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

describe('Búsqueda local de tareas por título', () => {
  const tasks: Task[] = [
    { ...task, id: 11, title: 'Comprar pan', description: 'Para casa' },
    { ...task, id: 12, title: 'COMPRAR leche', description: null },
    { ...task, id: 13, title: 'Preparar informe', description: 'Comprar material' },
    { ...task, id: 14, title: 'Comprar fruta', isCompleted: true },
  ];
  const api = { list: vi.fn(), get: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() };

  beforeEach(async () => {
    vi.resetAllMocks();
    api.list.mockReturnValue(of(tasks));
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [{ provide: TaskService, useValue: api }],
    }).compileComponents();
  });

  function setup() {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const input = element.querySelector<HTMLInputElement>('#task-title-search');
    if (!input) throw new Error('Falta el campo de búsqueda por título');

    function search(value: string) {
      input!.value = value;
      input!.dispatchEvent(new Event('input', { bubbles: true }));
      fixture.detectChanges();
    }

    function click(label: string, selector = 'button') {
      const button = Array.from(element.querySelectorAll<HTMLButtonElement>(selector)).find(
        (candidate) => candidate.textContent?.trim().startsWith(label),
      );
      if (!button) throw new Error(`Falta el botón ${label}`);
      button.click();
      fixture.detectChanges();
      return button;
    }

    function titles() {
      return Array.from(element.querySelectorAll('.task-summary')).map(
        (summary) => summary.textContent ?? '',
      );
    }

    function expectGlobalCounts() {
      expect(
        Array.from(element.querySelectorAll('.stats .stat strong')).map((count) =>
          count.textContent?.trim(),
        ),
      ).toEqual(['4', '3', '1']);
      expect(element.querySelector('.nav-count')?.textContent?.trim()).toBe('4');
      expect(
        Array.from(element.querySelectorAll('.tabs button span')).map((count) =>
          count.textContent?.trim(),
        ),
      ).toEqual(['4', '3', '1']);
    }

    return { fixture, element, input, search, click, titles, expectGlobalCounts };
  }

  it('asocia la etiqueta visible al campo y busca fragmentos solo en el título', () => {
    const { element, input, search, titles, expectGlobalCounts } = setup();
    const label = element.querySelector<HTMLLabelElement>('label[for="task-title-search"]');
    expect(label?.textContent?.trim()).toBe('Buscar por título');
    expect(label?.htmlFor).toBe(input.id);

    search('  oMpRaR  ');
    expect(titles()).toHaveLength(3);
    expect(titles().some((title) => title.includes('Preparar informe'))).toBe(false);
    expectGlobalCounts();

    search('informe');
    expect(titles()).toHaveLength(1);
    expect(titles()[0]).toContain('Preparar informe');
    expectGlobalCounts();
  });

  it('combina búsqueda y estados manteniendo los contadores globales', () => {
    const { search, click, titles, expectGlobalCounts } = setup();
    search('comprar');
    expect(titles()).toHaveLength(3);
    expectGlobalCounts();

    const pending = click('Pendientes', '.tabs button');
    expect(pending.getAttribute('aria-pressed')).toBe('true');
    expect(titles()).toHaveLength(2);
    expect(titles().some((title) => title.includes('Comprar fruta'))).toBe(false);
    expectGlobalCounts();

    click('Completadas', '.tabs button');
    expect(titles()).toHaveLength(1);
    expect(titles()[0]).toContain('Comprar fruta');
    expectGlobalCounts();

    click('Todas', '.tabs button');
    expect(titles()).toHaveLength(3);
    expectGlobalCounts();
  });

  it('una búsqueda vacía o con espacios muestra todas las tareas del estado elegido', () => {
    const { search, click, titles, expectGlobalCounts } = setup();
    click('Pendientes', '.tabs button');
    search('comprar');
    expect(titles()).toHaveLength(2);
    search('   ');
    expect(titles()).toHaveLength(3);
    search('');
    expect(titles()).toHaveLength(3);
    expectGlobalCounts();
    click('Completadas', '.tabs button');
    expect(titles()).toHaveLength(1);
  });

  it('limpia mediante un botón accesible sin cambiar el estado seleccionado', () => {
    const { element, input, search, click, titles, expectGlobalCounts } = setup();
    click('Pendientes', '.tabs button');
    search('informe');
    expect(titles()).toHaveLength(1);
    const clear = click('Limpiar búsqueda');
    expect(clear.type).toBe('button');
    expect(input.value).toBe('');
    expect(titles()).toHaveLength(3);
    expect(element.querySelector('.tabs button.active')?.textContent?.trim()).toContain(
      'Pendientes',
    );
    expectGlobalCounts();
  });

  it('distingue la búsqueda sin coincidencias del estado vacío y de la lista inicial vacía', () => {
    const { fixture, element, search, click } = setup();
    search('inexistente');
    expect(element.textContent).toContain('No hay tareas que coincidan con la búsqueda');
    expect(element.textContent).not.toContain('Todo empieza con una tarea');

    search('informe');
    click('Completadas', '.tabs button');
    expect(element.textContent).toContain('No hay tareas que coincidan con la búsqueda');

    api.list.mockReturnValue(of(tasks.filter((item) => !item.isCompleted)));
    search('');
    click('Actualizar');
    expect(element.textContent).toContain('No hay tareas en este estado');
    expect(element.textContent).not.toContain('No hay tareas que coincidan con la búsqueda');

    api.list.mockReturnValue(of([]));
    click('Todas', '.tabs button');
    search('inexistente');
    click('Actualizar');
    fixture.detectChanges();
    expect(element.textContent).toContain('Todo empieza con una tarea');
    expect(element.textContent).not.toContain('No hay tareas que coincidan con la búsqueda');
  });

  it('conserva búsqueda y estado al actualizar y filtra la nueva respuesta tras la carga', () => {
    const { fixture, element, input, search, click, titles } = setup();
    search('  COMPRAR  ');
    click('Pendientes', '.tabs button');
    const response = new Subject<Task[]>();
    api.list.mockReturnValue(response);
    click('Actualizar');
    expect(element.textContent).toContain('Buscando tus tareas…');
    expect(element.textContent).not.toContain('No hay tareas que coincidan con la búsqueda');
    expect(input.value).toBe('  COMPRAR  ');

    response.next([
      { ...task, id: 21, title: 'Comprar café' },
      { ...task, id: 22, title: 'Comprar té', isCompleted: true },
      { ...task, id: 23, title: 'Llamar al taller' },
    ]);
    response.complete();
    fixture.detectChanges();

    expect(api.list).toHaveBeenCalledTimes(2);
    expect(input.value).toBe('  COMPRAR  ');
    expect(element.querySelector('.tabs button.active')?.textContent).toContain('Pendientes');
    expect(titles()).toHaveLength(1);
    expect(titles()[0]).toContain('Comprar café');
    expect(
      Array.from(element.querySelectorAll('.stats .stat strong')).map((count) =>
        count.textContent?.trim(),
      ),
    ).toEqual(['3', '2', '1']);
  });
});

describe('mejoras de ordenación, editor y carga', () => {
  const records: Task[] = [
    {
      id: 31,
      title: 'Zeta pendiente',
      description: 'Detalle',
      isCompleted: false,
      createdAt: '2026-11-20T10:00:00+00:00',
      updatedAt: '2026-11-26T10:00:00+00:00',
    },
    {
      id: 32,
      title: 'alfa pendiente',
      description: null,
      isCompleted: false,
      createdAt: '2026-11-22T10:00:00+00:00',
      updatedAt: '2026-11-22T10:00:00+00:00',
    },
    {
      id: 33,
      title: 'Beta completada',
      description: null,
      isCompleted: true,
      createdAt: '2026-11-24T10:00:00+00:00',
      updatedAt: '2026-11-24T10:00:00+00:00',
    },
  ];
  let api: {
    list: ReturnType<typeof vi.fn>;
    get: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
  beforeEach(() => {
    api = {
      list: vi.fn().mockReturnValue(of([...records])),
      get: vi.fn().mockReturnValue(of(records[0])),
      create: vi.fn().mockReturnValue(of(records[0])),
      update: vi.fn().mockReturnValue(of(records[0])),
      delete: vi.fn().mockReturnValue(of(undefined)),
    };
    TestBed.configureTestingModule({
      imports: [App],
      providers: [{ provide: TaskService, useValue: api }],
    });
  });
  afterEach(() => {
    vi.restoreAllMocks();
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
  function button(element: HTMLElement, text: string): HTMLButtonElement {
    const result = Array.from(element.querySelectorAll('button')).find((candidate) =>
      candidate.textContent?.trim().startsWith(text),
    );
    if (!result) throw new Error(`No se encontró el botón ${text}`);
    return result;
  }
  function titles(element: HTMLElement): string[] {
    return Array.from(element.querySelectorAll('.task-summary strong')).map(
      (title) => title.textContent?.trim() ?? '',
    );
  }
  function chooseOrder(element: HTMLElement, value: string): void {
    const select = element.querySelector<HTMLSelectElement>('#task-order');
    if (!select) throw new Error('Falta el selector de orden');
    select.value = value;
    select.dispatchEvent(new Event('change', { bubbles: true }));
  }
  function input(element: HTMLElement, selector: string, value: string): void {
    const control = element.querySelector<HTMLInputElement | HTMLTextAreaElement>(selector);
    if (!control) throw new Error(`Falta el campo ${selector}`);
    control.value = value;
    control.dispatchEvent(new Event('input', { bubbles: true }));
  }
  it('ordena por creación o título sin mutar datos y combina búsqueda y estado', () => {
    const { fixture, app, element } = setup();
    expect(titles(element)).toEqual(['Beta completada', 'alfa pendiente', 'Zeta pendiente']);
    chooseOrder(element, 'oldest');
    fixture.detectChanges();
    expect(titles(element)).toEqual(['Zeta pendiente', 'alfa pendiente', 'Beta completada']);
    chooseOrder(element, 'title');
    fixture.detectChanges();
    expect(titles(element)).toEqual(['alfa pendiente', 'Beta completada', 'Zeta pendiente']);
    input(element, '#task-title-search', ' PENDIENTE ');
    button(element, 'Pendientes').click();
    fixture.detectChanges();
    expect(titles(element)).toEqual(['alfa pendiente', 'Zeta pendiente']);
    expect(app.tasks()).toEqual(records);
    expect(app.pendingCount()).toBe(2);
    expect(app.completedCount()).toBe(1);
    expect(api.list).toHaveBeenCalledTimes(1);
  });
  it('desempata con id y conserva orden, consulta y filtro al actualizar', () => {
    const { fixture, app, element } = setup();
    const tied = [
      { ...records[0], id: 42, title: 'igual' },
      { ...records[0], id: 41, title: 'IGUAL' },
    ];
    api.list.mockReturnValue(of(tied));
    chooseOrder(element, 'title');
    input(element, '#task-title-search', 'igual');
    button(element, 'Pendientes').click();
    button(element, 'Actualizar').click();
    fixture.detectChanges();
    expect(app.visibleTasks().map((record) => record.id)).toEqual([41, 42]);
    expect(app.tasks().map((record) => record.id)).toEqual([42, 41]);
    expect(app.order()).toBe('title');
    expect(app.filter()).toBe('pending');
    expect(app.searchControl.value).toBe('igual');
    chooseOrder(element, 'newest');
    fixture.detectChanges();
    expect(app.visibleTasks().map((record) => record.id)).toEqual([41, 42]);
    chooseOrder(element, 'oldest');
    fixture.detectChanges();
    expect(app.visibleTasks().map((record) => record.id)).toEqual([41, 42]);
  });
  it('no muestra vacíos en fallo inicial y permite reintentar con éxito', () => {
    api.list.mockReturnValue(throwError(() => new Error('Sin conexión')));
    const { fixture, element } = setup();
    expect(element.querySelector('[role="alert"]')).not.toBeNull();
    expect(element.querySelector('.empty')).toBeNull();
    expect(element.textContent).not.toContain('Todo empieza con una tarea');
    api.list.mockReturnValue(of([]));
    button(element, 'Reintentar').click();
    fixture.detectChanges();
    expect(element.querySelector('[role="alert"]')).toBeNull();
    expect(element.textContent).toContain('Todo empieza con una tarea');
  });
  it('conserva filas tras fallar una recarga y las sustituye solo al reintentar con éxito', () => {
    const { fixture, app, element } = setup();
    const refresh = new Subject<Task[]>();
    api.list.mockReturnValue(refresh);
    button(element, 'Actualizar').click();
    fixture.detectChanges();
    expect(element.textContent).toContain('Buscando tus tareas');
    refresh.error(new Error('Sin conexión'));
    fixture.detectChanges();
    expect(app.tasks()).toEqual(records);
    expect(titles(element)).toHaveLength(3);
    expect(element.querySelector('.empty')).toBeNull();
    api.list.mockReturnValue(of([]));
    button(element, 'Reintentar').click();
    fixture.detectChanges();
    expect(titles(element)).toEqual([]);
    expect(element.textContent).toContain('Todo empieza con una tarea');
  });
  it('no muestra ningún vacío al fallar una recarga de una lista vacía', () => {
    api.list.mockReturnValue(of([]));
    const { fixture, element } = setup();
    expect(element.textContent).toContain('Todo empieza con una tarea');
    api.list.mockReturnValue(throwError(() => new Error('Sin conexión')));
    button(element, 'Actualizar').click();
    fixture.detectChanges();
    expect(element.querySelector('.empty')).toBeNull();
    expect(element.querySelector('[role="alert"]')).not.toBeNull();
  });
  it('cancelar el descarte conserva borrador; confirmar permite cerrar o sustituir', () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    const { fixture, app, element } = setup();
    button(element, '＋ Nueva tarea').click();
    fixture.detectChanges();
    input(element, '#task-title', 'Borrador');
    button(element, 'Cerrar').click();
    fixture.detectChanges();
    expect(app.editorOpen()).toBe(true);
    expect(app.form.controls.title.value).toBe('Borrador');
    button(element, '＋ Nueva tarea').click();
    fixture.detectChanges();
    expect(app.form.controls.title.value).toBe('Borrador');
    const edit = element.querySelector<HTMLButtonElement>('[aria-label="Editar: Zeta pendiente"]');
    if (!edit) throw new Error('Falta Editar');
    edit.click();
    fixture.detectChanges();
    expect(app.editingId()).toBeNull();
    expect(app.form.controls.title.value).toBe('Borrador');
    confirm.mockReturnValue(true);
    edit.click();
    fixture.detectChanges();
    expect(app.editingId()).toBe(31);
    expect(app.form.controls.title.value).toBe('Zeta pendiente');
    input(element, '#task-description', 'Modificado');
    button(element, 'Cancelar').click();
    fixture.detectChanges();
    expect(app.editorOpen()).toBe(false);
    expect(confirm).toHaveBeenCalledTimes(5);
  });
  it('no pide confirmación si el usuario restaura exactamente los valores iniciales', () => {
    const confirm = vi.spyOn(window, 'confirm');
    const { fixture, app, element } = setup();
    app.openEditor(records[0]);
    fixture.detectChanges();
    input(element, '#task-title', 'Otro');
    input(element, '#task-title', records[0].title);
    input(element, '#task-description', 'Otro detalle');
    input(element, '#task-description', records[0].description ?? '');
    expect(app.form.dirty).toBe(true);
    button(element, 'Cerrar').click();
    fixture.detectChanges();
    expect(confirm).not.toHaveBeenCalled();
    expect(app.editorOpen()).toBe(false);
  });
  it('bloquea cambios de editor y detalle mientras guarda', () => {
    const confirm = vi.spyOn(window, 'confirm');
    const pending = new Subject<Task>();
    api.create.mockReturnValue(pending);
    const { fixture, app, element } = setup();
    button(element, '＋ Nueva tarea').click();
    fixture.detectChanges();
    input(element, '#task-title', 'Guardando borrador');
    button(element, 'Guardar tarea').click();
    fixture.detectChanges();
    app.closeEditor();
    app.openEditor(records[0]);
    app.showDetail(records[0]);
    expect(app.editorOpen()).toBe(true);
    expect(app.editingId()).toBeNull();
    expect(app.form.controls.title.value).toBe('Guardando borrador');
    expect(api.get).not.toHaveBeenCalled();
    expect(confirm).not.toHaveBeenCalled();
    pending.next({ ...records[0], title: 'Guardando borrador' });
    pending.complete();
    fixture.detectChanges();
    expect(app.editorOpen()).toBe(false);
  });
  it('protege el borrador al abrir detalle y ante respuestas de detalle tardías', () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    const pending = new Subject<Task>();
    api.get.mockReturnValue(pending);
    const { fixture, app, element } = setup();
    button(element, '＋ Nueva tarea').click();
    fixture.detectChanges();
    input(element, '#task-title', 'Borrador');
    element.querySelector<HTMLButtonElement>('.task-summary')?.click();
    fixture.detectChanges();
    expect(api.get).not.toHaveBeenCalled();
    expect(app.editorOpen()).toBe(true);
    confirm.mockReturnValue(true);
    element.querySelector<HTMLButtonElement>('.task-summary')?.click();
    fixture.detectChanges();
    expect(api.get).toHaveBeenCalledTimes(1);
    button(element, '＋ Nueva tarea').click();
    fixture.detectChanges();
    input(element, '#task-title', 'Nuevo borrador');
    pending.next(records[0]);
    pending.complete();
    fixture.detectChanges();
    expect(app.selected()).toBeNull();
    expect(app.editorOpen()).toBe(true);
    expect(app.form.controls.title.value).toBe('Nuevo borrador');
  });
  it('muestra contadores asociados a los campos, precargados y durante la edición', () => {
    const { fixture, app, element } = setup();
    app.openEditor(records[0]);
    fixture.detectChanges();
    expect(element.querySelector('#title-count')?.textContent).toContain(
      `${records[0].title.length} / 200`,
    );
    expect(element.querySelector('#description-count')?.textContent).toContain('7 / 5000');
    input(element, '#task-title', 'abc');
    input(element, '#task-description', '12345');
    fixture.detectChanges();
    expect(element.querySelector('#title-count')?.textContent).toContain('3 / 200');
    expect(element.querySelector('#description-count')?.textContent).toContain('5 / 5000');
    expect(element.querySelector('#task-title')?.getAttribute('aria-describedby')).toContain(
      'title-count',
    );
    expect(element.querySelector('#task-description')?.getAttribute('aria-describedby')).toContain(
      'description-count',
    );
    input(element, '#task-title', 'a'.repeat(200));
    input(element, '#task-description', 'b'.repeat(5000));
    fixture.detectChanges();
    expect(element.querySelector('#title-count')?.textContent).toContain('200 / 200');
    expect(element.querySelector('#description-count')?.textContent).toContain('5000 / 5000');
  });
  it('enfoca título al abrir y restaura el botón de origen al cerrar o guardar', async () => {
    const { fixture, element } = setup();
    const origin = element.querySelector<HTMLButtonElement>(
      '[aria-label="Editar: Zeta pendiente"]',
    );
    if (!origin) throw new Error('Falta Editar');
    origin.focus();
    origin.click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(document.activeElement).toBe(element.querySelector('#task-title'));
    button(element, 'Cerrar').click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(document.activeElement).toBe(origin);
    origin.click();
    fixture.detectChanges();
    await fixture.whenStable();
    button(element, 'Guardar tarea').click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(document.activeElement).toBe(origin);
  });
  it('restaura foco al botón nueva tarea si el origen desaparece', async () => {
    api.list.mockReturnValue(of([]));
    const { fixture, app, element } = setup();
    button(element, 'Crear mi primera tarea').click();
    fixture.detectChanges();
    await fixture.whenStable();
    app.tasks.set([...records]);
    fixture.detectChanges();
    button(element, 'Cerrar').click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(document.activeElement).toBe(button(element, '＋ Nueva tarea'));
  });
});
