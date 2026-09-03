import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import {
  Botao,
  Card,
  CONDICAO_CORES,
  CORES,
  GradientBackground,
  ScreenHeader,
  StatusBadge,
} from '@/components/ui';
import { listarOrdensServico, buscarVeiculo, buscarUsuario, listarVeiculos, type Veiculo as ApiVeiculo } from '@/services/api';
import {
  perfilAtual,
  usuarioLogado,
  type OrdemServico,
  type Veiculo,
} from '@/store';

export default function VistoriasScreen() {
  const mecanico = perfilAtual === 'mecanico';

  if (mecanico) {
    return <MechanicVistorias />;
  }
  return <ClientVistorias />;
}

/* ------------------------------------------------------------------ */
/*  CLIENTE                                                            */
/* ------------------------------------------------------------------ */
function ClientVistorias() {
  const [veiculosCli, setVeiculosCli] = useState<Veiculo[]>([]);
  const [vistorias, setVistorias] = useState<OrdemServico[]>([]);

  useEffect(() => {
    let ativo = true;
    (async () => {
      try {
        if (usuarioLogado?.uid) {
          const [dados, ordens] = await Promise.all([
            listarVeiculos(usuarioLogado.uid),
            listarOrdensServico({ clienteId: usuarioLogado.uid }),
          ]);
          if (!ativo) return;
          setVeiculosCli(
            dados.veiculos.map((v) => ({
              id: v.id,
              clienteId: v.clienteId,
              placa: v.placa,
              marca: v.marca,
              modelo: v.modelo,
              ano: v.ano,
              cor: v.cor,
              quilometragem: v.quilometragem,
              foto: v.foto ?? '',
              ativo: v.ativo,
            })),
          );
          setVistorias(ordens.ordens);
        }
      } catch {
        // servidor indisponível
      }
    })();
    return () => { ativo = false; };
  }, []);

  const primeiroVeiculo = veiculosCli[veiculosCli.length - 1];
  const buscarVeiculo = (id: string) => veiculosCli.find((v) => v.id === id);

  return (
    <View style={styles.container}>
      <GradientBackground />
      <View style={styles.inner}>
        <ScreenHeader titulo="Vistorias" voltar />

        <FlatList
          data={vistorias}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <>
              <Text style={styles.secao}>Seu carro</Text>
              {primeiroVeiculo ? (
                <Pressable
                  style={({ pressed }) => [styles.cardCarro, pressed && { opacity: 0.8 }]}
                  onPress={() => router.push('/carro')}
                >
                  {primeiroVeiculo.foto ? (
                    <Image
                      source={{ uri: primeiroVeiculo.foto }}
                      style={styles.carroFoto}
                      contentFit="cover"
                    />
                  ) : (
                    <View style={[styles.carroFoto, styles.carroFotoPlaceholder]}>
                      <Ionicons name="car-outline" size={40} color={CORES.textoSuave} />
                    </View>
                  )}
                  <Text style={styles.carroNome}>
                    {primeiroVeiculo.marca} {primeiroVeiculo.modelo}
                  </Text>
                </Pressable>
              ) : (
                <Pressable
                  style={({ pressed }) => [styles.cardAdicionar, pressed && { opacity: 0.7 }]}
                  onPress={() => router.push('/cadastrar-veiculo')}
                >
                  <Text style={styles.cardAdicionarTexto}>Cadastrar veículo</Text>
                </Pressable>
              )}

              {veiculosCli.length > 1 && (
                <Pressable
                  style={({ pressed }) => [styles.cardAdicionar, pressed && { opacity: 0.7 }]}
                  onPress={() => router.push('/nova-vistoria')}
                >
                  <Text style={styles.cardAdicionarTexto}>Adicionar outro carro</Text>
                </Pressable>
              )}

              <Text style={[styles.secao, { marginTop: 14 }]}>Vistorias</Text>
            </>
          }
          ListEmptyComponent={
            <View style={styles.vazioArea}>
              <Text style={styles.vazioTitulo}>Nenhuma vistoria</Text>
              <Text style={styles.vazioTexto}>Solicite uma vistoria para acompanhar seu veículo.</Text>
            </View>
          }
          renderItem={({ item }) => {
            const veiculo = buscarVeiculo(item.veiculoId);
            const problemas = item.problemas ?? [];
            const checklistItems = [
              ...problemas.map((p) => ({ nome: p, condicao: 'problema' as const })),
            ];

            return (
              <Card style={styles.vistoriaCard}>
                {veiculo && veiculo.foto ? (
                  <Image
                    source={{ uri: veiculo.foto }}
                    style={styles.vistoriaFoto}
                    contentFit="cover"
                  />
                ) : null}

                <Text style={styles.vistoriaNome}>
                  {veiculo ? `${veiculo.marca} ${veiculo.modelo}` : '—'}
                </Text>
                {veiculo?.placa && (
                  <Text style={styles.vistoriaPlaca}>Placa: {veiculo.placa}</Text>
                )}

                {item.dataAbertura && (
                  <Text style={styles.vistoriaDetalhe}>Data: {item.dataAbertura}</Text>
                )}
                {veiculo?.quilometragem ? (
                  <Text style={styles.vistoriaDetalhe}>
                    Quilometragem: {veiculo.quilometragem.toLocaleString('pt-BR')}
                  </Text>
                ) : null}
                {item.observacoes ? (
                  <Text style={styles.vistoriaDetalhe} numberOfLines={2}>
                    Defeito: {item.observacoes}
                  </Text>
                ) : null}

                {checklistItems.length > 0 && (
                  <View style={styles.checklistArea}>
                    <Text style={styles.checklistTitulo}>Checklist</Text>
                    {checklistItems.map((ci, idx) => (
                      <View key={idx} style={styles.checklistItem}>
                        <View style={[styles.checklistDot, { backgroundColor: CONDICAO_CORES[ci.condicao] }]} />
                        <Text style={styles.checklistTexto}>{ci.nome}</Text>
                      </View>
                    ))}
                  </View>
                )}

                <View style={styles.statusArea}>
                  <StatusBadge status={item.status} />
                  {item.status === 'APROVADA' && (
                    <Ionicons name="checkmark-circle" size={20} color={CORES.verde} />
                  )}
                </View>
              </Card>
            );
          }}
          contentContainerStyle={styles.listaConteudo}
        />

        <Botao
          titulo="+ Nova vistoria"
          onPress={() => router.push('/nova-vistoria')}
          estilo={styles.botaoNova}
        />
      </View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  MECÂNICO                                                           */
/* ------------------------------------------------------------------ */
function MechanicVistorias() {
  const [ordens, setOrdens] = useState<OrdemServico[]>([]);
  const [veiculoMap, setVeiculoMap] = useState<Record<string, ApiVeiculo | null>>({});
  const [clienteMap, setClienteMap] = useState<Record<string, string>>({});

  useEffect(() => {
    let ativo = true;
    (async () => {
      try {
        const { ordens: lista } = await listarOrdensServico();
        if (!ativo) return;
        setOrdens(lista);
        const vMap: Record<string, ApiVeiculo | null> = {};
        const cMap: Record<string, string> = {};
        for (const os of lista) {
          if (os.veiculoId && !(os.veiculoId in vMap)) {
            try {
              const { veiculo } = await buscarVeiculo(os.veiculoId);
              vMap[os.veiculoId] = veiculo;
            } catch {
              vMap[os.veiculoId] = null;
            }
          }
          if (os.clienteId && !(os.clienteId in cMap)) {
            try {
              const u = await buscarUsuario(os.clienteId);
              cMap[os.clienteId] = u.usuario?.nome || '—';            } catch {
              cMap[os.clienteId] = '—';
            }
          }
        }
        if (ativo) {
          setVeiculoMap(vMap);
          setClienteMap(cMap);
        }
      } catch {
        // servidor indisponível
      }
    })();
    return () => { ativo = false; };
  }, []);

  function abrir(os: OrdemServico) {
    if (os.status === 'PENDENTE') {
      router.push('/solicitacao');
    } else {
      router.push('/cadastro-vistoria');
    }
  }

  return (
    <View style={styles.container}>
      <GradientBackground />
      <View style={styles.inner}>
        <ScreenHeader titulo="Ordens de serviço" voltar />

        <FlatList
          style={styles.lista}
          contentContainerStyle={styles.listaConteudo}
          data={ordens}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <View style={styles.vazioArea}>
              <Text style={styles.vazioTitulo}>Ainda não há solicitações</Text>
              <Text style={styles.vazioTexto}>
                Quando um cliente solicitar, a vistoria aparecerá aqui.
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const veiculo = veiculoMap[item.veiculoId] ?? undefined;
            return (
              <Pressable onPress={() => abrir(item)}>
                <Card>
                  <Text style={styles.mecNome}>
                    {clienteMap[item.clienteId] ?? '—'}
                  </Text>
                  <View style={styles.mecLinha}>
                    <Text style={styles.mecPlaca}>{veiculo?.placa ?? '—'}</Text>
                    <Text style={styles.mecData}>{item.dataAbertura || '—'}</Text>
                  </View>
                  <View style={styles.mecRodape}>
                    <StatusBadge status={item.status} />
                    <Text style={styles.mecVeiculo}>
                      {veiculo?.marca ?? '—'} {veiculo?.modelo ?? ''}
                    </Text>
                  </View>
                </Card>
              </Pressable>
            );
          }}
        />

        <Botao
          titulo="Receber vistoria pelo código"
          onPress={() => router.push('/solicitacao')}
          estilo={styles.botaoReceber}
        />
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
  lista: {
    flex: 1,
  },
  listaConteudo: {
    paddingBottom: 20,
  },
  secao: {
    color: CORES.branco,
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 8,
  },

  /* ---- CLIENTE: Seu carro ---- */
  cardCarro: {
    backgroundColor: CORES.branco,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 8,
  },
  carroFoto: {
    width: '100%',
    height: 150,
    backgroundColor: CORES.input,
  },
  carroFotoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  carroNome: {
    color: CORES.preto,
    fontSize: 14,
    fontWeight: '700',
    padding: 12,
  },
  cardAdicionar: {
    backgroundColor: CORES.input,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  cardAdicionarTexto: {
    color: CORES.branco,
    fontSize: 12,
    fontWeight: '700',
  },

  /* ---- CLIENTE: Vistoria cards ---- */
  vistoriaCard: {
    marginBottom: 12,
  },
  vistoriaFoto: {
    width: '100%',
    height: 140,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: CORES.input,
  },
  vistoriaNome: {
    color: CORES.branco,
    fontSize: 14,
    fontWeight: '700',
  },
  vistoriaPlaca: {
    color: CORES.amarelo,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 4,
  },
  vistoriaDetalhe: {
    color: CORES.textoSuave,
    fontSize: 11,
    marginTop: 4,
  },
  checklistArea: {
    marginTop: 10,
  },
  checklistTitulo: {
    color: CORES.branco,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  checklistDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  checklistTexto: {
    color: CORES.textoSuave,
    fontSize: 11,
  },
  statusArea: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },

  /* ---- MECÂNICO ---- */
  mecNome: {
    color: CORES.branco,
    fontSize: 14,
    fontWeight: '700',
  },
  mecLinha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  mecPlaca: {
    color: CORES.amarelo,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  mecData: {
    color: CORES.textoSuave,
    fontSize: 11,
  },
  mecRodape: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  mecVeiculo: {
    color: CORES.textoSuave,
    fontSize: 10,
  },
  botaoReceber: {
    marginBottom: 14,
  },
  botaoNova: {
    marginBottom: 24,
  },

  /* Vazio */
  vazioArea: {
    alignItems: 'center',
    marginTop: 40,
    paddingHorizontal: 32,
  },
  vazio: {
    color: CORES.textoSuave,
    fontSize: 12,
    textAlign: 'center',
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
