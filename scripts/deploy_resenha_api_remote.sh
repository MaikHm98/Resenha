#!/usr/bin/env bash
set -euo pipefail

if ! sudo mysql -Nse "SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='resenha' AND TABLE_NAME='desafios_partida' AND COLUMN_NAME='escolha_paridade_capitao_atual'" | grep -q 1; then
  sudo mysql resenha < /tmp/update_desafios_partida_par_impar.sql
fi

if ! sudo mysql -Nse "SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='resenha' AND TABLE_NAME='desafios_partida' AND COLUMN_NAME='escolha_paridade_goleiro_capitao_atual'" | grep -q 1; then
  sudo mysql resenha < /tmp/update_desafios_partida_goleiros.sql
fi

sudo systemctl stop resenha-api
sudo cp -r /tmp/resenha-api-deploy/* /opt/resenha/api/current/
sudo chown -R ubuntu:ubuntu /opt/resenha/api/current
sudo chmod +x /opt/resenha/api/current/Resenha.API
sudo systemctl start resenha-api
sudo systemctl status resenha-api --no-pager
