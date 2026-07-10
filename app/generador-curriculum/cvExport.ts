/**
 * Modelo de datos del CV y generadores de exportación (HTML imprimible, Markdown, texto plano).
 * Todo determinista y client-side. El HTML se abre en una pestaña nueva para imprimir/guardar PDF.
 */

export interface Experiencia {
  id: string;
  puesto: string;
  empresa: string;
  ubicacion: string;
  inicio: string;
  fin: string;
  actual: boolean;
  descripcion: string;
}

export interface Formacion {
  id: string;
  titulo: string;
  centro: string;
  ubicacion: string;
  inicio: string;
  fin: string;
  actual: boolean;
  detalle: string;
}

export interface Idioma {
  id: string;
  idioma: string;
  nivel: string;
}

export interface Certificacion {
  id: string;
  nombre: string;
  entidad: string;
  anio: string;
}

export interface Proyecto {
  id: string;
  nombre: string;
  descripcion: string;
  enlace: string;
}

export interface CVData {
  nombre: string;
  titular: string;
  email: string;
  telefono: string;
  ubicacion: string;
  linkedin: string;
  web: string;
  resumen: string;
  habilidadesText: string; // una por línea
  experiencia: Experiencia[];
  formacion: Formacion[];
  idiomas: Idioma[];
  certificaciones: Certificacion[];
  proyectos: Proyecto[];
  acento: string; // color hex
}

export const CV_VACIO: CVData = {
  nombre: '',
  titular: '',
  email: '',
  telefono: '',
  ubicacion: '',
  linkedin: '',
  web: '',
  resumen: '',
  habilidadesText: '',
  experiencia: [],
  formacion: [],
  idiomas: [],
  certificaciones: [],
  proyectos: [],
  acento: '#2E86AB',
};

// ── Helpers ──

export function habilidadesLista(text: string): string[] {
  return text
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function rango(inicio: string, fin: string, actual: boolean): string {
  const f = actual ? 'Actualidad' : fin.trim();
  if (inicio.trim() && f) return `${inicio.trim()} – ${f}`;
  return inicio.trim() || f || '';
}

function esc(s: string): string {
  const mapa: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return s.replace(/[&<>"']/g, (c) => mapa[c]);
}

function contactoPartes(cv: CVData): string[] {
  return [cv.email, cv.telefono, cv.ubicacion, cv.linkedin, cv.web].map((s) => s.trim()).filter(Boolean);
}

// ── HTML imprimible autocontenido ──

export function construirHTML(cv: CVData): string {
  const acento = cv.acento || '#2E86AB';
  const habilidades = habilidadesLista(cv.habilidadesText);

  const seccion = (titulo: string, contenido: string): string =>
    contenido.trim() ? `<section><h2>${esc(titulo)}</h2>${contenido}</section>` : '';

  const expHtml = cv.experiencia
    .filter((e) => e.puesto || e.empresa)
    .map(
      (e) => `
      <div class="item">
        <div class="item-head">
          <span class="item-title">${esc(e.puesto)}${e.empresa ? ` · ${esc(e.empresa)}` : ''}</span>
          <span class="item-date">${esc(rango(e.inicio, e.fin, e.actual))}</span>
        </div>
        ${e.ubicacion ? `<div class="item-sub">${esc(e.ubicacion)}</div>` : ''}
        ${e.descripcion ? `<div class="item-desc">${esc(e.descripcion).replace(/\n/g, '<br>')}</div>` : ''}
      </div>`,
    )
    .join('');

  const formHtml = cv.formacion
    .filter((f) => f.titulo || f.centro)
    .map(
      (f) => `
      <div class="item">
        <div class="item-head">
          <span class="item-title">${esc(f.titulo)}${f.centro ? ` · ${esc(f.centro)}` : ''}</span>
          <span class="item-date">${esc(rango(f.inicio, f.fin, f.actual))}</span>
        </div>
        ${f.ubicacion ? `<div class="item-sub">${esc(f.ubicacion)}</div>` : ''}
        ${f.detalle ? `<div class="item-desc">${esc(f.detalle).replace(/\n/g, '<br>')}</div>` : ''}
      </div>`,
    )
    .join('');

  const habHtml = habilidades.length
    ? `<ul class="chips">${habilidades.map((h) => `<li>${esc(h)}</li>`).join('')}</ul>`
    : '';

  const idiomasHtml = cv.idiomas.filter((i) => i.idioma).length
    ? `<ul class="chips">${cv.idiomas
        .filter((i) => i.idioma)
        .map((i) => `<li>${esc(i.idioma)}${i.nivel ? ` — ${esc(i.nivel)}` : ''}</li>`)
        .join('')}</ul>`
    : '';

  const certHtml = cv.certificaciones
    .filter((c) => c.nombre)
    .map(
      (c) =>
        `<div class="item-line"><span>${esc(c.nombre)}${c.entidad ? ` · ${esc(c.entidad)}` : ''}</span><span class="item-date">${esc(c.anio)}</span></div>`,
    )
    .join('');

  const proyHtml = cv.proyectos
    .filter((p) => p.nombre)
    .map(
      (p) => `
      <div class="item">
        <div class="item-head">
          <span class="item-title">${esc(p.nombre)}</span>
          ${p.enlace ? `<span class="item-date">${esc(p.enlace)}</span>` : ''}
        </div>
        ${p.descripcion ? `<div class="item-desc">${esc(p.descripcion).replace(/\n/g, '<br>')}</div>` : ''}
      </div>`,
    )
    .join('');

  const cuerpo = [
    seccion('Resumen profesional', cv.resumen ? `<p>${esc(cv.resumen).replace(/\n/g, '<br>')}</p>` : ''),
    seccion('Experiencia', expHtml),
    seccion('Formación', formHtml),
    seccion('Habilidades', habHtml),
    seccion('Idiomas', idiomasHtml),
    seccion('Certificaciones', certHtml),
    seccion('Proyectos', proyHtml),
  ].join('');

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Currículum — ${esc(cv.nombre || 'CV')}</title>
<style>
  @page { margin: 1.5cm; }
  * { box-sizing: border-box; }
  body { font-family: -apple-system, 'Segoe UI', Roboto, Arial, sans-serif; color: #1a1a1a; line-height: 1.5; margin: 0; padding: 2rem; background: #fff; }
  .cv { max-width: 800px; margin: 0 auto; }
  header { border-bottom: 3px solid ${esc(acento)}; padding-bottom: 0.8rem; margin-bottom: 1.2rem; }
  h1 { font-size: 1.9rem; margin: 0 0 0.2rem; color: #1a1a1a; }
  .titular { font-size: 1.1rem; color: ${esc(acento)}; font-weight: 600; margin: 0 0 0.5rem; }
  .contacto { font-size: 0.9rem; color: #444; margin: 0; }
  h2 { font-size: 1.05rem; color: ${esc(acento)}; text-transform: uppercase; letter-spacing: 0.04em; border-bottom: 1px solid #ddd; padding-bottom: 0.25rem; margin: 1.4rem 0 0.7rem; }
  .item { margin-bottom: 0.9rem; }
  .item-head { display: flex; justify-content: space-between; gap: 1rem; }
  .item-title { font-weight: 700; }
  .item-date { color: #666; font-size: 0.9rem; white-space: nowrap; }
  .item-sub { color: #666; font-size: 0.9rem; font-style: italic; }
  .item-desc { margin-top: 0.2rem; font-size: 0.95rem; }
  .item-line { display: flex; justify-content: space-between; gap: 1rem; margin-bottom: 0.3rem; }
  .chips { list-style: none; padding: 0; margin: 0; display: flex; flex-wrap: wrap; gap: 0.4rem; }
  .chips li { background: #f0f4f7; border-radius: 4px; padding: 0.2rem 0.6rem; font-size: 0.9rem; }
  section { break-inside: avoid; }
</style>
</head>
<body>
<div class="cv">
  <header>
    <h1>${esc(cv.nombre || 'Tu nombre')}</h1>
    ${cv.titular ? `<p class="titular">${esc(cv.titular)}</p>` : ''}
    ${contactoPartes(cv).length ? `<p class="contacto">${contactoPartes(cv).map(esc).join(' · ')}</p>` : ''}
  </header>
  ${cuerpo}
</div>
</body>
</html>`;
}

// ── Markdown ──

export function construirMarkdown(cv: CVData): string {
  const lineas: string[] = [];
  lineas.push(`# ${cv.nombre || 'Tu nombre'}`);
  if (cv.titular) lineas.push(`**${cv.titular}**`);
  const contacto = contactoPartes(cv);
  if (contacto.length) lineas.push(contacto.join(' · '));
  lineas.push('');

  if (cv.resumen) {
    lineas.push('## Resumen profesional', '', cv.resumen, '');
  }

  const exp = cv.experiencia.filter((e) => e.puesto || e.empresa);
  if (exp.length) {
    lineas.push('## Experiencia', '');
    exp.forEach((e) => {
      lineas.push(`### ${e.puesto}${e.empresa ? ` · ${e.empresa}` : ''}`);
      const meta = [rango(e.inicio, e.fin, e.actual), e.ubicacion].filter(Boolean).join(' · ');
      if (meta) lineas.push(`_${meta}_`);
      if (e.descripcion) lineas.push('', e.descripcion);
      lineas.push('');
    });
  }

  const form = cv.formacion.filter((f) => f.titulo || f.centro);
  if (form.length) {
    lineas.push('## Formación', '');
    form.forEach((f) => {
      lineas.push(`### ${f.titulo}${f.centro ? ` · ${f.centro}` : ''}`);
      const meta = [rango(f.inicio, f.fin, f.actual), f.ubicacion].filter(Boolean).join(' · ');
      if (meta) lineas.push(`_${meta}_`);
      if (f.detalle) lineas.push('', f.detalle);
      lineas.push('');
    });
  }

  const hab = habilidadesLista(cv.habilidadesText);
  if (hab.length) lineas.push('## Habilidades', '', hab.join(' · '), '');

  const idiomas = cv.idiomas.filter((i) => i.idioma);
  if (idiomas.length) {
    lineas.push('## Idiomas', '');
    idiomas.forEach((i) => lineas.push(`- ${i.idioma}${i.nivel ? ` — ${i.nivel}` : ''}`));
    lineas.push('');
  }

  const cert = cv.certificaciones.filter((c) => c.nombre);
  if (cert.length) {
    lineas.push('## Certificaciones', '');
    cert.forEach((c) =>
      lineas.push(`- ${c.nombre}${c.entidad ? ` · ${c.entidad}` : ''}${c.anio ? ` (${c.anio})` : ''}`),
    );
    lineas.push('');
  }

  const proy = cv.proyectos.filter((p) => p.nombre);
  if (proy.length) {
    lineas.push('## Proyectos', '');
    proy.forEach((p) => {
      lineas.push(`### ${p.nombre}`);
      if (p.enlace) lineas.push(p.enlace);
      if (p.descripcion) lineas.push('', p.descripcion);
      lineas.push('');
    });
  }

  return lineas.join('\n');
}

// ── Texto plano (para formularios ATS) ──

export function construirTextoPlano(cv: CVData): string {
  return construirMarkdown(cv)
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/_(.*?)_/g, '$1');
}
