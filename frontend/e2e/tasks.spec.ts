import { expect, test } from '@playwright/test';

test.beforeEach(async ({ request }) => {
  const response = await request.get('/api/tasks');
  for (const task of await response.json()) await request.delete('/api/tasks/' + task.id);
});

test('crear, consultar, editar, completar, filtrar, reabrir y eliminar una tarea', async ({page}) => {
  await page.goto('/');
  await expect(page.getByText('Todo empieza con una tarea')).toBeVisible();
  await page.getByRole('button', {name: 'Nueva tarea'}).click();
  await page.getByLabel('Título').fill('Preparar versión 0.1');
  await page.getByLabel('Descripción').fill('Comprobar persistencia y pruebas');
  await page.getByRole('button', {name: 'Guardar tarea'}).click();
  await expect(page.getByRole('status').filter({hasText: 'Tarea creada.'})).toBeVisible();
  await page.reload();
  await page.getByRole('button', {name: /Preparar versión 0.1.*Comprobar/}).click();
  await expect(page.getByRole('heading', {name: 'Preparar versión 0.1'})).toBeVisible();
  await page.getByRole('button', {name: 'Editar tarea', exact: true}).click();
  await page.getByLabel('Título').fill('Demo terminada');
  await page.getByRole('button', {name: 'Guardar tarea'}).click();
  await page.getByRole('button', {name: 'Completar: Demo terminada', exact: true}).click();
  await expect(page.getByText('Tarea completada.', {exact: true})).toBeVisible();
  await page.getByRole('button', {name: /^Pendientes/}).click();
  await expect(page.getByText('No hay tareas en este estado')).toBeVisible();
  await page.getByRole('button', {name: /^Completadas/}).click();
  await page.getByRole('button', {name: 'Marcar como pendiente: Demo terminada'}).click();
  await expect(page.getByText('No hay tareas en este estado')).toBeVisible();
  await page.getByRole('button', {name: /^Todas/}).click();
  await page.getByRole('button', {name: 'Eliminar: Demo terminada', exact: true}).click();
  await page.getByRole('button', {name: 'Eliminar tarea', exact: true}).click();
  await expect(page.getByText('Todo empieza con una tarea')).toBeVisible();
});

test('interfaz móvil y validación del título', async ({page}) => {
  await page.setViewportSize({width: 390, height: 844});
  await page.goto('/');
  await page.getByRole('button', {name: 'Nueva tarea'}).click();
  await page.getByLabel('Título').fill('   ');
  await page.getByRole('button', {name: 'Guardar tarea'}).click();
  await expect(page.getByText(/Escribe un título de entre/)).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
