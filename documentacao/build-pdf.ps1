param(
  [string]$InputHtml = "$PSScriptRoot\resenha-documentacao-tecnica-consolidada.html",
  [string]$OutputPdf = "$PSScriptRoot\resenha-documentacao-tecnica-consolidada.pdf"
)

$edgeCandidates = @(
  'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe',
  'C:\Program Files\Microsoft\Edge\Application\msedge.exe',
  'C:\Program Files\Google\Chrome\Application\chrome.exe',
  'C:\Program Files (x86)\Google\Chrome\Application\chrome.exe'
)

$browser = $edgeCandidates | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $browser) {
  throw 'Nao foi encontrado Edge/Chrome em caminho padrao para gerar o PDF.'
}

$inputPath = (Resolve-Path $InputHtml).Path
$outputPath = [System.IO.Path]::GetFullPath($OutputPdf)
$inputUri = 'file:///' + ($inputPath -replace '\\', '/')

if (Test-Path $outputPath) {
  Remove-Item -LiteralPath $outputPath -Force
}

& $browser --headless --disable-gpu --run-all-compositor-stages-before-draw --virtual-time-budget=12000 --print-to-pdf="$outputPath" "$inputUri" | Out-Null

if (-not (Test-Path $outputPath)) {
  throw 'A geracao do PDF falhou.'
}

Write-Output "PDF gerado em: $outputPath"
