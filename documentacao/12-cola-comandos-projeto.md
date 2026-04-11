# Cola de Comandos do Projeto

## Objetivo

Esta cola reune os principais comandos do projeto `Resenha`, com explicacao simples de:

- quando usar
- o que faz
- em qual terminal rodar
- cuidados importantes

## Regra Basica dos Terminais

### PowerShell do Windows

Prompt parecido com:

```powershell
PS C:\Resenha>
```

Use para:

- abrir o projeto
- rodar Expo
- rodar build Android
- abrir SSH para a VM
- criar tunel para o banco

### Terminal da VM Ubuntu

Prompt parecido com:

```bash
ubuntu@vm-resenha-api-2:~$
```

Use para:

- mexer no servidor
- reiniciar API
- ver logs
- mexer no Nginx
- consultar o PostgreSQL local da VM

## 1. Entrar na Pasta do Projeto

### Comando

```powershell
cd C:\Resenha
```

### O que faz

Abre a pasta raiz do projeto no PowerShell.

### Quando usar

Sempre que for rodar comandos do projeto.

## 2. Rodar o App com Expo

### Comando basico

```powershell
cd C:\Resenha\frontend\resenha-app
npx expo start
```

### O que faz

Sobe o Metro Bundler e gera QR code para abrir o app em desenvolvimento.

### Quando usar

Quando quiser testar o app localmente.

### Observacao

Se estiver usando a API publicada, nao precisa subir backend local.

## 3. Rodar o App com Tunnel

### Comando

```powershell
cd C:\Resenha\frontend\resenha-app
npx expo start --tunnel --clear --port 8082
```

### O que faz

Sobe o app em modo tunnel, permitindo abrir de redes diferentes no Expo Go.

### Quando usar

- quando o celular nao esta na mesma rede do PC
- quando o modo LAN nao funciona bem

### Observacao

Se o tunnel falhar, pode ser problema do servico externo do Expo/Ngrok.

## 4. Fazer Reload no App

### No terminal do Expo

```text
r
```

### O que faz

Recarrega o app conectado ao Metro.

### Quando usar

Depois de alterar codigo no frontend.

### Observacao

Se aparecer:

```text
No apps connected
```

significa que o celular nao esta mais conectado ao Metro. Nesse caso, reabra o projeto no Expo Go.

## 5. Entrar na VM da Oracle

### Comando

```powershell
ssh -o ServerAliveInterval=30 -i "$env:USERPROFILE\Downloads\ssh-key-2026-03-11.key" ubuntu@163.176.142.15
```

### O que faz

Abre terminal remoto na VM de producao.

### Quando usar

- ver logs do servidor
- reiniciar API
- mexer no Nginx
- verificar arquivos de deploy

### Observacao

Se o comando ficar parado, teste:

```powershell
ssh -v -o ServerAliveInterval=30 -i "$env:USERPROFILE\Downloads\ssh-key-2026-03-11.key" ubuntu@163.176.142.15
```

## 6. Abrir Tunel do Banco para PostgreSQL

### Comando

```powershell
ssh -L 5433:127.0.0.1:5432 -o ServerAliveInterval=30 -i "$env:USERPROFILE\Downloads\ssh-key-2026-03-11.key" ubuntu@163.176.142.15
```

### O que faz

Cria um tunel local entre:

- seu computador: `127.0.0.1:5433`
- PostgreSQL da VM: `127.0.0.1:5432`

### Quando usar

Quando quiser abrir o banco no DBeaver, pgAdmin ou outro cliente PostgreSQL.

### Importante

Essa janela precisa ficar aberta enquanto o cliente PostgreSQL estiver conectado.

## 7. Configuracao do cliente PostgreSQL

### Preenchimento correto

- `Host`: `127.0.0.1`
- `Port`: `5433`
- `User`: `resenha_app`
- `Password`: `<senha_do_banco>`
- `Database`: `resenha`

### Observacao

Use o driver PostgreSQL do cliente escolhido.

## 8. Rodar Backend Local

### Comando

```powershell
cd C:\Resenha\backend\Resenha.API
dotnet restore
dotnet run
```

### O que faz

Sobe a API localmente.

### Quando usar

Quando quiser desenvolver backend local, sem depender da API publicada.

### Cuidado

Para funcionar de verdade, o backend local precisa de banco configurado.

## 9. Compilar o Backend

### Comando

```powershell
cd C:\Resenha
dotnet build backend\Resenha.API\Resenha.API.csproj
```

### O que faz

Compila a API e valida erros de build.

### Quando usar

Depois de alterar codigo no backend.

## 10. Validar o Frontend com TypeScript

### Comando

```powershell
cd C:\Resenha\frontend\resenha-app
npx tsc --noEmit
```

### O que faz

Verifica erros de tipagem sem gerar arquivos.

### Quando usar

Depois de alterar codigo no app.

## 11. Gerar APK Android de Teste

### Comando

```powershell
cd C:\Resenha\frontend\resenha-app
npx eas-cli build -p android --profile preview
```

### O que faz

Gera um APK Android interno para testes.

### Quando usar

Quando quiser testar uma versao fechada, fora do Expo Go.

## 12. Gerar Android AAB para Play Store

### Comando

```powershell
cd C:\Resenha\frontend\resenha-app
npx eas-cli build -p android --profile production
```

### O que faz

Gera um `AAB`, formato usado para publicar na Play Store.

### Quando usar

Quando o app estiver pronto para release Android.

## 13. Login no EAS

### Comando

```powershell
npx eas-cli login
```

### O que faz

Autentica sua conta Expo/EAS no terminal.

### Quando usar

Antes de gerar builds se a sessao nao estiver ativa.

## 14. Ver Logs do Servico da API na VM

### Comando

```bash
sudo journalctl -u resenha-api -n 100 --no-pager
```

### O que faz

Mostra os ultimos logs do servico da API.

### Quando usar

Quando login, cadastro ou qualquer endpoint falhar em producao.

## 15. Ver Status da API na VM

### Comando

```bash
sudo systemctl status resenha-api --no-pager
```

### O que faz

Mostra se a API esta rodando ou caiu.

### Quando usar

Depois de deploy ou ao investigar erro de producao.

## 16. Reiniciar a API na VM

### Comando

```bash
sudo systemctl restart resenha-api
```

### O que faz

Reinicia o servico da API.

### Quando usar

Depois de publicar nova versao no servidor.

## 17. Ver Status do Nginx

### Comando

```bash
sudo systemctl status nginx --no-pager
```

### O que faz

Mostra se o Nginx esta no ar.

### Quando usar

Quando houver problema de acesso externo na API.

## 18. Testar Configuracao do Nginx

### Comando

```bash
sudo nginx -t
```

### O que faz

Valida a configuracao do Nginx antes de recarregar.

### Quando usar

Depois de alterar arquivo em `/etc/nginx/sites-available/`.

## 19. Recarregar o Nginx

### Comando

```bash
sudo systemctl reload nginx
```

### O que faz

Recarrega a configuracao do Nginx sem derrubar o processo.

### Quando usar

Depois do `nginx -t` passar.

## 20. Testar API Publica

### Exemplo de rota publica

```powershell
curl.exe https://api.resenhaapp.com/api/users/clubs
```

### Exemplo de rota autenticada

```powershell
curl.exe -v https://api.resenhaapp.com/api/groups/me
```

### O que faz

Valida se a API esta acessivel publicamente.

## 21. Publicar Backend Linux para Produção

### Build local

```powershell
cd C:\Resenha
dotnet publish backend\Resenha.API\Resenha.API.csproj -c Release -r linux-x64 --self-contained true -o .\publish\resenha-api-linux
```

### O que faz

Gera os arquivos do backend prontos para Linux.

## 22. Enviar Build do Backend para a VM

### Comando

```powershell
scp -i "$env:USERPROFILE\Downloads\ssh-key-2026-03-11.key" -r .\publish\resenha-api-linux\* ubuntu@163.176.142.15:/tmp/resenha-api/
```

### O que faz

Copia os arquivos publicados para a VM.

## 23. Aplicar Build no Servidor

### Na VM

```bash
sudo cp -r /tmp/resenha-api/* /opt/resenha/api/current/
sudo chown -R resenha:resenha /opt/resenha/api/current
sudo chmod +x /opt/resenha/api/current/Resenha.API
sudo systemctl restart resenha-api
```

### O que faz

Atualiza os arquivos da API publicados e reinicia o servico.

## 24. Testar HTTPS da API

### Na VM

```bash
curl -I https://api.resenhaapp.com
```

### No Windows

```powershell
curl.exe -v https://api.resenhaapp.com/api/groups/me
```

### O que faz

Confirma se o dominio e o HTTPS estao funcionando.

## 25. Consultar Banco na VM

### Entrar no PostgreSQL

```bash
psql "host=127.0.0.1 port=5432 dbname=resenha user=resenha_app password=<senha_do_banco>"
```

### O que faz

Abre o PostgreSQL direto na VM.

### Quando usar

Para consultar dados rapidamente sem abrir um cliente grafico.

## 26. Consultas uteis de banco

### Ver usuarios

```sql
SELECT id_usuario, nome, email
FROM usuarios
ORDER BY id_usuario;
```

### Ver membros de um grupo

```sql
SELECT gu.id_grupo_usuario, gu.id_grupo, gu.id_usuario, u.nome, gu.perfil, gu.ativo
FROM grupo_usuarios gu
LEFT JOIN usuarios u ON u.id_usuario = gu.id_usuario
WHERE gu.id_grupo = 1
ORDER BY gu.id_grupo_usuario;
```

### Ver partidas do grupo

```sql
SELECT id_partida, id_grupo, data_hora_jogo, status
FROM partidas
WHERE id_grupo = 1
ORDER BY data_hora_jogo;
```

### Ver classificacao

```sql
SELECT u.nome, c.pontos, c.vitorias, c.derrotas, c.presencas
FROM classificacoes_temporada c
JOIN usuarios u ON u.id_usuario = c.id_usuario
WHERE c.id_temporada = 1
ORDER BY c.pontos DESC, c.vitorias DESC, c.gols DESC;
```

## 27. Arquivos importantes do projeto

### Frontend

- [app.json](c:/Resenha/frontend/resenha-app/app.json)
- [eas.json](c:/Resenha/frontend/resenha-app/eas.json)
- [.env](c:/Resenha/frontend/resenha-app/.env)
- [AppNavigator.tsx](c:/Resenha/frontend/resenha-app/src/navigation/AppNavigator.tsx)

### Backend

- [AuthService.cs](c:/Resenha/backend/Resenha.API/Services/AuthService.cs)
- [GroupService.cs](c:/Resenha/backend/Resenha.API/Services/GroupService.cs)
- [MatchService.cs](c:/Resenha/backend/Resenha.API/Services/MatchService.cs)
- [CaptainService.cs](c:/Resenha/backend/Resenha.API/Services/CaptainService.cs)
- [ClassificationService.cs](c:/Resenha/backend/Resenha.API/Services/ClassificationService.cs)

### Documentacao

- [10-carga-fut-da-ressaca.md](c:/Resenha/documentacao/10-carga-fut-da-ressaca.md)
- [11-plano-de-acao-produto-release.md](c:/Resenha/documentacao/11-plano-de-acao-produto-release.md)

## 28. Fluxos mais comuns

### Quero apenas abrir o app no celular

```powershell
cd C:\Resenha\frontend\resenha-app
npx expo start --tunnel --clear --port 8082
```

### Quero ver o banco no cliente PostgreSQL

1. abrir tunel:

```powershell
ssh -L 5433:127.0.0.1:5432 -o ServerAliveInterval=30 -i "$env:USERPROFILE\Downloads\ssh-key-2026-03-11.key" ubuntu@163.176.142.15
```

2. conectar no cliente PostgreSQL com:

- `127.0.0.1`
- porta `5433`

### Quero publicar backend novo

1. `dotnet publish`
2. `scp` para a VM
3. `cp` para `/opt/resenha/api/current`
4. `systemctl restart resenha-api`
5. validar logs

## 29. Dicas rapidas

- se o app usa a API publicada, nao precisa rodar backend local
- para o cliente PostgreSQL funcionar via tunel, o SSH precisa estar aberto
- se o Expo mostrar `No apps connected`, reabra o projeto no Expo Go
- para deploy seguro, sempre rode antes:

```bash
sudo nginx -t
```

e

```powershell
npx tsc --noEmit
```

## 30. Senhas e dados sensiveis

Esta cola menciona credenciais operacionais do ambiente atual.
Use com cuidado e nao compartilhe fora do projeto.
