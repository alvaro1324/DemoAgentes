import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { errorMessage, TaskService } from './task.service';

describe('TaskService', () => {
  let api: TaskService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(TaskService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  it('consulta los filtros con los valores del contrato', () => {
    api.list().subscribe();
    http.expectOne('/api/tasks').flush([]);
    api.list('pending').subscribe();
    http.expectOne('/api/tasks?completed=false').flush([]);
    api.list('completed').subscribe();
    http.expectOne('/api/tasks?completed=true').flush([]);
  });
  it('envía POST con los campos editables', () => {
    api.create({ title: 'Tarea', description: null }).subscribe();
    const request = http.expectOne('/api/tasks');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ title: 'Tarea', description: null });
    request.flush({ id: 1 });
  });
  it('actualiza el estado usando PATCH y elimina con DELETE', () => {
    api.update(7, { isCompleted: true }).subscribe();
    const update = http.expectOne('/api/tasks/7');
    expect(update.request.method).toBe('PATCH');
    expect(update.request.body).toEqual({ isCompleted: true });
    update.flush({});
    api.delete(7).subscribe();
    const deletion = http.expectOne('/api/tasks/7');
    expect(deletion.request.method).toBe('DELETE');
    deletion.flush(null, { status: 204, statusText: 'No Content' });
  });
  it('propaga los errores de la API sin convertirlos en éxito', () => {
    const failed = vi.fn();
    api.get(999).subscribe({ error: failed });
    http
      .expectOne('/api/tasks/999')
      .flush({ message: 'La tarea no existe.' }, { status: 404, statusText: 'Not Found' });
    expect(failed).toHaveBeenCalledOnce();
  });
  it('ofrece mensajes de red y del servidor', () => {
    expect(errorMessage(new HttpErrorResponse({ status: 0 }))).toContain('conectar');
    expect(
      errorMessage(new HttpErrorResponse({ status: 400, error: { message: 'Revisa el título.' } })),
    ).toBe('Revisa el título.');
  });
});
