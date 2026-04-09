ALTER TABLE desafios_partida
    ADD COLUMN escolha_paridade_goleiro_capitao_atual VARCHAR(10) NULL AFTER id_proximo_capitao_escolha,
    ADD COLUMN numero_goleiro_capitao_atual INT NULL AFTER escolha_paridade_goleiro_capitao_atual,
    ADD COLUMN numero_goleiro_desafiante INT NULL AFTER numero_goleiro_capitao_atual,
    ADD COLUMN soma_par_impar_goleiro INT NULL AFTER numero_goleiro_desafiante,
    ADD COLUMN id_vencedor_par_impar_goleiro BIGINT UNSIGNED NULL AFTER soma_par_impar_goleiro,
    ADD COLUMN id_proximo_capitao_escolha_goleiro BIGINT UNSIGNED NULL AFTER id_vencedor_par_impar_goleiro;
