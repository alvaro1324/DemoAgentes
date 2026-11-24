import { DatePipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { Task, TaskFilter } from './models/task';
import { errorMessage, TaskService } from './services/task.service';

@Component({
  selector: 'app-root',
  imports: [DatePipe, ReactiveFormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  private readonly api = inject(TaskService);
  readonly tasks = signal<Task[]>([]);
  readonly filter = signal<TaskFilter>('all');
  readonly loading = signal(false);
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
  readonly visibleTasks = computed(() =>
    this.tasks().filter(
      (t) => this.filter() === 'all' || t.isCompleted === (this.filter() === 'completed'),
    ),
  );
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
        next: (tasks) => this.tasks.set(tasks),
        error: (err: unknown) => this.error.set(errorMessage(err)),
      });
  }
  openEditor(task?: Task): void {
    this.editingId.set(task?.id ?? null);
    this.form.reset({ title: task?.title ?? '', description: task?.description ?? '' });
    this.editorOpen.set(true);
    this.error.set('');
    this.notice.set('');
    this.selected.set(null);
  }
  closeEditor(): void {
    if (!this.saving()) this.editorOpen.set(false);
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
    if (this.detailLoading()) return;
    this.detailLoading.set(true);
    this.error.set('');
    this.api
      .get(task.id)
      .pipe(finalize(() => this.detailLoading.set(false)))
      .subscribe({
        next: (detail) => {
          this.selected.set(detail);
          this.editorOpen.set(false);
        },
        error: (err: unknown) => this.error.set(errorMessage(err)),
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
