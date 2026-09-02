import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Botao, Campo, CONDICAO_CORES, CONDICAO_LABEL, CORES, GradientBackground, ScreenHeader } from '@/components/ui';
import { itemChecklistInicial, type Condicao } from '@/store';

const OPCOES: Condicao[] = ['ok', 'atencao', 'problema'];
const ICONES: Record<Condicao, string> = { ok: 'checkmark', atencao: 'warning', problema: 'close' };

export default function ChecklistScreen() {
  const [checklist, setChecklist] = useState(itemChecklistInicial());
  const [observacoes, setObservacoes] = useState('');

  function definirCondicao(index: number, condicao: Condicao) {
    setChecklist((atual) =>
      atual.map((item, i) => (i === index ? { ...item, condicao } : item)),
    );
  }

  function continuar() {
    router.push('/saude');
  }

  return (
    <View style={styles.container}>
      <GradientBackground />
      <View style={styles.inner}>
        <ScreenHeader titulo="Checklist do carro" voltar />

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.legenda}>
            {OPCOES.map((opcao) => (
              <View key={opcao} style={styles.legendaItem}>
                <View style={[styles.bolinha, { backgroundColor: CONDICAO_CORES[opcao] }]} />
                <Text style={styles.legendaTexto}>{CONDICAO_LABEL[opcao]}</Text>
              </View>
            ))}
          </View>

          {checklist.map((item, index) => (
            <View key={item.nome} style={styles.item}>
              <Text style={styles.itemNome}>{item.nome}</Text>
              <View style={styles.opcoes}>
                {OPCOES.map((opcao) => {
                  const selecionada = item.condicao === opcao;
                  return (
                    <Pressable
                      key={opcao}
                      onPress={() => definirCondicao(index, opcao)}
                      style={[
                        styles.opcao,
                        selecionada && { borderColor: CONDICAO_CORES[opcao], backgroundColor: CONDICAO_CORES[opcao] },
                      ]}
                    >
                      <Text
                        style={[
                          styles.opcaoTexto,
                          selecionada && { color: CORES.preto },
                        ]}
                      >
                        {ICONES[opcao]} {CONDICAO_LABEL[opcao]}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ))}

          <Campo
            label="Observações"
            value={observacoes}
            onChangeText={setObservacoes}
            placeholder="Observações gerais do veículo"
            multiline
          />

          <Botao titulo="Continuar" onPress={continuar} />
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
  legenda: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 6,
  },
  legendaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bolinha: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendaTexto: {
    color: CORES.textoSuave,
    fontSize: 10,
  },
  item: {
    backgroundColor: CORES.card,
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
  },
  itemNome: {
    color: CORES.branco,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  opcoes: {
    flexDirection: 'row',
    gap: 6,
  },
  opcao: {
    flex: 1,
    height: 32,
    borderWidth: 1,
    borderColor: CORES.cardBorder,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  opcaoTexto: {
    color: CORES.textoSuave,
    fontSize: 9,
    fontWeight: '700',
  },
});