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
    throw $Message
  }
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
    @{ nome = 'Admin Review'; email = "admin.review.$suffix@resenha.local"; senha = 'Resenha@123' },
    @{ nome = 'Jogador Um'; email = "j1.review.$suffix@resenha.local"; senha = 'Resenha@123' },
    @{ nome = 'Jogador Dois'; email = "j2.review.$suffix@resenha.local"; senha = 'Resenha@123' },
    @{ nome = 'Jogador Tres'; email = "j3.review.$suffix@resenha.local"; senha = 'Resenha@123' }
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
  $p1 = $auth[1]
  $p2 = $auth[2]
  $p3 = $auth[3]

  $group = Invoke-Api -Method 'POST' -Path '/api/groups' -Body @{ nome = "Grupo Review $suffix"; descricao = 'Grupo temporario teste'; limiteJogadores = 16 } -Token $admin.token
  $groupId = [int64]$group.idGrupo

  foreach ($p in @($p1, $p2, $p3)) {
    $invite = Invoke-Api -Method 'POST' -Path "/api/groups/$groupId/invite" -Body @{ emailConvidado = $p.email } -Token $admin.token
    [void](Invoke-Api -Method 'POST' -Path '/api/groups/join' -Body @{ codigoConvite = $invite.codigoConvite } -Token $p.token)
  }

  $match = Invoke-Api -Method 'POST' -Path '/api/matches' -Body @{ idGrupo = $groupId; dataHoraJogo = '2026-03-02T20:00:00'; limiteVagas = 16; observacao = 'Teste automatizado de votacao' } -Token $admin.token
  $matchId = [int64]$match.idPartida

  foreach ($u in @($admin, $p1, $p2, $p3)) {
    [void](Invoke-Api -Method 'POST' -Path "/api/matches/$matchId/confirm" -Body @{} -Token $u.token)
  }

  [void](Invoke-Api -Method 'POST' -Path "/api/matches/$matchId/teams" -Body @{
    time1 = @{ idCapitao = [int64]$admin.id; jogadores = @([int64]$admin.id, [int64]$p1.id) }
    time2 = @{ idCapitao = [int64]$p2.id; jogadores = @([int64]$p2.id, [int64]$p3.id) }
  } -Token $admin.token)

  [void](Invoke-Api -Method 'POST' -Path "/api/matches/$matchId/finalize" -Body @{ golsTime1 = 2; golsTime2 = 1; estatisticas = @() } -Token $admin.token)
  [void](Invoke-Api -Method 'POST' -Path "/api/matches/$matchId/vote/open" -Body @{} -Token $admin.token)

  [void](Invoke-Api -Method 'POST' -Path "/api/matches/$matchId/vote" -Body @{ tipo = 'MVP'; idUsuarioVotado = [int64]$p1.id } -Token $admin.token)
  [void](Invoke-Api -Method 'POST' -Path "/api/matches/$matchId/vote" -Body @{ tipo = 'MVP'; idUsuarioVotado = [int64]$p2.id } -Token $p1.token)
  [void](Invoke-Api -Method 'POST' -Path "/api/matches/$matchId/vote" -Body @{ tipo = 'MVP'; idUsuarioVotado = [int64]$p1.id } -Token $p2.token)
  [void](Invoke-Api -Method 'POST' -Path "/api/matches/$matchId/vote" -Body @{ tipo = 'MVP'; idUsuarioVotado = [int64]$p2.id } -Token $p3.token)

  [void](Invoke-Api -Method 'POST' -Path "/api/matches/$matchId/vote/close" -Body @{ tipo = 'MVP' } -Token $admin.token)
  $statusAfterTie = Invoke-Api -Method 'GET' -Path "/api/matches/$matchId/vote" -Token $admin.token

  $round2Candidates = @($statusAfterTie.mvp.candidatos)

  Assert-True ($statusAfterTie.mvp.rodada -eq 2) 'Falha: empate nao abriu rodada 2.'
  Assert-True ($statusAfterTie.mvp.status -eq 'ABERTA') 'Falha: rodada 2 nao ficou ABERTA.'
  Assert-True ($round2Candidates.Count -eq 2) 'Falha: rodada 2 nao trouxe os dois candidatos empatados.'

  [void](Invoke-Api -Method 'POST' -Path "/api/matches/$matchId/vote" -Body @{ tipo = 'MVP'; idUsuarioVotado = [int64]$p1.id } -Token $admin.token)
  [void](Invoke-Api -Method 'POST' -Path "/api/matches/$matchId/vote" -Body @{ tipo = 'MVP'; idUsuarioVotado = [int64]$p2.id } -Token $p1.token)
  [void](Invoke-Api -Method 'POST' -Path "/api/matches/$matchId/vote" -Body @{ tipo = 'MVP'; idUsuarioVotado = [int64]$p1.id } -Token $p2.token)
  [void](Invoke-Api -Method 'POST' -Path "/api/matches/$matchId/vote" -Body @{ tipo = 'MVP'; idUsuarioVotado = [int64]$p1.id } -Token $p3.token)

  [void](Invoke-Api -Method 'POST' -Path "/api/matches/$matchId/vote/close" -Body @{ tipo = 'MVP' } -Token $admin.token)
  [void](Invoke-Api -Method 'POST' -Path "/api/matches/$matchId/vote/approve" -Body @{ tipo = 'MVP' } -Token $admin.token)

  $finalStatus = Invoke-Api -Method 'GET' -Path "/api/matches/$matchId/vote" -Token $admin.token
  Assert-True ($finalStatus.mvp.status -eq 'APROVADA') 'Falha: resultado MVP nao ficou APROVADA.'

  $reopenAttempt = Invoke-Api -Method 'POST' -Path "/api/matches/$matchId/vote/open" -Body @{} -Token $admin.token -AllowError
  Assert-True ($reopenAttempt.error -and $reopenAttempt.status -eq 409) 'Falha: reabertura de votacao deveria ser bloqueada com 409.'

  $summary = [PSCustomObject]@{
    passed = $true
    groupId = $groupId
    matchId = $matchId
    mvpRoundAfterTie = $statusAfterTie.mvp.rodada
    round2CandidateCount = $round2Candidates.Count
    mvpFinalStatus = $finalStatus.mvp.status
    mvpWinner = $finalStatus.mvp.nomeVencedorProvisorio
    reopenStatus = $reopenAttempt.status
  }

  $summary | ConvertTo-Json -Depth 6
  Write-Host 'PASS: fluxo de votacao validado com sucesso.'
}
finally {
  if ($apiProcess -and -not $apiProcess.HasExited) {
    Stop-Process -Id $apiProcess.Id -Force
  }
}
