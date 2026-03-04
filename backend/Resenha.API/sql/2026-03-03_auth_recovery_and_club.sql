-- 2026-03-03 - Recuperacao de senha + time do coracao

ALTER TABLE usuarios
  ADD COLUMN IF NOT EXISTS time_coracao_codigo VARCHAR(20) NULL AFTER goleiro;

CREATE TABLE IF NOT EXISTS tokens_recuperacao_senha (
  id_token BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_usuario BIGINT UNSIGNED NOT NULL,
  token_hash VARCHAR(128) NOT NULL,
  expira_em DATETIME NOT NULL,
  usado_em DATETIME NULL,
  ip_solicitacao VARCHAR(64) NULL,
  tentativas_validacao INT NOT NULL DEFAULT 0,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_token),
  UNIQUE KEY uq_tokens_recuperacao_senha_token_hash (token_hash),
  KEY ix_tokens_recuperacao_senha_usuario_criado (id_usuario, criado_em),
  CONSTRAINT fk_tokens_recuperacao_senha_usuario
    FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS auditorias_seguranca (
  id_auditoria BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  acao VARCHAR(80) NOT NULL,
  id_usuario BIGINT UNSIGNED NULL,
  email_referencia VARCHAR(180) NULL,
  ip_origem VARCHAR(64) NULL,
  detalhes VARCHAR(120) NULL,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_auditoria),
  KEY ix_auditorias_seguranca_usuario (id_usuario),
  KEY ix_auditorias_seguranca_acao_data (acao, criado_em),
  CONSTRAINT fk_auditorias_seguranca_usuario
    FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
