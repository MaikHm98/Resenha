# Resenha
Resenha App

## Teste de integracao (votacao)

Executa o fluxo: empate na rodada 1 -> rodada 2 -> aprovacao -> bloqueio de reabertura.

```powershell
powershell -ExecutionPolicy Bypass -File scripts/test-vote-flow.ps1 -StartApi
```

Se a API ja estiver rodando, execute sem `-StartApi`.

## Novas features (senha e perfil)

Para habilitar recuperacao de senha e `time do coracao`, aplique antes o script SQL:

`backend/Resenha.API/sql/2026-03-03_auth_recovery_and_club.sql`

Novos endpoints:

- `POST /api/users/forgot-password`
- `GET /api/users/reset-password/validate?token=...`
- `POST /api/users/reset-password`
- `GET /api/users/clubs`
- `PATCH /api/users/profile`

## Regressao completa

Executa em sequencia os testes de votacao e capitao.

```powershell
powershell -ExecutionPolicy Bypass -File scripts/test-regression.ps1 -StartApi
```

Se a API ja estiver rodando, execute sem `-StartApi`.

## Teste de integracao (capitao)

Executa o fluxo: sorteio de captao -> desafio -> vitoria do captao com bloqueio -> novo desafio -> vitoria do desafiante com novo ciclo.

```powershell
powershell -ExecutionPolicy Bypass -File scripts/test-captain-flow.ps1 -StartApi
```

Se a API ja estiver rodando, execute sem `-StartApi`.
