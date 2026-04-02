# Checklist - Fase 1 (Autenticacao e Sessao)

Objetivo: registrar de forma objetiva o que foi entregue na Fase 1 de auth no `resenha-web`.

## Escopo minimo da fase 1

- [x] Contratos de autenticacao tipados no frontend
- [x] Servico `authApi` com os endpoints de auth
- [x] Mapper simples de resposta da API para sessao interna
- [x] `AuthProvider` conectado a acoes reais:
  - [x] `login`
  - [x] `register`
  - [x] `logout`
  - [x] `forgotPassword`
  - [x] `validateResetToken`
  - [x] `resetPassword`
- [x] Persistencia e restauracao de sessao no `localStorage`
- [x] `PrivateRoute` e `PublicRoute` usando sessao real
- [x] Tela de login funcional
- [x] Tela de cadastro funcional
- [x] Tela de recuperacao de senha funcional
- [x] Tela de redefinicao de senha funcional

## Endpoints consumidos na fase 1

- [x] `POST /api/users/login`
- [x] `POST /api/users/register`
- [x] `POST /api/users/forgot-password`
- [x] `GET /api/users/reset-password/validate?token=...`
- [x] `POST /api/users/reset-password`

## Comportamentos de sessao e rota

- [x] Sessao inicia automaticamente apos login/cadastro com sucesso
- [x] Sessao e restaurada no bootstrap a partir do storage
- [x] Logout limpa sessao em memoria e storage
- [x] Rota privada bloqueia sem sessao
- [x] Rota publica redireciona para `/home` quando ja autenticado

## Validacoes minimas implementadas

- [x] Login: email e senha obrigatorios
- [x] Cadastro: nome, email, senha, posicaoPrincipal e peDominante obrigatorios
- [x] Cadastro: nome minimo de 2 e senha minima de 8 caracteres
- [x] Forgot password: email obrigatorio
- [x] Reset password: token obrigatorio e senha minima de 8 caracteres
- [x] Reset password: exige token validado antes de redefinir

## Fora de escopo da fase 1 (pendente)

- [ ] Fluxos de dominio fora de auth
- [ ] Campos opcionais de cadastro no web (`goleiro`, `timeCoracaoCodigo`)
- [ ] Validacoes mais avancadas de formulario
- [ ] Testes automatizados de auth no frontend web
- [ ] Refinamentos de UX e acessibilidade alem do baseline

## Validacao tecnica da fase 1

- [x] Sem alteracao de backend
- [x] Sem alteracao de contrato da API
- [x] Build e lint funcionando nos commits da fase
