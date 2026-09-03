import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { router } from 'expo-router';
import {
  Botao,
  Campo,
  CORES,
  GradientBackground,
  Linha,
  ScreenHeader,
} from '@/components/ui';
import { PopupConfirmacao } from '@/components/popup-confirmacao';
import { pecaSelecionada } from '@/store';
import { atualizarPeca, excluirPeca } from '@/services/api';

export default function EditarPecaScreen() {
  const peca = pecaSelecionada;
  const [confirmando, setConfirmando] = useState(false);

  const [codigo, setCodigo] = useState(peca?.codigo ?? '');
  const [nome, setNome] = useState(peca?.nome ?? '');
  const [marca, setMarca] = useState(peca?.marca ?? '');
  const [precoCusto, setPrecoCusto] = useState((peca?.precoCusto ?? 0).toFixed(2).replace('.', ','));
  const [precoVenda, setPrecoVenda] = useState((peca?.precoVenda ?? 0).toFixed(2).replace('.', ','));
  const [estoqueAtual, setEstoqueAtual] = useState(String(peca?.estoqueAtual ?? 0));
  const [estoqueMinimo, setEstoqueMinimo] = useState(String(peca?.estoqueMinimo ?? 0));
  const [ativo, setAtivo] = useState(peca?.ativo ?? true);

  if (!peca) {
    return (
      <View style={styles.container}>
        <GradientBackground />
        <View style={styles.inner}>
          <ScreenHeader titulo="Editar Peça" voltar />
          <Text style={styles.ausente}>Nenhuma peça selecionada.</Text>
        </View>
      </View>
    );
  }

  const salvar = async () => {
    if (!codigo.trim() || !nome.trim()) {
      Alert.alert('Atenção', 'Preencha o código e o nome da peça.');
      return;
    }

    try {
      await atualizarPeca(peca.id, {
        codigo: codigo.trim(),
        nome: nome.trim(),
        marca: marca.trim(),
        precoCusto: parseFloat(precoCusto.replace(',', '.')) || 0,
        precoVenda: parseFloat(precoVenda.replace(',', '.')) || 0,
        estoqueAtual: parseInt(estoqueAtual, 10) || 0,
        estoqueMinimo: parseInt(estoqueMinimo, 10) || 0,
        ativo,
      });
      router.replace('/estoque');
    } catch (erro) {
      Alert.alert('Erro ao salvar', erro instanceof Error ? erro.message : 'Tente novamente.');
    }
  };

  return (
    <View style={styles.container}>
      <GradientBackground />
      <View style={styles.inner}>
        <ScreenHeader titulo="Editar Peça" voltar />

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Campo label="Código da Peça" value={codigo} onChangeText={setCodigo} />
          <Campo label="Nome da Peça" value={nome} onChangeText={setNome} />
          <Campo label="Marca" value={marca} onChangeText={setMarca} />

          <Text style={styles.subsecao}>Valores</Text>
          <Linha>
            <View style={styles.campoMetade}>
              <Campo label="Preço de Custo (R$)" keyboardType="decimal-pad" value={precoCusto} onChangeText={setPrecoCusto} />
            </View>
            <View style={styles.campoMetade}>
              <Campo label="Preço de Venda (R$)" keyboardType="decimal-pad" value={precoVenda} onChangeText={setPrecoVenda} />
            </View>
          </Linha>

          <Text style={styles.subsecao}>Estoque</Text>
          <Linha>
            <View style={styles.campoMetade}>
              <Campo label="Estoque Atual" keyboardType="number-pad" value={estoqueAtual} onChangeText={setEstoqueAtual} />
            </View>
            <View style={styles.campoMetade}>
              <Campo label="Estoque Mínimo" keyboardType="number-pad" value={estoqueMinimo} onChangeText={setEstoqueMinimo} />
            </View>
          </Linha>

          <View style={styles.statusRow}>
            <View style={styles.statusTexto}>
              <Text style={styles.statusTitulo}>Status da Peça</Text>
              <Text style={styles.statusSub}>Ativo no Sistema</Text>
            </View>
            <Switch
              value={ativo}
              onValueChange={setAtivo}
              trackColor={{ false: CORES.input, true: CORES.vermelho }}
              thumbColor={CORES.branco}
            />
          </View>

          <Botao titulo="Salvar Alterações" onPress={salvar} estilo={styles.botaoSalvar} />
          <Botao
            titulo="Excluir Peça"
            variante="contorno"
            onPress={() => setConfirmando(true)}
            estilo={styles.botaoExcluir}
          />
        </ScrollView>
      </View>

      <PopupConfirmacao
        visivel={confirmando}
        titulo="Excluir peça"
        mensagem="Tem certeza que deseja excluir essa peça?"
        textoConfirmar="Excluir Peça"
        onCancelar={() => setConfirmando(false)}
        onConfirmar={() => {
          setConfirmando(false);
          excluirPeca(peca.id).catch(() => {});
          router.replace('/estoque');
        }}
      />
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
  subsecao: {
    color: CORES.branco,
    fontSize: 13,
    fontWeight: '800',
    marginTop: 14,
    marginBottom: 12,
  },
  campoMetade: {
    flex: 1,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: CORES.input,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginTop: 18,
  },
  statusTexto: {
    flex: 1,
  },
  statusTitulo: {
    color: CORES.branco,
    fontSize: 12,
    fontWeight: '700',
  },
  statusSub: {
    color: CORES.textoSuave,
    fontSize: 10,
    marginTop: 2,
  },
  botaoSalvar: {
    marginTop: 24,
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
