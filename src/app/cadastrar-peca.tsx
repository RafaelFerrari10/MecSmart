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
import { criarPeca } from '@/services/api';

export default function CadastrarPecaScreen() {
  const [codigo, setCodigo] = useState('');
  const [nome, setNome] = useState('');
  const [marca, setMarca] = useState('');
  const [precoCusto, setPrecoCusto] = useState('0,00');
  const [precoVenda, setPrecoVenda] = useState('0,00');
  const [estoqueAtual, setEstoqueAtual] = useState('0');
  const [estoqueMinimo, setEstoqueMinimo] = useState('0');
  const [ativo, setAtivo] = useState(true);

  const salvar = async () => {
    if (!codigo.trim() || !nome.trim()) {
      Alert.alert('Atenção', 'Preencha o código e o nome da peça.');
      return;
    }

    try {
      await criarPeca({
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
        <ScreenHeader titulo="Cadastrar Peça" voltar />

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Campo label="Código da Peça" placeholder="Ex: PF-001" value={codigo} onChangeText={setCodigo} />
          <Campo
            label="Nome da Peça"
            placeholder="Ex: Pastilha de Freio Dianteira"
            value={nome}
            onChangeText={setNome}
          />
          <Campo label="Marca" placeholder="Ex: Bosch" value={marca} onChangeText={setMarca} />

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
            </View>            <Switch
              value={ativo}
              onValueChange={setAtivo}
              trackColor={{ false: CORES.input, true: CORES.vermelho }}
              thumbColor={CORES.branco}
            />
          </View>

          <Botao titulo="Salvar Peça" onPress={salvar} estilo={styles.botao} />
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
  botao: {
    marginTop: 24,
  },
});
