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

## APK de teste para amigos

O app mobile ja esta configurado para gerar um APK de distribuicao interna via Expo EAS.

Arquivos envolvidos:

- `frontend/resenha-app/app.json`
- `frontend/resenha-app/eas.json`
- `frontend/resenha-app/.env`
- `frontend/resenha-app/.env.example`

Antes da build:

1. Configure a URL real da API em `frontend/resenha-app/.env`.
2. Se seus amigos estiverem fora da sua rede local, a API precisa estar publicada na internet.
3. Entre na conta Expo.
4. Inicialize o projeto EAS na primeira vez.

Comandos:

```powershell
cd frontend/resenha-app
npx eas-cli login
npx eas-cli init
npm run build:android:apk
```

Observacoes:

- O perfil `preview` gera `APK`, ideal para testes fora da Play Store.
- O perfil `production` gera `AAB`, que e o formato usado depois na Play Store.
- Na primeira build o EAS pode pedir para criar ou gerenciar a keystore Android.

## Checklist de producao da API

Antes de publicar a API na Oracle Cloud:

1. Nao use `backend/Resenha.API/appsettings.json` com segredos reais no servidor.
2. Use `backend/Resenha.API/appsettings.Example.json` apenas como referencia.
3. Configure `JwtSettings:SecretKey` com pelo menos 32 caracteres aleatorios.
4. Configure `ConnectionStrings:DefaultConnection` com usuario dedicado do app, nunca `root`.
5. Em producao, publique a API atras de `Nginx` com `HTTPS`.
6. Nao exponha a porta do banco (`3306`) nem a porta interna da API (`5276`) na internet.
7. So habilite `CorsSettings:AllowedOrigins` para origens web realmente necessarias.
8. O Swagger fica habilitado apenas em desenvolvimento.

## Deploy Linux Oracle

Arquivos base para deploy seguro na VM Oracle:

- `backend/deploy/linux/resenha-api.service`
- `backend/deploy/linux/nginx-resenha-api.conf`
- `backend/deploy/linux/appsettings.Production.template.json`
- `backend/deploy/linux/resenha-api.env.template`

Uso recomendado:

1. Publicar a API localmente com `dotnet publish`.
2. Copiar os arquivos publicados para `/opt/resenha/api/current` na VM.
3. Criar o usuario de servico `resenha`.
4. Colocar os segredos reais em `/etc/resenha/resenha-api.env`.
5. Instalar a unit `systemd` e reiniciar o servico.
6. Instalar o arquivo do `nginx`, ajustar o dominio real e emitir o certificado TLS.
