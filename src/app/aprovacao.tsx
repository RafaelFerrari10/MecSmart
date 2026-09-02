import { Alert, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import {
  Botao,
  Card,
  CONDICAO_LABEL,
  CORES,
  GradientBackground,
  InfoCard,
  Linha,
  ScreenHeader,
} from '@/components/ui';

export default function AprovacaoScreen() {
  function aprovar() {
    router.replace('/retirada');
  }

  function naoAprovar() {
    Alert.alert('Esclarecimento', 'Uma solicitação de esclarecimento foi enviada ao mecânico.');
    router.back();
  }

  return (
    <View style={styles.container}>
      <GradientBackground />
      <View style={styles.inner}>
        <ScreenHeader titulo="Aprovação do cliente" voltar />

        <Card>
          <Text style={styles.titulo}>Resumo da vistoria</Text>
          <Linha>
            <InfoCard rotulo="Data" valor="—" />
            <InfoCard rotulo="Status" valor="AGUARDANDO" />
          </Linha>
          <Linha>
            <InfoCard rotulo="Veículo" valor="—" />
            <InfoCard rotulo="Condição" valor={CONDICAO_LABEL.atencao} />
          </Linha>
          <Text style={styles.detalhe}>
            Revise o checklist, os problemas encontrados e as observações do mecânico antes de
            aprovar.
          </Text>
        </Card>

        <Botao variante="verde" titulo="Aprovar vistoria" onPress={aprovar} />
        <Botao variante="contorno" titulo="Não aprovar / solicitar esclarecimento" onPress={naoAprovar} />
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
  titulo: {
    color: CORES.branco,
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 12,
  },
  detalhe: {
    color: CORES.textoSuave,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 14,
  },
});