import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import {
  Botao,
  Campo,
  CORES,
  GradientBackground,
  ScreenHeader,
} from '@/components/ui';
import { usuarioLogado } from '@/store';
import {
  criarAgendamento,
  listarUsuarios,
  listarVeiculos,
  type UsuarioCompleto,
  type Veiculo,
} from '@/services/api';

export default function CadastrarAgendamentoScreen() {
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [mecanicos, setMecanicos] = useState<UsuarioCompleto[]>([]);
  const [veiculoId, setVeiculoId] = useState('');
  const [mecanicoId, setMecanicoId] = useState('');
  const [data, setData] = useState('');
  const [hora, setHora] = useState('');
  const [servico, setServico] = useState('');
  const [observacoes, setObservacoes] = useState('');

  const clienteId = usuarioLogado?.uid ?? '';

  useEffect(() => {
    (async () => {
      try {
        if (clienteId) {
          const dadosVeiculos = await listarVeiculos(clienteId);
          setVeiculos(dadosVeiculos.veiculos);
        }
        const dadosMecanicos = await listarUsuarios('mecanico', true);
        setMecanicos(dadosMecanicos.usuarios);
      } catch {
        // servidor indisponível
      }
    })();
  }, [clienteId]);

  const salvar = async () => {
    if (!clienteId) {
      Alert.alert('Atenção', 'Você precisa estar logado para agendar.');
      return;
    }
    if (!veiculoId || !mecanicoId || !data.trim() || !hora.trim() || !servico.trim()) {
      Alert.alert('Atenção', 'Preencha todos os campos do agendamento.');
      return;
    }

    try {
      await criarAgendamento({
        clienteId,
        mecanicoId,
        veiculoId,
        data: data.trim(),
        hora: hora.trim(),
        servicos: [servico.trim()],
        observacoes: observacoes.trim(),
      });
      router.replace('/agendamentos');
    } catch (erro) {
      Alert.alert('Erro ao agendar', erro instanceof Error ? erro.message : 'Tente novamente.');
    }
  };

  return (
    <View style={styles.container}>
      <GradientBackground />
      <View style={styles.inner}>
        <ScreenHeader titulo="Novo Agendamento" voltar />

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.subsecao}>Veículo</Text>
          {veiculos.length === 0 ? (
            <Text style={styles.vazio}>Nenhum veículo cadastrado.</Text>
          ) : (
            veiculos.map((v) => (
              <SelRow
                key={v.id}
                label={`${v.marca} ${v.modelo} — ${v.placa}`}
                selecionado={veiculoId === v.id}
                onPress={() => setVeiculoId(v.id)}
              />
            ))
          )}

          <Text style={styles.subsecao}>Mecânico</Text>
          {mecanicos.length === 0 ? (
            <Text style={styles.vazio}>Nenhum mecânico disponível.</Text>
          ) : (
            mecanicos.map((m) => (
              <SelRow
                key={m.uid}
                label={`${m.nome}${m.especialidade ? ` — ${m.especialidade}` : ''}`}
                selecionado={mecanicoId === m.uid}
                onPress={() => setMecanicoId(m.uid)}
              />
            ))
          )}

          <Campo label="Data (AAAA-MM-DD)" placeholder="Ex: 2026-09-05" value={data} onChangeText={setData} />
          <Campo label="Hora (HH:MM)" placeholder="Ex: 14:00" value={hora} onChangeText={setHora} />
          <Campo label="Serviço" placeholder="Ex: Troca de óleo" value={servico} onChangeText={setServico} />
          <Campo label="Observações (opcional)" placeholder="Notas do agendamento" value={observacoes} onChangeText={setObservacoes} />

          <Botao titulo="Salvar Agendamento" onPress={salvar} estilo={styles.botao} />
        </ScrollView>
      </View>
    </View>
  );
}

function SelRow({ label, selecionado, onPress }: { label: string; selecionado: boolean; onPress: () => void }) {
  return (
    <Pressable
      style={[styles.selRow, selecionado && styles.selRowSelecionado]}
      onPress={onPress}
    >
      <Text style={[styles.selText, selecionado && styles.selTextSelecionado]}>{label}</Text>
    </Pressable>
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
    marginBottom: 10,
  },
  selRow: {
    backgroundColor: CORES.input,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: CORES.cardBorder,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
  },
  selRowSelecionado: {
    backgroundColor: CORES.vermelho,
    borderColor: CORES.vermelho,
  },
  selText: {
    color: CORES.textoSuave,
    fontSize: 12,
    fontWeight: '600',
  },
  selTextSelecionado: {
    color: CORES.branco,
  },
  vazio: {
    color: CORES.textoSuave,
    fontSize: 12,
    marginBottom: 10,
  },
  botao: {
    marginTop: 24,
  },
});
