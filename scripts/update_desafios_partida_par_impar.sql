ALTER TABLE desafios_partida
    ADD COLUMN escolha_paridade_capitao_atual VARCHAR(10) NULL AFTER id_desafiante,
    ADD COLUMN numero_capitao_atual INT NULL AFTER escolha_paridade_capitao_atual,
    ADD COLUMN numero_desafiante INT NULL AFTER numero_capitao_atual,
    ADD COLUMN soma_par_impar_linha INT NULL AFTER numero_desafiante,
    ADD COLUMN id_vencedor_par_impar_linha BIGINT UNSIGNED NULL AFTER soma_par_impar_linha,
    ADD COLUMN id_proximo_capitao_escolha BIGINT UNSIGNED NULL AFTER id_vencedor_par_impar_linha;
