# Interfaz Angular de DemoAgentes 0.1

Las instrucciones completas están en [el README de la raíz](../README.md).

```sh
npm ci
npm start
```

La interfaz sirve en `http://127.0.0.1:4200` y utiliza el backend de `http://127.0.0.1:8000` mediante el proxy `/api`. No contiene datos simulados ni persistencia en localStorage: las tareas se guardan con Doctrine en el backend.

Comprobaciones: `npm test`, `npm run format:check`, `npm run build`. Para los recorridos de navegador, instalar Chromium con `npx playwright install chromium` y ejecutar `npm run e2e`. Las pruebas de navegador usan otra base de datos y los puertos 8001/4201.
