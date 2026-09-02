import { useRef, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Image } from 'expo-image';
import { Botao, CORES, GradientBackground, ScreenHeader } from '@/components/ui';
import { vistoriaEmAndamento } from '@/store';

export default function FotoVeiculoScreen() {
  const cameraRef = useRef<CameraView>(null);
  const [permissao, solicitarPermissao] = useCameraPermissions();
  const [foto, setFoto] = useState(vistoriaEmAndamento.veiculo.foto);

  async function tirarFoto() {
    if (!cameraRef.current) return;
    try {
      const resultado = await cameraRef.current.takePictureAsync();
      if (resultado?.uri) setFoto(resultado.uri);
    } catch {
      Alert.alert('Erro', 'Não foi possível capturar a foto. Tente novamente.');
    }
  }

  function usarFoto() {
    if (foto) vistoriaEmAndamento.veiculo.foto = foto;
    router.back();
  }

  return (
    <View style={styles.container}>
      <GradientBackground />
      <View style={styles.inner}>
        <ScreenHeader titulo="Foto do veículo" voltar />

        {!permissao ? (
          <View style={styles.areaCentral}>
            <Text style={styles.info}>Consultando permissão da câmera...</Text>
          </View>
        ) : !permissao.granted ? (
          <View style={styles.areaCentral}>
            <Text style={styles.info}>
              É necessário permitir o acesso à câmera para registrar a foto do veículo.
            </Text>
            <Botao titulo="Conceder acesso à câmera" onPress={solicitarPermissao} />
          </View>
        ) : (
          <View style={styles.areaCentral}>
            {foto ? (
              <Image source={{ uri: foto }} style={styles.camera} contentFit="cover" />
            ) : (
              <CameraView
                ref={cameraRef}
                style={styles.camera}
                facing="back"
                mode="picture"
              />
            )}

            {foto ? (
              <View style={styles.acoes}>
                <Botao titulo="Refazer" variante="contorno" onPress={() => setFoto('')} />
                <Botao titulo="Usar foto" onPress={usarFoto} />
              </View>
            ) : (
              <Botao titulo="Tirar foto" onPress={tirarFoto} />
            )}
          </View>
        )}
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
  areaCentral: {
    flex: 1,
    gap: 14,
  },
  info: {
    color: CORES.textoSuave,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  camera: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  acoes: {
    flexDirection: 'row',
    gap: 12,
  },
});