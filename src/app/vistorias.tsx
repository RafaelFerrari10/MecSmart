import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Botao, Card, CORES, GradientBackground, ScreenHeader, StatusBadge } from '@/components/ui';
import { buscarUsuario, buscarVeiculo, ordensServico, perfilAtual, type OrdemServico } from '@/store';

export default function VistoriasScreen() {
  const mecanico = perfilAtual === 'mecanico';

  function abrirVistoria(os: OrdemServico) {
    if (mecanico) {
      if (os.status === 'PENDENTE') {
        router.push('/solicitacao');
      } else {
        router.push('/cadastro-vistoria');
      }
    } else {
      router.push('/carro');
    }
  }

  return (
    <View style={styles.container}>
      <GradientBackground />
      <View style={styles.inner}>
        <ScreenHeader
          titulo="Ordens de serviço"
          direita={
            <Pressable style={styles.perfilBotao} onPress={() => router.push('/perfil')}>
              <Ionicons name="person-circle-outline" size={24} color={CORES.branco} />
            </Pressable>
          }
        />

        {mecanico && (
          <View style={styles.filtros}>
            {['PENDENTES', 'EM ANDAMENTO', 'CONCLUÍDAS'].map((f) => (
              <Pressable key={f} style={styles.filtro}>
                <Text style={styles.filtroTexto}>{f}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {mecanico && (
          <Botao
            titulo="Receber vistoria pelo código"
            onPress={() => router.push('/solicitacao')}
            estilo={styles.botaoReceber}
          />
        )}

        <FlatList
          style={styles.lista}
          contentContainerStyle={styles.listaConteudo}
          data={ordensServico}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <View style={styles.vazio}>
              <Text style={styles.vazioTitulo}>
                {mecanico ? 'Ainda não há solicitações' : 'Você ainda não possui vistorias'}
              </Text>
              <Text style={styles.vazioTexto}>
                {mecanico
                  ? 'Quando um cliente solicitar, a vistoria aparecerá aqui.'
                  : 'Solicite uma vistoria para acompanhar seu veículo.'}
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const veiculo = buscarVeiculo(item.veiculoId);
            const cliente = buscarUsuario(item.clienteId);
            return (
              <Pressable onPress={() => abrirVistoria(item)}>
                <Card>
                  <Text style={styles.nome}>
                    {mecanico
                      ? cliente?.nome ?? '—'
                      : `${veiculo?.marca ?? '—'} ${veiculo?.modelo ?? ''}`}
                  </Text>
                  <View style={styles.linha}>
                    <Text style={styles.placa}>{veiculo?.placa ?? '—'}</Text>
                    <Text style={styles.data}>{item.dataAbertura || '—'}</Text>
                  </View>
                  <View style={styles.rodape}>
                    <StatusBadge status={item.status} />
                    <Text style={styles.placaLivre}>
                      {mecanico
                        ? `${veiculo?.marca ?? '—'} ${veiculo?.modelo ?? ''}`
                        : cliente?.nome ?? '—'}
                    </Text>
                  </View>
                </Card>
              </Pressable>
            );
          }}
        />

        {!mecanico && (
          <Botao
            titulo="+ Nova vistoria"
            onPress={() => router.push('/nova-vistoria')}
            estilo={styles.botaoNova}
          />
        )}
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
  filtros: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  filtro: {
    backgroundColor: CORES.input,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  filtroTexto: {
    color: CORES.textoSuave,
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  perfilBotao: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoReceber: {
    marginBottom: 14,
  },
  lista: {
    flex: 1,
  },
  listaConteudo: {
    paddingBottom: 20,
  },
  vazio: {
    alignItems: 'center',
    marginTop: 60,
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
  nome: {
    color: CORES.branco,
    fontSize: 14,
    fontWeight: '700',
  },
  linha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  placa: {
    color: CORES.amarelo,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  data: {
    color: CORES.textoSuave,
    fontSize: 11,
  },
  rodape: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  placaLivre: {
    color: CORES.textoSuave,
    fontSize: 10,
  },
  botaoNova: {
    marginBottom: 24,
  },
});