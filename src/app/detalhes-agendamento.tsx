import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import {
  Botao,
  Card,
  CORES,
  GradientBackground,
  ScreenHeader,
} from '@/components/ui';
import { PopupConfirmacao } from '@/components/popup-confirmacao';
import { agendamentoSelecionado } from '@/store';
import { alterarStatusAgendamento, excluirAgendamento } from '@/services/api';

export default function DetalhesAgendamentoScreen() {
  const [confirmandoExcluir, setConfirmandoExcluir] = useState(false);
  const agendamento = agendamentoSelecionado;

  if (!agendamento) {
    return (
      <View style={styles.container}>
        <GradientBackground />
        <View style={styles.inner}>
          <ScreenHeader titulo="Detalhes do Agendamento" voltar />
          <Text style={styles.ausente}>Nenhum agendamento selecionado.</Text>
        </View>
      </View>
    );
  }

  const status = agendamento.status;

  const alterar = async (novoStatus: string, msg: string) => {
    try {
      await alterarStatusAgendamento(agendamento.id, novoStatus);
      Alert.alert('Sucesso', msg, [{ text: 'OK', onPress: () => router.back() }]);
    } catch (erro) {
      Alert.alert('Erro', erro instanceof Error ? erro.message : 'Tente novamente.');
    }
  };

  return (
    <View style={styles.container}>
      <GradientBackground />
      <View style={styles.inner}>
        <ScreenHeader titulo="Detalhes do Agendamento" voltar />

        <ScrollView contentContainerStyle={styles.scroll}>
          <Card style={styles.card}>
            <Text style={styles.data}>{agendamento.data} às {agendamento.hora}</Text>
            <Text style={styles.status}>{agendamento.status}</Text>

            <View style={styles.listaInfo}>
              <InfoLinha rotulo="Cliente" valor={agendamento.clienteId} />
              <InfoLinha rotulo="Mecânico" valor={agendamento.mecanicoId} />
              <InfoLinha rotulo="Veículo" valor={agendamento.veiculoId} />
              <InfoLinha rotulo="Serviços" valor={agendamento.servicos.join(', ')} />
              <InfoLinha rotulo="Observações" valor={agendamento.observacoes || '—'} />
            </View>
          </Card>

          {(status === 'agendado' || status === 'confirmado') && (
            <Botao titulo="Confirmar" onPress={() => alterar('confirmar', 'Agendamento confirmado!')} estilo={styles.botao} />
          )}
          {status === 'confirmado' && (
            <Botao titulo="Iniciar" onPress={() => alterar('iniciar', 'Atendimento iniciado!')} estilo={styles.botao} />
          )}
          {status === 'emAndamento' && (
            <Botao titulo="Concluir" variante="verde" onPress={() => alterar('concluir', 'Atendimento concluído!')} estilo={styles.botao} />
          )}
          {status !== 'cancelado' && status !== 'concluido' && (
            <Botao titulo="Cancelar Agendamento" variante="contorno" onPress={() => alterar('cancelar', 'Agendamento cancelado!')} estilo={styles.botao} />
          )}

          <Botao titulo="Excluir" variante="contorno" onPress={() => setConfirmandoExcluir(true)} estilo={styles.botaoExcluir} />
        </ScrollView>
      </View>

      <PopupConfirmacao
        visivel={confirmandoExcluir}
        titulo="Excluir agendamento"
        mensagem="Tem certeza que deseja excluir esse agendamento?"
        textoConfirmar="Excluir"
        onCancelar={() => setConfirmandoExcluir(false)}
        onConfirmar={() => {
          setConfirmandoExcluir(false);
          excluirAgendamento(agendamento.id)
            .then(() => router.back())
            .catch((erro) => Alert.alert('Erro', erro.message));
        }}
      />
    </View>
  );
}

function InfoLinha({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <View style={styles.infoLinha}>
      <Text style={styles.infoRotulo}>{rotulo}</Text>
      <Text style={styles.infoValor}>{valor}</Text>
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
  card: {
    marginBottom: 4,
  },
  data: {
    color: CORES.branco,
    fontSize: 18,
    fontWeight: '800',
  },
  status: {
    color: CORES.amarelo,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginTop: 4,
    marginBottom: 14,
  },
  listaInfo: {
    borderTopWidth: 1,
    borderTopColor: '#1F1F1F',
  },
  infoLinha: {
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#1F1F1F',
  },
  infoRotulo: {
    color: CORES.textoSuave,
    fontSize: 10,
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  infoValor: {
    color: CORES.branco,
    fontSize: 13,
    fontWeight: '600',
  },
  botao: {
    marginTop: 20,
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
