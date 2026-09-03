import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Card, CORES, GradientBackground, ScreenHeader, StatusBadge } from '@/components/ui';
import { listarOrdensServico } from '@/services/api';
import { buscarVeiculo, ordensServico, type OrdemServico } from '@/store';

export default function HistoricoScreen() {
  const [ordens, setOrdens] = useState<OrdemServico[]>(ordensServico);

  useEffect(() => {
    let ativo = true;
    (async () => {
      try {
        const { ordens: lista } = await listarOrdensServico();
        if (ativo && lista.length > 0) setOrdens(lista);
      } catch {
        // servidor indisponível: mantém o fallback do store
      }
    })();
    return () => { ativo = false; };
  }, []);

  return (
    <View style={styles.container}>
      <GradientBackground />
      <View style={styles.inner}>
        <ScreenHeader titulo="Histórico de vistorias" voltar />

        <FlatList
          contentContainerStyle={styles.listaConteudo}
          data={ordens}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <View style={styles.vazio}>
              <Text style={styles.vazioTitulo}>Nenhuma vistoria ainda</Text>
              <Text style={styles.vazioTexto}>
                As vistorias realizadas neste veículo aparecerão aqui.
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const veiculo = buscarVeiculo(item.veiculoId);
            return (
              <Pressable onPress={() => router.push('/resultado')}>
                <Card>
                  <View style={styles.linha}>
                    <Text style={styles.nome}>
                      {item.dataAbertura || '—'} · {veiculo?.placa ?? '—'}
                    </Text>
                    <StatusBadge status={item.status} />
                  </View>
                  <Text style={styles.detalhe}>
                    Nº {item.numero} · Vistoria em {item.dataAbertura || '—'}
                  </Text>
                  <Text style={styles.detalhe}>
                    Problemas: {item.problemas.length > 0 ? item.problemas.length : 'nenhum'}
                  </Text>
                </Card>
              </Pressable>
            );
          }}
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
  listaConteudo: {
    paddingBottom: 24,
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
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  nome: {
    color: CORES.branco,
    fontSize: 13,
    fontWeight: '700',
    flexShrink: 1,
  },
  detalhe: {
    color: CORES.textoSuave,
    fontSize: 11,
    marginTop: 4,
  },
});