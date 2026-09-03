import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Botao, Campo, CORES, GradientBackground, ScreenHeader } from '@/components/ui';
import { pecaSelecionada } from '@/store';
import { adicionarEstoquePeca, retirarEstoquePeca } from '@/services/api';

export default function MovimentarEstoqueScreen() {
  const peca = pecaSelecionada;
  const [quantidade, setQuantidade] = useState('');

  if (!peca) {
    return (
      <View style={styles.container}>
        <GradientBackground />
        <View style={styles.inner}>
          <ScreenHeader titulo="Movimentar Estoque" voltar />
          <Text style={styles.ausente}>Nenhuma peça selecionada.</Text>
        </View>
      </View>
    );
  }

  const movimentar = async (operacao: 'adicionar' | 'retirar') => {
    const qtd = parseInt(quantidade, 10) || 0;
    if (qtd <= 0) {
      Alert.alert('Atenção', 'Informe uma quantidade válida.');
      return;
    }

    try {
      if (operacao === 'adicionar') {
        await adicionarEstoquePeca(peca.id, qtd);
      } else {
        await retirarEstoquePeca(peca.id, qtd);
      }
      Alert.alert('Sucesso', `Estoque ${operacao === 'adicionar' ? 'adicionado' : 'retirado'} com sucesso.`);
      router.back();
    } catch (erro) {
      Alert.alert('Erro', erro instanceof Error ? erro.message : 'Tente novamente.');
    }
  };

  return (
    <View style={styles.container}>
      <GradientBackground />
      <View style={styles.inner}>
        <ScreenHeader titulo="Movimentar Estoque" voltar />

        <View style={styles.info}>
          <Text style={styles.nome}>{peca.nome}</Text>
          <Text style={styles.estoque}>Estoque atual: {peca.estoqueAtual} unidades</Text>
        </View>

        <Campo
          label="Quantidade"
          keyboardType="number-pad"
          value={quantidade}
          onChangeText={setQuantidade}
          placeholder="Ex: 5"
        />

        <Botao titulo="Adicionar ao Estoque" onPress={() => movimentar('adicionar')} />
        <Botao titulo="Retirar do Estoque" variante="contorno" onPress={() => movimentar('retirar')} />
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
  info: {
    backgroundColor: CORES.card,
    borderColor: CORES.cardBorder,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  nome: {
    color: CORES.branco,
    fontSize: 15,
    fontWeight: '800',
  },
  estoque: {
    color: CORES.textoSuave,
    fontSize: 12,
    marginTop: 4,
  },
  ausente: {
    color: CORES.textoSuave,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 40,
  },
});
