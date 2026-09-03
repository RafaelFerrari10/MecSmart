import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import {
  Botao,
  CONDICAO_CORES,
  CONDICAO_LABEL,
  CondicaoItem,
  CORES,
  GradientBackground,
  ScreenHeader,
} from '@/components/ui';
import { vistoriaEmAndamento, type Condicao, osIdEmAndamento } from '@/store';
import { atualizarOrdemServico, alterarStatusOrdemServico } from '@/services/api';

export default function SaudeScreen() {
  const [enviando, setEnviando] = useState(false);
  const checklist = vistoriaEmAndamento.checklist;
  const condicoes = useMemo(() => checklist.map((item) => item.condicao), [checklist]);

  const geral: Condicao = useMemo(() => {
    const piores: Record<Condicao, number> = { ok: 3, atencao: 2, problema: 1 };
    const menor = condicoes.reduce((acc, c) => Math.min(acc, piores[c]), 3);
    if (menor === 1) return 'problema';
    if (menor === 2) return 'atencao';
    return 'ok';
  }, [condicoes]);

  async function enviar() {
    if (enviando) return;
    setEnviando(true);
    try {
      const problemas = checklist
        .filter((item) => item.condicao === 'problema' || item.condicao === 'atencao')
        .map((item) => `${item.nome}: ${CONDICAO_LABEL[item.condicao]}`);

      if (osIdEmAndamento) {
        await atualizarOrdemServico(osIdEmAndamento, {
          checklist,
          condicao: geral,
          problemas,
        });
        await alterarStatusOrdemServico(osIdEmAndamento, 'AGUARDANDO APROVAÇÃO');
      }
      alert('Vistoria enviada para o cliente.');
    } catch {
      Alert.alert(
        'Erro',
        'Não foi possível enviar a vistoria. Verifique sua conexão e tente novamente.',
      );
    } finally {
      setEnviando(false);
    }
    router.replace('/home');
  }

  return (
    <View style={styles.container}>
      <GradientBackground />
      <View style={styles.inner}>
        <ScreenHeader titulo="Saúde do veículo" voltar />

        <View style={styles.cartao}>
          <Text style={styles.titulo}>Saúde do veículo</Text>
          {checklist.map((item) => (
            <CondicaoItem key={item.nome} nome={item.nome} condicao={item.condicao} />
          ))}
        </View>

        <View style={[styles.geral, { borderColor: CONDICAO_CORES[geral] }]}>
          <Text style={styles.geralTitulo}>Condição geral</Text>
          <Text style={[styles.geralValor, { color: CONDICAO_CORES[geral] }]}>
            {CONDICAO_LABEL[geral]}
          </Text>
        </View>

        <Botao
          titulo={enviando ? 'Enviando...' : 'Enviar para aprovação do cliente'}
          onPress={enviar}
        />
        {enviando && <ActivityIndicator color={CORES.vermelho} style={styles.carregando} />}
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
  cartao: {
    backgroundColor: CORES.card,
    borderRadius: 14,
    padding: 16,
  },
  titulo: {
    color: CORES.branco,
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 8,
  },
  geral: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 14,
  },
  geralTitulo: {
    color: CORES.textoSuave,
    fontSize: 10,
    textTransform: 'uppercase',
  },
  geralValor: {
    fontSize: 22,
    fontWeight: '900',
    marginTop: 4,
  },
  carregando: {
    marginTop: 12,
  },
});