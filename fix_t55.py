import sys

# ================================================================
# T55: guia-tipos-pan, guia-tipos-pasta, guia-varietales-vino,
#      guia-vinagres-mundo
# ================================================================

BASE = r"c:\Users\jaceb\meskeia-web\app"

def apply(path, changes):
    with open(path, encoding="utf-8") as f:
        c = f.read()
    ok = 0
    for old, new in changes:
        c2 = c.replace(old, new)
        if c2 == c:
            print(f"  WARN no encontrado: {old[:55]!r}")
        else:
            c = c2
            ok += 1
    with open(path, "w", encoding="utf-8") as f:
        f.write(c)
    print(f"  {ok}/{len(changes)} cambios aplicados")

# ── guia-tipos-pan ─────────────────────────────────────────────
print("=== guia-tipos-pan ===")
apply(BASE + r"\guia-tipos-pan\page.tsx", [
    (
        "                  {FERMENTACION_EMOJI[pan.fermentacion]} {pan.fermentacion}",
        '                  <span aria-hidden="true">{FERMENTACION_EMOJI[pan.fermentacion]}</span> {pan.fermentacion}'
    ),
])

# ── guia-tipos-pasta ────────────────────────────────────────────
print("=== guia-tipos-pasta ===")
apply(BASE + r"\guia-tipos-pasta\page.tsx", [
    # forma - estático
    (
        "                type=\"button\"\n                onClick={() => setFormaFiltro('Todas')}",
        "                type=\"button\"\n                aria-pressed={formaFiltro === 'Todas'}\n                onClick={() => setFormaFiltro('Todas')}"
    ),
    # forma - mapeado
    (
        "                  type=\"button\"\n                  onClick={() => setFormaFiltro(forma)}",
        "                  type=\"button\"\n                  aria-pressed={formaFiltro === forma}\n                  onClick={() => setFormaFiltro(forma)}"
    ),
    # region - estático
    (
        "                type=\"button\"\n                onClick={() => setRegionFiltro('Todas')}",
        "                type=\"button\"\n                aria-pressed={regionFiltro === 'Todas'}\n                onClick={() => setRegionFiltro('Todas')}"
    ),
    # region - mapeado
    (
        "                  type=\"button\"\n                  onClick={() => setRegionFiltro(region)}",
        "                  type=\"button\"\n                  aria-pressed={regionFiltro === region}\n                  onClick={() => setRegionFiltro(region)}"
    ),
    # salsa - estático
    (
        "                type=\"button\"\n                onClick={() => setSalsaFiltro('Todas')}",
        "                type=\"button\"\n                aria-pressed={salsaFiltro === 'Todas'}\n                onClick={() => setSalsaFiltro('Todas')}"
    ),
    # salsa - mapeado
    (
        "                  type=\"button\"\n                  onClick={() => setSalsaFiltro(salsa)}",
        "                  type=\"button\"\n                  aria-pressed={salsaFiltro === salsa}\n                  onClick={() => setSalsaFiltro(salsa)}"
    ),
    # dificultad - estático
    (
        "                type=\"button\"\n                onClick={() => setDificultadFiltro('Todas')}",
        "                type=\"button\"\n                aria-pressed={dificultadFiltro === 'Todas'}\n                onClick={() => setDificultadFiltro('Todas')}"
    ),
    # dificultad - mapeado
    (
        "                  type=\"button\"\n                  onClick={() => setDificultadFiltro(dif)}",
        "                  type=\"button\"\n                  aria-pressed={dificultadFiltro === dif}\n                  onClick={() => setDificultadFiltro(dif)}"
    ),
])

# ── guia-varietales-vino ────────────────────────────────────────
print("=== guia-varietales-vino ===")
apply(BASE + r"\guia-varietales-vino\page.tsx", [
    # h1
    (
        "<h1>\U0001f377 Gu\xeda de Varietales de Vino</h1>",
        "<h1><span aria-hidden=\"true\">\U0001f377</span> Gu\xeda de Varietales de Vino</h1>"
    ),
    # botones TIPOS - añadir type="button" (ya tienen aria-pressed)
    (
        "                    className={`${styles.filtroBtn} ${tipo === t ? styles.filtroActivo : ''}`}\n                    onClick={() => setTipo(t)}\n                    aria-pressed={tipo === t}",
        "                    type=\"button\"\n                    className={`${styles.filtroBtn} ${tipo === t ? styles.filtroActivo : ''}`}\n                    onClick={() => setTipo(t)}\n                    aria-pressed={tipo === t}"
    ),
    # origenPill
    (
        "<span className={styles.origenPill}>\U0001f4cd {v.origen}</span>",
        "<span className={styles.origenPill}><span aria-hidden=\"true\">\U0001f4cd</span> {v.origen}</span>"
    ),
    # h4 escenarios
    (
        "<h4>\U0001f56f️ Cena rom\xe1ntica</h4>",
        "<h4><span aria-hidden=\"true\">\U0001f56f️</span> Cena rom\xe1ntica</h4>"
    ),
    (
        "<h4>\U0001f969 Maridaje con carne roja</h4>",
        "<h4><span aria-hidden=\"true\">\U0001f969</span> Maridaje con carne roja</h4>"
    ),
    (
        "<h4>\U0001f942 Aperitivo o celebraci\xf3n</h4>",
        "<h4><span aria-hidden=\"true\">\U0001f942</span> Aperitivo o celebraci\xf3n</h4>"
    ),
    (
        "<h4>\U0001f3fa Coleccionista o regalo especial</h4>",
        "<h4><span aria-hidden=\"true\">\U0001f3fa</span> Coleccionista o regalo especial</h4>"
    ),
    # faqTip 1
    (
        "              <span className={styles.faqTip}>\n                \U0001f4a1 Un joven de varietal expresivo puede superar a una crianza de uva mediocre.\n              </span>",
        "              <span className={styles.faqTip}>\n                <span aria-hidden=\"true\">\U0001f4a1</span> Un joven de varietal expresivo puede superar a una crianza de uva mediocre.\n              </span>"
    ),
    # faqTip 2
    (
        "              <span className={styles.faqTip}>\n                \U0001f4a1 Regla pr\xe1ctica: 30 minutos en el frigor\xedfico para un tinto servido a temperatura de sala.\n              </span>",
        "              <span className={styles.faqTip}>\n                <span aria-hidden=\"true\">\U0001f4a1</span> Regla pr\xe1ctica: 30 minutos en el frigor\xedfico para un tinto servido a temperatura de sala.\n              </span>"
    ),
])

# ── guia-vinagres-mundo ─────────────────────────────────────────
print("=== guia-vinagres-mundo ===")
apply(BASE + r"\guia-vinagres-mundo\page.tsx", [
    # h4 warning
    (
        "<h4>⚠️ Errores comunes que conviene evitar</h4>",
        "<h4><span aria-hidden=\"true\">⚠️</span> Errores comunes que conviene evitar</h4>"
    ),
    # origen - estático
    (
        "                <button\n                  className={`${styles.filtroBtn} ${\n                    origen === 'Todos' ? styles.filtroActivo : ''\n                  }`}\n                  onClick={() => setOrigen('Todos')}",
        "                <button\n                  type=\"button\"\n                  aria-pressed={origen === 'Todos'}\n                  className={`${styles.filtroBtn} ${\n                    origen === 'Todos' ? styles.filtroActivo : ''\n                  }`}\n                  onClick={() => setOrigen('Todos')}"
    ),
    # origen - mapeado
    (
        "                    className={`${styles.filtroBtn} ${\n                      origen === o ? styles.filtroActivo : ''\n                    }`}\n                    onClick={() => setOrigen(o)}",
        "                    type=\"button\"\n                    aria-pressed={origen === o}\n                    className={`${styles.filtroBtn} ${\n                      origen === o ? styles.filtroActivo : ''\n                    }`}\n                    onClick={() => setOrigen(o)}"
    ),
    # region - estático
    (
        "                <button\n                  className={`${styles.filtroBtn} ${\n                    region === 'Todos' ? styles.filtroActivo : ''\n                  }`}\n                  onClick={() => setRegion('Todos')}",
        "                <button\n                  type=\"button\"\n                  aria-pressed={region === 'Todos'}\n                  className={`${styles.filtroBtn} ${\n                    region === 'Todos' ? styles.filtroActivo : ''\n                  }`}\n                  onClick={() => setRegion('Todos')}"
    ),
    # region - mapeado
    (
        "                    className={`${styles.filtroBtn} ${\n                      region === r ? styles.filtroActivo : ''\n                    }`}\n                    onClick={() => setRegion(r)}",
        "                    type=\"button\"\n                    aria-pressed={region === r}\n                    className={`${styles.filtroBtn} ${\n                      region === r ? styles.filtroActivo : ''\n                    }`}\n                    onClick={() => setRegion(r)}"
    ),
    # acidez - estático
    (
        "                <button\n                  className={`${styles.filtroBtn} ${\n                    acidez === 'Todos' ? styles.filtroActivo : ''\n                  }`}\n                  onClick={() => setAcidez('Todos')}",
        "                <button\n                  type=\"button\"\n                  aria-pressed={acidez === 'Todos'}\n                  className={`${styles.filtroBtn} ${\n                    acidez === 'Todos' ? styles.filtroActivo : ''\n                  }`}\n                  onClick={() => setAcidez('Todos')}"
    ),
    # acidez - mapeado
    (
        "                    className={`${styles.filtroBtn} ${\n                      acidez === a ? styles.filtroActivo : ''\n                    }`}\n                    onClick={() => setAcidez(a)}",
        "                    type=\"button\"\n                    aria-pressed={acidez === a}\n                    className={`${styles.filtroBtn} ${\n                      acidez === a ? styles.filtroActivo : ''\n                    }`}\n                    onClick={() => setAcidez(a)}"
    ),
    # intensidad - estático
    (
        "                <button\n                  className={`${styles.filtroBtn} ${\n                    intensidad === 'Todos' ? styles.filtroActivo : ''\n                  }`}\n                  onClick={() => setIntensidad('Todos')}",
        "                <button\n                  type=\"button\"\n                  aria-pressed={intensidad === 'Todos'}\n                  className={`${styles.filtroBtn} ${\n                    intensidad === 'Todos' ? styles.filtroActivo : ''\n                  }`}\n                  onClick={() => setIntensidad('Todos')}"
    ),
    # intensidad - mapeado
    (
        "                    className={`${styles.filtroBtn} ${\n                      intensidad === i ? styles.filtroActivo : ''\n                    }`}\n                    onClick={() => setIntensidad(i)}",
        "                    type=\"button\"\n                    aria-pressed={intensidad === i}\n                    className={`${styles.filtroBtn} ${\n                      intensidad === i ? styles.filtroActivo : ''\n                    }`}\n                    onClick={() => setIntensidad(i)}"
    ),
    # uso - estático
    (
        "                <button\n                  className={`${styles.filtroBtn} ${\n                    uso === 'Todos' ? styles.filtroActivo : ''\n                  }`}\n                  onClick={() => setUso('Todos')}",
        "                <button\n                  type=\"button\"\n                  aria-pressed={uso === 'Todos'}\n                  className={`${styles.filtroBtn} ${\n                    uso === 'Todos' ? styles.filtroActivo : ''\n                  }`}\n                  onClick={() => setUso('Todos')}"
    ),
    # uso - mapeado
    (
        "                    className={`${styles.filtroBtn} ${\n                      uso === u ? styles.filtroActivo : ''\n                    }`}\n                    onClick={() => setUso(u)}",
        "                    type=\"button\"\n                    aria-pressed={uso === u}\n                    className={`${styles.filtroBtn} ${\n                      uso === u ? styles.filtroActivo : ''\n                    }`}\n                    onClick={() => setUso(u)}"
    ),
])

print("DONE T55")
