import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import {
  Botao,
  Card,
  CORES,
  GradientBackground,
  InfoCard,
  Linha,
  ScreenHeader,
  StatusBadge,
} from '@/components/ui';
import { Popup } from '@/components/popup';
import { alterarStatusOrdemServico } from '@/services/api';
import { osIdEmAndamento } from '@/store';

export default function RetiradaScreen() {
  const [mostrarPopup, setMostrarPopup] = useState(false);

  function solicitarRetirada() {
    setMostrarPopup(true);
  }

  function confirmar() {
    setMostrarPopup(false);
    if (osIdEmAndamento) {
      alterarStatusOrdemServico(osIdEmAndamento, 'RETIRADA SOLICITADA').catch(() => {
        // melhor esforço; falha silenciosa
      });
    }
    router.replace('/home');
  }

  return (
    <View style={styles.container}>
      <GradientBackground />
      <View style={styles.inner}>
        <ScreenHeader titulo="Retirada da vistoria" voltar />

        <Card>
          <Text style={styles.titulo}>Dados da retirada</Text>
          <Linha>
            <InfoCard rotulo="Veículo" valor="—" />
            <InfoCard rotulo="Placa" valor="—" />
          </Linha>
          <Linha>
            <InfoCard rotulo="Cliente" valor="—" />
            <InfoCard rotulo="Data" valor="—" />
          </Linha>
          <View style={styles.badge}>
            <StatusBadge status="APROVADA" />
          </View>
          <Text style={styles.detalhe}>
            A vistoria foi aprovada. Solicite a retirada do veículo para concluir o processo.
          </Text>
        </Card>

        <Botao titulo="Solicitar retirada" onPress={solicitarRetirada} />
      </View>

      <Popup
        visivel={mostrarPopup}
        titulo="Resultado da vistoria"
        mensagem={
          'Veículo: —\nPlaca: —\n\nStatus: vistoria aprovada\nRetirada: aguardando confirmação'
        }
        onConfirmar={confirmar}
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
  titulo: {
    color: CORES.branco,
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 12,
  },
  badge: {
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  detalhe: {
    color: CORES.textoSuave,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 14,
  },
});