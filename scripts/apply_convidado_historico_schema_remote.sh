#!/usr/bin/env bash
set -euo pipefail

MYSQL_CMD=(mysql -u resenha_app -p'455623@_' -D resenha)

HAS_CONVIDADO="$("${MYSQL_CMD[@]}" -N -e "SHOW COLUMNS FROM usuarios LIKE 'convidado';")"
if [ -z "$HAS_CONVIDADO" ]; then
  "${MYSQL_CMD[@]}" -e "ALTER TABLE usuarios ADD COLUMN convidado TINYINT(1) NOT NULL DEFAULT 0 AFTER goleiro;"
fi

"${MYSQL_CMD[@]}" -e "
CREATE TABLE IF NOT EXISTS historico_capitao (
  id_historico BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_grupo BIGINT UNSIGNED NOT NULL,
  id_partida BIGINT UNSIGNED NOT NULL,
  id_ciclo BIGINT UNSIGNED NOT NULL,
  id_capitao BIGINT UNSIGNED NOT NULL,
  id_desafiante BIGINT UNSIGNED NOT NULL,
  resultado VARCHAR(20) NOT NULL,
  id_vencedor BIGINT UNSIGNED NOT NULL,
  id_derrotado BIGINT UNSIGNED NOT NULL,
  registrado_em DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id_historico),
  UNIQUE KEY uq_historico_capitao_partida_ciclo (id_partida, id_ciclo),
  KEY ix_historico_capitao_grupo (id_grupo),
  KEY ix_historico_capitao_vencedor (id_vencedor),
  KEY ix_historico_capitao_derrotado (id_derrotado)
);"

echo "schema_ok"
