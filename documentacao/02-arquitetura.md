# 02. Arquitetura

## Visao Geral da Solucao

O projeto adota uma arquitetura simples e pragmatica para um produto em fase inicial:

- aplicativo mobile em `Expo/React Native`
- API REST em `ASP.NET Core 6`
- banco relacional `MySQL`
- proxy reverso `nginx`
- hospedagem em `Oracle Cloud`

## Diagrama Logico

```text
Usuario Android
    |
    v
App Expo / React Native
    |
    v
https://api.resenhaapp.com
    |
    v
nginx
    |
    v
Resenha.API (ASP.NET Core)
    |
    v
MySQL
```

## Componentes

### Frontend Mobile

Localizacao:

- `frontend/resenha-app`

Responsabilidades:

- autenticacao do usuario
- persistencia local de token e sessao
- navegacao entre telas
- consumo da API REST
- exibicao de grupos, partidas, classificacoes e votacoes

### Backend

Localizacao:

- `backend/Resenha.API`

Responsabilidades:

- autenticacao JWT
- validacao de regras de negocio
- persistencia de dados
- orquestracao de grupos, partidas, capitao, votacao e classificacao
- exposicao de endpoints REST

### Banco de Dados

Tecnologia:

- MySQL local na VM de producao

Responsabilidades:

- persistencia de usuarios
- grupos, membros e convites
- temporadas e partidas
- ciclos de capitao
- resultados, estatisticas e votacoes
- rastros de seguranca e recuperacao de senha

### Infraestrutura

Componentes principais:

- Oracle Cloud VM
- VCN, subnet publica e IP reservado
- nginx
- systemd
- certbot / Let's Encrypt
- Namecheap para dominio e DNS

## Estilo de Integracao

### App -> API

- protocolo: HTTPS
- formato: JSON
- autenticacao: JWT Bearer
- timeout configurado no app: 10 segundos

### API -> Banco

- Entity Framework Core
- provider MySQL
- conexao via `ConnectionStrings__DefaultConnection`

## Decisoes Tecnicas Relevantes

### 1. Backend monolitico

O backend foi mantido como um monolito modular. Para o estagio atual do produto, isso reduz complexidade operacional e acelera entrega.

### 2. JWT stateless

Autenticacao baseada em token Bearer, com validacao adicional de versao de senha via claim `pwd_at`.

Isso permite:

- invalidar sessoes antigas apos troca de senha
- manter autenticacao simples para app mobile

### 3. MySQL local na VM

Para reduzir custo e manter o projeto dentro de um plano gratuito, o banco roda na mesma instancia da API.

Trade-off:

- menor custo e menor complexidade
- menor isolamento entre aplicacao e banco

### 4. Proxy com nginx

O `nginx` fica na borda publica para:

- receber trafego HTTP/HTTPS
- aplicar TLS
- encaminhar requisicoes para a API interna
- evitar exposicao direta da porta interna da aplicacao

### 5. Deploy mobile via Expo EAS

Escolha adequada para:

- gerar APK rapidamente
- distribuir builds internas para teste
- evitar pipeline Android nativo mais pesado nesta fase

## Fluxos-Chave

### Fluxo de autenticacao

1. usuario envia email e senha
2. API valida credenciais
3. API gera JWT
4. app salva token e dados do usuario em `AsyncStorage`
5. chamadas autenticadas passam a incluir `Authorization: Bearer <token>`

### Fluxo de recuperacao de senha

1. usuario solicita recuperacao
2. API gera token de recuperacao
3. token e enviado por email ou link configurado
4. usuario valida token
5. usuario redefine senha
6. sessoes anteriores se tornam invalidas

### Fluxo de partida

1. grupo cria partida
2. jogadores confirmam ou marcam ausencia
3. capitao pode ser sorteado
4. desafio de capitao pode ocorrer
5. times sao montados
6. partida e finalizada
7. classificacao e estatisticas sao atualizadas

### Fluxo de votacao

1. votacao e aberta para uma partida
2. membros aptos votam
3. votacao pode ser fechada
4. resultado pode ser aprovado
5. regras impedem fluxos invalidos ou repeticao indevida

## Ambientes

### Desenvolvimento

- API local com Swagger habilitado
- CORS permissivo
- app Expo com URL local ou definida por `.env`

### Producao

- API atras de nginx
- HTTPS ativo
- Swagger desabilitado
- CORS configurado por origem
- segredos carregados por arquivo de ambiente

## Consideracoes de Escalabilidade

O desenho atual atende bem um beta e uma primeira operacao real de pequeno porte. Evolucoes futuras provaveis:

- banco em instancia separada
- logs centralizados
- storage externo para arquivos
- pipeline de CI/CD
- monitoramento e alertas
- cache para consultas intensivas
