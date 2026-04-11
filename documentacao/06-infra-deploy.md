# 06. Infraestrutura e Deploy

## Visao Geral

A API foi publicada em uma VM Linux na Oracle Cloud e exposta na internet com dominio proprio e HTTPS.

## Infra Atual

### Oracle Cloud

- compartment: `resenha-beta`
- VCN: `vcn-resenha-beta`
- subnet publica: `subnet-public-resenha`
- IP publico reservado: `163.176.142.15`
- VM ativa: `vm-resenha-api-2`

### Dominio e DNS

- dominio principal: `resenhaapp.com`
- DNS gerenciado na Namecheap
- subdominio da API: `api.resenhaapp.com`
- `A Record`:
  - host: `api`
  - value: `163.176.142.15`

### Endpoint Produtivo

- `https://api.resenhaapp.com`

## Servicos na VM

### API

- diretorio de publicacao: `/opt/resenha/api/current`
- usuario de servico: `resenha`
- servico systemd: `resenha-api`

### Banco

- PostgreSQL local na mesma VM ou em instancia dedicada

### Proxy reverso

- `nginx`

## Variaveis de Ambiente

Template base:

- `backend/deploy/linux/resenha-api.env.template`

Principais chaves:

- `ConnectionStrings__DefaultConnection`
- `JwtSettings__SecretKey`
- `JwtSettings__Issuer`
- `JwtSettings__Audience`
- `JwtSettings__ExpirationMinutes`
- `InviteSettings__RegisterLinkTemplate`
- `PasswordResetSettings__ResetLinkTemplate`
- `EmailSettings__Provider`
- `EmailSettings__Resend__ApiKey`
- `EmailSettings__FromEmail`
- `EmailSettings__FromName`

No ambiente produtivo, o arquivo efetivo fica em:

- `/etc/resenha/resenha-api.env`

Os valores reais de banco, JWT e Resend nao devem ser versionados. Em producao, eles devem ficar apenas no arquivo de ambiente da VM ou em mecanismo equivalente de segredo.

## Execucao da API

### Template do repositorio

Arquivo:

- `backend/deploy/linux/resenha-api.service`

Esse template usa execucao via:

- `/usr/bin/dotnet /opt/resenha/api/current/Resenha.API.dll`

### Execucao real em producao

Na publicacao atual, a API foi publicada como binario self-contained e esta sendo executada diretamente como:

- `/opt/resenha/api/current/Resenha.API`

O backend ativo esta ouvindo internamente em:

- `http://127.0.0.1:5000`

## nginx

### Template

- `backend/deploy/linux/nginx-resenha-api.conf`

### Configuracao efetiva

Configuracao final ajustada para producao:

```nginx
server {
    listen 80;
    server_name api.resenhaapp.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name api.resenhaapp.com;

    ssl_certificate /etc/letsencrypt/live/api.resenhaapp.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.resenhaapp.com/privkey.pem;

    client_max_body_size 10m;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
    }
}
```

## HTTPS

Certificado emitido via `certbot` para:

- `api.resenhaapp.com`

Arquivos principais:

- `/etc/letsencrypt/live/api.resenhaapp.com/fullchain.pem`
- `/etc/letsencrypt/live/api.resenhaapp.com/privkey.pem`

## Firewall e Acesso de Rede

### OCI

Regras de rede foram ajustadas para permitir:

- `22/tcp`
- `80/tcp`
- `443/tcp`

### VM

O ambiente exigiu ajuste adicional no `iptables`, porque havia uma regra `REJECT` posicionada antes das cadeias do `ufw`.

Correcao aplicada:

- aceitacao explicita de `80/tcp`
- aceitacao explicita de `443/tcp`
- persistencia com `iptables-persistent`

Estado esperado do `INPUT`:

- `22` antes do `REJECT`
- `80` antes do `REJECT`
- `443` antes do `REJECT`

## Sequencia de Deploy Recomendada

1. publicar a API localmente
2. copiar artefatos para a VM
3. ajustar segredos no arquivo de ambiente
4. instalar ou atualizar o servico `systemd`
5. configurar `nginx`
6. validar HTTP interno
7. apontar DNS
8. emitir certificado TLS
9. validar endpoint publico

## Checklist de Validacao em Producao

- `systemctl status resenha-api`
- `systemctl status nginx`
- `curl http://127.0.0.1:5000/health`
- `curl http://127.0.0.1:5000/ready`
- `curl -I https://api.resenhaapp.com`
- `curl https://api.resenhaapp.com/api/groups/me` retorna `401` sem token

## Observacoes Importantes

- nao versionar segredos reais
- nao expor PostgreSQL na internet
- manter o app consumindo somente a URL `https://api.resenhaapp.com`
- se a forma de publicacao mudar, revisar templates em `backend/deploy/linux`
