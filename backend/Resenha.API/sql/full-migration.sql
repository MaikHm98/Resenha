CREATE TABLE IF NOT EXISTS `__EFMigrationsHistory` (
    `MigrationId` varchar(150) CHARACTER SET utf8mb4 NOT NULL,
    `ProductVersion` varchar(32) CHARACTER SET utf8mb4 NOT NULL,
    CONSTRAINT `PK___EFMigrationsHistory` PRIMARY KEY (`MigrationId`)
) CHARACTER SET=utf8mb4;

START TRANSACTION;

ALTER DATABASE CHARACTER SET utf8mb4;

CREATE TABLE `ciclo_capitao_bloqueados` (
    `id_bloqueio` bigint unsigned NOT NULL AUTO_INCREMENT,
    `id_ciclo` bigint unsigned NOT NULL,
    `id_usuario_bloqueado` bigint unsigned NOT NULL,
    `criado_em` datetime(6) NOT NULL,
    CONSTRAINT `PK_ciclo_capitao_bloqueados` PRIMARY KEY (`id_bloqueio`)
) CHARACTER SET=utf8mb4;

CREATE TABLE `ciclos_capitao` (
    `id_ciclo` bigint unsigned NOT NULL AUTO_INCREMENT,
    `id_grupo` bigint unsigned NOT NULL,
    `id_temporada` bigint unsigned NOT NULL,
    `id_capitao_atual` bigint unsigned NOT NULL,
    `status` varchar(20) CHARACTER SET utf8mb4 NOT NULL,
    `iniciado_em` datetime(6) NOT NULL,
    `encerrado_em` datetime(6) NULL,
    CONSTRAINT `PK_ciclos_capitao` PRIMARY KEY (`id_ciclo`)
) CHARACTER SET=utf8mb4;

CREATE TABLE `classificacoes_geral_grupo` (
    `id_classificacao_geral` bigint unsigned NOT NULL AUTO_INCREMENT,
    `id_grupo` bigint unsigned NOT NULL,
    `id_usuario` bigint unsigned NOT NULL,
    `pontos` int NOT NULL,
    `vitorias` int NOT NULL,
    `derrotas` int NOT NULL,
    `presencas` int NOT NULL,
    `gols` int NOT NULL,
    `assistencias` int NOT NULL,
    `mvps` int NOT NULL,
    `bolas_murchas` int NOT NULL,
    `atualizado_em` datetime(6) NOT NULL,
    CONSTRAINT `PK_classificacoes_geral_grupo` PRIMARY KEY (`id_classificacao_geral`)
) CHARACTER SET=utf8mb4;

CREATE TABLE `classificacoes_temporada` (
    `id_classificacao` bigint unsigned NOT NULL AUTO_INCREMENT,
    `id_temporada` bigint unsigned NOT NULL,
    `id_usuario` bigint unsigned NOT NULL,
    `pontos` int NOT NULL,
    `vitorias` int NOT NULL,
    `derrotas` int NOT NULL,
    `presencas` int NOT NULL,
    `gols` int NOT NULL,
    `assistencias` int NOT NULL,
    `mvps` int NOT NULL,
    `bolas_murchas` int NOT NULL,
    `atualizado_em` datetime(6) NOT NULL,
    CONSTRAINT `PK_classificacoes_temporada` PRIMARY KEY (`id_classificacao`)
) CHARACTER SET=utf8mb4;

CREATE TABLE `convites_grupo` (
    `id_convite` bigint unsigned NOT NULL AUTO_INCREMENT,
    `id_grupo` bigint unsigned NOT NULL,
    `email_convidado` varchar(180) CHARACTER SET utf8mb4 NOT NULL,
    `codigo_convite` varchar(64) CHARACTER SET utf8mb4 NOT NULL,
    `status` varchar(20) CHARACTER SET utf8mb4 NOT NULL,
    `criado_por_usuario` bigint unsigned NOT NULL,
    `expira_em` datetime(6) NOT NULL,
    `criado_em` datetime(6) NOT NULL,
    CONSTRAINT `PK_convites_grupo` PRIMARY KEY (`id_convite`)
) CHARACTER SET=utf8mb4;

CREATE TABLE `estatisticas_partida` (
    `id_estatistica` bigint unsigned NOT NULL AUTO_INCREMENT,
    `id_partida` bigint unsigned NOT NULL,
    `id_usuario` bigint unsigned NOT NULL,
    `gols` int NOT NULL,
    `assistencias` int NOT NULL,
    `criado_em` datetime(6) NOT NULL,
    `atualizado_em` datetime(6) NULL,
    CONSTRAINT `PK_estatisticas_partida` PRIMARY KEY (`id_estatistica`)
) CHARACTER SET=utf8mb4;

CREATE TABLE `grupo_usuarios` (
    `id_grupo_usuario` bigint unsigned NOT NULL AUTO_INCREMENT,
    `id_grupo` bigint unsigned NOT NULL,
    `id_usuario` bigint unsigned NOT NULL,
    `perfil` varchar(20) CHARACTER SET utf8mb4 NOT NULL,
    `ativo` tinyint(1) NOT NULL,
    `entrou_em` datetime(6) NOT NULL,
    CONSTRAINT `PK_grupo_usuarios` PRIMARY KEY (`id_grupo_usuario`)
) CHARACTER SET=utf8mb4;

CREATE TABLE `grupos` (
    `id_grupo` bigint unsigned NOT NULL AUTO_INCREMENT,
    `nome` varchar(120) CHARACTER SET utf8mb4 NOT NULL,
    `descricao` varchar(255) CHARACTER SET utf8mb4 NULL,
    `limite_jogadores` int NOT NULL,
    `criado_por_usuario` bigint unsigned NOT NULL,
    `ativo` tinyint(1) NOT NULL,
    `criado_em` datetime(6) NOT NULL,
    `atualizado_em` datetime(6) NULL,
    CONSTRAINT `PK_grupos` PRIMARY KEY (`id_grupo`)
) CHARACTER SET=utf8mb4;

CREATE TABLE `jogadores_time_partida` (
    `id_jogador_time` bigint unsigned NOT NULL AUTO_INCREMENT,
    `id_time` bigint unsigned NOT NULL,
    `id_usuario` bigint unsigned NOT NULL,
    CONSTRAINT `PK_jogadores_time_partida` PRIMARY KEY (`id_jogador_time`)
) CHARACTER SET=utf8mb4;

CREATE TABLE `partidas` (
    `id_partida` bigint unsigned NOT NULL AUTO_INCREMENT,
    `id_grupo` bigint unsigned NOT NULL,
    `id_temporada` bigint unsigned NOT NULL,
    `data_hora_jogo` datetime(6) NOT NULL,
    `status` varchar(20) CHARACTER SET utf8mb4 NOT NULL,
    `observacao` varchar(255) CHARACTER SET utf8mb4 NULL,
    `criado_por_usuario` bigint unsigned NOT NULL,
    `id_ciclo_capitao` bigint unsigned NULL,
    `criado_em` datetime(6) NOT NULL,
    `atualizado_em` datetime(6) NULL,
    CONSTRAINT `PK_partidas` PRIMARY KEY (`id_partida`)
) CHARACTER SET=utf8mb4;

CREATE TABLE `presencas_partida` (
    `id_presenca` bigint unsigned NOT NULL AUTO_INCREMENT,
    `id_partida` bigint unsigned NOT NULL,
    `id_usuario` bigint unsigned NOT NULL,
    `status` varchar(20) CHARACTER SET utf8mb4 NOT NULL,
    `confirmado_em` datetime(6) NOT NULL,
    CONSTRAINT `PK_presencas_partida` PRIMARY KEY (`id_presenca`)
) CHARACTER SET=utf8mb4;

CREATE TABLE `resultados_partida` (
    `id_resultado` bigint unsigned NOT NULL AUTO_INCREMENT,
    `id_partida` bigint unsigned NOT NULL,
    `gols_time_1` int NOT NULL,
    `gols_time_2` int NOT NULL,
    `vencedor_numero_time` int NOT NULL,
    `finalizado_em` datetime(6) NOT NULL,
    CONSTRAINT `PK_resultados_partida` PRIMARY KEY (`id_resultado`)
) CHARACTER SET=utf8mb4;

CREATE TABLE `temporadas` (
    `id_temporada` bigint unsigned NOT NULL AUTO_INCREMENT,
    `id_grupo` bigint unsigned NOT NULL,
    `ano` int NOT NULL,
    `nome` varchar(60) CHARACTER SET utf8mb4 NOT NULL,
    `status` varchar(20) CHARACTER SET utf8mb4 NOT NULL,
    `confirmada_por_usuario` bigint unsigned NULL,
    `confirmada_em` datetime(6) NULL,
    `criada_em` datetime(6) NOT NULL,
    CONSTRAINT `PK_temporadas` PRIMARY KEY (`id_temporada`)
) CHARACTER SET=utf8mb4;

CREATE TABLE `times_partida` (
    `id_time` bigint unsigned NOT NULL AUTO_INCREMENT,
    `id_partida` bigint unsigned NOT NULL,
    `numero_time` int NOT NULL,
    `id_capitao` bigint unsigned NOT NULL,
    CONSTRAINT `PK_times_partida` PRIMARY KEY (`id_time`)
) CHARACTER SET=utf8mb4;

CREATE TABLE `usuarios` (
    `id_usuario` bigint unsigned NOT NULL AUTO_INCREMENT,
    `nome` varchar(120) CHARACTER SET utf8mb4 NOT NULL,
    `email` varchar(180) CHARACTER SET utf8mb4 NOT NULL,
    `senha_hash` longtext CHARACTER SET utf8mb4 NOT NULL,
    `ativo` tinyint(1) NOT NULL,
    `criado_em` datetime(6) NOT NULL,
    `atualizado_em` datetime(6) NULL,
    CONSTRAINT `PK_usuarios` PRIMARY KEY (`id_usuario`)
) CHARACTER SET=utf8mb4;

CREATE TABLE `votacoes_partida` (
    `id_votacao` bigint unsigned NOT NULL AUTO_INCREMENT,
    `id_partida` bigint unsigned NOT NULL,
    `tipo` varchar(20) CHARACTER SET utf8mb4 NOT NULL,
    `rodada` int NOT NULL,
    `status` varchar(20) CHARACTER SET utf8mb4 NOT NULL,
    `id_usuario_vencedor_provisorio` bigint unsigned NULL,
    `apurada_em` datetime(6) NULL,
    `aprovada_por_usuario` bigint unsigned NULL,
    `aprovada_em` datetime(6) NULL,
    `observacao` longtext CHARACTER SET utf8mb4 NULL,
    `criada_em` datetime(6) NOT NULL,
    CONSTRAINT `PK_votacoes_partida` PRIMARY KEY (`id_votacao`)
) CHARACTER SET=utf8mb4;

CREATE TABLE `votos` (
    `id_voto` bigint unsigned NOT NULL AUTO_INCREMENT,
    `id_votacao` bigint unsigned NOT NULL,
    `id_usuario_eleitor` bigint unsigned NOT NULL,
    `id_usuario_votado` bigint unsigned NOT NULL,
    `criado_em` datetime(6) NOT NULL,
    CONSTRAINT `PK_votos` PRIMARY KEY (`id_voto`)
) CHARACTER SET=utf8mb4;

CREATE UNIQUE INDEX `IX_ciclo_capitao_bloqueados_id_ciclo_id_usuario_bloqueado` ON `ciclo_capitao_bloqueados` (`id_ciclo`, `id_usuario_bloqueado`);

CREATE UNIQUE INDEX `IX_classificacoes_geral_grupo_id_grupo_id_usuario` ON `classificacoes_geral_grupo` (`id_grupo`, `id_usuario`);

CREATE UNIQUE INDEX `IX_classificacoes_temporada_id_temporada_id_usuario` ON `classificacoes_temporada` (`id_temporada`, `id_usuario`);

CREATE UNIQUE INDEX `IX_convites_grupo_codigo_convite` ON `convites_grupo` (`codigo_convite`);

CREATE UNIQUE INDEX `IX_grupo_usuarios_id_grupo_id_usuario` ON `grupo_usuarios` (`id_grupo`, `id_usuario`);

CREATE UNIQUE INDEX `IX_jogadores_time_partida_id_time_id_usuario` ON `jogadores_time_partida` (`id_time`, `id_usuario`);

CREATE UNIQUE INDEX `IX_presencas_partida_id_partida_id_usuario` ON `presencas_partida` (`id_partida`, `id_usuario`);

CREATE UNIQUE INDEX `IX_resultados_partida_id_partida` ON `resultados_partida` (`id_partida`);

CREATE UNIQUE INDEX `IX_temporadas_id_grupo_ano` ON `temporadas` (`id_grupo`, `ano`);

CREATE UNIQUE INDEX `IX_times_partida_id_partida_numero_time` ON `times_partida` (`id_partida`, `numero_time`);

CREATE UNIQUE INDEX `IX_usuarios_email` ON `usuarios` (`email`);

CREATE UNIQUE INDEX `IX_votacoes_partida_id_partida_tipo_rodada` ON `votacoes_partida` (`id_partida`, `tipo`, `rodada`);

CREATE UNIQUE INDEX `IX_votos_id_votacao_id_usuario_eleitor` ON `votos` (`id_votacao`, `id_usuario_eleitor`);

INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
VALUES ('20260225142754_InitialCreate', '6.0.36');

COMMIT;

START TRANSACTION;

ALTER TABLE `partidas` ADD `limite_vagas` int NOT NULL DEFAULT 0;

INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
VALUES ('20260225182558_AddLimiteVagasToPartidas', '6.0.36');

COMMIT;

START TRANSACTION;

ALTER TABLE `ciclos_capitao` ADD `id_desafiante_atual` bigint unsigned NULL;

INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
VALUES ('20260225183836_AddDesafianteAtualToCicloCapitao', '6.0.36');

COMMIT;

START TRANSACTION;

ALTER TABLE `grupos` ADD `dia_semana` int NULL;

ALTER TABLE `grupos` ADD `horario_fixo` varchar(5) CHARACTER SET utf8mb4 NULL;

INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
VALUES ('20260228170457_AddFixedScheduleToGrupo', '6.0.36');

COMMIT;

