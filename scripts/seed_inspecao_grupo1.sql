SELECT 'GRUPO' AS secao;
SELECT id_grupo, nome, criado_por_usuario, ativo
FROM grupos
WHERE id_grupo = 1;

SELECT 'ADMIN' AS secao;
SELECT id_usuario, nome, email, ativo
FROM usuarios
WHERE email = 'maiksosn.23@gmail.com';

SELECT 'USUARIOS_REFERENCIADOS_NO_GRUPO' AS secao;
SELECT id_usuario, nome, email, ativo
FROM usuarios
WHERE id_usuario IN (2, 4, 9)
ORDER BY id_usuario;

SELECT 'EMAILS_SEED_EXISTENTES' AS secao;
SELECT id_usuario, nome, email, ativo
FROM usuarios
WHERE email IN (
    'gustavo@resenha.com',
    'joao@resenha.com',
    'rafa@resenha.com',
    'igor@resenha.com',
    'casemiro@resenha.com',
    'lukinha@resenha.com',
    'damazio@resenha.com',
    'jorge@resenha.com',
    'nilin@resenha.com',
    'lucas@resenha.com',
    'leo@resenha.com',
    'noia@resenha.com',
    'markin@resenha.com',
    'matheus@resenha.com',
    'greder@resenha.com',
    'alceu@resenha.com',
    'claudemir@resenha.com',
    'andre@resenha.com'
)
ORDER BY email;

SELECT 'MEMBROS_ATIVOS' AS secao;
SELECT COUNT(*) AS membros_ativos
FROM grupo_usuarios
WHERE id_grupo = 1 AND ativo = 1;

SELECT 'MEMBROS_ATIVOS_DETALHE' AS secao;
SELECT gu.id_grupo_usuario, gu.id_usuario, u.nome, u.email, gu.perfil, gu.ativo, gu.entrou_em
FROM grupo_usuarios gu
JOIN usuarios u ON u.id_usuario = gu.id_usuario
WHERE gu.id_grupo = 1 AND gu.ativo = 1
ORDER BY gu.perfil DESC, u.nome;

SELECT 'MEMBROS_ATIVOS_CRU' AS secao;
SELECT id_grupo_usuario, id_grupo, id_usuario, perfil, ativo, entrou_em
FROM grupo_usuarios
WHERE id_grupo = 1
ORDER BY id_grupo_usuario;

SELECT 'TEMPORADAS' AS secao;
SELECT id_temporada, ano, nome, status, confirmada_por_usuario, confirmada_em
FROM temporadas
WHERE id_grupo = 1
ORDER BY id_temporada;

SELECT 'CICLOS_CAPITAO' AS secao;
SELECT id_ciclo, id_temporada, id_capitao_atual, id_desafiante_atual, status, iniciado_em, encerrado_em
FROM ciclos_capitao
WHERE id_grupo = 1
ORDER BY id_ciclo;

SELECT 'PARTIDAS_EXISTENTES' AS secao;
SELECT id_partida, id_temporada, data_hora_jogo, status, criado_por_usuario, id_ciclo_capitao
FROM partidas
WHERE id_grupo = 1
ORDER BY data_hora_jogo, id_partida;

SELECT 'CLASSIFICACAO_GERAL' AS secao;
SELECT c.id_usuario, u.nome, c.pontos, c.vitorias, c.derrotas, c.presencas, c.gols, c.assistencias, c.mvps, c.bolas_murchas
FROM classificacoes_geral_grupo c
JOIN usuarios u ON u.id_usuario = c.id_usuario
WHERE c.id_grupo = 1
ORDER BY c.pontos DESC, c.presencas DESC, c.id_usuario;

SELECT 'CLASSIFICACAO_TEMPORADA' AS secao;
SELECT c.id_temporada, c.id_usuario, u.nome, c.pontos, c.vitorias, c.derrotas, c.presencas, c.gols, c.assistencias, c.mvps, c.bolas_murchas
FROM classificacoes_temporada c
JOIN usuarios u ON u.id_usuario = c.id_usuario
JOIN temporadas t ON t.id_temporada = c.id_temporada
WHERE t.id_grupo = 1
ORDER BY c.id_temporada, c.pontos DESC, c.presencas DESC, c.id_usuario;

SELECT 'CLASSIFICACAO_API_ORDEM' AS secao;
SELECT u.nome, c.pontos, c.vitorias, c.presencas, c.gols
FROM classificacoes_temporada c
JOIN usuarios u ON u.id_usuario = c.id_usuario
WHERE c.id_temporada = 1
ORDER BY c.pontos DESC, c.vitorias DESC, c.gols DESC;
