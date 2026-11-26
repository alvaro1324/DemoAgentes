import { expect, test } from '@playwright/test';

test.beforeEach(async ({ request }) => {
  const response = await request.get('/api/tasks');
  for (const task of await response.json()) await request.delete('/api/tasks/' + task.id);
});

test('crear, consultar, editar, completar, filtrar, reabrir y eliminar una tarea', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.getByText('Todo empieza con una tarea')).toBeVisible();
  await page.getByRole('button', { name: 'Nueva tarea' }).click();
  await page.locator('#task-title').fill('Preparar versión 0.1');
  await page.getByLabel('Descripción').fill('Comprobar persistencia y pruebas');
  await page.getByRole('button', { name: 'Guardar tarea' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Tarea creada.' })).toBeVisible();
  await page.reload();
  await page.getByRole('button', { name: /Preparar versión 0.1.*Comprobar/ }).click();
  await expect(page.getByRole('heading', { name: 'Preparar versión 0.1' })).toBeVisible();
  await page.getByRole('button', { name: 'Editar tarea', exact: true }).click();
  await page.locator('#task-title').fill('Demo terminada');
  await page.getByRole('button', { name: 'Guardar tarea' }).click();
  await page.getByRole('button', { name: 'Completar: Demo terminada', exact: true }).click();
  await expect(page.getByText('Tarea completada.', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: /^Pendientes/ }).click();
  await expect(page.getByText('No hay tareas en este estado')).toBeVisible();
  await page.getByRole('button', { name: /^Completadas/ }).click();
  await page.getByRole('button', { name: 'Marcar como pendiente: Demo terminada' }).click();
  await expect(page.getByText('No hay tareas en este estado')).toBeVisible();
  await page.getByRole('button', { name: /^Todas/ }).click();
  await page.getByRole('button', { name: 'Eliminar: Demo terminada', exact: true }).click();
  await page.getByRole('button', { name: 'Eliminar tarea', exact: true }).click();
  await expect(page.getByText('Todo empieza con una tarea')).toBeVisible();
});

test('interfaz móvil y validación del título', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Nueva tarea' }).click();
  await page.locator('#task-title').fill('   ');
  await page.getByRole('button', { name: 'Guardar tarea' }).click();
  await expect(page.getByText(/Escribe un título de entre/)).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('ordena y combina búsqueda y estado conservando contadores y foco', async ({ page }) => {
  await page.goto('/');
  const newTask = page.getByRole('button', { name: /Nueva tarea/ });
  for (const title of ['Zeta demo', 'Alfa demo']) {
    await newTask.click();
    await expect(page.locator('#task-title')).toBeFocused();
    await page.locator('#task-title').fill(title);
    await page.locator('#task-description').fill('Detalle');
    await expect(page.locator('#title-count')).toContainText(`${title.length} / 200`);
    await expect(page.locator('#description-count')).toContainText('7 / 5000');
    await page.getByRole('button', { name: 'Guardar tarea', exact: true }).click();
    await expect(page.locator('#task-title')).toHaveCount(0);
    await expect(newTask).toBeFocused();
  }
  await page.getByLabel('Ordenar por').selectOption('title');
  await expect(page.locator('.task-summary strong')).toHaveText(['Alfa demo', 'Zeta demo']);
  await page.getByLabel('Buscar por título').fill(' DEMO ');
  await page.getByRole('button', { name: /^Pendientes/ }).click();
  await expect(page.locator('.task-summary strong')).toHaveText(['Alfa demo', 'Zeta demo']);
  await page.getByRole('button', { name: 'Completar: Alfa demo', exact: true }).click();
  await expect(page.locator('.task-summary strong')).toHaveText(['Zeta demo']);
  await expect(page.getByRole('button', { name: /^Todas/ })).toContainText('2');
  await expect(page.getByRole('button', { name: /^Pendientes/ })).toContainText('1');
  await expect(page.getByRole('button', { name: /^Completadas/ })).toContainText('1');
  await page.getByRole('button', { name: 'Actualizar', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Actualizar', exact: true })).toBeEnabled();
  await expect(page.getByLabel('Ordenar por')).toHaveValue('title');
  await expect(page.getByLabel('Buscar por título')).toHaveValue(' DEMO ');
  await expect(page.locator('.task-summary strong')).toHaveText(['Zeta demo']);
  await page.getByRole('button', { name: /^Todas/ }).click();
  await expect(page.locator('.task-summary strong')).toHaveText(['Alfa demo', 'Zeta demo']);
});

test('confirma el descarte y devuelve el foco al origen del editor', async ({ page }) => {
  await page.goto('/');
  const newTask = page.getByRole('button', { name: /Nueva tarea/ });
  await newTask.click();
  await page.locator('#task-title').fill('Tarea con borrador');
  await page.locator('#task-description').fill('Descripción original');
  await page.getByRole('button', { name: 'Guardar tarea', exact: true }).click();
  await expect(page.locator('#task-title')).toHaveCount(0);
  const edit = page.getByRole('button', { name: 'Editar: Tarea con borrador', exact: true });
  await edit.click();
  const title = page.locator('#task-title');
  await expect(title).toBeFocused();
  await expect(page.locator('#description-count')).toContainText('20 / 5000');
  await title.fill('Borrador conservado');
  page.once('dialog', (dialog) => dialog.dismiss());
  await page.getByRole('button', { name: 'Cerrar', exact: true }).click();
  await expect(title).toHaveValue('Borrador conservado');
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Cerrar', exact: true }).click();
  await expect(title).toHaveCount(0);
  await expect(edit).toBeFocused();
  await edit.click();
  await expect(title).toHaveValue('Tarea con borrador');
  await title.fill('Otro borrador');
  page.once('dialog', (dialog) => dialog.dismiss());
  await newTask.click();
  await expect(title).toHaveValue('Otro borrador');
  page.once('dialog', (dialog) => dialog.accept());
  await newTask.click();
  await expect(title).toHaveValue('');
  await expect(title).toBeFocused();
  await expect(page.locator('#title-count')).toContainText('0 / 200');
  await expect(page.locator('#description-count')).toContainText('0 / 5000');
  await page.getByRole('button', { name: 'Cancelar', exact: true }).click();
  await expect(title).toHaveCount(0);
  await expect(newTask).toBeFocused();
});
