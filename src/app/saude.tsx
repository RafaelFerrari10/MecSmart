import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import {
  Botao,
  CONDICAO_CORES,
  CONDICAO_LABEL,
  CondicaoItem,
  CORES,
  GradientBackground,
  ScreenHeader,
} from '@/components/ui';
import { vistoriaEmAndamento, type Condicao } from '@/store';

export default function SaudeScreen() {
  const condicoes: Condicao[] = [
    'ok',
    'atencao',
    'ok',
    'problema',
    'ok',
    'atencao',
    'ok',
    'ok',
    'ok',
    'ok',
  ];
  const piores: Record<Condicao, number> = { problema: 3, atencao: 2, ok: 1 };
  const geral =
    condicoes.reduce((acc, c) => Math.min(acc, piores[c]), 3) === 3
      ? 'ok'
      : condicoes.reduce((acc, c) => Math.min(acc, piores[c]), 3) === 2
        ? 'atencao'
        : 'problema';

  function enviar() {
    router.replace('/home');
  }

  return (
    <View style={styles.container}>
      <GradientBackground />
      <View style={styles.inner}>
        <ScreenHeader titulo="Saúde do veículo" voltar />

        <View style={styles.cartao}>
          <Text style={styles.titulo}>Saúde do veículo</Text>
          {vistoriaEmAndamento.checklist.map((item) => (
            <CondicaoItem key={item.nome} nome={item.nome} condicao={item.condicao} />
          ))}
        </View>

        <View style={[styles.geral, { borderColor: CONDICAO_CORES[geral] }]}>
          <Text style={styles.geralTitulo}>Condição geral</Text>
          <Text style={[styles.geralValor, { color: CONDICAO_CORES[geral] }]}>
            {CONDICAO_LABEL[geral]}
          </Text>
        </View>

        <Botao titulo="Enviar para aprovação do cliente" onPress={enviar} />
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
  cartao: {
    backgroundColor: CORES.card,
    borderRadius: 14,
    padding: 16,
  },
  titulo: {
    color: CORES.branco,
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 8,
  },
  geral: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 14,
  },
  geralTitulo: {
    color: CORES.textoSuave,
    fontSize: 10,
    textTransform: 'uppercase',
  },
  geralValor: {
    fontSize: 22,
    fontWeight: '900',
    marginTop: 4,
  },
});