$filePath = 'c:\Users\jaceb\meskeia-web\app\api\mcp\route.ts'
$lines = [System.IO.File]::ReadAllLines($filePath, [System.Text.Encoding]::UTF8)

$oldJoin  = "return { content: [{ type: 'text', text: lineas.join('\n') }] };"
$oldTexto = "return { content: [{ type: 'text', text: texto }] };"
$newFJ    = "return conAviso(lineas.join('\n'), AVISO_FISCAL);"
$newSJ    = "return conAviso(lineas.join('\n'), AVISO_SALUD);"
$newFT    = "return conAviso(texto, AVISO_FISCAL);"

$lines[464]  = $lines[464].Replace($oldJoin,  $newSJ)
$lines[762]  = $lines[762].Replace($oldJoin,  $newFJ)
$lines[807]  = $lines[807].Replace($oldTexto, $newFT)
$lines[952]  = $lines[952].Replace($oldJoin,  $newFJ)
$lines[1075] = $lines[1075].Replace($oldJoin, $newFJ)
$lines[1164] = $lines[1164].Replace($oldJoin, $newFJ)
$lines[1342] = $lines[1342].Replace($oldJoin, $newFJ)
$lines[1696] = $lines[1696].Replace($oldJoin, $newFJ)
$lines[2192] = $lines[2192].Replace($oldJoin, $newFJ)
$lines[2314] = $lines[2314].Replace($oldJoin, $newFJ)
$lines[2389] = $lines[2389].Replace($oldJoin, $newFJ)
$lines[2443] = $lines[2443].Replace($oldJoin, $newFJ)
$lines[3076] = $lines[3076].Replace($oldJoin, $newFJ)
$lines[3306] = $lines[3306].Replace($oldJoin, $newFJ)
$lines[4241] = $lines[4241].Replace($oldJoin, $newFJ)

[System.IO.File]::WriteAllLines($filePath, $lines, [System.Text.Encoding]::UTF8)

$changed = 0
$targets = @(464, 762, 807, 952, 1075, 1164, 1342, 1696, 2192, 2314, 2389, 2443, 3076, 3306, 4241)
foreach ($i in $targets) {
    if ($lines[$i] -match 'conAviso') { $changed++ }
}
Write-Host "OK: $changed de 15 lineas actualizadas con conAviso"
