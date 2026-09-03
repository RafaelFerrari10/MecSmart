import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import {
  Botao,
  Campo,
  CORES,
  GradientBackground,
  ScreenHeader,
} from '@/components/ui';
import { listarPecas, criarItemOS, type Peca } from '@/services/api';

export default function CadastrarItemOSScreen() {
  const [ordemServicoId, setOrdemServicoId] = useState('');
  const [tipo, setTipo] = useState<'peca' | 'servico'>('peca');
  const [pecas, setPecas] = useState<Peca[]>([]);
  const [pecaId, setPecaId] = useState('');
  const [quantidade, setQuantidade] = useState('1');
  const [nome, setNome] = useState('');
  const [precoUnitario, setPrecoUnitario] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const dados = await listarPecas();
        setPecas(dados.pecas);
      } catch {
        setPecas([]);
      }
    })();
  }, []);

  const salvar = async () => {
    if (!ordemServicoId.trim()) {
      Alert.alert('Atenção', 'Informe o código da ordem de serviço.');
      return;
    }

    const qtd = parseInt(quantidade, 10) || 0;
    if (qtd <= 0) {
      Alert.alert('Atenção', 'Informe uma quantidade válida.');
      return;
    }

    const dados =
      tipo === 'peca'
        ? {
            ordemServicoId: ordemServicoId.trim(),
            tipo: 'peca' as const,
            itemId: pecaId,
            quantidade: qtd,
          }
        : {
            ordemServicoId: ordemServicoId.trim(),
            tipo: 'servico' as const,
            nome: nome.trim(),
            quantidade: qtd,
            precoUnitario: parseFloat(precoUnitario.replace(',', '.')) || 0,
          };

    if (tipo === 'peca' && !pecaId) {
      Alert.alert('Atenção', 'Selecione uma peça.');
      return;
    }
    if (tipo === 'servico' && (!nome.trim() || !precoUnitario)) {
      Alert.alert('Atenção', 'Preencha o nome e o preço do serviço.');
      return;
    }

    try {
      await criarItemOS(dados);
      router.replace('/itens-os');
    } catch (erro) {
      Alert.alert('Erro ao salvar', erro instanceof Error ? erro.message : 'Tente novamente.');
    }
  };

  return (
    <View style={styles.container}>
      <GradientBackground />
      <View style={styles.inner}>
        <ScreenHeader titulo="Adicionar Item" voltar />

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Campo label="Ordem de Serviço" placeholder="Ex: OS-2026-002" value={ordemServicoId} onChangeText={setOrdemServicoId} />

          <Text style={styles.subsecao}>Tipo de Item</Text>
          <View style={styles.tipoArea}>
            <Pressable
              style={[styles.tipoBtn, tipo === 'peca' && styles.tipoBtnSelecionado]}
              onPress={() => setTipo('peca')}
            >
              <Text style={[styles.tipoBtnTexto, tipo === 'peca' && styles.tipoBtnTextoSelecionado]}>Peça</Text>
            </Pressable>
            <Pressable
              style={[styles.tipoBtn, tipo === 'servico' && styles.tipoBtnSelecionado]}
              onPress={() => setTipo('servico')}
            >
              <Text style={[styles.tipoBtnTexto, tipo === 'servico' && styles.tipoBtnTextoSelecionado]}>Serviço</Text>
            </Pressable>
          </View>

          {tipo === 'peca' ? (
            <>
              <Text style={styles.subsecao}>Peça</Text>
              {pecas.length === 0 ? (
                <Text style={styles.vazio}>Nenhuma peça cadastrada.</Text>
              ) : (
                pecas.map((p) => (
                  <Pressable
                    key={p.id}
                    style={[styles.selRow, pecaId === p.id && styles.selRowSelecionado]}
                    onPress={() => setPecaId(p.id)}
                  >
                    <Text style={styles.selText}>
                      {p.nome} — {p.codigo}
                    </Text>
                    <Text style={styles.selEstoque}>Estoque: {p.estoqueAtual}</Text>
                  </Pressable>
                ))
              )}
            </>
          ) : (
            <>
              <Campo label="Nome do Serviço" placeholder="Ex: Troca de óleo" value={nome} onChangeText={setNome} />
              <Campo label="Preço Unitário (R$)" keyboardType="decimal-pad" value={precoUnitario} onChangeText={setPrecoUnitario} />
            </>
          )}

          <Campo label="Quantidade" keyboardType="number-pad" value={quantidade} onChangeText={setQuantidade} />

          <Botao titulo="Adicionar Item" onPress={salvar} estilo={styles.botao} />
        </ScrollView>
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
  scroll: {
    paddingBottom: 32,
  },
  subsecao: {
    color: CORES.branco,
    fontSize: 13,
    fontWeight: '800',
    marginTop: 14,
    marginBottom: 10,
  },
  tipoArea: {
    flexDirection: 'row',
    gap: 10,
  },
  tipoBtn: {
    flex: 1,
    height: 38,
    backgroundColor: CORES.input,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: CORES.cardBorder,
  },
  tipoBtnSelecionado: {
    backgroundColor: CORES.vermelho,
    borderColor: CORES.vermelho,
  },
  tipoBtnTexto: {
    color: CORES.textoSuave,
    fontSize: 12,
    fontWeight: '700',
  },
  tipoBtnTextoSelecionado: {
    color: CORES.branco,
  },
  selRow: {
    backgroundColor: CORES.input,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: CORES.cardBorder,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
  },
  selRowSelecionado: {
    backgroundColor: CORES.vermelho,
    borderColor: CORES.vermelho,
  },
  selText: {
    color: CORES.textoSuave,
    fontSize: 12,
    fontWeight: '600',
  },
  selEstoque: {
    color: CORES.textoSuave,
    fontSize: 10,
    marginTop: 3,
  },
  vazio: {
    color: CORES.textoSuave,
    fontSize: 12,
    marginBottom: 10,
  },
  botao: {
    marginTop: 24,
  },
});
