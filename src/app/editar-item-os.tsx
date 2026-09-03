import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Botao, Campo, CORES, GradientBackground, ScreenHeader } from '@/components/ui';
import { itemOSSelecionado } from '@/store';
import { atualizarItemOS } from '@/services/api';

export default function EditarItemOSScreen() {
  const item = itemOSSelecionado;

  const [quantidade, setQuantidade] = useState(String(item?.quantidade ?? 1));
  const [precoUnitario, setPrecoUnitario] = useState(String(item?.precoUnitario ?? ''));

  if (!item) {
    return (
      <View style={styles.container}>
        <GradientBackground />
        <View style={styles.inner}>
          <ScreenHeader titulo="Editar Item" voltar />
          <Text style={styles.ausente}>Nenhum item selecionado.</Text>
        </View>
      </View>
    );
  }

  const salvar = async () => {
    const qtd = parseInt(quantidade, 10) || 0;
    if (qtd <= 0) {
      Alert.alert('Atenção', 'Informe uma quantidade válida.');
      return;
    }

    const dados: Record<string, unknown> = { quantidade: qtd };
    if (item.tipo === 'servico') {
      dados.precoUnitario = parseFloat(precoUnitario.replace(',', '.')) || item.precoUnitario;
    }

    try {
      await atualizarItemOS(item.id, dados);
      router.back();
    } catch (erro) {
      Alert.alert('Erro ao salvar', erro instanceof Error ? erro.message : 'Tente novamente.');
    }
  };

  return (
    <View style={styles.container}>
      <GradientBackground />
      <View style={styles.inner}>
        <ScreenHeader titulo="Editar Item" voltar />

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.info}>
            <Text style={styles.tipo}>{item.tipo === 'peca' ? 'Peça' : 'Serviço'}</Text>
            <Text style={styles.nome}>{item.nome}</Text>
            <Text style={styles.os}>OS: {item.ordemServicoId}</Text>
          </View>

          <Campo label="Quantidade" keyboardType="number-pad" value={quantidade} onChangeText={setQuantidade} />

          {item.tipo === 'servico' && (
            <Campo label="Preço Unitário (R$)" keyboardType="decimal-pad" value={precoUnitario} onChangeText={setPrecoUnitario} />
          )}

          <Botao titulo="Salvar Alterações" onPress={salvar} estilo={styles.botao} />
        </ScrollView>
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
  scroll: {
    paddingBottom: 32,
  },
  info: {
    backgroundColor: CORES.card,
    borderColor: CORES.cardBorder,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  tipo: {
    color: CORES.textoSuave,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  nome: {
    color: CORES.branco,
    fontSize: 15,
    fontWeight: '800',
  },
  os: {
    color: CORES.textoSuave,
    fontSize: 12,
    marginTop: 4,
  },
  botao: {
    marginTop: 24,
  },
  ausente: {
    color: CORES.textoSuave,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 40,
  },
});
