param(
  [string]$BaseUrl = 'http://localhost:5276',
  [switch]$StartApi
)

$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
$apiProcess = $null

function Run-Step {
  param(
    [string]$Name,
    [scriptblock]$Action
  )

  Write-Host "==> $Name"
  & $Action
  Write-Host "OK: $Name"
  Write-Host ''
}

try {
  if ($StartApi) {
    $apiProcess = Start-Process -FilePath 'dotnet' -ArgumentList "run --project backend/Resenha.API/Resenha.API.csproj --urls $BaseUrl" -WorkingDirectory $repoRoot -PassThru
    Start-Sleep -Seconds 4
  }

  Run-Step -Name 'Teste de votacao' -Action {
    & "$PSScriptRoot/test-vote-flow.ps1" -BaseUrl $BaseUrl
  }

  Run-Step -Name 'Teste de recuperacao de senha' -Action {
    & "$PSScriptRoot/test-password-recovery-flow.ps1" -BaseUrl $BaseUrl
  }

  Run-Step -Name 'Teste de capitao' -Action {
    & "$PSScriptRoot/test-captain-flow.ps1" -BaseUrl $BaseUrl
  }

  Write-Host 'PASS: regressao completa (votacao + recuperacao + capitao) validada com sucesso.'
}
finally {
  if ($apiProcess -and -not $apiProcess.HasExited) {
    Stop-Process -Id $apiProcess.Id -Force
  }
}
