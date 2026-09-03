import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import {
  Botao,
  Campo,
  CORES,
  GradientBackground,
  ScreenHeader,
} from '@/components/ui';
import { usuarioLogado } from '@/store';
import { criarLancamento } from '@/services/api';

const FORMAS_PAGAMENTO = [
  'dinheiro',
  'pix',
  'cartaoCredito',
  'cartaoDebito',
  'boleto',
  'transferencia',
];

const FORMAS_LABEL: Record<string, string> = {
  dinheiro: 'Dinheiro',
  pix: 'Pix',
  cartaoCredito: 'Cartão de crédito',
  cartaoDebito: 'Cartão de débito',
  boleto: 'Boleto',
  transferencia: 'Transferência',
};

export default function CadastrarFinanceiroScreen() {
  const [ordemServicoId, setOrdemServicoId] = useState('');
  const [valor, setValor] = useState('0,00');
  const [formaPagamento, setFormaPagamento] = useState('pix');
  const [parcelas, setParcelas] = useState('1');

  const salvar = async () => {
    const clienteId = usuarioLogado?.uid;
    if (!clienteId) {
      Alert.alert('Atenção', 'Você precisa estar logado para criar um lançamento.');
      return;
    }

    const valorNum = parseFloat(valor.replace(',', '.')) || 0;
    if (valorNum <= 0) {
      Alert.alert('Atenção', 'Informe um valor válido.');
      return;
    }

    try {
      await criarLancamento({
        ordemServicoId,
        clienteId,
        valor: valorNum,
        formaPagamento,
        parcelas: parseInt(parcelas, 10) || 1,
      });
      router.replace('/financeiro');
    } catch (erro) {
      Alert.alert('Erro ao salvar', erro instanceof Error ? erro.message : 'Tente novamente.');
    }
  };

  return (
    <View style={styles.container}>
      <GradientBackground />
      <View style={styles.inner}>
        <ScreenHeader titulo="Novo Lançamento" voltar />

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Campo label="Ordem de Serviço" placeholder="Ex: OS-2026-002" value={ordemServicoId} onChangeText={setOrdemServicoId} />
          <Campo label="Valor (R$)" keyboardType="decimal-pad" value={valor} onChangeText={setValor} />
          <Campo label="Parcelas" keyboardType="number-pad" value={parcelas} onChangeText={setParcelas} />

          <Text style={styles.subsecao}>Forma de Pagamento</Text>
          <View style={styles.formas}>
            {FORMAS_PAGAMENTO.map((f) => {
              const selecionado = formaPagamento === f;
              return (
                <PressableForma
                  key={f}
                  label={FORMAS_LABEL[f]}
                  selecionado={selecionado}
                  onPress={() => setFormaPagamento(f)}
                />
              );
            })}
          </View>

          <Botao titulo="Salvar Lançamento" onPress={salvar} estilo={styles.botao} />
        </ScrollView>
      </View>
    </View>
  );
}

function PressableForma({ label, selecionado, onPress }: { label: string; selecionado: boolean; onPress: () => void }) {
  return (
    <Pressable
      style={[styles.forma, selecionado && styles.formaSelecionada]}
      onPress={onPress}
    >
      <Text style={[styles.formaTexto, selecionado && styles.formaTextoSelecionado]}>{label}</Text>
    </Pressable>
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
  subsecao: {
    color: CORES.branco,
    fontSize: 13,
    fontWeight: '800',
    marginTop: 14,
    marginBottom: 12,
  },
  formas: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  forma: {
    backgroundColor: CORES.input,
    borderRadius: 9,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: CORES.cardBorder,
  },
  formaSelecionada: {
    backgroundColor: CORES.vermelho,
    borderColor: CORES.vermelho,
  },
  formaTexto: {
    color: CORES.textoSuave,
    fontSize: 11,
    fontWeight: '700',
  },
  formaTextoSelecionado: {
    color: CORES.branco,
  },
  botao: {
    marginTop: 24,
  },
});
