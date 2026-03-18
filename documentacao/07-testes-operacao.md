# 07. Testes e Operacao

## Objetivo

Centralizar os testes automatizados disponiveis, testes manuais recomendados e a rotina operacional minima do projeto.

## Scripts Disponiveis

Pasta:

- `scripts/`

Arquivos identificados:

- `test-captain-flow.ps1`
- `test-delete-match-classification-regression.ps1`
- `test-password-recovery-flow.ps1`
- `test-regression.ps1`
- `test-vote-flow.ps1`

## Testes Automatizados

### Votacao

Executa o fluxo:

- empate na rodada 1
- rodada 2
- aprovacao
- bloqueio de reabertura

Comando:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/test-vote-flow.ps1 -StartApi
```

### Capitao

Executa o fluxo:

- sorteio de capitao
- desafio
- vitoria do capitao com bloqueio
- novo desafio
- vitoria do desafiante com novo ciclo

Comando:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/test-captain-flow.ps1 -StartApi
```

### Recuperacao de senha

Comando:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/test-password-recovery-flow.ps1 -StartApi
```

### Regressao consolidada

Comando:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/test-regression.ps1 -StartApi
```

### Regressao de exclusao/classificacao

Comando:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/test-delete-match-classification-regression.ps1 -StartApi
```

## Testes Manuais Recomendados

### Backend em producao

Validacoes basicas:

- `GET /api/groups/me` sem token retorna `401`
- login retorna token valido
- criacao de grupo funciona
- criacao de partida funciona
- confirmacao e cancelamento de presenca funcionam
- fluxo de votacao respeita estado
- finalizacao atualiza classificacao

### Frontend Android

Fluxos prioritarios para o beta:

- cadastro
- login
- logout
- recuperar senha
- entrar em grupo por convite
- criar grupo
- criar partida
- confirmar presenca
- consultar classificacao
- operar votacao

## Validacao de Infra

Comandos uteis na VM:

```bash
sudo systemctl status resenha-api --no-pager
sudo systemctl status nginx --no-pager
sudo systemctl status mysql --no-pager
sudo iptables -L INPUT -n --line-numbers
curl -I https://api.resenhaapp.com
```

Comandos uteis no Windows:

```powershell
nslookup api.resenhaapp.com
Test-NetConnection api.resenhaapp.com -Port 443
curl.exe -v https://api.resenhaapp.com/api/groups/me
```

## Build Mobile

Projeto:

- `frontend/resenha-app`

Fluxo atual de build:

```powershell
cd frontend/resenha-app
npx eas-cli login
npx eas-cli build -p android --profile preview
```

Resultado esperado:

- APK para distribuicao interna

## Operacao Rotineira

### Antes de testar com usuarios

- confirmar que a API esta online
- confirmar HTTPS valido
- validar base URL no app
- garantir que o banco esta consistente
- ter um usuario administrador funcional

### Ao publicar uma nova versao de backend

1. gerar novo publish
2. copiar artefatos para a VM
3. revisar arquivo de ambiente
4. reiniciar `resenha-api`
5. validar endpoint autenticado e nao autenticado

### Ao mudar DNS ou dominio

1. validar `nslookup`
2. revisar `server_name` no nginx
3. reemitir certificado se necessario
4. testar novamente pelo app e por `curl`

## Checklist de Beta Fechado

- APK instalado em pelo menos 2 dispositivos Android
- login funcionando fora da rede local
- fluxo de grupo testado
- fluxo de partida testado
- fluxo de votacao testado
- recuperacao de senha testada
- desempenho minimo aceitavel em rede movel

## Pendencias Tecnicas Relevantes

- revisar e simplificar configuracao definitiva do `systemd` para refletir exatamente o modo self-contained atual
- revisar templates de deploy para manter alinhamento com o ambiente produtivo
- padronizar e documentar melhor a estrategia de backup do MySQL
- adicionar observabilidade minima para erros de producao
