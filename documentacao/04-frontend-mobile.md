# 04. Frontend Mobile

## Stack

- Expo
- React Native
- TypeScript
- React Navigation
- Axios
- AsyncStorage

Projeto:

- `frontend/resenha-app`

## Objetivo do App

Entregar ao usuario final uma interface mobile direta para:

- entrar na plataforma
- criar ou entrar em grupos
- acompanhar partidas
- confirmar presenca
- operar fluxos de capitao, classificacao e votacao
- consultar perfil e desempenho

## Configuracao de Ambiente

Variavel principal:

```env
EXPO_PUBLIC_API_BASE_URL=https://api.resenhaapp.com
```

Arquivos:

- `frontend/resenha-app/.env`
- `frontend/resenha-app/.env.example`

Em `src/api/api.ts`, a URL base e resolvida a partir dessa variavel. Se ela nao existir, o app cai para defaults locais por plataforma.

## Cliente HTTP

Arquivo:

- `frontend/resenha-app/src/api/api.ts`

Caracteristicas:

- usa `axios`
- timeout de 10 segundos
- injeta automaticamente o token JWT salvo em `AsyncStorage`
- header default `Content-Type: application/json`

Chaves de armazenamento local:

- `@resenha:token`
- `@resenha:user`
- `@resenha:flash_warning`

## Contexto de Autenticacao

Arquivo:

- `frontend/resenha-app/src/contexts/AuthContext.tsx`

Responsabilidades:

- restaurar sessao persistida
- login
- registro
- recuperacao de senha
- validacao de token de reset
- redefinicao de senha
- consulta de clubes
- atualizacao de perfil
- logout

## Navegacao e Telas

Telas identificadas no projeto:

- `LoginScreen`
- `RegisterScreen`
- `ForgotPasswordScreen`
- `ResetPasswordScreen`
- `HomeScreen`
- `JoinGroupScreen`
- `CreateGroupScreen`
- `ManageMembersScreen`
- `CreateMatchScreen`
- `GroupDashboardScreen`
- `ClassificationScreen`
- `CaptainScreen`
- `VoteScreen`
- `ProfileScreen`
- `MyPerformanceScreen`

## Fluxos do Usuario

### Onboarding e autenticacao

- cadastro
- login
- recuperacao de senha
- redefinicao de senha

### Vida dentro do grupo

- entrar por convite
- criar grupo
- listar grupos
- ver membros
- gerenciar convites e papeis

### Rotina da partida

- criar partida
- confirmar participacao
- declarar ausencia
- visualizar dashboard do grupo

### Governanca esportiva

- capitao
- classificacao
- votacao
- desempenho individual

## Configuracao Expo

Arquivo:

- `frontend/resenha-app/app.json`

Pontos relevantes:

- `slug`: `resenha-app`
- `scheme`: `resenha`
- Android package: `com.maikhm98.resenha`
- `versionCode`: `1`
- projeto EAS vinculado por `projectId`

## EAS Build

Arquivo:

- `frontend/resenha-app/eas.json`

Perfis definidos:

- `development`
- `preview`
- `production`

### Uso atual

- `preview`: gera APK para distribuicao interna
- `production`: gera AAB para publicacao futura

## Build Atual

O projeto ja foi buildado no Expo EAS com sucesso para Android em perfil `preview`.

## Boas Praticas para Evolucao

- manter todas as URLs de ambiente fora do codigo fixo
- evitar acoplamento de mensagens de erro com textos de backend
- revisar UX de loading e tratamento de falhas em rede
- padronizar feedback visual para operacoes criticas

## Arquivos Relevantes

- `frontend/resenha-app/src/api/api.ts`
- `frontend/resenha-app/src/contexts/AuthContext.tsx`
- `frontend/resenha-app/src/navigation/AppNavigator.tsx`
- `frontend/resenha-app/src/screens/*`
- `frontend/resenha-app/app.json`
- `frontend/resenha-app/eas.json`
