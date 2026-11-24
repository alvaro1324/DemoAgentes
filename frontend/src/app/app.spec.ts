import { TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import { App } from './app';
import { Task } from './models/task';
import { TaskService } from './services/task.service';

const task: Task = {
  id: 1,
  title: 'Preparar demo',
  description: 'Con pruebas',
  isCompleted: false,
  createdAt: '2026-11-24T10:00:00+00:00',
  updatedAt: '2026-11-24T10:00:00+00:00',
};
describe('Gestión de tareas', () => {
  const api = { list: vi.fn(), get: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() };
  beforeEach(async () => {
    vi.resetAllMocks();
    api.list.mockReturnValue(
      of([task, { ...task, id: 2, title: 'Finalizada', isCompleted: true }]),
    );
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [{ provide: TaskService, useValue: api }],
    }).compileComponents();
  });
  function setup() {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    return {
      fixture,
      app: fixture.componentInstance,
      element: fixture.nativeElement as HTMLElement,
    };
  }
  it('muestra tareas y filtra por estado con contadores coherentes', () => {
    const { fixture, app, element } = setup();
    expect(element.querySelectorAll('.task-row')).toHaveLength(2);
    app.filter.set('pending');
    fixture.detectChanges();
    expect(element.querySelectorAll('.task-row')).toHaveLength(1);
    expect(element.querySelector('.task-summary')?.textContent).toContain('Preparar demo');
    expect(app.pendingCount()).toBe(1);
    expect(app.completedCount()).toBe(1);
  });
  it('muestra carga y lista vacía al terminar una petición sin datos', () => {
    const response = new Subject<Task[]>();
    api.list.mockReturnValue(response);
    const { app, fixture, element } = setup();
    expect(app.loading()).toBe(true);
    response.next([]);
    response.complete();
    fixture.detectChanges();
    expect(element.textContent).toContain('Todo empieza con una tarea');
    expect(app.loading()).toBe(false);
  });
  it('rechaza títulos con espacios sin enviar una petición', () => {
    const { app } = setup();
    app.openEditor();
    app.form.controls.title.setValue('   ');
    app.save();
    expect(app.form.invalid).toBe(true);
    expect(api.create).not.toHaveBeenCalled();
  });
  it('crea con valores normalizados y evita envíos duplicados', () => {
    const response = new Subject<Task>();
    api.create.mockReturnValue(response);
    const { app } = setup();
    app.openEditor();
    app.form.setValue({ title: '  Preparar demo  ', description: 'Con pruebas' });
    app.save();
    app.save();
    expect(api.create).toHaveBeenCalledExactlyOnceWith({
      title: task.title,
      description: task.description,
    });
    expect(app.saving()).toBe(true);
    response.next(task);
    response.complete();
    expect(app.editorOpen()).toBe(false);
    expect(app.saving()).toBe(false);
    expect(app.notice()).toBe('Tarea creada.');
  });
  it('conserva el formulario si el servidor falla al guardar', () => {
    api.create.mockReturnValue(throwError(() => new Error('offline')));
    const { app } = setup();
    app.openEditor();
    app.form.controls.title.setValue('Conservar');
    app.save();
    expect(app.editorOpen()).toBe(true);
    expect(app.form.controls.title.value).toBe('Conservar');
    expect(app.error()).toBeTruthy();
    expect(app.saving()).toBe(false);
  });
  it('no cambia el estado de la tarea cuando falla la actualización', () => {
    api.update.mockReturnValue(throwError(() => new Error('offline')));
    const { app } = setup();
    app.toggle(task);
    expect(app.tasks()[0].isCompleted).toBe(false);
    expect(app.busyId()).toBeNull();
    expect(app.error()).toBeTruthy();
  });
  it('consulta el detalle y permite editarlo', () => {
    api.get.mockReturnValue(of(task));
    api.update.mockReturnValue(of({ ...task, title: 'Nuevo título' }));
    const { app } = setup();
    app.showDetail(task);
    expect(api.get).toHaveBeenCalledWith(1);
    expect(app.selected()).toEqual(task);
    app.openEditor(task);
    app.form.controls.title.setValue('Nuevo título');
    app.save();
    expect(api.update).toHaveBeenCalledWith(1, {
      title: 'Nuevo título',
      description: task.description,
    });
    expect(app.tasks()[0].title).toBe('Nuevo título');
  });
  it('elimina solo tras confirmar y refleja el resultado del servidor', () => {
    api.delete.mockReturnValue(of(undefined));
    const { app } = setup();
    app.deleteTarget.set(task);
    expect(api.delete).not.toHaveBeenCalled();
    app.confirmDelete();
    expect(api.delete).toHaveBeenCalledWith(1);
    expect(app.tasks().some((t) => t.id === 1)).toBe(false);
    expect(app.deleteTarget()).toBeNull();
  });
  it('muestra un error de carga y permite volver a consultar', () => {
    api.list.mockReturnValueOnce(throwError(() => new Error('offline')));
    const { app, fixture, element } = setup();
    expect(element.querySelector('[role="alert"]')).not.toBeNull();
    app.load();
    fixture.detectChanges();
    expect(app.error()).toBe('');
    expect(app.tasks()).toHaveLength(2);
  });
});
