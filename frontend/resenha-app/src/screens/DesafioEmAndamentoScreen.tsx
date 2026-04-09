import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { RouteProp, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import api from '../api/api';
import { AppStackParamList } from '../navigation/AppNavigator';
import { ChallengeStatus } from '../types';
import { Colors, FontSize, Radius, Spacing, Typography } from '../theme';

type Props = {
  navigation: NativeStackNavigationProp<AppStackParamList, 'DesafioEmAndamento'>;
  route: RouteProp<AppStackParamList, 'DesafioEmAndamento'>;
};

const STATUS_LABELS: Record<string, string> = {
  AGUARDANDO_CONFIRMACOES: 'Aguardando confirmacoes',
  PRONTA_PARA_MONTAGEM: 'Pronta para montagem',
  PAR_IMPAR_LINHA: 'Par ou impar dos jogadores',
  ESCOLHA_EM_ANDAMENTO: 'Escolha em andamento',
  PAR_IMPAR_GOLEIROS: 'Par ou impar dos goleiros',
  DEFINICAO_MANUAL_GOLEIRO: 'Definicao manual do goleiro',
  TIMES_FECHADOS: 'Times fechados',
  PARTIDA_FINALIZADA: 'Partida finalizada',
};

function formatarDataHora(iso: string) {
  const data = new Date(iso);
  const dataTexto = data.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
  });
  const horaTexto = data.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return `${dataTexto} - ${horaTexto}`;
}

export default function DesafioEmAndamentoScreen({ navigation, route }: Props) {
  const { matchId, groupName } = route.params;
  const [status, setStatus] = useState<ChallengeStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [erro, setErro] = useState('');
  const [salvandoParidade, setSalvandoParidade] = useState(false);
  const [salvandoNumero, setSalvandoNumero] = useState(false);
  const [salvandoEscolhaJogador, setSalvandoEscolhaJogador] = useState<number | null>(null);
  const [salvandoNumeroGoleiro, setSalvandoNumeroGoleiro] = useState(false);
  const [salvandoEscolhaGoleiro, setSalvandoEscolhaGoleiro] = useState<number | null>(null);
  const [numeroEscolhido, setNumeroEscolhido] = useState('');
  const [numeroGoleiroEscolhido, setNumeroGoleiroEscolhido] = useState('');
  const [regrasVisiveis, setRegrasVisiveis] = useState(false);

  async function carregar(silencioso = false) {
    if (!silencioso) setLoading(true);
    setErro('');

    try {
      const response = await api.get(`/api/matches/${matchId}/challenge-status`);
      setStatus(response.data);
    } catch (e: any) {
      setErro(e?.response?.data?.mensagem || 'Nao foi possivel carregar o desafio em andamento.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function escolherParidade(escolhaParidade: 'PAR' | 'IMPAR') {
    setSalvandoParidade(true);
    setErro('');

    try {
      await api.post(`/api/matches/${matchId}/challenge/line-draw/start`, { escolhaParidade });
      await carregar(true);
    } catch (e: any) {
      setErro(e?.response?.data?.mensagem || 'Nao foi possivel registrar a escolha de par ou impar.');
    } finally {
      setSalvandoParidade(false);
    }
  }

  async function enviarNumero() {
    const numero = Number(numeroEscolhido);

    if (!Number.isInteger(numero) || numero < 0 || numero > 10) {
      setErro('Informe um numero inteiro entre 0 e 10.');
      return;
    }

    setSalvandoNumero(true);
    setErro('');

    try {
      await api.post(`/api/matches/${matchId}/challenge/line-draw/number`, { numero });
      setNumeroEscolhido('');
      await carregar(true);
    } catch (e: any) {
      setErro(e?.response?.data?.mensagem || 'Nao foi possivel registrar o numero.');
    } finally {
      setSalvandoNumero(false);
    }
  }

  async function escolherJogadorLinha(idUsuarioJogador: number) {
    setSalvandoEscolhaJogador(idUsuarioJogador);
    setErro('');

    try {
      await api.post(`/api/matches/${matchId}/challenge/line-picks`, { idUsuarioJogador });
      await carregar(true);
    } catch (e: any) {
      setErro(e?.response?.data?.mensagem || 'Nao foi possivel registrar a escolha do jogador.');
    } finally {
      setSalvandoEscolhaJogador(null);
    }
  }

  async function enviarNumeroGoleiro() {
    const numero = Number(numeroGoleiroEscolhido);

    if (!Number.isInteger(numero) || numero < 0 || numero > 10) {
      setErro('Informe um numero inteiro entre 0 e 10.');
      return;
    }

    setSalvandoNumeroGoleiro(true);
    setErro('');

    try {
      await api.post(`/api/matches/${matchId}/challenge/goalkeeper-draw/number`, { numero });
      setNumeroGoleiroEscolhido('');
      await carregar(true);
    } catch (e: any) {
      setErro(e?.response?.data?.mensagem || 'Nao foi possivel registrar o numero dos goleiros.');
    } finally {
      setSalvandoNumeroGoleiro(false);
    }
  }

  async function escolherGoleiro(idUsuarioGoleiro: number) {
    setSalvandoEscolhaGoleiro(idUsuarioGoleiro);
    setErro('');

    try {
      await api.post(`/api/matches/${matchId}/challenge/goalkeeper-pick`, { idUsuarioGoleiro });
      await carregar(true);
    } catch (e: any) {
      setErro(e?.response?.data?.mensagem || 'Nao foi possivel registrar a escolha do goleiro.');
    } finally {
      setSalvandoEscolhaGoleiro(null);
    }
  }

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [matchId])
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!status) {
    return (
      <View style={[styles.container, styles.center, styles.emptyWrap]}>
        <Ionicons name="alert-circle-outline" size={28} color={Colors.danger} />
        <Text style={styles.emptyTitle}>Desafio indisponivel</Text>
        <Text style={styles.emptySubtitle}>{erro || 'Nenhuma informacao de desafio encontrada.'}</Text>
      </View>
    );
  }

  const statusLabel = STATUS_LABELS[status.statusDesafio] ?? status.statusDesafio;
  const horarioLimite = new Date(status.horarioLimiteConfirmacao).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const timeCapitaoAtual = status.timeCapitaoAtual;
  const timeDesafiante = status.timeDesafiante;
  const timesFechadosCompetitivo =
    status.statusDesafio === 'TIMES_FECHADOS' &&
    status.jogadoresLinhaDisponiveis.length === 0 &&
    status.goleirosDisponiveis.length === 0 &&
    !!timeCapitaoAtual &&
    !!timeDesafiante;

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              carregar(true);
            }}
            tintColor={Colors.primary}
          />
        }
      >
        <View style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <Text style={styles.heroLabel}>Desafio em andamento</Text>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Ver regras da partida"
              style={styles.infoButton}
              onPress={() => setRegrasVisiveis(true)}
            >
              <Ionicons name="information-circle-outline" size={18} color={Colors.gold} />
            </TouchableOpacity>
          </View>

          <Text style={styles.heroTitle}>{groupName}</Text>
          <Text style={styles.heroSubtitle}>{formatarDataHora(status.dataHoraJogo)}</Text>

          <View style={[styles.statusPill, status.podeIniciarMontagem ? styles.statusPillOk : styles.statusPillWarn]}>
            <Text style={[styles.statusPillText, status.podeIniciarMontagem ? styles.statusPillTextOk : styles.statusPillTextWarn]}>
              {statusLabel}
            </Text>
          </View>
        </View>

        <View style={styles.summaryGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{status.totalConfirmados}</Text>
            <Text style={styles.metricLabel}>Confirmados</Text>
            <Text style={styles.metricHint}>minimo {status.minimoConfirmados}</Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{status.goleirosConfirmados}</Text>
            <Text style={styles.metricLabel}>Goleiros</Text>
            <Text style={styles.metricHint}>maximo {status.maximoGoleiros}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Ionicons name="people-outline" size={16} color={Colors.primary} />
            <Text style={styles.sectionLabel}>Capitaes</Text>
          </View>

          <View style={styles.duelRow}>
            <View style={styles.captainCard}>
              <Text style={styles.captainTag}>Capitao atual</Text>
              <Text style={styles.captainName}>{status.capitaoAtual?.nome ?? 'Nao definido'}</Text>
            </View>

            <View style={styles.duelX}>
              <Text style={styles.duelXText}>X</Text>
            </View>

            <View style={styles.captainCard}>
              <Text style={styles.captainTag}>Desafiante</Text>
              <Text style={styles.captainName}>{status.desafiante?.nome ?? 'Aguardando'}</Text>
            </View>
          </View>
        </View>

        {timesFechadosCompetitivo ? (
          <View style={[styles.card, styles.competitiveCard]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="trophy-outline" size={16} color={Colors.gold} />
              <Text style={styles.sectionLabel}>Times fechados</Text>
            </View>

            <View style={styles.competitiveArena}>
              <View style={styles.competitiveTeam}>
                <Text style={styles.competitiveTeamLabel}>{timeCapitaoAtual.nomeCapitao}</Text>
                {timeCapitaoAtual.jogadores.map((jogador) => (
                  <Text
                    key={`fechado-capitao-${jogador.idUsuario}`}
                    style={[
                      styles.competitivePlayer,
                      jogador.idUsuario === timeCapitaoAtual.idCapitao && styles.competitiveCaptainPlayer,
                    ]}
                  >
                    {jogador.nome}
                    {jogador.idUsuario === timeCapitaoAtual.idCapitao ? ' (Capitao)' : ''}
                  </Text>
                ))}
              </View>

              <View style={styles.competitiveVsWrap}>
                <Text style={styles.competitiveVs}>VS</Text>
              </View>

              <View style={styles.competitiveTeam}>
                <Text style={styles.competitiveTeamLabel}>{timeDesafiante.nomeCapitao}</Text>
                {timeDesafiante.jogadores.map((jogador) => (
                  <Text
                    key={`fechado-desafiante-${jogador.idUsuario}`}
                    style={[
                      styles.competitivePlayer,
                      jogador.idUsuario === timeDesafiante.idCapitao && styles.competitiveCaptainPlayer,
                    ]}
                  >
                    {jogador.nome}
                    {jogador.idUsuario === timeDesafiante.idCapitao ? ' (Capitao)' : ''}
                  </Text>
                ))}
              </View>
            </View>
          </View>
        ) : (
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Ionicons name="game-controller-outline" size={16} color={Colors.primary} />
            <Text style={styles.sectionLabel}>Par ou impar dos jogadores</Text>
          </View>

          <Text style={styles.ruleItem}>Capitao atual: {status.paridadeCapitaoAtual ?? 'aguardando escolha'}</Text>
          <Text style={styles.ruleItem}>Desafiante: {status.paridadeDesafiante ?? 'aguardando escolha'}</Text>
          <Text style={styles.ruleItem}>
            Numero do capitao atual: {status.capitaoAtualJaInformouNumero ? 'enviado' : 'pendente'}
          </Text>
          <Text style={styles.ruleItem}>
            Numero do desafiante: {status.desafianteJaInformouNumero ? 'enviado' : 'pendente'}
          </Text>

          {!status.vencedorParImparLinha &&
            (status.capitaoAtualJaInformouNumero || status.desafianteJaInformouNumero) && (
              <Text style={styles.roleHintText}>
                Os numeros ficam ocultos ate os dois capitaes concluirem o par ou impar.
              </Text>
            )}

          {status.somaParImparLinha !== undefined && status.somaParImparLinha !== null && (
            <Text style={styles.drawResultText}>Soma do sorteio: {status.somaParImparLinha}</Text>
          )}

          {status.vencedorParImparLinha && (
            <View style={styles.drawWinnerBox}>
              <Text style={styles.drawWinnerLabel}>Vencedor do par ou impar</Text>
              <Text style={styles.drawWinnerName}>{status.vencedorParImparLinha.nome}</Text>
              {status.proximoCapitaoEscolha && (
                <Text style={styles.drawWinnerHint}>
                  Primeira escolha dos jogadores: {status.proximoCapitaoEscolha.nome}
                </Text>
              )}
            </View>
          )}

          {status.usuarioPodeEscolherParidade && (
            <View style={styles.actionArea}>
              <Text style={styles.actionLabel}>Escolha entre par e impar</Text>
              <View style={styles.choiceRow}>
                <TouchableOpacity
                  style={[styles.choiceButton, salvandoParidade && styles.choiceButtonDisabled]}
                  disabled={salvandoParidade}
                  onPress={() => escolherParidade('PAR')}
                >
                  <Text style={styles.choiceButtonText}>PAR</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.choiceButton, salvandoParidade && styles.choiceButtonDisabled]}
                  disabled={salvandoParidade}
                  onPress={() => escolherParidade('IMPAR')}
                >
                  <Text style={styles.choiceButtonText}>IMPAR</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {status.usuarioPodeInformarNumero && (
            <View style={styles.actionArea}>
              <Text style={styles.actionLabel}>Informe seu numero de 0 a 10</Text>
              <View style={styles.numberRow}>
                <TextInput
                  style={styles.numberInput}
                  value={numeroEscolhido}
                  onChangeText={setNumeroEscolhido}
                  keyboardType="number-pad"
                  maxLength={2}
                  placeholder="0 a 10"
                  placeholderTextColor={Colors.textMuted}
                />

                <TouchableOpacity
                  style={[styles.submitNumberButton, salvandoNumero && styles.choiceButtonDisabled]}
                  disabled={salvandoNumero}
                  onPress={enviarNumero}
                >
                  {salvandoNumero ? (
                    <ActivityIndicator size="small" color={Colors.bg} />
                  ) : (
                    <Text style={styles.submitNumberButtonText}>Enviar numero</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

          {!status.usuarioPodeEscolherParidade &&
            !status.usuarioPodeInformarNumero &&
            !status.vencedorParImparLinha && (
              <Text style={styles.roleHintText}>
                {status.usuarioEhCapitao
                  ? 'Aguardando a outra etapa do sorteio para seguir.'
                  : 'Acompanhe o sorteio. Apenas os capitaes podem interagir.'}
              </Text>
            )}
        </View>
        )}

        {!timesFechadosCompetitivo && (timeCapitaoAtual || timeDesafiante) && (
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Ionicons name="shirt-outline" size={16} color={Colors.primary} />
              <Text style={styles.sectionLabel}>Times em montagem</Text>
            </View>

            {status.proximoCapitaoEscolha && (
              <Text style={styles.turnText}>Vez de {status.proximoCapitaoEscolha.nome} escolher</Text>
            )}

            <View style={styles.teamGrid}>
              {timeCapitaoAtual && (
                <View style={styles.teamCard}>
                  <Text style={styles.teamTitle}>Time do capitao atual</Text>
                  {timeCapitaoAtual.jogadores.map((jogador) => (
                    <Text
                      key={`time-capitao-${jogador.idUsuario}`}
                      style={[
                        styles.teamPlayer,
                        jogador.idUsuario === timeCapitaoAtual.idCapitao && styles.teamCaptainPlayer,
                      ]}
                    >
                      {jogador.nome}
                      {jogador.idUsuario === timeCapitaoAtual.idCapitao ? ' (Capitao)' : ''}
                    </Text>
                  ))}
                </View>
              )}

              {timeDesafiante && (
                <View style={styles.teamCard}>
                  <Text style={styles.teamTitle}>Time do desafiante</Text>
                  {timeDesafiante.jogadores.map((jogador) => (
                    <Text
                      key={`time-desafiante-${jogador.idUsuario}`}
                      style={[
                        styles.teamPlayer,
                        jogador.idUsuario === timeDesafiante.idCapitao && styles.teamCaptainPlayer,
                      ]}
                    >
                      {jogador.nome}
                      {jogador.idUsuario === timeDesafiante.idCapitao ? ' (Capitao)' : ''}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          </View>
        )}

        {!timesFechadosCompetitivo && status.jogadoresLinhaDisponiveis.length > 0 && (
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Ionicons name="list-outline" size={16} color={Colors.primary} />
              <Text style={styles.sectionLabel}>Jogadores de linha disponiveis</Text>
            </View>

            {status.usuarioPodeEscolherJogadorLinha ? (
              <Text style={styles.roleHintText}>Escolha um jogador para o seu time.</Text>
            ) : (
              <Text style={styles.roleHintText}>Apenas o capitao da vez pode escolher.</Text>
            )}

            <View style={styles.availableList}>
              {status.jogadoresLinhaDisponiveis.map((jogador) => (
                <TouchableOpacity
                  key={jogador.idUsuario}
                  style={[
                    styles.availablePlayerButton,
                    !status.usuarioPodeEscolherJogadorLinha && styles.availablePlayerButtonDisabled,
                  ]}
                  disabled={!status.usuarioPodeEscolherJogadorLinha || salvandoEscolhaJogador !== null}
                  onPress={() => escolherJogadorLinha(jogador.idUsuario)}
                >
                  <Text style={styles.availablePlayerName}>{jogador.nome}</Text>
                  {salvandoEscolhaJogador === jogador.idUsuario ? (
                    <ActivityIndicator size="small" color={Colors.primary} />
                  ) : (
                    status.usuarioPodeEscolherJogadorLinha && (
                      <Ionicons name="add-circle-outline" size={18} color={Colors.primary} />
                    )
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {!timesFechadosCompetitivo && (status.statusDesafio === 'PAR_IMPAR_GOLEIROS' ||
          status.statusDesafio === 'ESCOLHA_GOLEIRO_EM_ANDAMENTO' ||
          status.statusDesafio === 'DEFINICAO_MANUAL_GOLEIRO' ||
          status.goleirosDisponiveis.length > 0 ||
          !!status.vencedorParImparGoleiro) && (
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Ionicons name="shield-outline" size={16} color={Colors.gold} />
              <Text style={styles.sectionLabel}>Etapa dos goleiros</Text>
            </View>

            <Text style={styles.ruleItem}>
              Capitao atual: {status.paridadeCapitaoAtualGoleiro ?? 'aguardando escolha'}
            </Text>
            <Text style={styles.ruleItem}>
              Desafiante: {status.paridadeDesafianteGoleiro ?? 'aguardando escolha'}
            </Text>
            <Text style={styles.ruleItem}>
              Numero do capitao atual: {status.capitaoAtualJaInformouNumeroGoleiro ? 'enviado' : 'pendente'}
            </Text>
            <Text style={styles.ruleItem}>
              Numero do desafiante: {status.desafianteJaInformouNumeroGoleiro ? 'enviado' : 'pendente'}
            </Text>
            <Text style={styles.roleHintText}>
              A mesma escolha de par ou impar feita no sorteio principal continua valendo para os goleiros.
            </Text>

            {!status.vencedorParImparGoleiro &&
              (status.capitaoAtualJaInformouNumeroGoleiro || status.desafianteJaInformouNumeroGoleiro) && (
                <Text style={styles.roleHintText}>
                  Os numeros dos goleiros ficam ocultos ate os dois capitaes concluirem o sorteio.
                </Text>
              )}

            {status.somaParImparGoleiro !== undefined && status.somaParImparGoleiro !== null && (
              <Text style={styles.drawResultText}>Soma do sorteio dos goleiros: {status.somaParImparGoleiro}</Text>
            )}

            {status.vencedorParImparGoleiro && (
              <View style={styles.drawWinnerBox}>
                <Text style={styles.drawWinnerLabel}>Vencedor do sorteio dos goleiros</Text>
                <Text style={styles.drawWinnerName}>{status.vencedorParImparGoleiro.nome}</Text>
                {status.proximoCapitaoEscolhaGoleiro && (
                  <Text style={styles.drawWinnerHint}>
                    Escolhe primeiro o goleiro: {status.proximoCapitaoEscolhaGoleiro.nome}
                  </Text>
                )}
              </View>
            )}

            {status.usuarioPodeInformarNumeroGoleiro && (
              <View style={styles.actionArea}>
                <Text style={styles.actionLabel}>Informe seu numero de 0 a 10 para os goleiros</Text>
                <View style={styles.numberRow}>
                  <TextInput
                    style={styles.numberInput}
                    value={numeroGoleiroEscolhido}
                    onChangeText={setNumeroGoleiroEscolhido}
                    keyboardType="number-pad"
                    maxLength={2}
                    placeholder="0 a 10"
                    placeholderTextColor={Colors.textMuted}
                  />

                  <TouchableOpacity
                    style={[styles.submitNumberButton, salvandoNumeroGoleiro && styles.choiceButtonDisabled]}
                    disabled={salvandoNumeroGoleiro}
                    onPress={enviarNumeroGoleiro}
                  >
                    {salvandoNumeroGoleiro ? (
                      <ActivityIndicator size="small" color={Colors.bg} />
                    ) : (
                      <Text style={styles.submitNumberButtonText}>Enviar numero</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {status.goleirosDisponiveis.length > 0 && (
              <View style={styles.availableList}>
                {status.goleirosDisponiveis.map((goleiro) => (
                  <TouchableOpacity
                    key={goleiro.idUsuario}
                    style={[
                      styles.availablePlayerButton,
                      !status.usuarioPodeEscolherGoleiro && styles.availablePlayerButtonDisabled,
                    ]}
                    disabled={!status.usuarioPodeEscolherGoleiro || salvandoEscolhaGoleiro !== null}
                    onPress={() => escolherGoleiro(goleiro.idUsuario)}
                  >
                    <Text style={styles.availablePlayerName}>{goleiro.nome}</Text>
                    {salvandoEscolhaGoleiro === goleiro.idUsuario ? (
                      <ActivityIndicator size="small" color={Colors.primary} />
                    ) : (
                      status.usuarioPodeEscolherGoleiro && (
                        <Ionicons name="add-circle-outline" size={18} color={Colors.primary} />
                      )
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {status.statusDesafio === 'DEFINICAO_MANUAL_GOLEIRO' && (
              <Text style={styles.roleHintText}>
                Existe apenas 1 goleiro confirmado. A definicao final do goleiro precisa ser feita manualmente.
              </Text>
            )}
          </View>
        )}

        {status.bloqueios.length > 0 && (
          <View style={[styles.card, styles.blockCard]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="close-circle-outline" size={16} color={Colors.danger} />
              <Text style={styles.sectionLabel}>Bloqueios</Text>
            </View>
            {status.bloqueios.map((bloqueio) => (
              <Text key={bloqueio} style={styles.blockText}>
                • {bloqueio}
              </Text>
            ))}
          </View>
        )}

        {status.alertas.length > 0 && (
          <View style={[styles.card, styles.alertCard]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="alert-circle-outline" size={16} color={Colors.gold} />
              <Text style={styles.sectionLabel}>Alertas</Text>
            </View>
            {status.alertas.map((alerta) => (
              <Text key={alerta} style={styles.alertText}>
                • {alerta}
              </Text>
            ))}
          </View>
        )}

        {!timesFechadosCompetitivo && (
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Ionicons
                name={status.usuarioEhCapitao ? 'flash-outline' : 'eye-outline'}
                size={16}
                color={status.usuarioEhCapitao ? Colors.primary : Colors.textMuted}
              />
              <Text style={styles.sectionLabel}>Seu papel</Text>
            </View>

            <Text style={styles.roleText}>
              {status.usuarioEhCapitao
                ? 'Voce participa da montagem como capitao nesta partida.'
                : 'Voce acompanha o desafio em modo leitura. As escolhas sao exclusivas dos capitaes.'}
            </Text>

            <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back-outline" size={16} color={Colors.text} />
              <Text style={styles.secondaryButtonText}>Voltar</Text>
            </TouchableOpacity>
          </View>
        )}

        {timesFechadosCompetitivo && (
          <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back-outline" size={16} color={Colors.text} />
            <Text style={styles.secondaryButtonText}>Voltar</Text>
          </TouchableOpacity>
        )}

        {erro !== '' && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={14} color={Colors.danger} />
            <Text style={styles.errorText}>{erro}</Text>
          </View>
        )}
      </ScrollView>

      <Modal
        animationType="fade"
        transparent
        visible={regrasVisiveis}
        onRequestClose={() => setRegrasVisiveis(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setRegrasVisiveis(false)}>
          <Pressable style={styles.modalCard} onPress={(event) => event.stopPropagation()}>
            <View style={styles.modalHeader}>
              <View style={styles.sectionHeaderCompact}>
                <Ionicons name="shield-checkmark-outline" size={18} color={Colors.gold} />
                <Text style={styles.modalTitle}>Regras da partida</Text>
              </View>

              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Fechar regras da partida"
                style={styles.modalCloseButton}
                onPress={() => setRegrasVisiveis(false)}
              >
                <Ionicons name="close-outline" size={20} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={styles.ruleItem}>Confirmacoes ate {horarioLimite}</Text>
            <Text style={styles.ruleItem}>Montagem liberada com pelo menos {status.minimoConfirmados} confirmados</Text>
            <Text style={styles.ruleItem}>Apenas os capitaes podem escolher jogadores</Text>
            <Text style={styles.ruleItem}>Demais jogadores acompanham em modo leitura</Text>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: Spacing.md, gap: Spacing.sm, paddingBottom: Spacing.xl },
  center: { justifyContent: 'center', alignItems: 'center' },
  emptyWrap: { paddingHorizontal: Spacing.lg },
  emptyTitle: { ...Typography.title, fontSize: FontSize.lg, textAlign: 'center', marginTop: 8 },
  emptySubtitle: { ...Typography.subtitle, textAlign: 'center', marginTop: 4 },

  heroCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    marginBottom: 6,
  },
  heroLabel: { ...Typography.label, color: Colors.primary, marginBottom: 0 },
  infoButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: { ...Typography.title, fontSize: FontSize.xl },
  heroSubtitle: { ...Typography.subtitle, marginTop: 4 },
  statusPill: {
    alignSelf: 'flex-start',
    marginTop: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  statusPillOk: { borderColor: `${Colors.success}66`, backgroundColor: `${Colors.success}12` },
  statusPillWarn: { borderColor: `${Colors.gold}66`, backgroundColor: `${Colors.gold}12` },
  statusPillText: { fontSize: FontSize.sm, fontWeight: '800' },
  statusPillTextOk: { color: Colors.success },
  statusPillTextWarn: { color: Colors.gold },

  summaryGrid: { flexDirection: 'row', gap: Spacing.sm },
  metricCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
  },
  metricValue: { color: Colors.text, fontSize: FontSize.xxl, fontWeight: '900' },
  metricLabel: { color: Colors.text, fontSize: FontSize.sm, fontWeight: '700', marginTop: 6 },
  metricHint: { color: Colors.textMuted, fontSize: FontSize.xs, marginTop: 2 },

  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
  },
  blockCard: { borderColor: `${Colors.danger}66` },
  alertCard: { borderColor: `${Colors.gold}66` },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: Spacing.sm },
  sectionHeaderCompact: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionLabel: { ...Typography.label, marginBottom: 0 },
  duelRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  captainCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface2,
    padding: Spacing.sm,
  },
  captainTag: { color: Colors.textMuted, fontSize: FontSize.xs, fontWeight: '700', marginBottom: 4 },
  captainName: { color: Colors.text, fontSize: FontSize.md, fontWeight: '800' },
  duelX: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  duelXText: { color: Colors.primary, fontWeight: '900' },
  ruleItem: { color: Colors.text, fontSize: FontSize.sm, paddingVertical: 4, lineHeight: 20 },
  actionArea: {
    marginTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.md,
    gap: Spacing.sm,
  },
  actionLabel: { color: Colors.text, fontSize: FontSize.sm, fontWeight: '800' },
  choiceRow: { flexDirection: 'row', gap: Spacing.sm },
  choiceButton: {
    flex: 1,
    borderRadius: Radius.md,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  choiceButtonDisabled: { opacity: 0.6 },
  choiceButtonText: { color: Colors.bg, fontSize: FontSize.sm, fontWeight: '900' },
  numberRow: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' },
  numberInput: {
    width: 90,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface2,
    color: Colors.text,
    fontSize: FontSize.md,
    paddingHorizontal: 12,
    paddingVertical: 12,
    textAlign: 'center',
  },
  submitNumberButton: {
    flex: 1,
    borderRadius: Radius.md,
    backgroundColor: Colors.success,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitNumberButtonText: { color: Colors.bg, fontSize: FontSize.sm, fontWeight: '900' },
  drawResultText: { color: Colors.text, fontSize: FontSize.sm, fontWeight: '700', marginTop: Spacing.sm },
  drawWinnerBox: {
    marginTop: Spacing.md,
    borderWidth: 1,
    borderColor: `${Colors.success}66`,
    backgroundColor: `${Colors.success}12`,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  drawWinnerLabel: { color: Colors.success, fontSize: FontSize.xs, fontWeight: '900', marginBottom: 4 },
  drawWinnerName: { color: Colors.text, fontSize: FontSize.lg, fontWeight: '900' },
  drawWinnerHint: { color: Colors.textMuted, fontSize: FontSize.sm, marginTop: 4 },
  turnText: { color: Colors.primary, fontSize: FontSize.sm, fontWeight: '800', marginBottom: Spacing.sm },
  teamGrid: { gap: Spacing.sm },
  teamCard: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface2,
    padding: Spacing.sm,
    gap: 6,
  },
  teamTitle: { color: Colors.text, fontSize: FontSize.sm, fontWeight: '800' },
  teamPlayer: { color: Colors.text, fontSize: FontSize.sm },
  teamCaptainPlayer: { color: Colors.primary, fontWeight: '800' },
  competitiveCard: {
    borderColor: `${Colors.gold}44`,
    backgroundColor: Colors.surface,
  },
  competitiveArena: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: Spacing.sm,
  },
  competitiveTeam: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface2,
    padding: Spacing.sm,
    gap: 6,
  },
  competitiveTeamLabel: {
    color: Colors.gold,
    fontSize: FontSize.md,
    fontWeight: '900',
    marginBottom: 4,
  },
  competitivePlayer: {
    color: Colors.text,
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
  competitiveCaptainPlayer: {
    color: Colors.primary,
    fontWeight: '900',
  },
  competitiveVsWrap: {
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  competitiveVs: {
    color: Colors.gold,
    fontSize: FontSize.lg,
    fontWeight: '900',
  },
  availableList: { gap: Spacing.xs, marginTop: Spacing.sm },
  availablePlayerButton: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface2,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  availablePlayerButtonDisabled: { opacity: 0.7 },
  availablePlayerName: { color: Colors.text, fontSize: FontSize.sm, fontWeight: '700', flex: 1 },
  roleHintText: { color: Colors.textMuted, fontSize: FontSize.sm, fontStyle: 'italic', marginTop: Spacing.sm },
  blockText: { color: Colors.danger, fontSize: FontSize.sm, paddingVertical: 3 },
  alertText: { color: Colors.gold, fontSize: FontSize.sm, paddingVertical: 3 },
  roleText: { color: Colors.text, fontSize: FontSize.sm, lineHeight: 20, marginBottom: Spacing.md },
  secondaryButton: {
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface2,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  secondaryButtonText: { color: Colors.text, fontSize: FontSize.sm, fontWeight: '800' },
  errorBox: {
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: `${Colors.danger}66`,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 10,
    backgroundColor: Colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  errorText: { color: Colors.danger, fontSize: FontSize.sm, flex: 1 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: '#00000088',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  modalCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    gap: Spacing.xs,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  modalTitle: { color: Colors.text, fontSize: FontSize.md, fontWeight: '800' },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
