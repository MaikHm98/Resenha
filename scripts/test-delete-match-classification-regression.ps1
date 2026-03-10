param(
  [string]$BaseUrl = 'http://localhost:5276',
  [switch]$StartApi
)

$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
$apiProcess = $null

function Invoke-Api {
  param(
    [string]$Method,
    [string]$Path,
    [object]$Body = $null,
    [string]$Token = $null,
    [switch]$AllowError
  )

  $headers = @{}
  if ($Token) {
    $headers['Authorization'] = "Bearer $Token"
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
    throw [System.Exception]::new($Message)
  }
}

function Normalize-ApiList {
  param([object]$Value)

  if ($null -eq $Value) { return @() }
  if ($Value -is [System.Array]) { return @($Value) }
  if ($Value.PSObject -and ($Value.PSObject.Properties.Name -contains '$values')) {
    return @($Value.'$values')
  }

  return @($Value)
}

function Get-EntryById {
  param(
    [array]$Entries,
    [int64]$UserId
  )

  return ($Entries | Where-Object { [int64]$_.idUsuario -eq $UserId } | Select-Object -First 1)
}

try {
  if ($StartApi) {
    $apiProcess = Start-Process -FilePath 'dotnet' -ArgumentList "run --project backend/Resenha.API/Resenha.API.csproj --urls $BaseUrl" -WorkingDirectory $repoRoot -PassThru
    Start-Sleep -Seconds 4
  }

  $health = Invoke-Api -Method 'GET' -Path '/swagger/index.html' -AllowError
  if ($health.error -and $health.status -lt 0) {
    throw "API nao acessivel em $BaseUrl. Inicie a API ou use -StartApi."
  }

  $suffix = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds().ToString()

  $users = @(
    @{ nome = 'Admin Delete'; email = "admin.delete.$suffix@resenha.local"; senha = 'Resenha@123' },
    @{ nome = 'Winner One'; email = "w1.delete.$suffix@resenha.local"; senha = 'Resenha@123' },
    @{ nome = 'Loser One'; email = "l1.delete.$suffix@resenha.local"; senha = 'Resenha@123' },
    @{ nome = 'Loser Two'; email = "l2.delete.$suffix@resenha.local"; senha = 'Resenha@123' }
  )

  $auth = @()
  foreach ($u in $users) {
    $reg = Invoke-Api -Method 'POST' -Path '/api/users/register' -Body @{ nome = $u.nome; email = $u.email; senha = $u.senha; goleiro = $false }
    $auth += [PSCustomObject]@{
      nome = $u.nome
      email = $u.email
      id = [int64]$reg.idUsuario
      token = $reg.token
    }
  }

  $admin = $auth[0]
  $winner = $auth[1]
  $loser1 = $auth[2]
  $loser2 = $auth[3]

  $group = Invoke-Api -Method 'POST' -Path '/api/groups' -Body @{ nome = "Grupo Delete Regression $suffix"; descricao = 'Teste delete match rollback'; limiteJogadores = 16 } -Token $admin.token
  $groupId = [int64]$group.idGrupo

  foreach ($p in @($winner, $loser1, $loser2)) {
    $invite = Invoke-Api -Method 'POST' -Path "/api/groups/$groupId/invite" -Body @{ emailConvidado = $p.email } -Token $admin.token
    [void](Invoke-Api -Method 'POST' -Path '/api/groups/join' -Body @{ codigoConvite = $invite.codigoConvite } -Token $p.token)
  }

  $match = Invoke-Api -Method 'POST' -Path '/api/matches' -Body @{ idGrupo = $groupId; dataHoraJogo = '2026-03-04T20:00:00'; limiteVagas = 16; observacao = 'Teste regressao delete classificacao' } -Token $admin.token
  $matchId = [int64]$match.idPartida

  foreach ($u in @($admin, $winner, $loser1, $loser2)) {
    [void](Invoke-Api -Method 'POST' -Path "/api/matches/$matchId/confirm" -Body @{} -Token $u.token)
  }

  [void](Invoke-Api -Method 'POST' -Path "/api/matches/$matchId/teams" -Body @{
    time1 = @{ idCapitao = [int64]$admin.id; jogadores = @([int64]$admin.id, [int64]$winner.id) }
    time2 = @{ idCapitao = [int64]$loser1.id; jogadores = @([int64]$loser1.id, [int64]$loser2.id) }
  } -Token $admin.token)

  [void](Invoke-Api -Method 'POST' -Path "/api/matches/$matchId/finalize" -Body @{ golsTime1 = 2; golsTime2 = 1; estatisticas = @(
    @{ idUsuario = [int64]$admin.id; gols = 1; assistencias = 0 },
    @{ idUsuario = [int64]$winner.id; gols = 1; assistencias = 1 },
    @{ idUsuario = [int64]$loser1.id; gols = 1; assistencias = 0 },
    @{ idUsuario = [int64]$loser2.id; gols = 0; assistencias = 0 }
  ) } -Token $admin.token)

  [void](Invoke-Api -Method 'POST' -Path "/api/matches/$matchId/vote/open" -Body @{} -Token $admin.token)

  # MVP winner = Winner One
  [void](Invoke-Api -Method 'POST' -Path "/api/matches/$matchId/vote" -Body @{ tipo = 'MVP'; idUsuarioVotado = [int64]$winner.id } -Token $admin.token)
  [void](Invoke-Api -Method 'POST' -Path "/api/matches/$matchId/vote" -Body @{ tipo = 'MVP'; idUsuarioVotado = [int64]$admin.id } -Token $winner.token)
  [void](Invoke-Api -Method 'POST' -Path "/api/matches/$matchId/vote" -Body @{ tipo = 'MVP'; idUsuarioVotado = [int64]$winner.id } -Token $loser1.token)
  [void](Invoke-Api -Method 'POST' -Path "/api/matches/$matchId/vote" -Body @{ tipo = 'MVP'; idUsuarioVotado = [int64]$winner.id } -Token $loser2.token)
  [void](Invoke-Api -Method 'POST' -Path "/api/matches/$matchId/vote/close" -Body @{ tipo = 'MVP' } -Token $admin.token)
  [void](Invoke-Api -Method 'POST' -Path "/api/matches/$matchId/vote/approve" -Body @{ tipo = 'MVP' } -Token $admin.token)

  # Bola murcha winner = Loser Two
  [void](Invoke-Api -Method 'POST' -Path "/api/matches/$matchId/vote" -Body @{ tipo = 'BOLA_MURCHA'; idUsuarioVotado = [int64]$loser2.id } -Token $admin.token)
  [void](Invoke-Api -Method 'POST' -Path "/api/matches/$matchId/vote" -Body @{ tipo = 'BOLA_MURCHA'; idUsuarioVotado = [int64]$loser2.id } -Token $winner.token)
  [void](Invoke-Api -Method 'POST' -Path "/api/matches/$matchId/vote" -Body @{ tipo = 'BOLA_MURCHA'; idUsuarioVotado = [int64]$loser2.id } -Token $loser1.token)
  [void](Invoke-Api -Method 'POST' -Path "/api/matches/$matchId/vote" -Body @{ tipo = 'BOLA_MURCHA'; idUsuarioVotado = [int64]$loser1.id } -Token $loser2.token)
  [void](Invoke-Api -Method 'POST' -Path "/api/matches/$matchId/vote/close" -Body @{ tipo = 'BOLA_MURCHA' } -Token $admin.token)
  [void](Invoke-Api -Method 'POST' -Path "/api/matches/$matchId/vote/approve" -Body @{ tipo = 'BOLA_MURCHA' } -Token $admin.token)

  $before = Invoke-Api -Method 'GET' -Path "/api/groups/$groupId/classification" -Token $admin.token
  $beforeEntries = Normalize-ApiList $before.classificacao

  $beforeAdmin = Get-EntryById -Entries $beforeEntries -UserId $admin.id
  $beforeWinner = Get-EntryById -Entries $beforeEntries -UserId $winner.id
  $beforeLoser1 = Get-EntryById -Entries $beforeEntries -UserId $loser1.id
  $beforeLoser2 = Get-EntryById -Entries $beforeEntries -UserId $loser2.id

  Assert-True ($null -ne $beforeAdmin -and [int]$beforeAdmin.pontos -eq 4 -and [int]$beforeAdmin.vitorias -eq 1 -and [int]$beforeAdmin.presencas -eq 1) 'Falha pre-delete: stats do admin incorretas.'
  Assert-True ($null -ne $beforeWinner -and [int]$beforeWinner.pontos -eq 4 -and [int]$beforeWinner.mvps -eq 1) 'Falha pre-delete: stats do winner incorretas.'
  Assert-True ($null -ne $beforeLoser1 -and [int]$beforeLoser1.pontos -eq 1 -and [int]$beforeLoser1.derrotas -eq 1) 'Falha pre-delete: stats do loser1 incorretas.'
  Assert-True ($null -ne $beforeLoser2 -and [int]$beforeLoser2.pontos -eq 1 -and [int]$beforeLoser2.bolasMurchas -eq 1) 'Falha pre-delete: stats do loser2 incorretas.'

  [void](Invoke-Api -Method 'DELETE' -Path "/api/matches/$matchId" -Token $admin.token)

  $after = Invoke-Api -Method 'GET' -Path "/api/groups/$groupId/classification" -Token $admin.token
  $afterEntries = Normalize-ApiList $after.classificacao

  foreach ($u in @($admin, $winner, $loser1, $loser2)) {
    $entry = Get-EntryById -Entries $afterEntries -UserId $u.id
    Assert-True ($null -ne $entry) "Falha pos-delete: entrada de classificacao ausente para $($u.nome)."
    $statsReset =
      [int]$entry.pontos -eq 0 -and
      [int]$entry.vitorias -eq 0 -and
      [int]$entry.derrotas -eq 0 -and
      [int]$entry.presencas -eq 0 -and
      [int]$entry.gols -eq 0 -and
      [int]$entry.assistencias -eq 0 -and
      [int]$entry.mvps -eq 0 -and
      [int]$entry.bolasMurchas -eq 0

    Assert-True $statsReset "Falha pos-delete: stats nao foram revertidas para $($u.nome)."
  }

  $summary = [PSCustomObject]@{
    passed = $true
    groupId = $groupId
    matchId = $matchId
    playersChecked = @($admin.nome, $winner.nome, $loser1.nome, $loser2.nome)
    verification = 'classificacao revertida apos exclusao da partida finalizada'
  }

  $summary | ConvertTo-Json -Depth 6
  Write-Host 'PASS: rollback da classificacao na exclusao de partida validado com sucesso.'
}
finally {
  if ($apiProcess -and -not $apiProcess.HasExited) {
    Stop-Process -Id $apiProcess.Id -Force
  }
}
