import { DatePipe } from '@angular/common';
import {
  afterNextRender,
  Component,
  computed,
  ElementRef,
  inject,
  Injector,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { Task, TaskFilter } from './models/task';
import { errorMessage, TaskService } from './services/task.service';

type TaskOrder = 'newest' | 'oldest' | 'title';

@Component({
  selector: 'app-root',
  imports: [DatePipe, ReactiveFormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  private readonly api = inject(TaskService);
  private readonly injector = inject(Injector);
  private readonly titleInput = viewChild<ElementRef<HTMLInputElement>>('titleInput');
  private readonly newTaskButton = viewChild<ElementRef<HTMLButtonElement>>('newTaskButton');
  private editorOrigin: HTMLElement | null = null;
  private initialValues = { title: '', description: '' };
  private detailRequest = 0;
  readonly tasks = signal<Task[]>([]);
  readonly filter = signal<TaskFilter>('all');
  readonly order = signal<TaskOrder>('newest');
  readonly searchControl = new FormControl('', { nonNullable: true });
  private readonly searchText = toSignal(this.searchControl.valueChanges, { initialValue: '' });
  readonly searchQuery = computed(() => this.searchText().trim().toLowerCase());
  readonly loading = signal(false);
  readonly loaded = signal(false);
  readonly saving = signal(false);
  readonly detailLoading = signal(false);
  readonly busyId = signal<number | null>(null);
  readonly error = signal('');
  readonly notice = signal('');
  readonly selected = signal<Task | null>(null);
  readonly editingId = signal<number | null>(null);
  readonly editorOpen = signal(false);
  readonly deleteTarget = signal<Task | null>(null);
  readonly pendingCount = computed(() => this.tasks().filter((t) => !t.isCompleted).length);
  readonly completedCount = computed(() => this.tasks().filter((t) => t.isCompleted).length);
  readonly visibleTasks = computed(() => {
    const order = this.order();
    return this.tasks()
      .filter(
        (t) =>
          (this.filter() === 'all' || t.isCompleted === (this.filter() === 'completed')) &&
          t.title.toLowerCase().includes(this.searchQuery()),
      )
      .sort((a, b) => {
        const comparison =
          order === 'title'
            ? a.title.localeCompare(b.title, 'es', { sensitivity: 'base' })
            : order === 'oldest'
              ? Date.parse(a.createdAt) - Date.parse(b.createdAt)
              : Date.parse(b.createdAt) - Date.parse(a.createdAt);
        return comparison || a.id - b.id;
      });
  });
  readonly filters: { value: TaskFilter; label: string }[] = [
    { value: 'all', label: 'Todas' },
    { value: 'pending', label: 'Pendientes' },
    { value: 'completed', label: 'Completadas' },
  ];
  readonly form = new FormGroup({
    title: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(200), Validators.pattern(/\S/u)],
    }),
    description: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(5000)],
    }),
  });
  ngOnInit(): void {
    this.load();
  }
  load(): void {
    if (this.loading()) return;
    this.loading.set(true);
    this.error.set('');
    this.api
      .list()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (tasks) => {
          this.tasks.set(tasks);
          this.loaded.set(true);
        },
        error: (err: unknown) => this.error.set(errorMessage(err)),
      });
  }
  setOrder(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    if (value === 'newest' || value === 'oldest' || value === 'title') {
      this.order.set(value);
    }
  }
  openEditor(task?: Task, event?: Event): void {
    if (this.saving() || !this.canDiscardEditor()) return;
    this.detailRequest++;
    this.detailLoading.set(false);
    const origin = event?.currentTarget;
    this.editorOrigin =
      origin instanceof HTMLElement
        ? origin
        : this.editorOpen()
          ? this.editorOrigin
          : document.activeElement instanceof HTMLElement
            ? document.activeElement
            : null;
    this.editingId.set(task?.id ?? null);
    this.initialValues = { title: task?.title ?? '', description: task?.description ?? '' };
    this.form.reset(this.initialValues);
    this.editorOpen.set(true);
    this.error.set('');
    this.notice.set('');
    this.selected.set(null);
    afterNextRender(() => this.titleInput()?.nativeElement.focus(), { injector: this.injector });
  }
  closeEditor(): void {
    if (this.saving() || !this.canDiscardEditor()) return;
    this.editorOpen.set(false);
    this.restoreEditorFocus();
  }
  private canDiscardEditor(): boolean {
    if (!this.editorOpen()) return true;
    const values = this.form.getRawValue();
    return (
      (values.title === this.initialValues.title &&
        values.description === this.initialValues.description) ||
      window.confirm('Hay cambios sin guardar. ¿Quieres descartarlos?')
    );
  }
  private restoreEditorFocus(): void {
    const origin = this.editorOrigin;
    afterNextRender(
      () => {
        if (origin?.isConnected && !origin.matches(':disabled')) {
          origin.focus();
        } else {
          this.newTaskButton()?.nativeElement.focus();
        }
      },
      { injector: this.injector },
    );
  }
  save(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.saving()) return;
    const values = this.form.getRawValue();
    const data = { title: values.title.trim(), description: values.description || null };
    const id = this.editingId();
    this.saving.set(true);
    this.error.set('');
    const request = id === null ? this.api.create(data) : this.api.update(id, data);
    request.pipe(finalize(() => this.saving.set(false))).subscribe({
      next: (task) => {
        this.tasks.update((tasks) =>
          id === null ? [task, ...tasks] : tasks.map((t) => (t.id === id ? task : t)),
        );
        this.editorOpen.set(false);
        this.notice.set(id === null ? 'Tarea creada.' : 'Cambios guardados.');
        this.restoreEditorFocus();
      },
      error: (err: unknown) => this.error.set(errorMessage(err)),
    });
  }
  toggle(task: Task): void {
    if (this.busyId() !== null) return;
    this.busyId.set(task.id);
    this.error.set('');
    this.api
      .update(task.id, { isCompleted: !task.isCompleted })
      .pipe(finalize(() => this.busyId.set(null)))
      .subscribe({
        next: (updated) => {
          this.tasks.update((tasks) => tasks.map((t) => (t.id === updated.id ? updated : t)));
          if (this.selected()?.id === updated.id) this.selected.set(updated);
          this.notice.set(
            updated.isCompleted ? 'Tarea completada.' : 'Tarea marcada como pendiente.',
          );
        },
        error: (err: unknown) => this.error.set(errorMessage(err)),
      });
  }
  showDetail(task: Task): void {
    if (this.saving() || this.detailLoading() || !this.canDiscardEditor()) return;
    const request = ++this.detailRequest;
    if (this.editorOpen()) {
      this.editorOpen.set(false);
      this.restoreEditorFocus();
    }
    this.detailLoading.set(true);
    this.error.set('');
    this.api
      .get(task.id)
      .pipe(
        finalize(() => {
          if (request === this.detailRequest) this.detailLoading.set(false);
        }),
      )
      .subscribe({
        next: (detail) => {
          if (request === this.detailRequest) this.selected.set(detail);
        },
        error: (err: unknown) => {
          if (request === this.detailRequest) this.error.set(errorMessage(err));
        },
      });
  }
  confirmDelete(): void {
    const task = this.deleteTarget();
    if (!task || this.busyId() !== null) return;
    this.busyId.set(task.id);
    this.error.set('');
    this.api
      .delete(task.id)
      .pipe(finalize(() => this.busyId.set(null)))
      .subscribe({
        next: () => {
          this.tasks.update((tasks) => tasks.filter((t) => t.id !== task.id));
          if (this.selected()?.id === task.id) this.selected.set(null);
          this.deleteTarget.set(null);
          this.notice.set('Tarea eliminada.');
        },
        error: (err: unknown) => this.error.set(errorMessage(err)),
      });
  }
}
