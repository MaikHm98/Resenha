param(
  [string]$BaseUrl = 'http://localhost:5276',
  [switch]$StartApi
)

$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
$apiProcess = $null
$stdoutPath = Join-Path $env:TEMP "resenha-api-reset-$([DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()).out.log"
$stderrPath = Join-Path $env:TEMP "resenha-api-reset-$([DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()).err.log"
$testPassed = $false

function Invoke-Api {
  param(
    [string]$Method,
    [string]$Path,
    [object]$Body = $null,
    [string]$Token = $null,
    [hashtable]$ExtraHeaders = $null,
    [switch]$AllowError
  )

  $headers = @{}
  if ($Token) {
    $headers['Authorization'] = "Bearer $Token"
  }
  if ($ExtraHeaders) {
    foreach ($k in $ExtraHeaders.Keys) {
      $headers[$k] = $ExtraHeaders[$k]
    }
  }

  try {
    if ($null -eq $Body) {
      return Invoke-RestMethod -Method $Method -Uri "$BaseUrl$Path" -Headers $headers -ContentType 'application/json'
    }

    $json = $Body | ConvertTo-Json -Depth 10
    return Invoke-RestMethod -Method $Method -Uri "$BaseUrl$Path" -Headers $headers -ContentType 'application/json' -Body $json
  } catch {
    if (-not $AllowError) {
      throw
    }

    $status = -1
    $raw = $_.Exception.Message

    if ($_.Exception.Response -and $_.Exception.Response.GetResponseStream) {
      $resp = $_.Exception.Response
      $status = [int]$resp.StatusCode
      $reader = New-Object System.IO.StreamReader($resp.GetResponseStream())
      $raw = $reader.ReadToEnd()
    }

    return [PSCustomObject]@{
      error = $true
      status = $status
      raw = $raw
    }
  }
}

function Assert-True {
  param(
    [bool]$Condition,
    [string]$Message
  )

  if (-not $Condition) {
    throw $Message
  }
}

function Read-TokenFromLogs {
  param(
    [string]$LogPath
  )

  if (-not (Test-Path $LogPath)) {
    return $null
  }

  $line = Get-Content $LogPath | Select-String -Pattern 'PASSWORD_RESET_EMAIL_(SKIPPED_NO_(SMTP|SENDGRID)_CONFIG|SEND_FAILED) \| .*link=' | Select-Object -Last 1
  if (-not $line) {
    return $null
  }

  $raw = $line.Line
  $match = [regex]::Match($raw, 'token=([A-Za-z0-9\-_]+)')
  if (-not $match.Success) {
    return $null
  }

  return $match.Groups[1].Value
}

try {
  if ($StartApi) {
    $apiProcess = Start-Process -FilePath 'dotnet' -ArgumentList "run --project backend/Resenha.API/Resenha.API.csproj --urls $BaseUrl" -WorkingDirectory $repoRoot -PassThru -RedirectStandardOutput $stdoutPath -RedirectStandardError $stderrPath
    Start-Sleep -Seconds 4
  }

  $health = Invoke-Api -Method 'GET' -Path '/swagger/index.html' -AllowError
  if ($health.error -and $health.status -lt 0) {
    throw "API nao acessivel em $BaseUrl. Inicie a API ou use -StartApi."
  }

  $suffix = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds().ToString()
  $email = "recover.$suffix@resenha.local"
  $oldPassword = 'Resenha@123'
  $newPassword = 'ResenhaNova@123'

  $register = Invoke-Api -Method 'POST' -Path '/api/users/register' -Body @{
    nome = 'Recover User'
    email = $email
    senha = $oldPassword
    goleiro = $false
  }
  $oldToken = $register.token

  $forgot = Invoke-Api -Method 'POST' -Path '/api/users/forgot-password' -Body @{ email = $email } -ExtraHeaders @{ 'X-Debug-Reset-Token' = 'true' }
  $resetToken = $forgot.debugToken

  if (-not $resetToken) {
    for ($i = 0; $i -lt 15; $i++) {
      Start-Sleep -Milliseconds 400
      $resetToken = Read-TokenFromLogs -LogPath $stdoutPath
      if ($resetToken) { break }
    }
  }

  if (-not $resetToken) {
    throw "Nao foi possivel extrair o token de recuperacao dos logs. Confira configuracao de e-mail e logs da API em $stdoutPath."
  }

  $validation = Invoke-Api -Method 'GET' -Path "/api/users/reset-password/validate?token=$resetToken"
  Assert-True ($validation.valido -eq $true) 'Falha: token de recuperacao deveria ser valido.'

  $weakReset = Invoke-Api -Method 'POST' -Path '/api/users/reset-password' -Body @{
    token = $resetToken
    novaSenha = 'fraca'
  } -AllowError
  Assert-True ($weakReset.error -and $weakReset.status -eq 400) 'Falha: senha fraca deveria ser rejeitada com 400.'

  [void](Invoke-Api -Method 'POST' -Path '/api/users/reset-password' -Body @{
    token = $resetToken
    novaSenha = $newPassword
  })

  $validationAfter = Invoke-Api -Method 'GET' -Path "/api/users/reset-password/validate?token=$resetToken"
  Assert-True ($validationAfter.valido -eq $false) 'Falha: token deveria estar invalidado apos reset.'

  $oldLogin = Invoke-Api -Method 'POST' -Path '/api/users/login' -Body @{
    email = $email
    senha = $oldPassword
  } -AllowError
  Assert-True ($oldLogin.error -and $oldLogin.status -eq 400) 'Falha: senha antiga deveria falhar no login.'

  $newLogin = Invoke-Api -Method 'POST' -Path '/api/users/login' -Body @{
    email = $email
    senha = $newPassword
  }
  Assert-True (-not [string]::IsNullOrWhiteSpace($newLogin.token)) 'Falha: login com senha nova deveria retornar token.'

  $oldTokenProfile = Invoke-Api -Method 'PATCH' -Path '/api/users/profile' -Body @{ goleiro = $false } -Token $oldToken -AllowError
  Assert-True ($oldTokenProfile.error -and $oldTokenProfile.status -eq 401) 'Falha: token antigo deveria ser invalidado apos reset.'

  $summary = [PSCustomObject]@{
    passed = $true
    email = $email
    oldTokenInvalidated = $true
    tokenInvalidatedAfterReset = $true
    weakPasswordRejected = $true
  }

  $summary | ConvertTo-Json -Depth 6
  Write-Host 'PASS: fluxo de recuperacao de senha validado com sucesso.'
  $testPassed = $true
}
finally {
  if ($apiProcess -and -not $apiProcess.HasExited) {
    Stop-Process -Id $apiProcess.Id -Force
  }

  if ($StartApi -and $testPassed) {
    if (Test-Path $stdoutPath) {
      Remove-Item $stdoutPath -Force -ErrorAction SilentlyContinue
    }
    if (Test-Path $stderrPath) {
      Remove-Item $stderrPath -Force -ErrorAction SilentlyContinue
    }
  }
}
