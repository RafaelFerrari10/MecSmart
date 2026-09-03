import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import {
  Botao,
  Card,
  CONDICAO_LABEL,
  CondicaoItem,
  CORES,
  GradientBackground,
  InfoCard,
  Linha,
  ScreenHeader,
  StatusBadge,
} from '@/components/ui';
import { listarOrdensServico } from '@/services/api';
import { buscarUsuario, buscarVeiculo, ordensServico, type OrdemServico } from '@/store';

export default function ResultadoScreen() {
  const [os, setOs] = useState<OrdemServico | null>(ordensServico[0] ?? null);

  useEffect(() => {
    let ativo = true;
    (async () => {
      try {
        const { ordens } = await listarOrdensServico();
        if (ativo && ordens.length > 0) setOs(ordens[0]);
      } catch {
        // servidor indisponível; mantém o fallback do store
      }
    })();
    return () => { ativo = false; };
  }, []);

  const veiculo = os ? buscarVeiculo(os.veiculoId) : undefined;
  const mecanico = os ? buscarUsuario(os.mecanicoId) : undefined;
  const nomeVeiculo = veiculo ? `${veiculo.marca} ${veiculo.modelo}`.trim() : '—';
  const problemas = os?.problemas ?? [];

  return (
    <View style={styles.container}>
      <GradientBackground />
      <View style={styles.inner}>
        <ScreenHeader titulo="Resultado da vistoria" voltar />

        <Card>
          <Text style={styles.titulo}>Informações</Text>
          <Linha>
            <InfoCard rotulo="Data" valor={os?.dataAbertura || '—'} />
            <InfoCard rotulo="Mecânico" valor={mecanico?.nome ?? '—'} />
          </Linha>
          <Linha>
            <InfoCard rotulo="Veículo" valor={nomeVeiculo} />
            <InfoCard rotulo="Placa" valor={veiculo?.placa || '—'} />
          </Linha>
          <View style={styles.badge}>
            <StatusBadge status={os?.status ?? 'PENDENTE'} />
          </View>
        </Card>

        <Card>
          <Text style={styles.titulo}>Saúde do veículo</Text>
          <CondicaoItem nome="Condição geral" condicao={os?.condicao ?? 'ok'} />
          <CondicaoItem
            nome="Problemas encontrados"
            condicao={problemas.length > 0 ? 'problema' : 'ok'}
          />
        </Card>

        <Card>
          <Text style={styles.titulo}>Checklist</Text>
          <Text style={styles.detalhe}>
            {problemas.length > 0
              ? problemas.join(', ')
              : `${CONDICAO_LABEL.ok} — veículo avaliado pelo mecânico.`}
          </Text>
        </Card>

        <Card>
          <Text style={styles.titulo}>Observações</Text>
          <Text style={styles.detalhe}>{os?.observacoes || 'Sem observações registradas.'}</Text>
        </Card>

        <Botao titulo="Aprovar vistoria" onPress={() => router.push('/aprovacao')} />
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
  titulo: {
    color: CORES.branco,
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 12,
  },
  badge: {
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  detalhe: {
    color: CORES.textoSuave,
    fontSize: 12,
    lineHeight: 18,
  },
});