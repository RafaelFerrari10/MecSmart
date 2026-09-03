import { Alert, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Botao, Card, CORES, GradientBackground, ScreenHeader, StatusBadge } from '@/components/ui';
import {
  CODIGO_MECANICO,
  codigoMecanicoSolicitado,
  definirOsIdEmAndamento,
  perfilAtual,
  vistoriaEmAndamento,
} from '@/store';
import { criarOrdemServico, criarVeiculo } from '@/services/api';

export default function SolicitacaoScreen() {
  const mecanico = perfilAtual === 'mecanico';

  async function receber() {
    if (codigoMecanicoSolicitado.trim() !== CODIGO_MECANICO) {
      Alert.alert(
        'Código não confere',
        'A chave indicada pelo cliente não é a sua. A vistoria permanece aguardando o mecânico correto.',
      );
      return;
    }

    try {
      // Garante que o veículo exista no backend
      let veiculoId = vistoriaEmAndamento.veiculo.id;
      const v = vistoriaEmAndamento.veiculo;
      if (!veiculoId) {
        if (!v.placa || !v.marca || !v.modelo) {
          Alert.alert('Atenção', 'Dados do veículo incompletos. Volte e preencha os dados da vistoria.');
          return;
        }
        const criado = await criarVeiculo({
          clienteId: v.clienteId,
          placa: v.placa,
          marca: v.marca,
          modelo: v.modelo,
          ano: v.ano,
          cor: v.cor,
          quilometragem: v.quilometragem,
          foto: v.foto || null,
        });
        veiculoId = criado.veiculo.id;
        vistoriaEmAndamento.veiculo.id = veiculoId;
      }

      // Cria a ordem de serviço no backend
      const criada = await criarOrdemServico({
        clienteId: vistoriaEmAndamento.veiculo.clienteId,
        veiculoId,
        status: 'EM ANÁLISE',
        dataAbertura: vistoriaEmAndamento.data || new Date().toLocaleDateString('pt-BR'),
        observacoes: vistoriaEmAndamento.observacoes,
        problemas: [],
        condicao: 'ok',
        checklist: vistoriaEmAndamento.checklist,
      });

      definirOsIdEmAndamento(criada.ordem.id);
      router.replace('/cadastro-vistoria');
    } catch (erro) {
      Alert.alert(
        'Erro ao receber',
        erro instanceof Error ? erro.message : 'Não foi possível iniciar a vistoria.',
      );
    }
  }

  return (
    <View style={styles.container}>
      <GradientBackground />
      <View style={styles.inner}>
        <ScreenHeader titulo="Solicitação" voltar />

        <Card style={styles.cartao}>
          <Ionicons
            name={mecanico ? 'car' : 'checkmark-circle'}
            size={40}
            color={mecanico ? CORES.amarelo : CORES.verde}
          />
          <Text style={styles.titulo}>
            {mecanico ? 'Nova vistoria aguardando' : 'Solicitação enviada!'}
          </Text>
          <Text style={styles.texto}>
            {mecanico
              ? 'Um cliente indicou você para a vistoria. Insira o seu código para receber o atendimento.'
              : 'Sua solicitação foi registrada e está aguardando o atendimento do mecânico escolhido.'}
          </Text>

          <View style={styles.badge}>
            <StatusBadge status="PENDENTE" />
          </View>

          <View style={styles.codigoBox}>
            <Text style={styles.codigoRotulo}>
              {mecanico ? 'Código indicado pelo cliente' : 'Código do mecânico escolhido'}
            </Text>
            <Text style={styles.codigoValor}>{codigoMecanicoSolicitado || '—'}</Text>
          </View>

          {mecanico ? (
            <View style={styles.mecanicoArea}>
              <Text style={styles.minhaChave}>
                Sua chave: <Text style={styles.minhaChaveValor}>{CODIGO_MECANICO}</Text>
              </Text>
              <Botao titulo="Receber vistoria" onPress={receber} />
            </View>
          ) : (
            <Botao titulo="Aguardando mecânico" onPress={() => router.push('/home')} />
          )}
        </Card>
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
  cartao: {
    alignItems: 'center',
    marginTop: 24,
    paddingVertical: 32,
  },
  titulo: {
    color: CORES.branco,
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 14,
  },
  texto: {
    color: CORES.textoSuave,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 10,
  },
  badge: {
    marginTop: 18,
  },
  codigoBox: {
    alignSelf: 'stretch',
    alignItems: 'center',
    backgroundColor: CORES.input,
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 16,
  },
  codigoRotulo: {
    color: CORES.textoSuave,
    fontSize: 9,
    textTransform: 'uppercase',
  },
  codigoValor: {
    color: CORES.amarelo,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
    marginTop: 2,
  },
  mecanicoArea: {
    alignSelf: 'stretch',
    marginTop: 16,
  },
  minhaChave: {
    color: CORES.textoSuave,
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 4,
  },
  minhaChaveValor: {
    color: CORES.amarelo,
    fontWeight: '800',
    letterSpacing: 1,
  },
});