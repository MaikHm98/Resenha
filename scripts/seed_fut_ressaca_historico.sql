START TRANSACTION;

SET @grupo_id := 1;
SET @admin_email := 'maiksosn.23@gmail.com';
SET @admin_id := (
    SELECT id_usuario
    FROM usuarios
    WHERE email = @admin_email AND ativo = 1
    LIMIT 1
);
SET @temporada_id := (
    SELECT id_temporada
    FROM temporadas
    WHERE id_grupo = @grupo_id AND status = 'ATIVA'
    ORDER BY id_temporada DESC
    LIMIT 1
);

UPDATE grupo_usuarios gu
LEFT JOIN usuarios u
    ON u.id_usuario = gu.id_usuario
   AND u.ativo = 1
SET gu.ativo = 0
WHERE gu.id_grupo = @grupo_id
  AND gu.ativo = 1
  AND u.id_usuario IS NULL;

DROP TEMPORARY TABLE IF EXISTS tmp_seed_usuarios;
CREATE TEMPORARY TABLE tmp_seed_usuarios (
    email VARCHAR(180) NOT NULL PRIMARY KEY,
    nome VARCHAR(120) NOT NULL,
    senha VARCHAR(120) NOT NULL,
    posicao VARCHAR(20) NOT NULL,
    pe VARCHAR(20) NOT NULL,
    time_codigo VARCHAR(20) NOT NULL,
    goleiro TINYINT(1) NOT NULL
);

INSERT INTO tmp_seed_usuarios (email, nome, senha, posicao, pe, time_codigo, goleiro) VALUES
('gustavo@resenha.com', 'Gustavo', 'Gustavo123456@', 'ATACANTE', 'DIREITO', 'SAN', 0),
('joao@resenha.com', 'Joao', 'Joao123456@', 'ATACANTE', 'DIREITO', 'SAN', 0),
('rafa@resenha.com', 'Rafa', 'Rafa123456@', 'ZAGUEIRO', 'DIREITO', 'PAL', 0),
('igor@resenha.com', 'Igor', 'Igor123456@', 'ATACANTE', 'DIREITO', 'COR', 0),
('casemiro@resenha.com', 'Casemiro', 'Casemiro123456@', 'ATACANTE', 'DIREITO', 'PAL', 0),
('lukinha@resenha.com', 'Lukinha', 'Lukinha123456@', 'MEIA', 'DIREITO', 'SAO', 0),
('damazio@resenha.com', 'Damazio', 'Damazio123456@', 'ATACANTE', 'AMBIDESTRO', 'COR', 0),
('jorge@resenha.com', 'Jorge', 'Jorge123456@', 'ATACANTE', 'DIREITO', 'COR', 0),
('nilin@resenha.com', 'Nilin', 'Nilin123456@', 'GOLEIRO', 'DIREITO', 'COR', 1),
('lucas@resenha.com', 'Lucas', 'Lucas123456@', 'ZAGUEIRO', 'DIREITO', 'COR', 0),
('leo@resenha.com', 'Leo', 'Leo123456@', 'ZAGUEIRO', 'DIREITO', 'COR', 0),
('noia@resenha.com', 'Noia', 'Noia123456@', 'GOLEIRO', 'DIREITO', 'COR', 1),
('markin@resenha.com', 'Markin', 'Markin123456@', 'ZAGUEIRO', 'DIREITO', 'FLA', 0),
('matheus@resenha.com', 'Matheus', 'Matheus123456@', 'GOLEIRO', 'DIREITO', 'SAO', 1),
('greder@resenha.com', 'Greder', 'Greder123456@', 'MEIA', 'DIREITO', 'COR', 0),
('alceu@resenha.com', 'Alceu', 'Alceu123456@', 'ZAGUEIRO', 'DIREITO', 'SAN', 0),
('claudemir@resenha.com', 'Claudemir', 'Claudemir123456@', 'MEIA', 'DIREITO', 'SAN', 0),
('andre@resenha.com', 'Andre', 'Andre123456@', 'MEIA', 'DIREITO', 'SAN', 0);

INSERT INTO usuarios (
    nome,
    email,
    senha_hash,
    ativo,
    criado_em,
    goleiro,
    time_coracao_codigo,
    posicao_principal,
    pe_dominante,
    atualizado_em
)
SELECT
    su.nome,
    su.email,
    TO_BASE64(UNHEX(SHA2(su.senha, 256))),
    1,
    UTC_TIMESTAMP(),
    su.goleiro,
    su.time_codigo,
    su.posicao,
    su.pe,
    UTC_TIMESTAMP()
FROM tmp_seed_usuarios su
LEFT JOIN usuarios u
    ON LOWER(u.email) = su.email
WHERE u.id_usuario IS NULL;

DROP TEMPORARY TABLE IF EXISTS tmp_seed_ids;
CREATE TEMPORARY TABLE tmp_seed_ids AS
SELECT
    su.email,
    su.nome,
    u.id_usuario
FROM tmp_seed_usuarios su
JOIN usuarios u
    ON LOWER(u.email) = su.email
   AND u.ativo = 1;

INSERT INTO grupo_usuarios (id_grupo, id_usuario, perfil, ativo, entrou_em)
SELECT
    @grupo_id,
    tsi.id_usuario,
    'JOGADOR',
    1,
    UTC_TIMESTAMP()
FROM tmp_seed_ids tsi
LEFT JOIN grupo_usuarios gu
    ON gu.id_grupo = @grupo_id
   AND gu.id_usuario = tsi.id_usuario
   AND gu.ativo = 1
WHERE gu.id_grupo_usuario IS NULL;

SET @u_gustavo := (SELECT id_usuario FROM usuarios WHERE email = 'gustavo@resenha.com' LIMIT 1);
SET @u_joao := (SELECT id_usuario FROM usuarios WHERE email = 'joao@resenha.com' LIMIT 1);
SET @u_rafa := (SELECT id_usuario FROM usuarios WHERE email = 'rafa@resenha.com' LIMIT 1);
SET @u_igor := (SELECT id_usuario FROM usuarios WHERE email = 'igor@resenha.com' LIMIT 1);
SET @u_casemiro := (SELECT id_usuario FROM usuarios WHERE email = 'casemiro@resenha.com' LIMIT 1);
SET @u_lukinha := (SELECT id_usuario FROM usuarios WHERE email = 'lukinha@resenha.com' LIMIT 1);
SET @u_damazio := (SELECT id_usuario FROM usuarios WHERE email = 'damazio@resenha.com' LIMIT 1);
SET @u_jorge := (SELECT id_usuario FROM usuarios WHERE email = 'jorge@resenha.com' LIMIT 1);
SET @u_nilin := (SELECT id_usuario FROM usuarios WHERE email = 'nilin@resenha.com' LIMIT 1);
SET @u_lucas := (SELECT id_usuario FROM usuarios WHERE email = 'lucas@resenha.com' LIMIT 1);
SET @u_leo := (SELECT id_usuario FROM usuarios WHERE email = 'leo@resenha.com' LIMIT 1);
SET @u_noia := (SELECT id_usuario FROM usuarios WHERE email = 'noia@resenha.com' LIMIT 1);
SET @u_markin := (SELECT id_usuario FROM usuarios WHERE email = 'markin@resenha.com' LIMIT 1);
SET @u_matheus := (SELECT id_usuario FROM usuarios WHERE email = 'matheus@resenha.com' LIMIT 1);
SET @u_greder := (SELECT id_usuario FROM usuarios WHERE email = 'greder@resenha.com' LIMIT 1);
SET @u_alceu := (SELECT id_usuario FROM usuarios WHERE email = 'alceu@resenha.com' LIMIT 1);
SET @u_claudemir := (SELECT id_usuario FROM usuarios WHERE email = 'claudemir@resenha.com' LIMIT 1);
SET @u_andre := (SELECT id_usuario FROM usuarios WHERE email = 'andre@resenha.com' LIMIT 1);

DROP TEMPORARY TABLE IF EXISTS tmp_ranking_final;
CREATE TEMPORARY TABLE tmp_ranking_final (
    ordem_manual INT NOT NULL PRIMARY KEY,
    id_usuario BIGINT UNSIGNED NOT NULL,
    pontos INT NOT NULL,
    vitorias INT NOT NULL,
    derrotas INT NOT NULL,
    presencas INT NOT NULL,
    gols INT NOT NULL,
    assistencias INT NOT NULL,
    mvps INT NOT NULL,
    bolas_murchas INT NOT NULL
);

INSERT INTO tmp_ranking_final (
    ordem_manual, id_usuario, pontos, vitorias, derrotas, presencas, gols, assistencias, mvps, bolas_murchas
) VALUES
(1,  @u_gustavo,   21, 5, 1, 6, 8, 4, 2, 0),
(2,  @u_joao,      21, 5, 1, 6, 7, 3, 1, 0),
(3,  @u_rafa,      17, 4, 1, 5, 5, 2, 0, 0),
(4,  @u_damazio,   15, 3, 3, 6, 4, 4, 0, 0),
(5,  @admin_id,    15, 3, 3, 6, 3, 2, 0, 0),
(6,  @u_igor,      14, 3, 2, 5, 6, 1, 0, 0),
(7,  @u_casemiro,  14, 3, 2, 5, 5, 3, 0, 0),
(8,  @u_lukinha,   14, 3, 2, 5, 4, 5, 2, 0),
(9,  @u_leo,       12, 2, 4, 6, 3, 1, 1, 0),
(10, @u_noia,      12, 2, 4, 6, 1, 0, 0, 1),
(11, @u_lucas,     11, 2, 3, 5, 2, 1, 0, 0),
(12, @u_nilin,     10, 2, 2, 4, 0, 0, 0, 0),
(13, @u_jorge,      9, 2, 1, 3, 1, 0, 0, 2),
(14, @u_claudemir,  8, 1, 4, 5, 0, 3, 0, 0),
(15, @u_alceu,      7, 1, 3, 4, 2, 0, 0, 0),
(16, @u_greder,     6, 1, 2, 3, 2, 1, 0, 0),
(17, @u_markin,     5, 1, 1, 2, 1, 0, 0, 1),
(18, @u_matheus,    5, 1, 1, 2, 0, 0, 0, 0),
(19, @u_andre,      1, 0, 1, 1, 0, 0, 0, 1);

INSERT INTO classificacoes_temporada (
    id_temporada,
    id_usuario,
    pontos,
    vitorias,
    derrotas,
    presencas,
    gols,
    assistencias,
    mvps,
    bolas_murchas,
    atualizado_em
)
SELECT
    @temporada_id,
    trf.id_usuario,
    trf.pontos,
    trf.vitorias,
    trf.derrotas,
    trf.presencas,
    trf.gols,
    trf.assistencias,
    trf.mvps,
    trf.bolas_murchas,
    UTC_TIMESTAMP()
FROM tmp_ranking_final trf
LEFT JOIN classificacoes_temporada ct
    ON ct.id_temporada = @temporada_id
   AND ct.id_usuario = trf.id_usuario
WHERE ct.id_classificacao IS NULL;

INSERT INTO classificacoes_geral_grupo (
    id_grupo,
    id_usuario,
    pontos,
    vitorias,
    derrotas,
    presencas,
    gols,
    assistencias,
    mvps,
    bolas_murchas,
    atualizado_em
)
SELECT
    @grupo_id,
    trf.id_usuario,
    trf.pontos,
    trf.vitorias,
    trf.derrotas,
    trf.presencas,
    trf.gols,
    trf.assistencias,
    trf.mvps,
    trf.bolas_murchas,
    UTC_TIMESTAMP()
FROM tmp_ranking_final trf
LEFT JOIN classificacoes_geral_grupo cgg
    ON cgg.id_grupo = @grupo_id
   AND cgg.id_usuario = trf.id_usuario
WHERE cgg.id_classificacao_geral IS NULL;

INSERT INTO ciclos_capitao (
    id_grupo,
    id_temporada,
    id_capitao_atual,
    id_desafiante_atual,
    status,
    iniciado_em,
    encerrado_em
) VALUES (
    @grupo_id,
    @temporada_id,
    @u_gustavo,
    NULL,
    'ENCERRADO',
    '2026-02-08 09:30:00',
    '2026-03-08 11:30:00'
);
SET @ciclo1_id := LAST_INSERT_ID();

INSERT INTO ciclo_capitao_bloqueados (id_ciclo, id_usuario_bloqueado, criado_em) VALUES
(@ciclo1_id, @u_alceu,      '2026-02-08 11:30:00'),
(@ciclo1_id, @u_lucas,      '2026-02-15 11:30:00'),
(@ciclo1_id, @u_andre,      '2026-02-22 11:30:00'),
(@ciclo1_id, @admin_id,     '2026-03-01 11:30:00');

INSERT INTO ciclos_capitao (
    id_grupo,
    id_temporada,
    id_capitao_atual,
    id_desafiante_atual,
    status,
    iniciado_em,
    encerrado_em
) VALUES (
    @grupo_id,
    @temporada_id,
    @u_lukinha,
    NULL,
    'ATIVO',
    '2026-03-08 11:31:00',
    NULL
);
SET @ciclo2_id := LAST_INSERT_ID();

INSERT INTO ciclo_capitao_bloqueados (id_ciclo, id_usuario_bloqueado, criado_em) VALUES
(@ciclo2_id, @u_greder, '2026-03-15 11:30:00');

INSERT INTO partidas (
    id_grupo, id_temporada, data_hora_jogo, status, observacao, limite_vagas, criado_por_usuario, id_ciclo_capitao, criado_em, atualizado_em
) VALUES (
    @grupo_id, @temporada_id, '2026-02-08 10:00:00', 'FINALIZADA', 'Desafio de capitao: Gustavo x Alceu', 14, @admin_id, @ciclo1_id, '2026-02-07 20:00:00', '2026-02-08 11:30:00'
);
SET @match_0802 := LAST_INSERT_ID();

INSERT INTO presencas_partida (id_partida, id_usuario, status, confirmado_em) VALUES
(@match_0802, @u_gustavo,   'CONFIRMADO', '2026-02-08 09:00:00'),
(@match_0802, @u_joao,      'CONFIRMADO', '2026-02-08 09:00:00'),
(@match_0802, @u_rafa,      'CONFIRMADO', '2026-02-08 09:00:00'),
(@match_0802, @u_damazio,   'CONFIRMADO', '2026-02-08 09:00:00'),
(@match_0802, @admin_id,    'CONFIRMADO', '2026-02-08 09:00:00'),
(@match_0802, @u_igor,      'CONFIRMADO', '2026-02-08 09:00:00'),
(@match_0802, @u_casemiro,  'CONFIRMADO', '2026-02-08 09:00:00'),
(@match_0802, @u_leo,       'CONFIRMADO', '2026-02-08 09:00:00'),
(@match_0802, @u_noia,      'CONFIRMADO', '2026-02-08 09:00:00'),
(@match_0802, @u_lucas,     'CONFIRMADO', '2026-02-08 09:00:00'),
(@match_0802, @u_nilin,     'CONFIRMADO', '2026-02-08 09:00:00'),
(@match_0802, @u_alceu,     'CONFIRMADO', '2026-02-08 09:00:00'),
(@match_0802, @u_claudemir, 'CONFIRMADO', '2026-02-08 09:00:00'),
(@match_0802, @u_markin,    'CONFIRMADO', '2026-02-08 09:00:00');

INSERT INTO times_partida (id_partida, numero_time, id_capitao) VALUES (@match_0802, 1, @u_gustavo);
SET @match_0802_time1 := LAST_INSERT_ID();
INSERT INTO times_partida (id_partida, numero_time, id_capitao) VALUES (@match_0802, 2, @u_alceu);
SET @match_0802_time2 := LAST_INSERT_ID();

INSERT INTO jogadores_time_partida (id_time, id_usuario) VALUES
(@match_0802_time1, @u_gustavo),
(@match_0802_time1, @u_joao),
(@match_0802_time1, @u_rafa),
(@match_0802_time1, @u_damazio),
(@match_0802_time1, @u_leo),
(@match_0802_time1, @u_lucas),
(@match_0802_time1, @u_nilin),
(@match_0802_time2, @u_alceu),
(@match_0802_time2, @admin_id),
(@match_0802_time2, @u_igor),
(@match_0802_time2, @u_casemiro),
(@match_0802_time2, @u_noia),
(@match_0802_time2, @u_claudemir),
(@match_0802_time2, @u_markin);

INSERT INTO resultados_partida (id_partida, gols_time_1, gols_time_2, vencedor_numero_time, finalizado_em)
VALUES (@match_0802, 6, 4, 1, '2026-02-08 11:30:00');

INSERT INTO estatisticas_partida (id_partida, id_usuario, gols, assistencias, criado_em, atualizado_em) VALUES
(@match_0802, @u_gustavo,   2, 1, '2026-02-08 11:00:00', '2026-02-08 11:00:00'),
(@match_0802, @u_joao,      1, 1, '2026-02-08 11:00:00', '2026-02-08 11:00:00'),
(@match_0802, @u_rafa,      1, 0, '2026-02-08 11:00:00', '2026-02-08 11:00:00'),
(@match_0802, @u_damazio,   1, 1, '2026-02-08 11:00:00', '2026-02-08 11:00:00'),
(@match_0802, @u_leo,       1, 0, '2026-02-08 11:00:00', '2026-02-08 11:00:00'),
(@match_0802, @u_lucas,     0, 1, '2026-02-08 11:00:00', '2026-02-08 11:00:00'),
(@match_0802, @u_alceu,     1, 0, '2026-02-08 11:00:00', '2026-02-08 11:00:00'),
(@match_0802, @admin_id,    1, 1, '2026-02-08 11:00:00', '2026-02-08 11:00:00'),
(@match_0802, @u_igor,      1, 0, '2026-02-08 11:00:00', '2026-02-08 11:00:00'),
(@match_0802, @u_casemiro,  1, 0, '2026-02-08 11:00:00', '2026-02-08 11:00:00');

INSERT INTO votacoes_partida (
    id_partida, tipo, rodada, status, id_usuario_vencedor_provisorio, apurada_em, aprovada_por_usuario, aprovada_em, observacao, criada_em
) VALUES
(@match_0802, 'MVP',          1, 'APROVADA', @u_gustavo, '2026-02-08 11:10:00', @admin_id, '2026-02-08 11:12:00', 'Melhor jogador da partida.', '2026-02-08 11:05:00'),
(@match_0802, 'BOLA_MURCHA',  1, 'APROVADA', @u_markin,  '2026-02-08 11:10:00', @admin_id, '2026-02-08 11:12:00', 'Partida abaixo do esperado.', '2026-02-08 11:05:00');

INSERT INTO partidas (
    id_grupo, id_temporada, data_hora_jogo, status, observacao, limite_vagas, criado_por_usuario, id_ciclo_capitao, criado_em, atualizado_em
) VALUES (
    @grupo_id, @temporada_id, '2026-02-15 10:00:00', 'FINALIZADA', 'Desafio de capitao: Gustavo x Lucas', 14, @admin_id, @ciclo1_id, '2026-02-14 20:00:00', '2026-02-15 11:30:00'
);
SET @match_1502 := LAST_INSERT_ID();

INSERT INTO presencas_partida (id_partida, id_usuario, status, confirmado_em) VALUES
(@match_1502, @u_gustavo,   'CONFIRMADO', '2026-02-15 09:00:00'),
(@match_1502, @u_joao,      'CONFIRMADO', '2026-02-15 09:00:00'),
(@match_1502, @u_rafa,      'CONFIRMADO', '2026-02-15 09:00:00'),
(@match_1502, @u_damazio,   'CONFIRMADO', '2026-02-15 09:00:00'),
(@match_1502, @admin_id,    'CONFIRMADO', '2026-02-15 09:00:00'),
(@match_1502, @u_igor,      'CONFIRMADO', '2026-02-15 09:00:00'),
(@match_1502, @u_casemiro,  'CONFIRMADO', '2026-02-15 09:00:00'),
(@match_1502, @u_lukinha,   'CONFIRMADO', '2026-02-15 09:00:00'),
(@match_1502, @u_leo,       'CONFIRMADO', '2026-02-15 09:00:00'),
(@match_1502, @u_noia,      'CONFIRMADO', '2026-02-15 09:00:00'),
(@match_1502, @u_lucas,     'CONFIRMADO', '2026-02-15 09:00:00'),
(@match_1502, @u_nilin,     'CONFIRMADO', '2026-02-15 09:00:00'),
(@match_1502, @u_jorge,     'CONFIRMADO', '2026-02-15 09:00:00'),
(@match_1502, @u_claudemir, 'CONFIRMADO', '2026-02-15 09:00:00');

INSERT INTO times_partida (id_partida, numero_time, id_capitao) VALUES (@match_1502, 1, @u_gustavo);
SET @match_1502_time1 := LAST_INSERT_ID();
INSERT INTO times_partida (id_partida, numero_time, id_capitao) VALUES (@match_1502, 2, @u_lucas);
SET @match_1502_time2 := LAST_INSERT_ID();

INSERT INTO jogadores_time_partida (id_time, id_usuario) VALUES
(@match_1502_time1, @u_gustavo),
(@match_1502_time1, @u_joao),
(@match_1502_time1, @u_damazio),
(@match_1502_time1, @u_igor),
(@match_1502_time1, @u_noia),
(@match_1502_time1, @u_claudemir),
(@match_1502_time1, @u_jorge),
(@match_1502_time2, @u_lucas),
(@match_1502_time2, @u_rafa),
(@match_1502_time2, @u_casemiro),
(@match_1502_time2, @u_leo),
(@match_1502_time2, @u_nilin),
(@match_1502_time2, @u_lukinha),
(@match_1502_time2, @admin_id);

INSERT INTO resultados_partida (id_partida, gols_time_1, gols_time_2, vencedor_numero_time, finalizado_em)
VALUES (@match_1502, 5, 3, 1, '2026-02-15 11:30:00');

INSERT INTO estatisticas_partida (id_partida, id_usuario, gols, assistencias, criado_em, atualizado_em) VALUES
(@match_1502, @u_gustavo,   1, 1, '2026-02-15 11:00:00', '2026-02-15 11:00:00'),
(@match_1502, @u_joao,      2, 0, '2026-02-15 11:00:00', '2026-02-15 11:00:00'),
(@match_1502, @u_damazio,   1, 1, '2026-02-15 11:00:00', '2026-02-15 11:00:00'),
(@match_1502, @u_igor,      1, 0, '2026-02-15 11:00:00', '2026-02-15 11:00:00'),
(@match_1502, @u_claudemir, 0, 1, '2026-02-15 11:00:00', '2026-02-15 11:00:00'),
(@match_1502, @u_lucas,     1, 0, '2026-02-15 11:00:00', '2026-02-15 11:00:00'),
(@match_1502, @u_lukinha,   1, 1, '2026-02-15 11:00:00', '2026-02-15 11:00:00'),
(@match_1502, @u_rafa,      1, 0, '2026-02-15 11:00:00', '2026-02-15 11:00:00'),
(@match_1502, @u_casemiro,  0, 1, '2026-02-15 11:00:00', '2026-02-15 11:00:00');

INSERT INTO votacoes_partida (
    id_partida, tipo, rodada, status, id_usuario_vencedor_provisorio, apurada_em, aprovada_por_usuario, aprovada_em, observacao, criada_em
) VALUES
(@match_1502, 'MVP',          1, 'APROVADA', @u_joao,  '2026-02-15 11:10:00', @admin_id, '2026-02-15 11:12:00', 'Melhor desempenho da manha.', '2026-02-15 11:05:00'),
(@match_1502, 'BOLA_MURCHA',  1, 'APROVADA', @u_jorge, '2026-02-15 11:10:00', @admin_id, '2026-02-15 11:12:00', 'Nao conseguiu entrar bem no jogo.', '2026-02-15 11:05:00');

INSERT INTO partidas (
    id_grupo, id_temporada, data_hora_jogo, status, observacao, limite_vagas, criado_por_usuario, id_ciclo_capitao, criado_em, atualizado_em
) VALUES (
    @grupo_id, @temporada_id, '2026-02-22 10:00:00', 'FINALIZADA', 'Desafio de capitao: Gustavo x Andre', 14, @admin_id, @ciclo1_id, '2026-02-21 20:00:00', '2026-02-22 11:30:00'
);
SET @match_2202 := LAST_INSERT_ID();

INSERT INTO presencas_partida (id_partida, id_usuario, status, confirmado_em) VALUES
(@match_2202, @u_gustavo,   'CONFIRMADO', '2026-02-22 09:00:00'),
(@match_2202, @u_joao,      'CONFIRMADO', '2026-02-22 09:00:00'),
(@match_2202, @u_rafa,      'CONFIRMADO', '2026-02-22 09:00:00'),
(@match_2202, @u_damazio,   'CONFIRMADO', '2026-02-22 09:00:00'),
(@match_2202, @admin_id,    'CONFIRMADO', '2026-02-22 09:00:00'),
(@match_2202, @u_igor,      'CONFIRMADO', '2026-02-22 09:00:00'),
(@match_2202, @u_casemiro,  'CONFIRMADO', '2026-02-22 09:00:00'),
(@match_2202, @u_lukinha,   'CONFIRMADO', '2026-02-22 09:00:00'),
(@match_2202, @u_leo,       'CONFIRMADO', '2026-02-22 09:00:00'),
(@match_2202, @u_noia,      'CONFIRMADO', '2026-02-22 09:00:00'),
(@match_2202, @u_lucas,     'CONFIRMADO', '2026-02-22 09:00:00'),
(@match_2202, @u_alceu,     'CONFIRMADO', '2026-02-22 09:00:00'),
(@match_2202, @u_greder,    'CONFIRMADO', '2026-02-22 09:00:00'),
(@match_2202, @u_andre,     'CONFIRMADO', '2026-02-22 09:00:00');

INSERT INTO times_partida (id_partida, numero_time, id_capitao) VALUES (@match_2202, 1, @u_gustavo);
SET @match_2202_time1 := LAST_INSERT_ID();
INSERT INTO times_partida (id_partida, numero_time, id_capitao) VALUES (@match_2202, 2, @u_andre);
SET @match_2202_time2 := LAST_INSERT_ID();

INSERT INTO jogadores_time_partida (id_time, id_usuario) VALUES
(@match_2202_time1, @u_gustavo),
(@match_2202_time1, @u_joao),
(@match_2202_time1, @u_rafa),
(@match_2202_time1, @u_casemiro),
(@match_2202_time1, @u_leo),
(@match_2202_time1, @u_noia),
(@match_2202_time1, @u_lukinha),
(@match_2202_time2, @u_andre),
(@match_2202_time2, @u_damazio),
(@match_2202_time2, @admin_id),
(@match_2202_time2, @u_igor),
(@match_2202_time2, @u_lucas),
(@match_2202_time2, @u_alceu),
(@match_2202_time2, @u_greder);

INSERT INTO resultados_partida (id_partida, gols_time_1, gols_time_2, vencedor_numero_time, finalizado_em)
VALUES (@match_2202, 4, 2, 1, '2026-02-22 11:30:00');

INSERT INTO estatisticas_partida (id_partida, id_usuario, gols, assistencias, criado_em, atualizado_em) VALUES
(@match_2202, @u_gustavo,   1, 1, '2026-02-22 11:00:00', '2026-02-22 11:00:00'),
(@match_2202, @u_joao,      1, 0, '2026-02-22 11:00:00', '2026-02-22 11:00:00'),
(@match_2202, @u_rafa,      1, 0, '2026-02-22 11:00:00', '2026-02-22 11:00:00'),
(@match_2202, @u_lukinha,   1, 0, '2026-02-22 11:00:00', '2026-02-22 11:00:00'),
(@match_2202, @u_casemiro,  0, 1, '2026-02-22 11:00:00', '2026-02-22 11:00:00'),
(@match_2202, @u_damazio,   1, 0, '2026-02-22 11:00:00', '2026-02-22 11:00:00'),
(@match_2202, @u_igor,      1, 0, '2026-02-22 11:00:00', '2026-02-22 11:00:00');

INSERT INTO votacoes_partida (
    id_partida, tipo, rodada, status, id_usuario_vencedor_provisorio, apurada_em, aprovada_por_usuario, aprovada_em, observacao, criada_em
) VALUES
(@match_2202, 'MVP',          1, 'APROVADA', @u_lukinha, '2026-02-22 11:10:00', @admin_id, '2026-02-22 11:12:00', 'Entrou e decidiu a partida.', '2026-02-22 11:05:00'),
(@match_2202, 'BOLA_MURCHA',  1, 'APROVADA', @u_andre,   '2026-02-22 11:10:00', @admin_id, '2026-02-22 11:12:00', 'Desafiante nao conseguiu render.', '2026-02-22 11:05:00');

INSERT INTO partidas (
    id_grupo, id_temporada, data_hora_jogo, status, observacao, limite_vagas, criado_por_usuario, id_ciclo_capitao, criado_em, atualizado_em
) VALUES (
    @grupo_id, @temporada_id, '2026-03-01 10:00:00', 'FINALIZADA', 'Desafio de capitao: Gustavo x Maik', 14, @admin_id, @ciclo1_id, '2026-02-28 20:00:00', '2026-03-01 11:30:00'
);
SET @match_0103 := LAST_INSERT_ID();

INSERT INTO presencas_partida (id_partida, id_usuario, status, confirmado_em) VALUES
(@match_0103, @u_gustavo,   'CONFIRMADO', '2026-03-01 09:00:00'),
(@match_0103, @u_joao,      'CONFIRMADO', '2026-03-01 09:00:00'),
(@match_0103, @u_rafa,      'CONFIRMADO', '2026-03-01 09:00:00'),
(@match_0103, @u_damazio,   'CONFIRMADO', '2026-03-01 09:00:00'),
(@match_0103, @admin_id,    'CONFIRMADO', '2026-03-01 09:00:00'),
(@match_0103, @u_igor,      'CONFIRMADO', '2026-03-01 09:00:00'),
(@match_0103, @u_casemiro,  'CONFIRMADO', '2026-03-01 09:00:00'),
(@match_0103, @u_lukinha,   'CONFIRMADO', '2026-03-01 09:00:00'),
(@match_0103, @u_leo,       'CONFIRMADO', '2026-03-01 09:00:00'),
(@match_0103, @u_noia,      'CONFIRMADO', '2026-03-01 09:00:00'),
(@match_0103, @u_lucas,     'CONFIRMADO', '2026-03-01 09:00:00'),
(@match_0103, @u_nilin,     'CONFIRMADO', '2026-03-01 09:00:00'),
(@match_0103, @u_jorge,     'CONFIRMADO', '2026-03-01 09:00:00'),
(@match_0103, @u_claudemir, 'CONFIRMADO', '2026-03-01 09:00:00');

INSERT INTO times_partida (id_partida, numero_time, id_capitao) VALUES (@match_0103, 1, @u_gustavo);
SET @match_0103_time1 := LAST_INSERT_ID();
INSERT INTO times_partida (id_partida, numero_time, id_capitao) VALUES (@match_0103, 2, @admin_id);
SET @match_0103_time2 := LAST_INSERT_ID();

INSERT INTO jogadores_time_partida (id_time, id_usuario) VALUES
(@match_0103_time1, @u_gustavo),
(@match_0103_time1, @u_joao),
(@match_0103_time1, @u_rafa),
(@match_0103_time1, @u_damazio),
(@match_0103_time1, @u_leo),
(@match_0103_time1, @u_noia),
(@match_0103_time1, @u_nilin),
(@match_0103_time2, @admin_id),
(@match_0103_time2, @u_igor),
(@match_0103_time2, @u_casemiro),
(@match_0103_time2, @u_lucas),
(@match_0103_time2, @u_jorge),
(@match_0103_time2, @u_claudemir),
(@match_0103_time2, @u_lukinha);

INSERT INTO resultados_partida (id_partida, gols_time_1, gols_time_2, vencedor_numero_time, finalizado_em)
VALUES (@match_0103, 3, 2, 1, '2026-03-01 11:30:00');

INSERT INTO estatisticas_partida (id_partida, id_usuario, gols, assistencias, criado_em, atualizado_em) VALUES
(@match_0103, @u_gustavo,   1, 0, '2026-03-01 11:00:00', '2026-03-01 11:00:00'),
(@match_0103, @u_joao,      1, 0, '2026-03-01 11:00:00', '2026-03-01 11:00:00'),
(@match_0103, @u_damazio,   1, 0, '2026-03-01 11:00:00', '2026-03-01 11:00:00'),
(@match_0103, @u_lukinha,   1, 0, '2026-03-01 11:00:00', '2026-03-01 11:00:00'),
(@match_0103, @u_igor,      1, 0, '2026-03-01 11:00:00', '2026-03-01 11:00:00');

INSERT INTO votacoes_partida (
    id_partida, tipo, rodada, status, id_usuario_vencedor_provisorio, apurada_em, aprovada_por_usuario, aprovada_em, observacao, criada_em
) VALUES
(@match_0103, 'MVP',          1, 'APROVADA', @u_gustavo, '2026-03-01 11:10:00', @admin_id, '2026-03-01 11:12:00', 'Segurou o reinado em jogo duro.', '2026-03-01 11:05:00'),
(@match_0103, 'BOLA_MURCHA',  1, 'APROVADA', @u_jorge,   '2026-03-01 11:10:00', @admin_id, '2026-03-01 11:12:00', 'Entrou pouco no ritmo da partida.', '2026-03-01 11:05:00');

INSERT INTO partidas (
    id_grupo, id_temporada, data_hora_jogo, status, observacao, limite_vagas, criado_por_usuario, id_ciclo_capitao, criado_em, atualizado_em
) VALUES (
    @grupo_id, @temporada_id, '2026-03-08 10:00:00', 'FINALIZADA', 'Desafio de capitao: Gustavo x Lukinha', 15, @admin_id, @ciclo1_id, '2026-03-07 20:00:00', '2026-03-08 11:30:00'
);
SET @match_0803 := LAST_INSERT_ID();

INSERT INTO presencas_partida (id_partida, id_usuario, status, confirmado_em) VALUES
(@match_0803, @u_gustavo,   'CONFIRMADO', '2026-03-08 09:00:00'),
(@match_0803, @u_joao,      'CONFIRMADO', '2026-03-08 09:00:00'),
(@match_0803, @u_rafa,      'CONFIRMADO', '2026-03-08 09:00:00'),
(@match_0803, @u_damazio,   'CONFIRMADO', '2026-03-08 09:00:00'),
(@match_0803, @admin_id,    'CONFIRMADO', '2026-03-08 09:00:00'),
(@match_0803, @u_igor,      'CONFIRMADO', '2026-03-08 09:00:00'),
(@match_0803, @u_casemiro,  'CONFIRMADO', '2026-03-08 09:00:00'),
(@match_0803, @u_lukinha,   'CONFIRMADO', '2026-03-08 09:00:00'),
(@match_0803, @u_leo,       'CONFIRMADO', '2026-03-08 09:00:00'),
(@match_0803, @u_noia,      'CONFIRMADO', '2026-03-08 09:00:00'),
(@match_0803, @u_alceu,     'CONFIRMADO', '2026-03-08 09:00:00'),
(@match_0803, @u_greder,    'CONFIRMADO', '2026-03-08 09:00:00'),
(@match_0803, @u_markin,    'CONFIRMADO', '2026-03-08 09:00:00'),
(@match_0803, @u_matheus,   'CONFIRMADO', '2026-03-08 09:00:00'),
(@match_0803, @u_claudemir, 'CONFIRMADO', '2026-03-08 09:00:00');

INSERT INTO times_partida (id_partida, numero_time, id_capitao) VALUES (@match_0803, 1, @u_gustavo);
SET @match_0803_time1 := LAST_INSERT_ID();
INSERT INTO times_partida (id_partida, numero_time, id_capitao) VALUES (@match_0803, 2, @u_lukinha);
SET @match_0803_time2 := LAST_INSERT_ID();

INSERT INTO jogadores_time_partida (id_time, id_usuario) VALUES
(@match_0803_time1, @u_gustavo),
(@match_0803_time1, @u_joao),
(@match_0803_time1, @u_rafa),
(@match_0803_time1, @u_igor),
(@match_0803_time1, @u_casemiro),
(@match_0803_time1, @u_leo),
(@match_0803_time1, @u_noia),
(@match_0803_time1, @u_alceu),
(@match_0803_time2, @u_lukinha),
(@match_0803_time2, @u_damazio),
(@match_0803_time2, @admin_id),
(@match_0803_time2, @u_greder),
(@match_0803_time2, @u_markin),
(@match_0803_time2, @u_matheus),
(@match_0803_time2, @u_claudemir);

INSERT INTO resultados_partida (id_partida, gols_time_1, gols_time_2, vencedor_numero_time, finalizado_em)
VALUES (@match_0803, 4, 5, 2, '2026-03-08 11:30:00');

INSERT INTO estatisticas_partida (id_partida, id_usuario, gols, assistencias, criado_em, atualizado_em) VALUES
(@match_0803, @u_gustavo,   1, 1, '2026-03-08 11:00:00', '2026-03-08 11:00:00'),
(@match_0803, @u_joao,      1, 0, '2026-03-08 11:00:00', '2026-03-08 11:00:00'),
(@match_0803, @u_igor,      1, 0, '2026-03-08 11:00:00', '2026-03-08 11:00:00'),
(@match_0803, @u_alceu,     1, 0, '2026-03-08 11:00:00', '2026-03-08 11:00:00'),
(@match_0803, @u_lukinha,   2, 1, '2026-03-08 11:00:00', '2026-03-08 11:00:00'),
(@match_0803, @u_damazio,   1, 1, '2026-03-08 11:00:00', '2026-03-08 11:00:00'),
(@match_0803, @admin_id,    1, 0, '2026-03-08 11:00:00', '2026-03-08 11:00:00'),
(@match_0803, @u_greder,    1, 0, '2026-03-08 11:00:00', '2026-03-08 11:00:00'),
(@match_0803, @u_claudemir, 0, 1, '2026-03-08 11:00:00', '2026-03-08 11:00:00');

INSERT INTO votacoes_partida (
    id_partida, tipo, rodada, status, id_usuario_vencedor_provisorio, apurada_em, aprovada_por_usuario, aprovada_em, observacao, criada_em
) VALUES
(@match_0803, 'MVP',          1, 'APROVADA', @u_lukinha, '2026-03-08 11:10:00', @admin_id, '2026-03-08 11:12:00', 'Virou o jogo e tomou o posto de capitao.', '2026-03-08 11:05:00'),
(@match_0803, 'BOLA_MURCHA',  1, 'APROVADA', @u_noia,    '2026-03-08 11:10:00', @admin_id, '2026-03-08 11:12:00', 'Nao esteve em um bom dia.', '2026-03-08 11:05:00');

INSERT INTO partidas (
    id_grupo, id_temporada, data_hora_jogo, status, observacao, limite_vagas, criado_por_usuario, id_ciclo_capitao, criado_em, atualizado_em
) VALUES (
    @grupo_id, @temporada_id, '2026-03-15 10:00:00', 'FINALIZADA', 'Desafio de capitao: Lukinha x Greder', 14, @admin_id, @ciclo2_id, '2026-03-14 20:00:00', '2026-03-15 11:30:00'
);
SET @match_1503 := LAST_INSERT_ID();

INSERT INTO presencas_partida (id_partida, id_usuario, status, confirmado_em) VALUES
(@match_1503, @u_gustavo,   'CONFIRMADO', '2026-03-15 09:00:00'),
(@match_1503, @u_joao,      'CONFIRMADO', '2026-03-15 09:00:00'),
(@match_1503, @u_damazio,   'CONFIRMADO', '2026-03-15 09:00:00'),
(@match_1503, @admin_id,    'CONFIRMADO', '2026-03-15 09:00:00'),
(@match_1503, @u_lukinha,   'CONFIRMADO', '2026-03-15 09:00:00'),
(@match_1503, @u_leo,       'CONFIRMADO', '2026-03-15 09:00:00'),
(@match_1503, @u_noia,      'CONFIRMADO', '2026-03-15 09:00:00'),
(@match_1503, @u_nilin,     'CONFIRMADO', '2026-03-15 09:00:00'),
(@match_1503, @u_lucas,     'CONFIRMADO', '2026-03-15 09:00:00'),
(@match_1503, @u_jorge,     'CONFIRMADO', '2026-03-15 09:00:00'),
(@match_1503, @u_matheus,   'CONFIRMADO', '2026-03-15 09:00:00'),
(@match_1503, @u_greder,    'CONFIRMADO', '2026-03-15 09:00:00'),
(@match_1503, @u_alceu,     'CONFIRMADO', '2026-03-15 09:00:00'),
(@match_1503, @u_claudemir, 'CONFIRMADO', '2026-03-15 09:00:00');

INSERT INTO times_partida (id_partida, numero_time, id_capitao) VALUES (@match_1503, 1, @u_lukinha);
SET @match_1503_time1 := LAST_INSERT_ID();
INSERT INTO times_partida (id_partida, numero_time, id_capitao) VALUES (@match_1503, 2, @u_greder);
SET @match_1503_time2 := LAST_INSERT_ID();

INSERT INTO jogadores_time_partida (id_time, id_usuario) VALUES
(@match_1503_time1, @u_lukinha),
(@match_1503_time1, @u_gustavo),
(@match_1503_time1, @u_joao),
(@match_1503_time1, @u_damazio),
(@match_1503_time1, @u_leo),
(@match_1503_time1, @u_noia),
(@match_1503_time1, @u_nilin),
(@match_1503_time2, @u_greder),
(@match_1503_time2, @admin_id),
(@match_1503_time2, @u_lucas),
(@match_1503_time2, @u_jorge),
(@match_1503_time2, @u_claudemir),
(@match_1503_time2, @u_alceu),
(@match_1503_time2, @u_matheus);

INSERT INTO resultados_partida (id_partida, gols_time_1, gols_time_2, vencedor_numero_time, finalizado_em)
VALUES (@match_1503, 4, 1, 1, '2026-03-15 11:30:00');

INSERT INTO estatisticas_partida (id_partida, id_usuario, gols, assistencias, criado_em, atualizado_em) VALUES
(@match_1503, @u_lukinha,   1, 1, '2026-03-15 11:00:00', '2026-03-15 11:00:00'),
(@match_1503, @u_gustavo,   1, 0, '2026-03-15 11:00:00', '2026-03-15 11:00:00'),
(@match_1503, @u_joao,      1, 0, '2026-03-15 11:00:00', '2026-03-15 11:00:00'),
(@match_1503, @u_leo,       1, 0, '2026-03-15 11:00:00', '2026-03-15 11:00:00'),
(@match_1503, @u_damazio,   0, 1, '2026-03-15 11:00:00', '2026-03-15 11:00:00'),
(@match_1503, @u_greder,    1, 0, '2026-03-15 11:00:00', '2026-03-15 11:00:00');

INSERT INTO votacoes_partida (
    id_partida, tipo, rodada, status, id_usuario_vencedor_provisorio, apurada_em, aprovada_por_usuario, aprovada_em, observacao, criada_em
) VALUES
(@match_1503, 'MVP',          1, 'APROVADA', @u_leo,     '2026-03-15 11:10:00', @admin_id, '2026-03-15 11:12:00', 'Jogou muito atras e ainda deixou o dele.', '2026-03-15 11:05:00'),
(@match_1503, 'BOLA_MURCHA',  1, 'APROVADA', @u_matheus, '2026-03-15 11:10:00', @admin_id, '2026-03-15 11:12:00', 'Nao conseguiu acompanhar o ritmo do jogo.', '2026-03-15 11:05:00');

COMMIT;
