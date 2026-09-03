import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import {
  Botao,
  Card,
  CORES,
  GradientBackground,
  ScreenHeader,
} from '@/components/ui';
import { PopupConfirmacao } from '@/components/popup-confirmacao';
import { lancamentoSelecionado } from '@/store';
import {
  cancelarLancamento,
  estornarLancamento,
  excluirLancamento,
  pagarLancamento,
} from '@/services/api';

const FORMAS: Record<string, string> = {
  dinheiro: 'Dinheiro',
  pix: 'Pix',
  cartaoCredito: 'Cartão de crédito',
  cartaoDebito: 'Cartão de débito',
  boleto: 'Boleto',
  transferencia: 'Transferência',
};

const moeda = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`;

function formatarData(iso?: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pt-BR');
}

export default function DetalhesFinanceiroScreen() {
  const [confirmandoExcluir, setConfirmandoExcluir] = useState(false);
  const lancamento = lancamentoSelecionado;

  if (!lancamento) {
    return (
      <View style={styles.container}>
        <GradientBackground />
        <View style={styles.inner}>
          <ScreenHeader titulo="Detalhes do Lançamento" voltar />
          <Text style={styles.ausente}>Nenhum lançamento selecionado.</Text>
        </View>
      </View>
    );
  }

  const acao = async (fn: () => Promise<unknown>, msg: string) => {
    try {
      await fn();
      Alert.alert('Sucesso', msg, [{ text: 'OK', onPress: () => router.back() }]);
    } catch (erro) {
      Alert.alert('Erro', erro instanceof Error ? erro.message : 'Tente novamente.');
    }
  };

  const podePagar = lancamento.status === 'pendente';
  const podeCancelar = lancamento.status !== 'cancelado' && lancamento.status !== 'pago';
  const podeEstornar = lancamento.status === 'pago';

  return (
    <View style={styles.container}>
      <GradientBackground />
      <View style={styles.inner}>
        <ScreenHeader titulo="Detalhes do Lançamento" voltar />

        <ScrollView contentContainerStyle={styles.scroll}>
          <Card style={styles.card}>
            <Text style={styles.valor}>{moeda(lancamento.valor)}</Text>
            <View style={styles.listaInfo}>
              <InfoLinha rotulo="Ordem de Serviço" valor={lancamento.ordemServicoId || '—'} />
              <InfoLinha rotulo="Forma de Pagamento" valor={FORMAS[lancamento.formaPagamento] ?? lancamento.formaPagamento} />
              <InfoLinha rotulo="Status" valor={lancamento.status} destaque={lancamento.status === 'pago' ? CORES.verde : undefined} />
              <InfoLinha rotulo="Parcelas" valor={String(lancamento.parcelas)} />
              <InfoLinha rotulo="Data de Pagamento" valor={formatarData(lancamento.dataPagamento)} />
            </View>
          </Card>

          {podePagar && (
            <Botao titulo="Marcar como Pago" variante="verde" onPress={() => acao(() => pagarLancamento(lancamento.id), 'Pagamento registrado!')} estilo={styles.botao} />
          )}
          {podeCancelar && (
            <Botao titulo="Cancelar Lançamento" onPress={() => acao(() => cancelarLancamento(lancamento.id), 'Lançamento cancelado!')} estilo={styles.botao} />
          )}
          {podeEstornar && (
            <Botao titulo="Estornar" onPress={() => acao(() => estornarLancamento(lancamento.id), 'Lançamento estornado!')} estilo={styles.botao} />
          )}

          <Botao titulo="Excluir" variante="contorno" onPress={() => setConfirmandoExcluir(true)} estilo={styles.botaoExcluir} />
        </ScrollView>
      </View>

      <PopupConfirmacao
        visivel={confirmandoExcluir}
        titulo="Excluir lançamento"
        mensagem="Tem certeza que deseja excluir esse lançamento?"
        textoConfirmar="Excluir"
        onCancelar={() => setConfirmandoExcluir(false)}
        onConfirmar={() => {
          setConfirmandoExcluir(false);
          excluirLancamento(lancamento.id)
            .then(() => router.back())
            .catch((erro) => Alert.alert('Erro', erro.message));
        }}
      />
    </View>
  );
}

function InfoLinha({ rotulo, valor, destaque }: { rotulo: string; valor: string; destaque?: string }) {
  return (
    <View style={styles.infoLinha}>
      <Text style={styles.infoRotulo}>{rotulo}</Text>
      <Text style={[styles.infoValor, destaque ? { color: destaque } : null]}>{valor}</Text>
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
  scroll: {
    paddingBottom: 32,
  },
  card: {
    marginBottom: 4,
  },
  valor: {
    color: CORES.branco,
    fontSize: 26,
    fontWeight: '900',
    marginBottom: 18,
  },
  listaInfo: {
    borderTopWidth: 1,
    borderTopColor: '#1F1F1F',
  },
  infoLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#1F1F1F',
  },
  infoRotulo: {
    color: CORES.textoSuave,
    fontSize: 12,
  },
  infoValor: {
    color: CORES.branco,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  botao: {
    marginTop: 20,
  },
  botaoExcluir: {
    marginBottom: 10,
  },
  ausente: {
    color: CORES.textoSuave,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 40,
  },
});
