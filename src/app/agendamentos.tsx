import { useCallback, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { Card, CORES, GradientBackground, ScreenHeader } from '@/components/ui';
import { definirAgendamentoSelecionado } from '@/store';
import { listarAgendamentos, type Agendamento } from '@/services/api';

const STATUS_CORES: Record<string, string> = {
  agendado: CORES.azul,
  confirmado: CORES.amarelo,
  emAndamento: CORES.laranja,
  concluido: CORES.verde,
  cancelado: CORES.textoSuave,
};

export default function AgendamentosScreen() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [carregando, setCarregando] = useState(false);

  const carregar = useCallback(async () => {
    try {
      const dados = await listarAgendamentos();
      setAgendamentos(dados.agendamentos);
    } catch {
      setAgendamentos([]);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar]),
  );

  const status = (s: string) => STATUS_CORES[s] ?? CORES.textoSuave;
  const ordenados = [...agendamentos].sort((a, b) => (a.data + a.hora).localeCompare(b.data + b.hora));

  return (
    <View style={styles.container}>
      <GradientBackground />
      <View style={styles.inner}>
        <ScreenHeader titulo="Agendamentos" voltar />

        <FlatList
          data={ordenados}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listaConteudo}
          refreshControl={
            <RefreshControl
              refreshing={carregando}
              onRefresh={() => {
                setCarregando(true);
                carregar().finally(() => setCarregando(false));
              }}
              tintColor={CORES.vermelho}
            />
          }
          ListEmptyComponent={
            <View style={styles.vazioArea}>
              <Text style={styles.vazioTitulo}>Nenhum agendamento</Text>
              <Text style={styles.vazioTexto}>
                Agende serviços para não perder nenhum atendimento.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => {
                definirAgendamentoSelecionado(item);
                router.push('/detalhes-agendamento');
              }}
            >
              <Card style={styles.card}>
                <View style={styles.cardTopo}>
                  <Text style={styles.cardData}>
                    {item.data} às {item.hora}
                  </Text>
                  <View style={[styles.statusPill, { borderColor: status(item.status) }]}>
                    <Text style={[styles.statusTexto, { color: status(item.status) }]}>
                      {item.status}
                    </Text>
                  </View>
                </View>
                <Text style={styles.cardServicos} numberOfLines={2}>
                  {item.servicos.join(', ')}
                </Text>
                {item.observacoes ? (
                  <Text style={styles.cardObs} numberOfLines={1}>{item.observacoes}</Text>
                ) : null}
              </Card>
            </Pressable>
          )}
        />
      </View>

      <Pressable
        style={({ pressed }) => [styles.fab, pressed && { opacity: 0.8 }]}
        onPress={() => router.push('/cadastrar-agendamento')}
      >
        <Ionicons name="add" size={30} color={CORES.branco} />
      </Pressable>
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
  listaConteudo: {
    paddingBottom: 24,
  },
  card: {
    marginBottom: 12,
  },
  cardTopo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardData: {
    color: CORES.branco,
    fontSize: 14,
    fontWeight: '700',
  },
  statusPill: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  statusTexto: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  cardServicos: {
    color: CORES.textoSuave,
    fontSize: 12,
  },
  cardObs: {
    color: CORES.textoSuave,
    fontSize: 10,
    marginTop: 6,
    fontStyle: 'italic',
  },
  fab: {
    position: 'absolute',
    right: 22,
    bottom: 28,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: CORES.vermelho,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  vazioArea: {
    alignItems: 'center',
    marginTop: 40,
    paddingHorizontal: 32,
  },
  vazioTitulo: {
    color: CORES.branco,
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
  },
  vazioTexto: {
    color: CORES.textoSuave,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 8,
  },
});
