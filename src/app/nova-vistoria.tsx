import { useCallback, useEffect, useRef, useState } from 'react';import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useFocusEffect } from 'expo-router';
import { Botao, CORES, GradientBackground, ScreenHeader } from '@/components/ui';
import { criarVeiculo, listarVeiculos, type Veiculo } from '@/services/api';
import { vistoriaEmAndamento, usuarioLogado, veiculos as storeVeiculos } from '@/store';

const HORARIOS = ['09:00', '10:00', '12:30', '14:30', '15:40'];

export default function SolicitarVistoriaScreen() {
  const [veiculosCli, setVeiculosCli] = useState<Veiculo[]>([]);
  const [veiculoSelecionado, setVeiculoSelecionado] = useState<Veiculo | null>(null);
  const [problema, setProblema] = useState('');
  const [fotoAnexo, setFotoAnexo] = useState(vistoriaEmAndamento.veiculo.foto || '');
  const [horario, setHorario] = useState('');
  const [carregando, setCarregando] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    let ativo = true;
    (async () => {
      try {
        if (usuarioLogado?.uid) {
          const dados = await listarVeiculos(usuarioLogado.uid);
          if (ativo) {
            setVeiculosCli(dados.veiculos);
            if (dados.veiculos.length > 0) {
              setVeiculoSelecionado(dados.veiculos[dados.veiculos.length - 1]);
            }
          }
        }
      } catch {
        if (storeVeiculos.length > 0) {
          setVeiculosCli(storeVeiculos as unknown as Veiculo[]);
          setVeiculoSelecionado(storeVeiculos[storeVeiculos.length - 1] as unknown as Veiculo);
        }
      }
    })();
    return () => {
      ativo = false;
    };
  }, []);

  function trocarVeiculo() {
    if (veiculosCli.length <= 1) {
      Alert.alert('Aviso', 'Você só possui um veículo cadastrado.');
      return;
    }
    const atual = veiculoSelecionado?.id;
    const proximo = veiculosCli.find((v) => v.id !== atual);
    if (proximo) setVeiculoSelecionado(proximo);
  }

  useFocusEffect(
    useCallback(() => {
      if (vistoriaEmAndamento.veiculo.foto) {
        setFotoAnexo(vistoriaEmAndamento.veiculo.foto);
      }
    }, []),
  );

  async function solicitar() {
    if (!veiculoSelecionado) {
      Alert.alert('Atenção', 'Selecione um veículo.');
      return;
    }
    if (!problema.trim()) {
      Alert.alert('Atenção', 'Descreva o problema.');
      return;
    }
    if (!horario) {
      Alert.alert('Atenção', 'Selecione um horário disponível.');
      return;
    }

    vistoriaEmAndamento.veiculo = {
      ...vistoriaEmAndamento.veiculo,
      placa: veiculoSelecionado.placa,
      marca: veiculoSelecionado.marca,
      modelo: veiculoSelecionado.modelo,
      ano: veiculoSelecionado.ano,
      cor: veiculoSelecionado.cor,
      quilometragem: veiculoSelecionado.quilometragem,
      foto: veiculoSelecionado.foto || '',
      id: veiculoSelecionado.id,
    };
    vistoriaEmAndamento.observacoes = problema;
    vistoriaEmAndamento.data = horario;

    try {
      if (usuarioLogado?.tipo === 'cliente') {
        setCarregando(true);
        const criado = await criarVeiculo({
          clienteId: usuarioLogado.uid,
          placa: veiculoSelecionado.placa,
          marca: veiculoSelecionado.marca,
          modelo: veiculoSelecionado.modelo,
          ano: veiculoSelecionado.ano,
          cor: veiculoSelecionado.cor,
          quilometragem: veiculoSelecionado.quilometragem,
          foto: veiculoSelecionado.foto || null,
        });
        vistoriaEmAndamento.veiculo = {
          ...vistoriaEmAndamento.veiculo,
          id: criado.veiculo.id,
        };
      }
    } catch (erro) {
      Alert.alert(
        'Atenção',
        erro instanceof Error ? erro.message : 'Não foi possível registrar. Verifique o servidor.',
      );
      return;
    } finally {
      setCarregando(false);
    }

    router.push('/solicitacao');
  }

  return (
    <View style={styles.container}>
      <GradientBackground />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.inner}>
          <ScreenHeader titulo="Solicitar vistoria" voltar />

          <ScrollView
            ref={scrollRef}
            contentContainerStyle={styles.formulario}
            keyboardShouldPersistTaps="handled"
          >
            {/* Veículo selecionado */}
            {veiculoSelecionado ? (
              <>
                <Text style={styles.rotuloSecao}>Veículo selecionado</Text>
                <View style={styles.cardVeiculo}>
                  {veiculoSelecionado.foto ? (
                    <Image
                      source={{ uri: veiculoSelecionado.foto }}
                      style={styles.veiculoFoto}
                      contentFit="cover"
                    />
                  ) : (
                    <View style={[styles.veiculoFoto, styles.veiculoFotoPlaceholder]}>
                      <Ionicons name="car-outline" size={36} color={CORES.textoSuave} />
                    </View>
                  )}
                  <View style={styles.veiculoInfo}>
                    <Text style={styles.veiculoNome}>
                      {veiculoSelecionado.marca} {veiculoSelecionado.modelo}{' '}
                      {veiculoSelecionado.ano || ''}
                    </Text>
                    <Text style={styles.veiculoPlaca}>Placa: {veiculoSelecionado.placa}</Text>
                  </View>
                  <Pressable style={styles.trocaBotao} onPress={trocarVeiculo}>
                    <Text style={styles.trocaTexto}>Troca</Text>
                  </Pressable>
                </View>
              </>
            ) : (
              <View style={styles.semVeiculo}>
                <Text style={styles.semVeiculoTexto}>
                  Nenhum veículo cadastrado. Cadastre um antes de solicitar vistoria.
                </Text>
                <Botao
                  titulo="Cadastrar veículo"
                  variante="contorno"
                  onPress={() => router.back()}
                />
              </View>
            )}

            {/* Descreva o problema */}
            <Text style={styles.rotuloSecao}>Descreva o problema</Text>
            <View style={styles.campoContainer}>
              <Text style={styles.campoLabel}>Problema</Text>
              <TextInput
                style={styles.campoInput}
                value={problema}
                onChangeText={setProblema}
                placeholder="Ex: O pneu está furado, está fazendo um barulho estranho..."
                placeholderTextColor="#9A9A9A"
                multiline
              />
            </View>

            {/* Anexar imagem */}
            <Text style={styles.rotuloSecao}>Anexar imagem</Text>
            <Pressable
              style={({ pressed }) => [styles.fotoArea, pressed && { opacity: 0.7 }]}
              onPress={() => router.push('/foto-veiculo')}
            >
              {fotoAnexo ? (
                <Image source={{ uri: fotoAnexo }} style={styles.fotoAnexo} contentFit="cover" />
              ) : (
                <Ionicons name="camera-outline" size={30} color={CORES.textoSuave} />
              )}
            </Pressable>

            {/* Horários disponíveis */}
            <Text style={styles.rotuloSecao}>Horários disponíveis</Text>
            <View style={styles.horariosContainer}>
              <View style={styles.horariosLinha}>
                {HORARIOS.slice(0, 3).map((h) => (
                  <PilhaHorario
                    key={h}
                    hora={h}
                    ativo={horario === h}
                    onPress={() => setHorario(h)}
                  />
                ))}
              </View>
              <View style={styles.horariosLinha}>
                {HORARIOS.slice(3).map((h) => (
                  <PilhaHorario
                    key={h}
                    hora={h}
                    ativo={horario === h}
                    onPress={() => setHorario(h)}
                  />
                ))}
              </View>
            </View>

            <Botao
              titulo={carregando ? 'Enviando...' : 'Solicitar vistoria'}
              onPress={solicitar}
              estilo={styles.botaoEnviar}
            />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

function PilhaHorario({
  hora,
  ativo,
  onPress,
}: {
  hora: string;
  ativo: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.pilha,
        ativo && styles.pilhaAtiva,
        pressed && { opacity: 0.7 },
      ]}
    >
      <Text style={[styles.pilhaTexto, ativo && styles.pilhaTextoAtivo]}>{hora}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CORES.preto,
  },
  flex: {
    flex: 1,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 8,
  },
  formulario: {
    paddingBottom: 32,
  },
  rotuloSecao: {
    color: CORES.branco,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
    marginTop: 16,
  },

  /* Veículo card */
  cardVeiculo: {
    backgroundColor: CORES.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: CORES.cardBorder,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  veiculoFoto: {
    width: 100,
    height: 90,
    backgroundColor: CORES.input,
  },
  veiculoFotoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  veiculoInfo: {
    flex: 1,
    paddingLeft: 12,
  },
  veiculoNome: {
    color: CORES.branco,
    fontSize: 13,
    fontWeight: '700',
  },
  veiculoPlaca: {
    color: CORES.amarelo,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 4,
  },
  trocaBotao: {
    backgroundColor: CORES.vermelho,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginRight: 10,
  },
  trocaTexto: {
    color: CORES.branco,
    fontSize: 11,
    fontWeight: '700',
  },

  semVeiculo: {
    backgroundColor: CORES.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: CORES.cardBorder,
    padding: 16,
    alignItems: 'center',
    gap: 12,
  },
  semVeiculoTexto: {
    color: CORES.textoSuave,
    fontSize: 12,
    textAlign: 'center',
  },

  /* Problema */
  campoContainer: {
    marginBottom: 4,
  },
  campoLabel: {
    color: CORES.label,
    fontSize: 10,
    marginBottom: 6,
    marginLeft: 2,
  },
  campoInput: {
    height: 80,
    backgroundColor: CORES.input,
    borderRadius: 9,
    paddingHorizontal: 12,
    paddingTop: 10,
    color: CORES.branco,
    fontSize: 12,
    textAlignVertical: 'top',
  },

  /* Foto */
  fotoArea: {
    height: 130,
    backgroundColor: CORES.input,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  fotoAnexo: {
    width: '100%',
    height: '100%',
  },

  /* Horários */
  horariosContainer: {
    gap: 8,
    marginBottom: 8,
  },
  horariosLinha: {
    flexDirection: 'row',
    gap: 8,
  },
  pilha: {
    flex: 1,
    backgroundColor: CORES.input,
    borderRadius: 16,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pilhaAtiva: {
    backgroundColor: CORES.vermelho,
  },
  pilhaTexto: {
    color: CORES.textoSuave,
    fontSize: 12,
    fontWeight: '700',
  },
  pilhaTextoAtivo: {
    color: CORES.branco,
  },
  botaoEnviar: {
    marginTop: 16,
  },
});
