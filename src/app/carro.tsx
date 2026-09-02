import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import {
  Botao,
  Card,
  CORES,
  GradientBackground,
  InfoCard,
  Linha,
  ScreenHeader,
  StatusBadge,
} from '@/components/ui';
import { VEICULO_VAZIO, ordensServico } from '@/store';
import { listarVeiculos, tipoVeiculo, type Veiculo } from '@/services/api';
import { usuarioLogado } from '@/store';

export default function CarroScreen() {
  const [veiculo, setVeiculo] = useState<Veiculo | null>(null);
  const os = ordensServico[0];
  const problemas = os?.problemas ?? [];

  useEffect(() => {
    let ativo = true;
    (async () => {
      try {
        if (usuarioLogado?.tipo === 'cliente') {
          const dados = await listarVeiculos(usuarioLogado.uid);
          if (ativo && dados.veiculos.length > 0) {
            setVeiculo(tipoVeiculo(dados.veiculos[dados.veiculos.length - 1]));
          }
        }
      } catch {
        // servidor indisponível: mantém vazio
      }
    })();
    return () => {
      ativo = false;
    };
  }, []);

  const exibido = veiculo
    ? {
        id: veiculo.id,
        clienteId: veiculo.clienteId,
        placa: veiculo.placa,
        marca: veiculo.marca,
        modelo: veiculo.modelo,
        ano: veiculo.ano,
        cor: veiculo.cor,
        quilometragem: veiculo.quilometragem,
        foto: veiculo.foto ?? '',
        ativo: veiculo.ativo,
      }
    : VEICULO_VAZIO;

  return (
    <View style={styles.container}>
      <GradientBackground />
      <View style={styles.inner}>
        <ScreenHeader titulo="Veículo" voltar />

        <View style={styles.foto}>
          {exibido.foto ? (
            <Image source={{ uri: exibido.foto }} style={styles.fotoImagem} contentFit="cover" />
          ) : (
            <Text style={styles.fotoTexto}>Foto do veículo</Text>
          )}
        </View>

        <Card>
          <Text style={styles.titulo}>Dados do veículo</Text>
          <Linha>
            <InfoCard rotulo="Marca" valor={exibido.marca || '—'} />
            <InfoCard rotulo="Modelo" valor={exibido.modelo || '—'} />
          </Linha>
          <Linha>
            <InfoCard rotulo="Placa" valor={exibido.placa || '—'} />
            <InfoCard rotulo="Ano" valor={exibido.ano ? String(exibido.ano) : '—'} />
          </Linha>
          <Linha>
            <InfoCard rotulo="Cor" valor={exibido.cor || '—'} />
            <InfoCard
              rotulo="Quilometragem"
              valor={exibido.quilometragem ? `${exibido.quilometragem.toLocaleString('pt-BR')} km` : '—'}
            />
          </Linha>
        </Card>

        <Card>
          <Text style={styles.titulo}>Última vistoria</Text>
          {os ? (
            <>
              <Text style={styles.vazia}>Nº {os.numero} · {os.dataAbertura}</Text>
              <View style={styles.status}>
                <StatusBadge status={os.status} />
              </View>
            </>
          ) : (
            <Text style={styles.vazia}>Nenhuma vistoria registrada ainda.</Text>
          )}
        </Card>

        <Card>
          <Text style={styles.titulo}>Problemas encontrados</Text>
          <Text style={styles.vazia}>
            {problemas.length > 0 ? problemas.join(', ') : 'Nenhum problema registrado.'}
          </Text>
        </Card>

        <Botao titulo="Histórico de vistorias" onPress={() => router.push('/historico')} />
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
  foto: {
    height: 150,
    backgroundColor: CORES.input,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    overflow: 'hidden',
  },
  fotoImagem: {
    width: '100%',
    height: '100%',
  },
  fotoTexto: {
    color: CORES.textoSuave,
    fontSize: 12,
  },
  titulo: {
    color: CORES.branco,
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 12,
  },
  vazia: {
    color: CORES.textoSuave,
    fontSize: 12,
  },
  status: {
    marginTop: 10,
    alignSelf: 'flex-start',
  },
});