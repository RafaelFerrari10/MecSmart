import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import {
  Botao,
  Card,
  CORES,
  GradientBackground,
  ScreenHeader,
} from '@/components/ui';
import { PopupConfirmacao } from '@/components/popup-confirmacao';
import { pecaSelecionada } from '@/store';
import { excluirPeca } from '@/services/api';

const moeda = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`;

export default function DetalhesPecaScreen() {
  const [confirmando, setConfirmando] = useState(false);
  const peca = pecaSelecionada;

  if (!peca) {
    return (
      <View style={styles.container}>
        <GradientBackground />
        <View style={styles.inner}>
          <ScreenHeader titulo="Detalhes da Peça" voltar />
          <Text style={styles.ausente}>Nenhuma peça selecionada.</Text>
        </View>
      </View>
    );
  }

  const baixa = peca.estoqueAtual < peca.estoqueMinimo;
  const corEstoque = baixa ? CORES.vermelho : CORES.verde;

  return (
    <View style={styles.container}>
      <GradientBackground />
      <View style={styles.inner}>
        <ScreenHeader titulo="Detalhes da Peça" voltar />

        <ScrollView contentContainerStyle={styles.scroll}>
          <Card style={styles.card}>
            <Text style={styles.rotuloNome}>NOME DA PEÇA</Text>
            <Text style={styles.nome}>{peca.nome}</Text>

            <View style={styles.listaInfo}>
              <InfoLinha rotulo="Código" valor={peca.codigo} destaque={false} />
              <InfoLinha rotulo="Marca" valor={peca.marca} destaque={false} />
              <InfoLinha rotulo="Preço de Custo" valor={moeda(peca.precoCusto)} destaque={false} />
              <InfoLinha rotulo="Preço de Venda" valor={moeda(peca.precoVenda)} destaque={false} />
              <InfoLinha
                rotulo="Estoque Atual"
                valor={`${peca.estoqueAtual} unidades`}
                destaque={corEstoque}
              />
              <InfoLinha rotulo="Estoque Mínimo" valor={`${peca.estoqueMinimo} unidades`} destaque={false} />
              <InfoLinha rotulo="Status" valor="Ativo" destaque={CORES.verde} />
            </View>
          </Card>

          <Botao titulo="Editar Peça" onPress={() => router.push('/editar-peca')} estilo={styles.botaoEditar} />
          <Botao titulo="Movimentar Estoque" onPress={() => router.push('/movimentar-estoque')} estilo={styles.botaoMovimentar} />
          <Botao
            titulo="Excluir"
            variante="contorno"
            onPress={() => setConfirmando(true)}
            estilo={styles.botaoExcluir}
          />
        </ScrollView>
      </View>

      <PopupConfirmacao
        visivel={confirmando}
        titulo="Excluir peça"
        mensagem="Tem certeza que deseja excluir essa peça?"
        textoConfirmar="Excluir Peça"
        onCancelar={() => setConfirmando(false)}
        onConfirmar={() => {
          setConfirmando(false);
          excluirPeca(peca.id).catch(() => {});
          router.replace('/estoque');
        }}
      />
    </View>
  );
}

function InfoLinha({ rotulo, valor, destaque }: { rotulo: string; valor: string; destaque: string | false }) {
  return (
    <View style={styles.infoLinha}>
      <Text style={styles.infoRotulo}>{rotulo}</Text>
      <Text style={[styles.infoValor, destaque ? { color: destaque } : null]}>{valor}</Text>
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
  scroll: {
    paddingBottom: 32,
  },
  card: {
    marginBottom: 4,
  },
  rotuloNome: {
    color: CORES.textoSuave,
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  nome: {
    color: CORES.branco,
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 18,
  },
  listaInfo: {
    borderTopWidth: 1,
    borderTopColor: '#1F1F1F',
  },
  infoLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#1F1F1F',
  },
  infoRotulo: {
    color: CORES.textoSuave,
    fontSize: 12,
  },
  infoValor: {
    color: CORES.branco,
    fontSize: 12,
    fontWeight: '700',
  },
  botaoEditar: {
    marginTop: 20,
  },
  botaoMovimentar: {
    marginTop: 0,
  },
  botaoExcluir: {
    marginBottom: 10,
  },
  ausente: {
    color: CORES.textoSuave,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 40,
  },
});
