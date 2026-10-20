/**
 * Cerrojo de Playwright — una sola tanda a la vez contra el servidor que arranca Playwright.
 *
 * El `webServer` de playwright.config.ts lleva `reuseExistingServer`: si al arrancar ya hay algo en
 * el 3050, lo usa en vez de levantar el suyo. Si ese algo es el `next dev` de OTRA tanda de
 * Playwright, esa tanda lo apaga al terminar, y la segunda se queda sin servidor a mitad.
 *
 * De dónde sale (20/10/2026, /reparar en conversación): se lanzó una tanda de 249 tests mientras la
 * anterior aún cerraba. La segunda reutilizó su servidor, la primera lo apagó al salir, y 180 tests
 * cayeron con `net::ERR_CONNECTION_REFUSED`: 14 minutos perdidos y una tanda roja que no decía
 * nada de las apps.
 *
 * Qué hace: al empezar, mira si otra tanda VIVA de este mismo directorio tiene el cerrojo (su pid
 * sigue existiendo) y, si es así, para con un mensaje en vez de reutilizar su servidor. El cerrojo
 * no se borra al acabar: un pid que ya no existe lo deja libre solo, y el proceso de Playwright no
 * termina hasta haber apagado su servidor, que es justo la ventana del choque.
 *
 * Solo con el servidor que gestiona Playwright (el 3050 de meskeia-web). Con `PUERTO_PRUEBAS`, el
 * servidor lo arranca y lo apaga una tarea (Inspector en el 3052, /reparar en el 3053, la suite con
 * `next start`), y sus agentes pasan specs A LA VEZ contra él a propósito: ahí no hay choque.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';

interface Cerrojo {
  pid: number;
  inicio: string;
  orden: string;
}

/** ¿Existe aún ese proceso? `kill(pid, 0)` no mata nada: solo pregunta. */
function vivo(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch (e) {
    // EPERM: existe, pero es de otro usuario
    return (e as NodeJS.ErrnoException).code === 'EPERM';
  }
}

export default function cerrojoPlaywright(): void {
  if (process.env.PUERTO_PRUEBAS) return;
  const directorio = crypto.createHash('sha1').update(process.cwd().toLowerCase()).digest('hex').slice(0, 12);
  const fichero = path.join(os.tmpdir(), `meskeia-playwright-${directorio}.json`);

  let otro: Cerrojo | null = null;
  try {
    otro = JSON.parse(fs.readFileSync(fichero, 'utf8')) as Cerrojo;
  } catch {
    otro = null; // no hay cerrojo, o está ilegible: libre
  }
  if (otro && otro.pid !== process.pid && vivo(otro.pid)) {
    throw new Error(
      `Otra tanda de Playwright sigue en marcha en este directorio (pid ${otro.pid}, desde ${otro.inicio}: ${otro.orden}). ` +
        'Esta reutilizaría su servidor, y al terminar aquella lo apagaría a mitad de la tuya. Espera a que acabe y vuelve a lanzarla.',
    );
  }
  const cerrojo: Cerrojo = {
    pid: process.pid,
    inicio: new Date().toLocaleString('es-ES', { hour12: false }),
    orden: process.argv.slice(2).join(' ').slice(0, 200),
  };
  fs.writeFileSync(fichero, JSON.stringify(cerrojo), 'utf8');
}
