import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Botao, Campo, CORES, GradientBackground, ScreenHeader } from '@/components/ui';
import { criarVeiculo } from '@/services/api';
import { definirCodigoSolicitado, usuarioLogado, vistoriaEmAndamento } from '@/store';

export default function NovaVistoriaScreen() {
  const [carregando, setCarregando] = useState(false);
  const [placa, setPlaca] = useState(vistoriaEmAndamento.veiculo.placa);
  const [marca, setMarca] = useState(vistoriaEmAndamento.veiculo.marca);
  const [modelo, setModelo] = useState(vistoriaEmAndamento.veiculo.modelo);
  const [ano, setAno] = useState(
    vistoriaEmAndamento.veiculo.ano ? String(vistoriaEmAndamento.veiculo.ano) : '',
  );
  const [cor, setCor] = useState(vistoriaEmAndamento.veiculo.cor);
  const [km, setKm] = useState(
    vistoriaEmAndamento.veiculo.quilometragem
      ? String(vistoriaEmAndamento.veiculo.quilometragem)
      : '',
  );
  const [codigoMecanico, setCodigoMecanico] = useState('');
  const [observacoes, setObservacoes] = useState(vistoriaEmAndamento.observacoes);

  const foto = vistoriaEmAndamento.veiculo.foto;

  async function solicitar() {
    if (!codigoMecanico.trim()) {
      Alert.alert('Atenção', 'Informe o código do mecânico que fará a vistoria.');
      return;
    }

    vistoriaEmAndamento.veiculo = {
      ...vistoriaEmAndamento.veiculo,
      placa: placa.trim(),
      marca: marca.trim(),
      modelo: modelo.trim(),
      ano: ano ? Number(ano) : 0,
      cor: cor.trim(),
      quilometragem: km ? Number(km) : 0,
    };
    vistoriaEmAndamento.observacoes = observacoes;

    definirCodigoSolicitado(codigoMecanico.trim());

    try {
      if (usuarioLogado?.tipo === 'cliente') {
        setCarregando(true);
        const criado = await criarVeiculo({
          clienteId: usuarioLogado.uid,
          placa: vistoriaEmAndamento.veiculo.placa,
          marca: vistoriaEmAndamento.veiculo.marca,
          modelo: vistoriaEmAndamento.veiculo.modelo,
          ano: vistoriaEmAndamento.veiculo.ano,
          cor: vistoriaEmAndamento.veiculo.cor,
          quilometragem: vistoriaEmAndamento.veiculo.quilometragem,
          foto: vistoriaEmAndamento.veiculo.foto || null,
        });
        vistoriaEmAndamento.veiculo = { ...vistoriaEmAndamento.veiculo, id: criado.veiculo.id };
      }
    } catch (erro) {
      Alert.alert(
        'Atenção',
        erro instanceof Error
          ? erro.message
          : 'Não foi possível registrar o veículo. Verifique se o servidor está rodando.',
      );
      return;
    } finally {
      setCarregando(false);
    }

    router.push('/solicitacao');
  }

  return (
    <View style={styles.container}>
      <GradientBackground />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.inner}>
          <ScreenHeader titulo="Nova vistoria" voltar />

          <ScrollView contentContainerStyle={styles.formulario} keyboardShouldPersistTaps="handled">
            <Pressable style={styles.fotoArea} onPress={() => router.push('/foto-veiculo')}>
              {foto ? (
                <Image source={{ uri: foto }} style={styles.foto} contentFit="cover" />
              ) : (
                <>
                  <Ionicons name="camera-outline" size={30} color={CORES.textoSuave} />
                  <Text style={styles.fotoTexto}>Registrar foto do veículo</Text>
                </>
              )}
            </Pressable>

            <Campo label="Marca" value={marca} onChangeText={setMarca} placeholder="Ex.: Fiat" />
            <Campo label="Modelo" value={modelo} onChangeText={setModelo} placeholder="Ex.: Palio" />
            <Campo label="Placa" value={placa} onChangeText={setPlaca} placeholder="ABC-1234" autoCapitalize="characters" />
            <Campo label="Ano" value={ano} onChangeText={setAno} placeholder="2024" keyboardType="number-pad" />
            <Campo label="Cor" value={cor} onChangeText={setCor} placeholder="Ex.: Prata" />
            <Campo label="Quilometragem (km)" value={km} onChangeText={setKm} placeholder="Ex.: 50000" keyboardType="number-pad" />
            <Campo
              label="Código do mecânico"
              value={codigoMecanico}
              onChangeText={setCodigoMecanico}
              placeholder="Ex.: ABC123"
              autoCapitalize="characters"
            />
            <Campo
              label="Observações"
              value={observacoes}
              onChangeText={setObservacoes}
              placeholder="Descreva algum detalhe relevante"
              multiline
            />

            <Botao titulo={carregando ? 'Salvando...' : 'Solicitar nova vistoria'} onPress={solicitar} />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CORES.preto,
  },
  flex: {
    flex: 1,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 8,
  },
  formulario: {
    paddingBottom: 32,
  },
  fotoArea: {
    height: 130,
    backgroundColor: CORES.input,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    overflow: 'hidden',
  },
  foto: {
    width: '100%',
    height: '100%',
  },
  fotoTexto: {
    color: CORES.textoSuave,
    fontSize: 12,
    marginTop: 8,
  },
});