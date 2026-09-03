import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  CONDICAO_CORES,
  CONDICAO_LABEL,
  CORES,
  GradientBackground,
  ScreenHeader,
} from '@/components/ui';
import { useVoiceAssistant } from '@/contexts/VoiceAssistContext';
import {
  CHECKLIST_ITENS,
  itemChecklistInicial,
  osIdEmAndamento,
  vistoriaEmAndamento,
  type Condicao,
} from '@/store';
import type { ComandoVoz } from '@/utils/voiceCommands';
import { atualizarOrdemServico } from '@/services/api';

const OPCOES: Condicao[] = ['ok', 'atencao', 'problema'];
const ICONES: Record<Condicao, string> = { ok: 'checkmark-circle', atencao: 'warning', problema: 'close-circle' };

const TOTAL_ETAPAS = CHECKLIST_ITENS.length;

export default function ChecklistScreen() {
  const [etapa, setEtapa] = useState(0);
  const [checklist, setChecklist] = useState(itemChecklistInicial());
  const { mode, listening, enableVoice, disableVoice, speak, setCommandHandler } =
    useVoiceAssistant();

  const etapaRef = useRef(etapa);
  useEffect(() => {
    etapaRef.current = etapa;
  }, [etapa]);

  const definirCondicao = useCallback((index: number, condicao: Condicao) => {
    setChecklist((atual) =>
      atual.map((item, i) => (i === index ? { ...item, condicao } : item)),
    );
  }, []);

  const irParaProximo = useCallback(() => {
    setEtapa((atual) => {
      if (atual < TOTAL_ETAPAS - 1) {
        const proximo = atual + 1;
        speak(`Etapa ${proximo + 1} de ${TOTAL_ETAPAS}. ${CHECKLIST_ITENS[proximo]}.`);
        return proximo;
      }
      speak('Todas as etapas foram concluídas. Deseja finalizar o checklist?');
      return atual;
    });
  }, [speak]);

  const irParaAnterior = useCallback(() => {
    setEtapa((atual) => {
      if (atual > 0) {
        const anterior = atual - 1;
        speak(`Etapa ${anterior + 1} de ${TOTAL_ETAPAS}. ${CHECKLIST_ITENS[anterior]}.`);
        return anterior;
      }
      speak('Você está na primeira etapa.');
      return atual;
    });
  }, [speak]);

  const repetir = useCallback(() => {
    const atual = etapaRef.current;
    speak(`Etapa ${atual + 1} de ${TOTAL_ETAPAS}. ${CHECKLIST_ITENS[atual]}. Diga bom, atenção ou problema.`);
  }, [speak]);

  const finalizar = useCallback(async () => {
    vistoriaEmAndamento.checklist = checklist;
    try {
      if (osIdEmAndamento) {
        await atualizarOrdemServico(osIdEmAndamento, { checklist });
      }
    } catch (erro) {
      Alert.alert(
        'Aviso',
        erro instanceof Error ? erro.message : 'Não foi possível salvar o checklist.',
      );
    }
    speak('Checklist finalizado. Enviando para análise.');
    router.push('/saude');
  }, [checklist, speak]);

  const handler = useCallback(
    (comando: ComandoVoz) => {
      switch (comando.tipo) {
        case 'NEXT':
          irParaProximo();
          break;
        case 'BACK':
          irParaAnterior();
          break;
        case 'REPEAT':
          repetir();
          break;
        case 'OK':
          definirCondicao(etapaRef.current, 'ok');
          speak('Marcado como bom.');
          irParaProximo();
          break;
        case 'ATTENTION':
          definirCondicao(etapaRef.current, 'atencao');
          speak('Marcado como atenção.');
          irParaProximo();
          break;
        case 'PROBLEM':
          definirCondicao(etapaRef.current, 'problema');
          speak('Marcado como problema.');
          irParaProximo();
          break;
        case 'FINISH':
          finalizar();
          break;
        default:
          break;
      }
    },
    [irParaProximo, irParaAnterior, repetir, definirCondicao, speak, finalizar],
  );

  useEffect(() => {
    setCommandHandler(handler);
    return () => setCommandHandler(null);
  }, [handler, setCommandHandler]);

  const progresso = useMemo(() => ((etapa + 1) / TOTAL_ETAPAS) * 100, [etapa]);

  const condicaoAtual = checklist[etapa]?.condicao;

  return (
    <View style={styles.container}>
      <GradientBackground />
      <View style={styles.inner}>
        <ScreenHeader titulo="Checklist do Carro" voltar />

        <Pressable
          style={[
            styles.vozCard,
            mode === 'active' && styles.vozCardAtivo,
          ]}
          onPress={mode === 'active' ? disableVoice : enableVoice}
        >
          <View style={styles.vozInfo}>
            <Text style={styles.vozTitulo}>Auxílio de Voz</Text>
            <Text style={styles.vozStatus}>
              {mode === 'active'
                ? listening ? 'Estou ouvindo...' : 'Ativado'
                : 'Desativado'}
            </Text>
          </View>
          <View style={[styles.vozBadge, { backgroundColor: mode === 'active' ? CORES.verde : CORES.vermelho }]}>
            <Text style={styles.vozBadgeTexto}>{mode === 'active' ? 'ATIVADO' : 'DESATIVADO'}</Text>
          </View>
        </Pressable>

        <View style={styles.progressoCard}>
          <Text style={styles.progressoEtapa}>
            Etapa {etapa + 1} de {TOTAL_ETAPAS}
          </Text>
          <Text style={styles.progressoNome}>{CHECKLIST_ITENS[etapa]}</Text>
          <Text style={styles.progressoInstrucao}>
            Use {'"Próximo passo"'}, {'"Voltar"'}, {'"Repita"'} ou {'"Finalizar"'}
          </Text>
          <View style={styles.barraProgresso}>
            <View style={[styles.barraProgressoFill, { width: `${progresso}%` }]} />
          </View>
        </View>

        <View style={styles.legenda}>
          {OPCOES.map((opcao) => (
            <View key={opcao} style={styles.legendaItem}>
              <View style={[styles.bolinha, { backgroundColor: CONDICAO_CORES[opcao] }]} />
              <Text style={styles.legendaTexto}>{CONDICAO_LABEL[opcao]}</Text>
            </View>
          ))}
        </View>

        <View style={styles.itemCard}>
          <Text style={styles.itemNome}>{CHECKLIST_ITENS[etapa]}</Text>
          <View style={styles.opcoes}>
            {OPCOES.map((opcao) => {
              const selecionada = condicaoAtual === opcao;
              return (
                <Pressable
                  key={opcao}
                  onPress={() => definirCondicao(etapa, opcao)}
                  style={[
                    styles.opcao,
                    selecionada && {
                      borderColor: CONDICAO_CORES[opcao],
                      backgroundColor: CONDICAO_CORES[opcao],
                    },
                  ]}
                >
                  <Ionicons
                    name={ICONES[opcao] as any}
                    size={14}
                    color={selecionada ? CORES.preto : CONDICAO_CORES[opcao]}
                  />
                  <Text
                    style={[
                      styles.opcaoTexto,
                      selecionada && { color: CORES.preto },
                    ]}
                  >
                    {CONDICAO_LABEL[opcao]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.navegacao}>
          <Pressable
            style={[styles.navBotao, etapa === 0 && styles.navBotaoDesabilitado]}
            onPress={irParaAnterior}
            disabled={etapa === 0}
          >
            <Ionicons name="arrow-back" size={18} color={CORES.branco} />
            <Text style={styles.navBotaoTexto}>Voltar</Text>
          </Pressable>

          {etapa < TOTAL_ETAPAS - 1 ? (
            <Pressable style={styles.navBotao} onPress={irParaProximo}>
              <Text style={styles.navBotaoTexto}>Próximo</Text>
              <Ionicons name="arrow-forward" size={18} color={CORES.branco} />
            </Pressable>
          ) : (
            <Pressable style={[styles.navBotao, styles.navBotaoFinalizar]} onPress={finalizar}>
              <Ionicons name="checkmark-circle" size={18} color={CORES.preto} />
              <Text style={[styles.navBotaoTexto, { color: CORES.preto }]}>Finalizar</Text>
            </Pressable>
          )}
        </View>

        <View style={styles.dotsContainer}>
          {CHECKLIST_ITENS.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === etapa && styles.dotAtual,
                checklist[i].condicao !== 'ok' && {
                  backgroundColor: CONDICAO_CORES[checklist[i].condicao],
                },
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CORES.preto,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 8,
  },
  vozCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: CORES.card,
    borderColor: CORES.cardBorder,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  vozCardAtivo: {
    borderColor: CORES.verde,
  },
  vozInfo: {
    flex: 1,
  },
  vozTitulo: {
    color: CORES.branco,
    fontSize: 13,
    fontWeight: '700',
  },
  vozStatus: {
    color: CORES.textoSuave,
    fontSize: 11,
    marginTop: 2,
  },
  vozBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  vozBadgeTexto: {
    color: CORES.branco,
    fontSize: 9,
    fontWeight: '800',
  },
  progressoCard: {
    backgroundColor: CORES.card,
    borderColor: CORES.cardBorder,
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
  },
  progressoEtapa: {
    color: CORES.textoSuave,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  progressoNome: {
    color: CORES.branco,
    fontSize: 20,
    fontWeight: '900',
    marginTop: 4,
  },
  progressoInstrucao: {
    color: CORES.textoSuave,
    fontSize: 10,
    marginTop: 6,
  },
  barraProgresso: {
    height: 4,
    backgroundColor: CORES.cardBorder,
    borderRadius: 2,
    marginTop: 10,
    overflow: 'hidden',
  },
  barraProgressoFill: {
    height: '100%',
    backgroundColor: CORES.vermelho,
    borderRadius: 2,
  },
  legenda: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 10,
  },
  legendaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bolinha: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendaTexto: {
    color: CORES.textoSuave,
    fontSize: 10,
  },
  itemCard: {
    backgroundColor: CORES.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 2,
    borderColor: CORES.amarelo,
  },
  itemNome: {
    color: CORES.branco,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
  },
  opcoes: {
    flexDirection: 'row',
    gap: 8,
  },
  opcao: {
    flex: 1,
    height: 36,
    borderWidth: 1,
    borderColor: CORES.cardBorder,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  opcaoTexto: {
    color: CORES.textoSuave,
    fontSize: 10,
    fontWeight: '700',
  },
  navegacao: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  navBotao: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 42,
    backgroundColor: CORES.vermelho,
    borderRadius: 10,
  },
  navBotaoDesabilitado: {
    opacity: 0.35,
  },
  navBotaoFinalizar: {
    backgroundColor: CORES.verde,
  },
  navBotaoTexto: {
    color: CORES.branco,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  dotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 5,
    marginTop: 14,
    paddingBottom: 16,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: CORES.cardBorder,
  },
  dotAtual: {
    backgroundColor: CORES.branco,
    width: 9,
    height: 9,
    borderRadius: 5,
  },
});
