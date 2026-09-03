import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { CORES, GradientBackground } from '@/components/ui';
import { listarVeiculos } from '@/services/api';
import {
  ordensServico,
  perfilAtual,
  usuarioLogado,
  veiculos,
  type OrdemServico,
  type Veiculo,
} from '@/store';

export default function HomeScreen() {
  const mecanico = perfilAtual === 'mecanico';
  const nome = usuarioLogado?.nome ?? '';

  return (
    <View style={styles.container}>
      <GradientBackground />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.inner}>
          {mecanico ? (
            <MechanicHome nome={nome} />
          ) : (
            <ClientHome nome={nome} />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  CLIENTE                                                            */
/* ------------------------------------------------------------------ */
function ClientHome({ nome }: { nome: string }) {
  const [veiculosCli, setVeiculosCli] = useState<Veiculo[]>(veiculos);

  useEffect(() => {
    let ativo = true;
    (async () => {
      try {
        if (usuarioLogado?.uid) {
          const dados = await listarVeiculos(usuarioLogado.uid);
          if (ativo && dados.veiculos.length > 0) {
            const convertidos: Veiculo[] = dados.veiculos.map((v) => ({
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
            }));
            setVeiculosCli(convertidos);
          }
        }
      } catch {
        // servidor indisponível
      }
    })();
    return () => {
      ativo = false;
    };
  }, []);

  const temVeiculo = veiculosCli.length > 0;
  const primeiroVeiculo = veiculosCli[veiculosCli.length - 1];

  return (
    <>
      {/* Logo */}
      <View style={styles.logoArea}>
        <Image
          source={require('@/assets/images/Logo.png')}
          style={styles.logo}
          contentFit="contain"
        />
      </View>

      <Text style={styles.saudacao}>Bem vindo {nome}!</Text>

      {!temVeiculo ? (
        <>
          <Text style={styles.sub}>Cadastre seu primeiro carro!</Text>
          <Pressable
            style={({ pressed }) => [styles.cardCadastro, pressed && { opacity: 0.7 }]}
            onPress={() => router.push('/nova-vistoria')}
          >
            <Ionicons name="car-outline" size={36} color={CORES.vermelho} />
            <Text style={styles.cardCadastroTexto}>Cadastrar carro</Text>
          </Pressable>
        </>
      ) : (
        <>
          <Text style={styles.secao}>Seu carro</Text>
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
              {primeiroVeiculo.modelo || primeiroVeiculo.marca}
            </Text>
          </Pressable>

          {veiculosCli.length > 1 && (
            <Text style={styles.adicionarTexto}>
              Você tem {veiculosCli.length} veículos cadastrados
            </Text>
          )}

          <Pressable
            style={({ pressed }) => [styles.cardAdicionar, pressed && { opacity: 0.7 }]}
            onPress={() => router.push('/nova-vistoria')}
          >
            <Text style={styles.cardAdicionarTexto}>Adicionar outro carro</Text>
          </Pressable>
        </>
      )}

      <Text style={styles.secao}>Vistorias</Text>
      <Pressable
        style={({ pressed }) => [styles.cardNovaVistoria, pressed && { opacity: 0.7 }]}
        onPress={() => router.push('/nova-vistoria')}
      >
        <View style={styles.cardNovaVistoriaIcone}>
          <Ionicons name="add" size={32} color={CORES.branco} />
        </View>
        <Text style={styles.cardNovaVistoriaTexto}>Nova vistoria</Text>
      </Pressable>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  MECÂNICO                                                           */
/* ------------------------------------------------------------------ */
function MechanicHome({ nome }: { nome: string }) {
  const hoje = new Date().toLocaleDateString('pt-BR');

  const paraHoje = ordensServico.filter(
    (o: OrdemServico) => o.dataAbertura === hoje && o.status === 'PENDENTE',
  ).length;
  const emAndamento = ordensServico.filter(
    (o: OrdemServico) =>
      o.status === 'EM ANÁLISE' || o.status === 'VISTORIA REALIZADA' || o.status === 'AGUARDANDO APROVAÇÃO',
  ).length;
  const finalizados = ordensServico.filter(
    (o: OrdemServico) => o.status === 'APROVADA' || o.status === 'RETIRADA SOLICITADA',
  ).length;

  return (
    <>
      {/* Logo */}
      <View style={styles.logoArea}>
        <Image
          source={require('@/assets/images/Logo.png')}
          style={styles.logo}
          contentFit="contain"
        />
      </View>

      <Text style={styles.saudacao}>Bem vindo {nome}!</Text>

      <Text style={styles.secao}>Serviços</Text>

      <View style={styles.indicadores}>
        <View style={[styles.indicadorCard, { borderColor: CORES.amarelo }]}>
          <Text style={[styles.indicadorValor, { color: CORES.amarelo }]}>{paraHoje}</Text>
          <Text style={styles.indicadorLabel}>Para hoje</Text>
        </View>
        <View style={[styles.indicadorCard, { borderColor: CORES.azul }]}>
          <Text style={[styles.indicadorValor, { color: CORES.azul }]}>{emAndamento}</Text>
          <Text style={styles.indicadorLabel}>Em andamento</Text>
        </View>
        <View style={[styles.indicadorCard, { borderColor: CORES.verde }]}>
          <Text style={[styles.indicadorValor, { color: CORES.verde }]}>{finalizados}</Text>
          <Text style={styles.indicadorLabel}>Finalizados</Text>
        </View>
      </View>

      <Pressable
        style={({ pressed }) => [styles.botaoEstoque, pressed && { opacity: 0.7 }]}
        onPress={() => router.push('/vistorias')}
      >
        <Text style={styles.botaoEstoqueTexto}>Estoque</Text>
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CORES.preto,
  },
  scroll: {
    flexGrow: 1,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 8,
    paddingBottom: 32,
  },

  /* Logo */
  logoArea: {
    alignItems: 'center',
    marginTop: 36,
    marginBottom: 6,
  },
  logo: {
    width: 140,
    height: 50,
  },

  /* Saudação */
  saudacao: {
    color: CORES.branco,
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 20,
  },
  sub: {
    color: CORES.textoSuave,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 18,
  },

  /* Seções */
  secao: {
    color: CORES.branco,
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 10,
  },

  /* ---- CLIENTE ---- */
  cardCadastro: {
    backgroundColor: CORES.branco,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 28,
    marginBottom: 22,
  },
  cardCadastroTexto: {
    color: CORES.preto,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 8,
  },
  cardCarro: {
    backgroundColor: CORES.branco,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 10,
  },
  carroFoto: {
    width: '100%',
    height: 160,
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
  adicionarTexto: {
    color: CORES.textoSuave,
    fontSize: 11,
    marginBottom: 8,
  },
  cardAdicionar: {
    backgroundColor: CORES.input,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 22,
  },
  cardAdicionarTexto: {
    color: CORES.branco,
    fontSize: 12,
    fontWeight: '700',
  },
  cardNovaVistoria: {
    backgroundColor: CORES.branco,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 28,
    marginBottom: 24,
  },
  cardNovaVistoriaIcone: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: CORES.vermelho,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardNovaVistoriaTexto: {
    color: CORES.preto,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 10,
  },

  /* ---- MECÂNICO ---- */
  indicadores: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 22,
  },
  indicadorCard: {
    flex: 1,
    backgroundColor: CORES.card,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 6,
  },
  indicadorValor: {
    fontSize: 26,
    fontWeight: '900',
    marginBottom: 4,
  },
  indicadorLabel: {
    color: CORES.textoSuave,
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  botaoEstoque: {
    height: 44,
    borderRadius: 10,
    backgroundColor: CORES.vermelho,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoEstoqueTexto: {
    color: CORES.branco,
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
});
