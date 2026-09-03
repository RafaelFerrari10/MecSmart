import { useCallback, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { Card, CORES, GradientBackground, ScreenHeader } from '@/components/ui';
import { definirLancamentoSelecionado } from '@/store';
import { listarFinanceiro, type Financeiro } from '@/services/api';

const FORMAS: Record<string, string> = {
  dinheiro: 'Dinheiro',
  pix: 'Pix',
  cartaoCredito: 'Cartão de crédito',
  cartaoDebito: 'Cartão de débito',
  boleto: 'Boleto',
  transferencia: 'Transferência',
};

const STATUS_CORES: Record<string, string> = {
  pendente: CORES.amarelo,
  pago: CORES.verde,
  cancelado: CORES.textoSuave,
  estornado: CORES.roxo,
};

const moeda = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`;

export default function FinanceiroScreen() {
  const [lancamentos, setLancamentos] = useState<Financeiro[]>([]);
  const [carregando, setCarregando] = useState(false);

  const carregar = useCallback(async () => {
    try {
      const dados = await listarFinanceiro();
      setLancamentos(dados.financeiro);
    } catch {
      setLancamentos([]);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar]),
  );

  const status = (s: string) => STATUS_CORES[s] ?? CORES.textoSuave;

  return (
    <View style={styles.container}>
      <GradientBackground />
      <View style={styles.inner}>
        <ScreenHeader titulo="Financeiro" voltar />

        <FlatList
          data={lancamentos}
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
              <Text style={styles.vazioTitulo}>Nenhum lançamento</Text>
              <Text style={styles.vazioTexto}>
                Cadastre lançamentos financeiros para acompanhar a oficina.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => {
                definirLancamentoSelecionado(item);
                router.push('/detalhes-financeiro');
              }}
            >
              <Card style={styles.card}>
                <View style={styles.cardTopo}>
                  <Text style={styles.cardOs}>OS: {item.ordemServicoId || '—'}</Text>
                  <View style={[styles.statusPill, { borderColor: status(item.status) }]}>
                    <Text style={[styles.statusTexto, { color: status(item.status) }]}>
                      {item.status}
                    </Text>
                  </View>
                </View>
                <View style={styles.cardLinha}>
                  <Text style={styles.cardValor}>{moeda(item.valor)}</Text>
                  <Text style={styles.cardForma}>
                    {FORMAS[item.formaPagamento] ?? item.formaPagamento}
                  </Text>
                </View>
              </Card>
            </Pressable>
          )}
        />
      </View>

      <Pressable
        style={({ pressed }) => [styles.fab, pressed && { opacity: 0.8 }]}
        onPress={() => router.push('/cadastrar-financeiro')}
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
    marginBottom: 10,
  },
  cardOs: {
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
  cardLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardValor: {
    color: CORES.branco,
    fontSize: 16,
    fontWeight: '800',
  },
  cardForma: {
    color: CORES.textoSuave,
    fontSize: 11,
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
