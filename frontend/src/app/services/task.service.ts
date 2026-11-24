import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { inject, Injectable, InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateTask, Task, TaskFilter, UpdateTask } from '../models/task';

export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', { factory: () => '/api' });
@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly http = inject(HttpClient);
  private readonly url = inject(API_BASE_URL) + '/tasks';
  list(filter: TaskFilter = 'all'): Observable<Task[]> {
    const params =
      filter === 'all'
        ? new HttpParams()
        : new HttpParams().set('completed', filter === 'completed');
    return this.http.get<Task[]>(this.url, { params });
  }
  get(id: number): Observable<Task> {
    return this.http.get<Task>(this.url + '/' + id);
  }
  create(task: CreateTask): Observable<Task> {
    return this.http.post<Task>(this.url, task);
  }
  update(id: number, changes: UpdateTask): Observable<Task> {
    return this.http.patch<Task>(this.url + '/' + id, changes);
  }
  delete(id: number): Observable<void> {
    return this.http.delete<void>(this.url + '/' + id);
  }
}
export function errorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0)
      return 'No se puede conectar con el servidor. Comprueba la conexión e inténtalo de nuevo.';
    const body: unknown = error.error;
    if (body && typeof body === 'object' && 'message' in body && typeof body.message === 'string')
      return body.message;
  }
  return 'No se ha podido completar la operación. Inténtalo de nuevo.';
}
