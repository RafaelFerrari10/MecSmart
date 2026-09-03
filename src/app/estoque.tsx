import { useCallback, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { Card, CORES, GradientBackground, ScreenHeader } from '@/components/ui';
import { definirPecaSelecionada, type Peca } from '@/store';
import { listarPecas } from '@/services/api';

const moeda = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`;

export default function EstoqueScreen() {
  const [busca, setBusca] = useState('');
  const [pecas, setPecas] = useState<Peca[]>([]);
  const [carregando, setCarregando] = useState(false);

  const carregar = useCallback(async () => {
    try {
      const dados = await listarPecas();
      setPecas(dados.pecas);
    } catch {
      setPecas([]);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar]),
  );

  const filtradas = pecas.filter((p) => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return true;
    return (
      p.nome.toLowerCase().includes(termo) ||
      p.codigo.toLowerCase().includes(termo) ||
      p.marca.toLowerCase().includes(termo)
    );
  });

  return (
    <View style={styles.container}>
      <GradientBackground />
      <View style={styles.inner}>
        <ScreenHeader titulo="Estoque de Peças" voltar />

        <View style={styles.buscaArea}>
          <Ionicons name="search" size={16} color={CORES.textoSuave} />
          <TextInput
            style={styles.buscaInput}
            placeholder="Buscar peças pelo nome ou código..."
            placeholderTextColor="#9A9A9A"
            value={busca}
            onChangeText={setBusca}
          />
        </View>

        <Text style={styles.secao}>Peças no Estoque</Text>

        <FlatList
          data={filtradas}
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
              <Text style={styles.vazioTitulo}>Nenhuma peça encontrada</Text>
              <Text style={styles.vazioTexto}>
                Cadastre peças para controlar o estoque da oficina.
              </Text>
            </View>
          }
          renderItem={({ item }) => <PecaCard peca={item} />}
        />
      </View>

      <Pressable
        style={({ pressed }) => [styles.fab, pressed && { opacity: 0.8 }]}
        onPress={() => router.push('/cadastrar-peca')}
      >
        <Ionicons name="add" size={30} color={CORES.branco} />
      </Pressable>
    </View>
  );
}

function PecaCard({ peca }: { peca: Peca }) {
  const baixa = peca.estoqueAtual < peca.estoqueMinimo;
  const corEstoque = baixa ? CORES.vermelho : CORES.verde;

  return (
    <Pressable
      onPress={() => {
        definirPecaSelecionada(peca);
        router.push('/detalhes-peca');
      }}
    >
      <Card style={styles.card}>
        <View style={styles.cardTopo}>
          <Text style={styles.cardNome}>{peca.nome}</Text>
          <View style={styles.statusPill}>
            <View style={[styles.statusDot, { backgroundColor: peca.ativo ? CORES.verde : CORES.textoSuave }]} />
            <Text style={[styles.statusTexto, { color: peca.ativo ? CORES.verde : CORES.textoSuave }]}>
              {peca.ativo ? 'Ativo' : 'Inativo'}
            </Text>
          </View>
        </View>

        <View style={styles.cardInfo}>
          <Text style={styles.cardRotulo}>Código: <Text style={styles.cardValor}>{peca.codigo}</Text></Text>
          <Text style={styles.cardRotulo}>Marca: <Text style={styles.cardValor}>{peca.marca}</Text></Text>
        </View>

        <View style={styles.cardLinha}>
          <Text style={styles.cardPreco}>{moeda(peca.precoVenda)}</Text>
          <View style={[styles.estoquePill, { borderColor: corEstoque }]}>
            <Text style={[styles.estoqueTexto, { color: corEstoque }]}>
              Estoque: {peca.estoqueAtual} / {peca.estoqueMinimo}
            </Text>
          </View>
        </View>
      </Card>
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
  buscaArea: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CORES.input,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
    marginBottom: 16,
    gap: 8,
  },
  buscaInput: {
    flex: 1,
    color: CORES.branco,
    fontSize: 12,
    height: '100%',
  },
  secao: {
    color: CORES.branco,
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 8,
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
  cardNome: {
    color: CORES.branco,
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
    marginRight: 10,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: CORES.verde,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: CORES.verde,
  },
  statusTexto: {
    color: CORES.verde,
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  cardInfo: {
    marginBottom: 10,
  },
  cardRotulo: {
    color: CORES.textoSuave,
    fontSize: 11,
    marginBottom: 3,
  },
  cardValor: {
    color: CORES.branco,
    fontWeight: '600',
  },
  cardLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardPreco: {
    color: CORES.branco,
    fontSize: 14,
    fontWeight: '800',
  },
  estoquePill: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  estoqueTexto: {
    fontSize: 10,
    fontWeight: '700',
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
