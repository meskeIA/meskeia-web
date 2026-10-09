/**
 * Puerto del servidor contra el que corren las pruebas — UN solo sitio para el número.
 *
 * Por defecto el 3050 de siempre. `PUERTO_PRUEBAS` lo cambia: la tarea de Windows
 * «Inspector meskeIA» (09/10/2026) inspecciona en una copia aparte del repositorio con su
 * servidor en el 3052, para que el usuario pueda seguir trabajando en meskeia-web (3050)
 * mientras tanto. Un spec que escriba `localhost:3050` a mano iría a buscar al servidor del
 * usuario: usar `PUERTO` u `ORIGEN`, o rutas relativas, que ya resuelve la `baseURL`.
 */
export const PUERTO = Number(process.env.PUERTO_PRUEBAS) || 3050;
export const ORIGEN = `http://localhost:${PUERTO}`;
