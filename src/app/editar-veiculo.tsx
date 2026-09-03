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
import { veiculoSelecionado } from '@/store';
import { atualizarVeiculo, excluirVeiculo } from '@/services/api';

export default function EditarVeiculoScreen() {
  const veiculo = veiculoSelecionado;
  const [confirmando, setConfirmando] = useState(false);

  const [placa, setPlaca] = useState(veiculo?.placa ?? '');
  const [marca, setMarca] = useState(veiculo?.marca ?? '');
  const [modelo, setModelo] = useState(veiculo?.modelo ?? '');
  const [ano, setAno] = useState(String(veiculo?.ano ?? ''));
  const [cor, setCor] = useState(veiculo?.cor ?? '');
  const [quilometragem, setQuilometragem] = useState(String(veiculo?.quilometragem ?? ''));
  const [ativo, setAtivo] = useState(veiculo?.ativo ?? true);

  if (!veiculo) {
    return (
      <View style={styles.container}>
        <GradientBackground />
        <View style={styles.inner}>
          <ScreenHeader titulo="Editar Veículo" voltar />
          <Text style={styles.ausente}>Nenhum veículo selecionado.</Text>
        </View>
      </View>
    );
  }

  const salvar = async () => {
    if (!placa.trim() || !marca.trim() || !modelo.trim()) {
      Alert.alert('Atenção', 'Preencha placa, marca e modelo.');
      return;
    }

    try {
      await atualizarVeiculo(veiculo.id, {
        placa: placa.trim(),
        marca: marca.trim(),
        modelo: modelo.trim(),
        ano: parseInt(ano, 10) || veiculo.ano,
        cor: cor.trim(),
        quilometragem: parseInt(quilometragem, 10) || veiculo.quilometragem,
        ativo,
      });
      router.back();
    } catch (erro) {
      Alert.alert('Erro ao salvar', erro instanceof Error ? erro.message : 'Tente novamente.');
    }
  };

  return (
    <View style={styles.container}>
      <GradientBackground />
      <View style={styles.inner}>
        <ScreenHeader titulo="Editar Veículo" voltar />

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Campo label="Placa" value={placa} onChangeText={setPlaca} placeholder="ABC1D23" />
          <Campo label="Marca" value={marca} onChangeText={setMarca} placeholder="Ex: Volkswagen" />
          <Campo label="Modelo" value={modelo} onChangeText={setModelo} placeholder="Ex: Gol" />

          <Linha>
            <View style={styles.campoMetade}>
              <Campo label="Ano" keyboardType="number-pad" value={ano} onChangeText={setAno} />
            </View>
            <View style={styles.campoMetade}>
              <Campo label="Cor" value={cor} onChangeText={setCor} placeholder="Ex: Prata" />
            </View>
          </Linha>

          <Campo label="Quilometragem" keyboardType="number-pad" value={quilometragem} onChangeText={setQuilometragem} />

          <View style={styles.statusRow}>
            <View style={styles.statusTexto}>
              <Text style={styles.statusTitulo}>Status do Veículo</Text>
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
            titulo="Excluir Veículo"
            variante="contorno"
            onPress={() => setConfirmando(true)}
            estilo={styles.botaoExcluir}
          />
        </ScrollView>
      </View>

      <PopupConfirmacao
        visivel={confirmando}
        titulo="Excluir veículo"
        mensagem="Tem certeza que deseja excluir esse veículo?"
        textoConfirmar="Excluir Veículo"
        onCancelar={() => setConfirmando(false)}
        onConfirmar={() => {
          setConfirmando(false);
          excluirVeiculo(veiculo.id)
            .then(() => router.back())
            .catch(() => {});
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
