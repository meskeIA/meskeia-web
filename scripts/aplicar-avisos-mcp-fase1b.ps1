# Script Fase 1B: aplicar avisos legales al resto de tools MCP
# Cubre ~110 tools no procesadas en Fase 1A

$filePath = 'c:\Users\jaceb\meskeia-web\app\api\mcp\route.ts'
$lines = [System.IO.File]::ReadAllLines($filePath, [System.Text.Encoding]::UTF8)
$totalLines = $lines.Count

# -----------------------------------------------------------------------
# CLASIFICACION DE TOOLS
# -----------------------------------------------------------------------

# Tools ya procesadas en Fase 1A — saltar
$yaHechas = @(
  'calcular_imc', 'calcular_donaciones', 'calcular_iva',
  'calcular_pension_publica', 'calcular_sucesiones', 'calcular_hipoteca',
  'calcular_compraventa_inmueble', 'calcular_legitimas',
  'calcular_jubilacion_anticipada', 'calcular_sueldo_neto',
  'calcular_irpf', 'calcular_cuota_autonomo',
  'calcular_herencia_conjunta', 'calcular_declaracion_conjunta',
  'calcular_pension_complementaria'
)

# Tools cotidianas/educativas — sin aviso
$sinAviso = @(
  'calcular_propina', 'calcular_porcentaje', 'calcular_combustible',
  'calcular_diferencia_fechas', 'calcular_fecha_resultado',
  'calcular_dia_semana', 'calcular_edad',
  'calcular_gasto_energetico', 'convertir_edad_mascota',
  'calcular_regla_tres', 'convertir_unidades',
  'calcular_estadisticas', 'calcular_mcd_mcm', 'calcular_inflacion',
  'recomendar_vehiculo', 'calcular_breakeven_electrico',
  'consultar_etiqueta_dgt'
)

# Tools financieras (no fiscales directas) — AVISO_FINANCIERO
$financiero = @(
  'calcular_interes_compuesto', 'calcular_tir_van', 'calcular_fire',
  'calcular_tarifa_freelance', 'calcular_coste_aplazado',
  'calcular_roi_marketing', 'comparar_alquiler_compra',
  'calcular_break_even', 'calcular_seguro_vida',
  'calcular_subida_salarial', 'calcular_valor_presente',
  'calcular_rentabilidad_alquiler', 'calcular_estrategia_deuda',
  'calcular_objetivo_ahorro', 'calcular_regla_72',
  'rendimiento_bono', 'reequilibrio_cartera',
  'calcular_precio_venta', 'calcular_horas_efectivas',
  'calcular_numero_pagos', 'calcular_descuento_efectos',
  'calcular_provision_insolvencias'
)

# Tools de salud — AVISO_SALUD
$salud = @('calcular_macros')

# Todo lo demas => AVISO_FISCAL

# -----------------------------------------------------------------------
# LOCALIZAR TODAS LAS TOOLS (por patron servidor.tool)
# -----------------------------------------------------------------------
$toolPositions = [System.Collections.Generic.List[hashtable]]::new()

for ($i = 0; $i -lt ($totalLines - 1); $i++) {
  if ($lines[$i] -match "^\s+servidor\.tool\(") {
    $nameLine = $lines[$i + 1].Trim()
    if ($nameLine -match "^'([^']+)'") {
      $toolName = $Matches[1]
      $toolPositions.Add(@{ Line = $i; Name = $toolName })
    }
  }
}

Write-Host "Tools encontradas: $($toolPositions.Count)"

# -----------------------------------------------------------------------
# PATRON DE BUSQUEDA Y REEMPLAZO
# -----------------------------------------------------------------------
$pattern = "return \{ content: \[\{ type: 'text', text: (.+) \}\] \};"

$modified = 0
$skipped = 0

for ($t = 0; $t -lt $toolPositions.Count; $t++) {
  $tool     = $toolPositions[$t]
  $toolName = $tool.Name
  $startIdx = $tool.Line
  $endIdx   = if ($t + 1 -lt $toolPositions.Count) { $toolPositions[$t + 1].Line } else { $totalLines }

  # Saltar si ya hecha o sin aviso
  if ($yaHechas -contains $toolName -or $sinAviso -contains $toolName) {
    $skipped++
    continue
  }

  # Determinar tipo de aviso
  if ($salud -contains $toolName) {
    $aviso = 'AVISO_SALUD'
  } elseif ($financiero -contains $toolName) {
    $aviso = 'AVISO_FINANCIERO'
  } else {
    $aviso = 'AVISO_FISCAL'
  }

  # Procesar lineas de esta tool
  for ($i = $startIdx; $i -lt $endIdx; $i++) {
    $line = $lines[$i]

    # Solo lineas que sean returns de contenido texto
    if ($line -notmatch $pattern) { continue }

    # Excluir returns de error
    if ($line -match "Error|[Ee]rr |❌|'Para |'No se |'Solo |'Falta |'Modo ") { continue }

    # Excluir si ya tiene conAviso
    if ($line -match 'conAviso') { continue }

    # Aplicar reemplazo
    $newLine = $line -replace $pattern, "return conAviso(`$1, $aviso);"
    if ($newLine -ne $line) {
      $lines[$i] = $newLine
      $modified++
    }
  }
}

[System.IO.File]::WriteAllLines($filePath, $lines, [System.Text.Encoding]::UTF8)

Write-Host "Lineas modificadas: $modified"
Write-Host "Tools saltadas (ya hechas / sin aviso): $skipped"

# Verificacion rapida
$totalConAviso = ($lines | Where-Object { $_ -match 'conAviso' }).Count
Write-Host "Total lineas con conAviso en el archivo: $totalConAviso"
