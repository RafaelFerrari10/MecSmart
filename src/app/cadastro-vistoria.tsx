import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Botao, Campo, CORES, GradientBackground, ScreenHeader } from '@/components/ui';
import { VEICULO_VAZIO, vistoriaEmAndamento } from '@/store';

export default function CadastroVistoriaScreen() {
  const [placa, setPlaca] = useState(vistoriaEmAndamento.veiculo.placa || VEICULO_VAZIO.placa);
  const [marca, setMarca] = useState(vistoriaEmAndamento.veiculo.marca);
  const [modelo, setModelo] = useState(vistoriaEmAndamento.veiculo.modelo);
  const [ano, setAno] = useState(
    vistoriaEmAndamento.veiculo.ano ? String(vistoriaEmAndamento.veiculo.ano) : '',
  );
  const [cor, setCor] = useState(vistoriaEmAndamento.veiculo.cor);
  const [km, setKm] = useState(
    vistoriaEmAndamento.veiculo.quilometragem
      ? String(vistoriaEmAndamento.veiculo.quilometragem)
      : '',
  );
  const [dia, setDia] = useState(vistoriaEmAndamento.data);
  const [problemas, setProblemas] = useState(vistoriaEmAndamento.problemasIdentificados);

  function continuar() {
    vistoriaEmAndamento.data = dia.trim();
    vistoriaEmAndamento.problemasIdentificados = problemas;
    vistoriaEmAndamento.veiculo = {
      ...vistoriaEmAndamento.veiculo,
      placa: placa.trim(),
      marca: marca.trim(),
      modelo: modelo.trim(),
      ano: ano ? Number(ano) : 0,
      cor: cor.trim(),
      quilometragem: km ? Number(km) : 0,
    };
    router.push('/checklist');
  }

  return (
    <View style={styles.container}>
      <GradientBackground />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.inner}>
          <ScreenHeader titulo="Cadastro da vistoria" voltar />

          <ScrollView contentContainerStyle={styles.formulario} keyboardShouldPersistTaps="handled">
            <Campo label="Dia" value={dia} onChangeText={setDia} placeholder="dd/mm/aaaa" />
            <Campo label="Placa" value={placa} onChangeText={setPlaca} placeholder="ABC-1234" autoCapitalize="characters" />
            <Campo label="Marca" value={marca} onChangeText={setMarca} placeholder="Ex.: Fiat" />
            <Campo label="Modelo" value={modelo} onChangeText={setModelo} placeholder="Ex.: Palio" />
            <Campo label="Ano" value={ano} onChangeText={setAno} placeholder="2024" keyboardType="number-pad" />
            <Campo label="Cor" value={cor} onChangeText={setCor} placeholder="Ex.: Prata" />
            <Campo label="Quilometragem (km)" value={km} onChangeText={setKm} placeholder="Ex.: 50000" keyboardType="number-pad" />
            <Campo
              label="Problemas identificados"
              value={problemas}
              onChangeText={setProblemas}
              placeholder="Descreva os problemas encontrados"
              multiline
            />

            <Botao titulo="Continuar" onPress={continuar} />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </View>
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
});