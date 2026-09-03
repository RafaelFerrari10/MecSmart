import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Botao, Campo, CORES, GradientBackground, ScreenHeader } from '@/components/ui';
import { agendamentoSelecionado } from '@/store';
import { atualizarAgendamento } from '@/services/api';

export default function EditarAgendamentoScreen() {
  const agendamento = agendamentoSelecionado;

  const [data, setData] = useState(agendamento?.data ?? '');
  const [hora, setHora] = useState(agendamento?.hora ?? '');
  const [servicos, setServicos] = useState(agendamento?.servicos.join(', ') ?? '');
  const [observacoes, setObservacoes] = useState(agendamento?.observacoes ?? '');

  if (!agendamento) {
    return (
      <View style={styles.container}>
        <GradientBackground />
        <View style={styles.inner}>
          <ScreenHeader titulo="Editar Agendamento" voltar />
          <Text style={styles.ausente}>Nenhum agendamento selecionado.</Text>
        </View>
      </View>
    );
  }

  const salvar = async () => {
    if (!data.trim() || !hora.trim() || !servicos.trim()) {
      Alert.alert('Atenção', 'Preencha data, hora e serviços.');
      return;
    }

    try {
      await atualizarAgendamento(agendamento.id, {
        data: data.trim(),
        hora: hora.trim(),
        servicos: servicos.split(',').map((s) => s.trim()).filter(Boolean),
        observacoes: observacoes.trim(),
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
        <ScreenHeader titulo="Editar Agendamento" voltar />

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Campo label="Data (AAAA-MM-DD)" value={data} onChangeText={setData} placeholder="Ex: 2026-09-10" />
          <Campo label="Hora (HH:MM)" value={hora} onChangeText={setHora} placeholder="Ex: 14:30" />
          <Campo label="Serviços (separados por vírgula)" value={servicos} onChangeText={setServicos} placeholder="Ex: Troca de óleo, Revisão" />
          <Campo
            label="Observações"
            value={observacoes}
            onChangeText={setObservacoes}
            placeholder="Observações do agendamento"
            multiline
          />

          <Botao titulo="Salvar Alterações" onPress={salvar} estilo={styles.botao} />
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
  botao: {
    marginTop: 24,
  },
  ausente: {
    color: CORES.textoSuave,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 40,
  },
});
