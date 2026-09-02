import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Botao, Card, CORES, GradientBackground, ScreenHeader } from '@/components/ui';
import { perfilAtual, usuarioLogado, CODIGO_MECANICO } from '@/store';

const ROTULOS_PERFIL: Record<typeof perfilAtual, string> = {
  cliente: 'Cliente',
  mecanico: 'Mecânico',
};

export default function PerfilScreen() {
  const nome = usuarioLogado?.nome ?? '—';
  const email = usuarioLogado?.email ?? '—';
  const cpf = usuarioLogado?.cpf ?? '—';
  const telefone = usuarioLogado?.telefone ?? '—';
  const dataNascimento = usuarioLogado?.dataNascimento ?? '—';

  return (
    <View style={styles.container}>
      <GradientBackground />
      <View style={styles.inner}>
        <ScreenHeader titulo="Perfil" voltar />

        <View style={styles.avatar}>
          <Ionicons name="person-circle" size={72} color={CORES.vermelho} />
          <Text style={styles.nome}>{nome}</Text>
          <View style={styles.rotuloPerfil}>
            <Text style={styles.rotuloPerfilTexto}>{ROTULOS_PERFIL[perfilAtual]}</Text>
          </View>
        </View>

        <Card>
          <Text style={styles.titulo}>Dados da conta</Text>
          <LinhaPerfil rotulo="Nome completo" valor={nome} />
          <LinhaPerfil rotulo="Email" valor={email} />
          <LinhaPerfil rotulo="CPF" valor={cpf} />
          <LinhaPerfil rotulo="Telefone" valor={telefone} />
          <LinhaPerfil rotulo="Data de nascimento" valor={dataNascimento} />
          <LinhaPerfil rotulo="Perfil" valor={ROTULOS_PERFIL[perfilAtual]} />
          {perfilAtual === 'mecanico' && (
            <>
              <LinhaPerfil rotulo="Especialidade" valor={usuarioLogado?.especialidade ?? '—'} />
              <LinhaPerfil rotulo="Sua chave (código)" valor={CODIGO_MECANICO} />
            </>
          )}
          {perfilAtual === 'cliente' && (
            <>
              <LinhaPerfil rotulo="Endereço" valor={usuarioLogado?.endereco ?? '—'} />
              <LinhaPerfil rotulo="Complemento" valor={usuarioLogado?.complemento ?? '—'} />
            </>
          )}
        </Card>

        <Botao
          variante="contorno"
          titulo="Sair da conta"
          onPress={() => router.replace('/login')}
        />
      </View>
    </View>
  );
}

function LinhaPerfil({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <View style={styles.linha}>
      <Text style={styles.rotulo}>{rotulo}</Text>
      <Text style={styles.valor}>{valor}</Text>
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
  avatar: {
    alignItems: 'center',
    marginBottom: 18,
  },
  nome: {
    color: CORES.branco,
    fontSize: 16,
    fontWeight: '800',
    marginTop: 4,
  },
  rotuloPerfil: {
    backgroundColor: CORES.vermelho,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 3,
    marginTop: 8,
  },
  rotuloPerfilTexto: {
    color: CORES.branco,
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  titulo: {
    color: CORES.branco,
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 10,
  },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1F1F1F',
  },
  rotulo: {
    color: CORES.textoSuave,
    fontSize: 11,
  },
  valor: {
    color: CORES.branco,
    fontSize: 12,
    fontWeight: '700',
  },
});