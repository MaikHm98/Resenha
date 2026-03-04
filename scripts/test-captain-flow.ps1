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

function Normalize-ApiList {
  param(
    [object]$Value
  )

  if ($null -eq $Value) {
    return @()
  }

  if ($Value -is [System.Array]) {
    return @($Value)
  }

  if ($Value.PSObject -and ($Value.PSObject.Properties.Name -contains '$values')) {
    return @($Value.'$values')
  }

  return @($Value)
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
    @{ nome = 'Admin Captain'; email = "admin.captain.$suffix@resenha.local"; senha = 'Resenha@123' },
    @{ nome = 'Jogador 01'; email = "j01.captain.$suffix@resenha.local"; senha = 'Resenha@123' },
    @{ nome = 'Jogador 02'; email = "j02.captain.$suffix@resenha.local"; senha = 'Resenha@123' },
    @{ nome = 'Jogador 03'; email = "j03.captain.$suffix@resenha.local"; senha = 'Resenha@123' },
    @{ nome = 'Jogador 04'; email = "j04.captain.$suffix@resenha.local"; senha = 'Resenha@123' },
    @{ nome = 'Jogador 05'; email = "j05.captain.$suffix@resenha.local"; senha = 'Resenha@123' },
    @{ nome = 'Jogador 06'; email = "j06.captain.$suffix@resenha.local"; senha = 'Resenha@123' },
    @{ nome = 'Jogador 07'; email = "j07.captain.$suffix@resenha.local"; senha = 'Resenha@123' },
    @{ nome = 'Jogador 08'; email = "j08.captain.$suffix@resenha.local"; senha = 'Resenha@123' },
    @{ nome = 'Jogador 09'; email = "j09.captain.$suffix@resenha.local"; senha = 'Resenha@123' },
    @{ nome = 'Jogador 10'; email = "j10.captain.$suffix@resenha.local"; senha = 'Resenha@123' },
    @{ nome = 'Jogador 11'; email = "j11.captain.$suffix@resenha.local"; senha = 'Resenha@123' },
    @{ nome = 'Jogador 12'; email = "j12.captain.$suffix@resenha.local"; senha = 'Resenha@123' }
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
  $players = @($auth[1..12])

  $group = Invoke-Api -Method 'POST' -Path '/api/groups' -Body @{ nome = "Grupo Captain $suffix"; descricao = 'Grupo temporario teste capitao'; limiteJogadores = 20 } -Token $admin.token
  $groupId = [int64]$group.idGrupo

  foreach ($p in $players) {
    $invite = Invoke-Api -Method 'POST' -Path "/api/groups/$groupId/invite" -Body @{ emailConvidado = $p.email } -Token $admin.token
    [void](Invoke-Api -Method 'POST' -Path '/api/groups/join' -Body @{ codigoConvite = $invite.codigoConvite } -Token $p.token)
  }

  # Cria temporada ativa
  $match = Invoke-Api -Method 'POST' -Path '/api/matches' -Body @{ idGrupo = $groupId; dataHoraJogo = '2026-03-03T20:00:00'; limiteVagas = 20; observacao = 'Teste automatizado de capitao' } -Token $admin.token
  $matchId = [int64]$match.idPartida

  foreach ($u in @($admin) + $players) {
    [void](Invoke-Api -Method 'POST' -Path "/api/matches/$matchId/confirm" -Body @{} -Token $u.token)
  }

  $status0 = Invoke-Api -Method 'POST' -Path "/api/groups/$groupId/captain/draw" -Body @{} -Token $admin.token
  Assert-True ($status0.idCapitao -eq $admin.id) 'Falha: captao inicial deveria ser o admin.'

  $matches = @(Invoke-Api -Method 'GET' -Path "/api/groups/$groupId/matches" -Token $admin.token)
  $matchStatus = $matches | Where-Object { [int64]$_.idPartida -eq $matchId } | Select-Object -First 1
  Assert-True ($null -ne $matchStatus) 'Falha: partida de teste nao foi encontrada no grupo.'
  Assert-True ([int]$matchStatus.totalConfirmados -ge 12) 'Falha: fluxo precisa de pelo menos 12 confirmados para desafio de capitao.'

  $eligible0 = Normalize-ApiList (Invoke-Api -Method 'GET' -Path "/api/groups/$groupId/captain/eligible/$matchId" -Token $admin.token)
  Assert-True ($eligible0.Count -ge 1) 'Falha: lista de elegiveis deveria ter ao menos 1 jogador.'

  $challenger1 = [int64]$eligible0[0].idUsuario
  $challenger2 = [int64](($players | ForEach-Object { [int64]$_.id } | Where-Object { $_ -ne $challenger1 })[0])

  $status1 = Invoke-Api -Method 'POST' -Path "/api/groups/$groupId/captain/challenge" -Body @{ idDesafiante = $challenger1; idPartida = $matchId } -Token $admin.token
  Assert-True ($status1.idDesafiante -eq $challenger1) 'Falha: desafiante 1 nao foi definido.'

  $status2 = Invoke-Api -Method 'POST' -Path "/api/groups/$groupId/captain/result" -Body @{ resultado = 'CAPITAO' } -Token $admin.token
  Assert-True (-not $status2.idDesafiante) 'Falha: desafio pendente deveria ser limpo apos vitoria do capitao.'
  Assert-True (@($status2.bloqueados).Count -eq 1) 'Falha: desafiante derrotado deveria entrar em bloqueados.'
  Assert-True ([int64]$status2.bloqueados[0].idUsuario -eq $challenger1) 'Falha: jogador bloqueado incorreto.'

  $eligible1 = Normalize-ApiList (Invoke-Api -Method 'GET' -Path "/api/groups/$groupId/captain/eligible/$matchId" -Token $admin.token)
  Assert-True ((@($eligible1 | Where-Object { [int64]$_.idUsuario -eq $challenger1 }).Count) -eq 0) 'Falha: desafiante bloqueado ainda aparece como elegivel.'

  $status3 = Invoke-Api -Method 'POST' -Path "/api/groups/$groupId/captain/challenge" -Body @{ idDesafiante = $challenger2; idPartida = $matchId } -Token $admin.token
  Assert-True ($status3.idDesafiante -eq $challenger2) 'Falha: desafiante 2 nao foi definido.'

  $status4 = Invoke-Api -Method 'POST' -Path "/api/groups/$groupId/captain/result" -Body @{ resultado = 'DESAFIANTE' } -Token $admin.token
  Assert-True ($status4.idCapitao -eq $challenger2) 'Falha: novo captao deveria ser o desafiante vencedor.'
  Assert-True (@($status4.bloqueados).Count -eq 0) 'Falha: novo ciclo deveria iniciar sem bloqueados.'

  $eligible2 = Normalize-ApiList (Invoke-Api -Method 'GET' -Path "/api/groups/$groupId/captain/eligible/$matchId" -Token $admin.token)
  Assert-True ((@($eligible2 | Where-Object { [int64]$_.idUsuario -eq $challenger1 }).Count) -eq 1) 'Falha: bloqueio do ciclo anterior deveria ser resetado no novo ciclo.'

  $summary = [PSCustomObject]@{
    passed = $true
    groupId = $groupId
    matchId = $matchId
    captainInitial = $status0.nomeCapitao
    challengerBlocked = $challenger1
    newCaptain = $status4.nomeCapitao
    eligibleAfterResetContainsBlocked = $true
  }

  $summary | ConvertTo-Json -Depth 6
  Write-Host 'PASS: fluxo de capitao validado com sucesso.'
}
finally {
  if ($apiProcess -and -not $apiProcess.HasExited) {
    Stop-Process -Id $apiProcess.Id -Force
  }
}

