// seed.js — Popular o grupo "Fut da Ressaca" com dados de teste
// Rodar: node seed.js
// Pré-requisito: API rodando em http://localhost:5276

const BASE_URL = process.env.BASE_URL || 'http://localhost:5276';

// ============================================================
// CONFIGURAÇÃO — defina as variáveis de ambiente antes de rodar:
//   ADMIN_EMAIL=seu@email.com ADMIN_SENHA=suaSenha node seed.js
// OU preencha os valores abaixo apenas localmente (nunca commite senhas!)
// ============================================================
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || '';
const ADMIN_SENHA = process.env.ADMIN_SENHA || '';
const GRUPO_NOME  = process.env.GRUPO_NOME  || 'Fut da Ressaca'; // nome exato do grupo
// ============================================================

const JOGADORES = [
  { nome: 'Gustavo',   email: 'gustavo@ressaca.com'   },
  { nome: 'João',      email: 'joao@ressaca.com'      },
  { nome: 'Léo',       email: 'leo@ressaca.com'       },
  { nome: 'Igor',      email: 'igor@ressaca.com'      },
  { nome: 'Nilin',     email: 'nilin@ressaca.com'     },
  { nome: 'Claudemir', email: 'claudemir@ressaca.com' },
  { nome: 'Noia',      email: 'noia@ressaca.com'      },
  { nome: 'Lucas',     email: 'lucas@ressaca.com'     },
  { nome: 'Lukinha',   email: 'lukinha@ressaca.com'   },
  { nome: 'Damazio',   email: 'damazio@ressaca.com'   },
  { nome: 'Rafa',      email: 'rafa@ressaca.com'      },
  { nome: 'Markin',    email: 'markin@ressaca.com'    },
  { nome: 'Alceu',     email: 'alceu@ressaca.com'     },
  { nome: 'Casemiro',  email: 'casemiro@ressaca.com'  },
  { nome: 'André',     email: 'andre@ressaca.com'     },
];
const SENHA_PADRAO = 'Ressaca@123';

// ─── helpers ────────────────────────────────────────────────
async function req(method, url, body, token) {
  const res = await fetch(`${BASE_URL}${url}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }
  if (!res.ok) {
    const msg = (data && typeof data === 'object' && data.mensagem)
      ? data.mensagem
      : (text || `HTTP ${res.status} ${res.statusText}`);
    throw new Error(`[${res.status}] ${method} ${url} → ${msg}\nBody: ${text.substring(0, 300)}`);
  }
  return data;
}
const post = (url, body, token) => req('POST', url, body, token);
const get  = (url, token)       => req('GET',  url, null, token);
const del  = (url, token)       => req('DELETE', url, null, token);

async function loginOuRegistrar(nome, email, senha) {
  try {
    return await post('/api/users/register', { nome, email, senha });
  } catch {
    return await post('/api/users/login', { email, senha });
  }
}

// ─── main ────────────────────────────────────────────────────
async function main() {
  console.log('🌱 Iniciando seed — Fut da Ressaca\n');

  if (ADMIN_EMAIL === 'COLOQUE_SEU_EMAIL_AQUI') {
    throw new Error('Configure ADMIN_EMAIL e ADMIN_SENHA no topo do arquivo seed.js');
  }

  // 1. Login admin
  console.log('1️⃣  Login admin...');
  const adminData = await post('/api/users/login', { email: ADMIN_EMAIL, senha: ADMIN_SENHA });
  const adminToken = adminData.token;
  const adminId    = adminData.idUsuario;
  console.log(`   ✅ ${adminData.nome} (ID ${adminId})\n`);

  // 2. Encontrar grupo
  console.log(`2️⃣  Buscando grupo "${GRUPO_NOME}"...`);
  const grupos = await get('/api/groups/me', adminToken);
  const grupo  = grupos.find(g => g.nome === GRUPO_NOME);
  if (!grupo) throw new Error(`Grupo "${GRUPO_NOME}" não encontrado. Verifique o nome exato.`);
  const groupId = grupo.idGrupo;
  console.log(`   ✅ ID ${groupId} | ${grupo.totalMembros}/${grupo.limiteJogadores} membros\n`);

  // 3. Registrar jogadores e adicionar ao grupo
  console.log('3️⃣  Registrando jogadores...');
  // índice 0 = Maik (admin), índices 1-15 = jogadores
  const allUsers = [{ nome: adminData.nome, email: ADMIN_EMAIL, id: adminId, token: adminToken }];

  for (const j of JOGADORES) {
    process.stdout.write(`   ${j.nome.padEnd(12)}`);
    try {
      const data = await loginOuRegistrar(j.nome, j.email, SENHA_PADRAO);
      const userId = data.idUsuario;
      const token  = data.token;
      allUsers.push({ nome: j.nome, email: j.email, id: userId, token });

      // Admin convida → usuário entra
      try {
        const invite = await post(`/api/groups/${groupId}/invite`, { emailConvidado: j.email }, adminToken);
        await post('/api/groups/join', { codigoConvite: invite.codigoConvite }, token);
        console.log('✅ entrou no grupo');
      } catch (e) {
        console.log(`⚠️  já no grupo ou erro: ${e.message}`);
      }
    } catch (e) {
      console.log(`❌ ${e.message}`);
    }
  }

  const ids    = allUsers.map(u => u.id);
  const tokens = allUsers.map(u => u.token);
  // ids[0]=Maik, ids[1]=Gustavo, ids[2]=João, ids[3]=Léo, ids[4]=Igor, ids[5]=Nilin
  // ids[6]=Claudemir, ids[7]=Noia, ids[8]=Lucas, ids[9]=Lukinha, ids[10]=Damazio
  // ids[11]=Rafa, ids[12]=Markin, ids[13]=Alceu, ids[14]=Casemiro, ids[15]=André
  console.log(`\n   Total de usuários: ${allUsers.length}`);

  // ─── helper para criar + finalizar partida ───────────────
  async function criarPartida(dataISO, observacao, limiteVagas = 16) {
    return await post('/api/matches', {
      idGrupo: groupId,
      dataHoraJogo: dataISO,
      limiteVagas,
      observacao: observacao || null,
    }, adminToken);
  }

  async function confirmarPresencas(matchId, participantesIdx) {
    for (const idx of participantesIdx) {
      if (!tokens[idx]) continue;
      try { await post(`/api/matches/${matchId}/confirm`, {}, tokens[idx]); } catch {}
    }
  }

  async function atribuirTimes(matchId, time1Idx, time2Idx) {
    await post(`/api/matches/${matchId}/teams`, {
      time1: { idCapitao: ids[time1Idx[0]], jogadores: time1Idx.map(i => ids[i]) },
      time2: { idCapitao: ids[time2Idx[0]], jogadores: time2Idx.map(i => ids[i]) },
    }, adminToken);
  }

  async function finalizar(matchId, gols1, gols2, stats) {
    await post(`/api/matches/${matchId}/finalize`, {
      golsTime1: gols1,
      golsTime2: gols2,
      estatisticas: stats.map(s => ({ idUsuario: ids[s.i], gols: s.g, assistencias: s.a })),
    }, adminToken);
  }

  // 4. Partida 1 — 08/02/2026 — Time 1 vence 3x1
  //    Time 1 (vence): Maik(0), Gustavo(1), João(2), Léo(3), Igor(4), Nilin(5), Claudemir(6), Noia(7)
  //    Time 2 (perde): Lucas(8), Lukinha(9), Damazio(10), Rafa(11), Markin(12), Alceu(13), Casemiro(14), André(15)
  console.log('\n4️⃣  Criando Partida 1 (08/02/2026 — 3x1)...');
  const p1 = await criarPartida('2026-02-08T19:00:00', null, 16);
  await confirmarPresencas(p1.idPartida, [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]);
  await atribuirTimes(p1.idPartida, [0,1,2,3,4,5,6,7], [8,9,10,11,12,13,14,15]);
  await finalizar(p1.idPartida, 3, 1, [
    { i: 1,  g: 2, a: 1 }, // Gustavo: 2 gols, 1 ass
    { i: 0,  g: 1, a: 0 }, // Maik: 1 gol
    { i: 2,  g: 0, a: 1 }, // João: 1 ass
    { i: 8,  g: 1, a: 0 }, // Lucas: 1 gol (honra)
  ]);
  console.log('   ✅ Partida 1 finalizada');

  // 5. Partida 2 — 22/02/2026 — Time 2 vence 2x0
  //    Time 1 (perde): Maik(0), Gustavo(1), Lucas(8), Lukinha(9), Damazio(10), Rafa(11), Markin(12), Alceu(13)
  //    Time 2 (vence): João(2), Léo(3), Igor(4), Nilin(5), Claudemir(6), Noia(7), Casemiro(14), André(15)
  console.log('\n5️⃣  Criando Partida 2 (22/02/2026 — 0x2)...');
  const p2 = await criarPartida('2026-02-22T19:00:00', null, 16);
  await confirmarPresencas(p2.idPartida, [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]);
  await atribuirTimes(p2.idPartida, [0,1,8,9,10,11,12,13], [2,3,4,5,6,7,14,15]);
  await finalizar(p2.idPartida, 0, 2, [
    { i: 2,  g: 1, a: 1 }, // João: 1 gol, 1 ass
    { i: 3,  g: 1, a: 0 }, // Léo: 1 gol
    { i: 5,  g: 0, a: 1 }, // Nilin: 1 ass
  ]);
  console.log('   ✅ Partida 2 finalizada');

  // 6. Partida futura — 01/03/2026
  console.log('\n6️⃣  Criando partida futura (01/03/2026 19h)...');
  const p3 = await criarPartida('2026-03-01T19:00:00', 'Levar coletes. Campo coberto.', 16);
  console.log(`   ✅ Partida ${p3.idPartida} criada (aberta para confirmação)`);

  // Resumo da classificação esperada
  console.log(`
🎉 Seed concluído com sucesso!

📊 Classificação esperada (Temporada):
   João, Léo, Igor, Nilin, Claudemir, Noia, Casemiro, André  → 5 pts (V+D)
   Maik, Gustavo                                               → 5 pts (V+D)
   Lucas, Lukinha, Damazio, Rafa, Markin, Alceu               → 2 pts (D+D)

📅 Partidas:
   ✅ 08/02/2026 — FINALIZADA (3x1)
   ✅ 22/02/2026 — FINALIZADA (0x2)
   📌 01/03/2026 — ABERTA (aguardando confirmações)

Abra o app e navegue para o grupo "${GRUPO_NOME}"!
  `);
}

main().catch(e => {
  console.error('\n❌ Erro:', e.message);
  process.exit(1);
});
