import { useCallback, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { Card, CORES, GradientBackground, ScreenHeader } from '@/components/ui';
import { PopupConfirmacao } from '@/components/popup-confirmacao';
import { listarItensOS, excluirItemOS, type ItemOS } from '@/services/api';

const moeda = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`;

export default function ItensOSScreen() {
  const [itens, setItens] = useState<ItemOS[]>([]);
  const [total, setTotal] = useState(0);
  const [filtro, setFiltro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [excluindo, setExcluindo] = useState<ItemOS | null>(null);

  const carregar = useCallback(async () => {
    try {
      const dados = await listarItensOS();
      setItens(dados.itensOS);
      setTotal(dados.total);
    } catch {
      setItens([]);
      setTotal(0);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar]),
  );

  const filtrados = filtro.trim()
    ? itens.filter((i) => i.ordemServicoId.toLowerCase().includes(filtro.trim().toLowerCase()))
    : itens;

  return (
    <View style={styles.container}>
      <GradientBackground />
      <View style={styles.inner}>
        <ScreenHeader titulo="Itens de OS" voltar />

        <View style={styles.buscaArea}>
          <Ionicons name="search" size={16} color={CORES.textoSuave} />
          <TextInput
            style={styles.buscaInput}
            placeholder="Filtrar por ordem de serviço..."
            placeholderTextColor="#9A9A9A"
            value={filtro}
            onChangeText={setFiltro}
          />
        </View>

        <FlatList
          data={filtrados}
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
              <Text style={styles.vazioTitulo}>Nenhum item</Text>
              <Text style={styles.vazioTexto}>
                Adicione peças e serviços às ordens de serviço.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <View style={styles.cardTopo}>
                <View style={[styles.tipoPill, { borderColor: item.tipo === 'peca' ? CORES.azul : CORES.roxo }]}>
                  <Text style={[styles.tipoTexto, { color: item.tipo === 'peca' ? CORES.azul : CORES.roxo }]}>
                    {item.tipo === 'peca' ? 'Peça' : 'Serviço'}
                  </Text>
                </View>
                <Text style={styles.cardOs}>OS: {item.ordemServicoId || '—'}</Text>
              </View>
              <Text style={styles.cardNome}>{item.nome}</Text>
              <View style={styles.cardLinha}>
                <Text style={styles.cardQtd}>{item.quantidade} x {moeda(item.precoUnitario)}</Text>
                <Text style={styles.cardSubtotal}>{moeda(item.subtotal)}</Text>
              </View>
              <Pressable
                style={({ pressed }) => [styles.excluirBtn, pressed && { opacity: 0.7 }]}
                onPress={() => setExcluindo(item)}
              >
                <Ionicons name="trash-outline" size={16} color={CORES.vermelho} />
                <Text style={styles.excluirTexto}>Remover</Text>
              </Pressable>
            </Card>
          )}
        />

        <View style={styles.totalArea}>
          <Text style={styles.totalLabel}>Total geral</Text>
          <Text style={styles.totalValor}>{moeda(total)}</Text>
        </View>
      </View>

      <Pressable
        style={({ pressed }) => [styles.fab, pressed && { opacity: 0.8 }]}
        onPress={() => router.push('/cadastrar-item-os')}
      >
        <Ionicons name="add" size={30} color={CORES.branco} />
      </Pressable>

      <PopupConfirmacao
        visivel={excluindo !== null}
        titulo="Remover item"
        mensagem={`Tem certeza que deseja remover "${excluindo?.nome}" da ordem de serviço?`}
        textoConfirmar="Remover"
        onCancelar={() => setExcluindo(null)}
        onConfirmar={() => {
          if (!excluindo) return;
          const id = excluindo.id;
          setExcluindo(null);
          excluirItemOS(id)
            .then(carregar)
            .catch(() => {});
        }}
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
  listaConteudo: {
    paddingBottom: 16,
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
  tipoPill: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  tipoTexto: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  cardOs: {
    color: CORES.textoSuave,
    fontSize: 11,
  },
  cardNome: {
    color: CORES.branco,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  cardLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardQtd: {
    color: CORES.textoSuave,
    fontSize: 12,
  },
  cardSubtotal: {
    color: CORES.branco,
    fontSize: 14,
    fontWeight: '800',
  },
  excluirBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: 5,
    marginTop: 10,
  },
  excluirTexto: {
    color: CORES.vermelho,
    fontSize: 11,
    fontWeight: '700',
  },
  totalArea: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: CORES.card,
    borderColor: CORES.cardBorder,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 8,
  },
  totalLabel: {
    color: CORES.textoSuave,
    fontSize: 12,
  },
  totalValor: {
    color: CORES.branco,
    fontSize: 16,
    fontWeight: '800',
  },
  fab: {
    position: 'absolute',
    right: 22,
    bottom: 72,
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
