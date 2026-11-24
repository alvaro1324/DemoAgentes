export interface Task {
  id: number;
  title: string;
  description: string | null;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}
export type TaskFilter = 'all' | 'pending' | 'completed';
export type CreateTask = Pick<Task, 'title' | 'description'>;
export type UpdateTask = Partial<Pick<Task, 'title' | 'description' | 'isCompleted'>>;
