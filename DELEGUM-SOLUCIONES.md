# DELEGUM · "Soluciones" — rediseño del acceso por situación

> Plano de obra de la reorganización de la antigua pestaña **Calculadoras** → **Soluciones**.
> Documento de ejecución (el plano); la miga de pan entre sesiones está en la memoria del proyecto.
> Iniciado: 2026-06-21.

---

## 1. El problema que resuelve

Delegum nació desde la parte fiscal (MCP → web) con una pestaña "Calculadoras" = lista curada de 15 enlaces a meskeIA. Al querer ampliar la **pata financiera** (donde está el fuerte del autor y la app nº1 de meskeIA, `test-perfil-inversor`), aparece el riesgo de **convertir Delegum en un "meskeIA-2"**: poblar la web de apps y pasar de vertical a horizontal.

**Diagnóstico clave**: el enemigo no es la *cantidad* de apps, es la *falta de estructura de acceso*. Una asesoría integral tiene cientos de capacidades y no abruma porque enruta por **situación**, no por catálogo.

## 2. La solución — modelo "triaje de asesoría"

Acceso por **situación** (como el triaje de urgencias: pocas señales → te derivan al especialista), no por lista plana. Tres+1 vías de acceso:

1. **Puertas por situación** (la fachada curada) — 6 puertas.
2. **Buscador acotado** al universo Delegum (~100, no las 1.022 de meskeIA) — *pendiente, fase posterior*.
3. **Asistente IA** (ya existe) — el "recepcionista" que enruta en lenguaje natural.
4. **Cross-linking contextual** dentro de cada herramienta — *pendiente*.

> Principio rector: **fachada mínima, capacidad profunda**. Las puertas NO son exhaustivas por diseño; lo no-cubierto se alcanza por buscador / asistente / cross-links. Tag de dominio ≠ escaparate: se puede taggear el universo entero y mostrar solo lo curado.

## 3. Las 6 puertas (decisión cerrada)

Agrupadas en los dos clientes de una gestoría: **Particular** (5) y **Profesional/Empresa** (1).

| # | Puerta | Voz (primera persona) | Grupo |
|---|--------|------------------------|-------|
| 1 | Trabajo por cuenta ajena | "Entender mi sueldo y mis impuestos" | particular |
| 2 | Vivienda | "Comprar, vender o alquilar" | particular |
| 3 | Ahorro e inversión ⭐ | "Mi dinero a futuro" (pilar financiero) | particular |
| 4 | Jubilación y herencias | "Lo que viene y lo que dejo" | particular |
| 5 | Familia | "Situaciones personales con impacto económico" | particular |
| 6 | Mi actividad o negocio | "Autónomo o empresa, al día" | profesional |

Notas de fusión (decisión del autor): se unieron *Jubilación + Herencias* y *Autónomo + Empresa* para bajar de 8 a 6 puertas.

## 4. Renombrado

- **Etiqueta de menú**: `Calculadoras` → **`Soluciones`** (lenguaje de asesoría; cubre calc/orientador/simulador/test/checklist; cálida-profesional, no utilitaria).
- **Ruta**: `/calculadoras` → `/soluciones` (con redirect 301 desde la antigua).
- **Título de página**: *"¿Qué necesitas resolver?"*

## 5. Mapeo de apps por puerta (v1 — defaults documentados)

> Origen: extracción de las 228 candidatas (suites finanzas/legal-fiscal/freelance). Exclusiones aplicadas (ver §6).

**1 · Trabajo por cuenta ajena**: estimador-sueldo-neto · simulador-desglose-nomina · orientador-tipos-renta-irpf · estimador-irpf · test-obligado-declarar-renta · selector-contrato-trabajo · estimador-smi

**2 · Vivienda**: estimador-hipoteca · amortizacion-hipoteca · estimador-compraventa-inmueble · estimador-plusvalia-municipal · selector-tipo-hipoteca · selector-tipo-prestamo · estimador-prestamos · orientador-aval-ico · calculadora-rentabilidad-alquiler · estimador-actualizacion-alquiler · orientador-alquiler-vs-compra · simulador-bono-joven-alquiler · estimador-gastos-comunidad · orientador-alquiler-habitaciones

**3 · Ahorro e inversión** ⭐: test-perfil-inversor · estimador-interes-compuesto · estimador-inflacion · estimador-fire · estimador-fondo-emergencia · estimador-cartera-inversion · selector-inversiones · orientador-regla-50-30-20 · control-gastos · estimador-deuda · estimador-coste-plazos · estimador-tiempo-ahorro · selector-tipo-ahorro · selector-cuenta-bancaria · conversor-divisas

**4 · Jubilación y herencias**: simulador-jubilacion-publica · planificador-ahorro-jubilacion · selector-plan-pensiones · simulador-renta-plan-pensiones · estimador-complemento-minimos · estimador-irpf-pensionista · optimizador-rentas-60 · orientador-tramites-jubilacion · estimador-pension-viudedad · verificador-complemento-brecha-genero · estimador-impuesto-sucesiones · estimador-impuesto-donaciones · estimador-legitimas · simulador-heredar-vivienda · declaracion-renta-fallecidos · orientacion-tramitacion-herencias

**5 · Familia**: estimacion-prestacion-nacimiento · estimacion-deduccion-maternidad · estimacion-prestaciones-dependencia · orientador-grado-dependencia · orientador-discapacidad · estimacion-deduccion-discapacidad · residencia-vs-cuidado-en-casa · checklist-tramites-dependencia · impuestos-divorcio · orientador-ayudas-personas-familias
> Excluido por el autor: `planificador-gastos-bebe` (planificación de gasto doméstico, no prestación/fiscalidad).

**6 · Mi actividad o negocio**: estimador-cuota-autonomo · orientador-iva-espana · orientador-gastos-deducibles · orientador-facturacion-retencion · selector-regimen-fiscal-autonomo · simulador-modulos-vs-directa · generador-facturas · orientador-tarifa-freelance · planificador-trimestres-freelance · asistente-alta-autonomo · checklist-preparar-verifactu · calendario-fiscal-emprendedor · comparador-autonomo-vs-sl · comparador-formas-juridicas · asistente-constitucion-sociedad · analizador-ratios-financieros · calculadora-valoracion-empresa · simulador-contabilidad-basica · simulador-financiacion-empresarial · orientador-ayudas-autonomos-pymes · calculadora-amortizacion-inmovilizado · estimador-tir-van · calculadora-z-score-altman

## 6. Exclusiones aplicadas (defaults v1)

- **Visualizadores educativos (~35)** → fuera de Soluciones; futura sección **"Aprende"** (fase 2). Siguen accesibles vía buscador/asistente/cross-link.
- **Salud (E)**: colesterol, tensión, osteoporosis, fragilidad, chequeos, movilidad, adaptacion-hogar → fuera (la etiqueta legal-fiscal parece arrastre por dependencia).
- **Legal puro no fiscal (F)**: costas-judiciales, contrato-mercantil, justicia-gratuita, plazos-legales, constitucion-asociacion → fuera v1.
- **Becas/estudio (G)**: orientador-becas-ayudas-estudio → fuera v1.
- **Lifestyle financiero (H)**: comparador-coste-vida, planificador-gastos-bebe, estimador-reformas-hogar, simulador-placas-solares → fuera.
- **Duplicado simple vs profundo**: `calculadora-iva` (simple) fuera; `orientador-iva-espana` (profundo) dentro. Regla general: el tag va a la app profunda/España-específica; la simple/universal se queda en meskeIA.

## 7. Dudas ABIERTAS (a resolver "sobre la marcha")

- **A · Duplicados** aún sin cerrar: estimador-irpf vs simulador-irpf-tramos/mito · orientador-alquiler-vs-compra vs selector-alquiler-vs-compra · selector-forma-juridica vs comparador-formas-juridicas · estimador-inversiones vs selector-inversiones vs estimador-cartera-inversion · selector-financiacion-empresa vs simulador-financiacion-empresarial · test-perfil-inversor vs test-tolerancia-riesgo-detallado · impuestos-divorcio vs estimador-costes-divorcio.
- **B · Bloque SEGUROS** (~10 apps): sin puerta natural en el esquema de 6 → **excluido v1**. ¿Se abraza (¿nueva puerta? ¿repartido?) o se deja fuera?
- **C · Granularidad inmuebles**: garaje/trastero/nave-industrial → fuera v1 (solo el genérico); accesibles por buscador.
- **Posible duplicación entre superficies**: `calendario-fiscal-emprendedor` y `estimador-smi` podrían existir ya como *fichas de Datos fiscales* → enlazar, no repetir.
- **Armonización Puertas ↔ Guías**: ambas entran "por situación"; revisar relación en fase posterior.

## 8. Checklist de implementación

### Fase 1 — "Soluciones" (en curso)
- [ ] `DELEGUM-SOLUCIONES.md` (este documento)
- [ ] `data/delegum/soluciones.ts` — 6 puertas → urls + overrides
- [ ] `app/delegum/soluciones/page.tsx` + `Soluciones.module.css`
- [ ] Eliminar `app/delegum/calculadoras/`
- [ ] `proxy.ts` — matcher `/soluciones` + redirect 301 `/calculadoras`
- [ ] Enlaces internos `/calculadoras` → `/soluciones` (DelegumHeader, blog, datos-fiscales ×2, glosario, guias, home card)
- [ ] `public/delegum-sitemap.xml` — `/calculadoras/` → `/soluciones/`
- [ ] `npm run build` OK + commit/push
- [ ] Actualizar memoria

### Fase 2 — redes de seguridad y "Aprende" (posterior)
- [ ] Buscador acotado al universo Delegum
- [ ] Cross-linking contextual Delegum dentro de las herramientas
- [ ] Sección "Aprende" (hogar de los ~35 visualizadores)
- [ ] Resolver dudas A/B/C de §7
