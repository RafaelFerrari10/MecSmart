import { useRef, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Image } from 'expo-image';
import {
  Botao,
  Campo,
  CORES,
  GradientBackground,
  Linha,
  ScreenHeader,
} from '@/components/ui';
import { usuarioLogado } from '@/store';
import { criarVeiculo } from '@/services/api';

export default function CadastrarVeiculoScreen() {
  const cameraRef = useRef<CameraView>(null);
  const [permissao, solicitarPermissao] = useCameraPermissions();
  const [placa, setPlaca] = useState('');
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [ano, setAno] = useState('');
  const [cor, setCor] = useState('');
  const [quilometragem, setQuilometragem] = useState('');
  const [foto, setFoto] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function tirarFoto() {
    if (!cameraRef.current) return;
    try {
      const resultado = await cameraRef.current.takePictureAsync();
      if (resultado?.uri) setFoto(resultado.uri);
    } catch {
      Alert.alert('Erro', 'Não foi possível capturar a foto. Tente novamente.');
    }
  }

  async function salvar() {
    const placaLimpa = placa.trim().toUpperCase();
    const marcaLimpa = marca.trim();
    const modeloLimpo = modelo.trim();
    const corLimpa = cor.trim();
    const anoNum = parseInt(ano, 10);
    const kmNum = parseInt(quilometragem, 10);

    const placaValida = /^[A-Z]{3}[0-9]{4}$/.test(placaLimpa) || /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/.test(placaLimpa);
    if (!placaValida) {
      Alert.alert('Atenção', 'Placa inválida. Use o formato ABC1234 ou o padrão Mercosul ABC1D23.');
      return;
    }
    if (marcaLimpa.length < 2) {
      Alert.alert('Atenção', 'Marca deve ter pelo menos 2 caracteres.');
      return;
    }
    if (!modeloLimpo) {
      Alert.alert('Atenção', 'Informe o modelo do veículo.');
      return;
    }
    const anoAtual = new Date().getFullYear();
    if (isNaN(anoNum) || !Number.isInteger(anoNum) || anoNum < 1950 || anoNum > anoAtual + 1) {
      Alert.alert('Atenção', `Ano deve ser um número inteiro entre 1950 e ${anoAtual + 1}.`);
      return;
    }
    if (corLimpa.length < 2) {
      Alert.alert('Atenção', 'Cor deve ter pelo menos 2 caracteres.');
      return;
    }
    if (isNaN(kmNum) || kmNum < 0) {
      Alert.alert('Atenção', 'Quilometragem deve ser um número maior ou igual a 0.');
      return;
    }
    if (!usuarioLogado?.uid || usuarioLogado.tipo !== 'cliente') {
      Alert.alert('Atenção', 'Somente clientes podem cadastrar veículos.');
      return;
    }

    setCarregando(true);
    try {
      await criarVeiculo({
        clienteId: usuarioLogado.uid,
        placa: placaLimpa,
        marca: marcaLimpa,
        modelo: modeloLimpo,
        ano: anoNum,
        cor: corLimpa,
        quilometragem: kmNum,
        foto: foto || null,
      });
      Alert.alert('Sucesso', 'Veículo cadastrado com sucesso!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (erro) {
      Alert.alert(
        'Erro ao cadastrar',
        erro instanceof Error ? erro.message : 'Verifique os dados e tente novamente.',
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <View style={styles.container}>
      <GradientBackground />
      <View style={styles.inner}>
        <ScreenHeader titulo="Cadastrar Veículo" voltar />

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Campo label="Placa" value={placa} onChangeText={setPlaca} placeholder="ABC1D23" autoCapitalize="characters" />
          <Campo label="Marca" value={marca} onChangeText={setMarca} placeholder="Ex: Volkswagen" />
          <Campo label="Modelo" value={modelo} onChangeText={setModelo} placeholder="Ex: Gol" />

          <Linha>
            <View style={styles.campoMetade}>
              <Campo label="Ano" keyboardType="number-pad" value={ano} onChangeText={setAno} placeholder="2024" />
            </View>
            <View style={styles.campoMetade}>
              <Campo label="Cor" value={cor} onChangeText={setCor} placeholder="Ex: Prata" />
            </View>
          </Linha>

          <Campo
            label="Quilometragem"
            keyboardType="number-pad"
            value={quilometragem}
            onChangeText={setQuilometragem}
            placeholder="Ex: 45000"
          />

          <Text style={styles.fotoLabel}>Foto do veículo (opcional)</Text>
          <View style={styles.fotoArea}>
            {foto ? (
              <Image source={{ uri: foto }} style={styles.fotoImagem} contentFit="cover" />
            ) : permissao?.granted ? (
              <CameraView
                ref={cameraRef}
                style={styles.fotoImagem}
                facing="back"
                mode="picture"
              />
            ) : (
              <View style={styles.fotoVazio}>
                <Text style={styles.fotoVazioTexto}>Adicione uma foto do veículo</Text>
              </View>
            )}

            {foto ? (
              <View style={styles.fotoAcoes}>
                <Botao titulo="Refazer" variante="contorno" onPress={() => setFoto('')} estilo={styles.fotoBotao} />
              </View>
            ) : (
              <View style={styles.fotoAcoes}>
                {!permissao || !permissao.granted ? (
                  <Botao titulo="Permitir acesso à câmera" onPress={solicitarPermissao} estilo={styles.fotoBotao} />
                ) : null}
                {permissao?.granted ? (
                  <Botao titulo="Tirar foto" onPress={tirarFoto} estilo={styles.fotoBotao} />
                ) : null}
              </View>
            )}
          </View>

          <Botao
            titulo={carregando ? 'Cadastrando...' : 'Cadastrar Veículo'}
            onPress={salvar}
            estilo={styles.botaoSalvar}
          />
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
  campoMetade: {
    flex: 1,
  },
  fotoLabel: {
    color: CORES.textoSuave,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 18,
    marginBottom: 8,
  },
  fotoArea: {
    gap: 12,
  },
  fotoImagem: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: CORES.card,
  },
  fotoVazio: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: CORES.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CORES.card,
  },
  fotoVazioTexto: {
    color: CORES.textoSuave,
    fontSize: 13,
  },
  fotoAcoes: {
    flexDirection: 'row',
    gap: 12,
  },
  fotoBotao: {
    flex: 1,
  },
  botaoSalvar: {
    marginTop: 24,
  },
});
