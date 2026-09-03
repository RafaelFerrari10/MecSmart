import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Botao, Card, CORES, GradientBackground, ScreenHeader } from '@/components/ui';
import { perfilAtual, usuarioLogado, CODIGO_MECANICO } from '@/store';

const ROTULOS_PERFIL: Record<'cliente' | 'mecanico', string> = {
  cliente: 'Cliente',
  mecanico: 'Mecânico',
};

export default function PerfilScreen() {
  const nome = usuarioLogado?.nome ?? '—';
  const email = usuarioLogado?.email ?? '—';
  const cpf = usuarioLogado?.cpf ?? '—';
  const telefone = usuarioLogado?.telefone ?? '—';
  const dataNascimento = usuarioLogado?.dataNascimento ?? '—';

  function handleSair() {
    Alert.alert('Sair da conta', 'Deseja realmente sair?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: () => router.replace('/login') },
    ]);
  }

  return (
    <View style={styles.container}>
      <GradientBackground />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.inner}>
          <ScreenHeader titulo="Perfil" voltar />

          {/* Avatar + nome + badge */}
          <View style={styles.avatarArea}>
            <View style={styles.avatarCircle}>
              <Ionicons name="person" size={48} color={CORES.branco} />
            </View>
            <Text style={styles.nome}>{nome}</Text>
            <View style={styles.badge}>
              <View style={styles.badgeDot} />
              <Text style={styles.badgeTexto}>{ROTULOS_PERFIL[perfilAtual]}</Text>
            </View>
          </View>

          {/* Dados pessoais */}
          <Text style={styles.secao}>Dados pessoais</Text>
          <Card>
            <LinhaPerfil rotulo="Nome completo" valor={nome} />
            <LinhaPerfil rotulo="Email" valor={email} />
            <LinhaPerfil rotulo="CPF" valor={cpf} />
            <LinhaPerfil rotulo="Telefone" valor={telefone} />
            <LinhaPerfil rotulo="Data de nascimento" valor={dataNascimento} />
          </Card>

          {/* Dados do perfil */}
          {perfilAtual === 'mecanico' && (
            <>
              <Text style={styles.secao}>Dados do mecânico</Text>
              <Card>
                <LinhaPerfil rotulo="Especialidade" valor={usuarioLogado?.especialidade ?? '—'} />
                <LinhaPerfil rotulo="Comissão" valor={`${usuarioLogado?.comissao ?? 0}%`} />
                <LinhaPerfil rotulo="Sua chave" valor={CODIGO_MECANICO} />
              </Card>
            </>
          )}

          {perfilAtual === 'cliente' && (
            <>
              <Text style={styles.secao}>Endereço</Text>
              <Card>
                <LinhaPerfil rotulo="Endereço" valor={usuarioLogado?.endereco ?? '—'} />
                <LinhaPerfil rotulo="Complemento" valor={usuarioLogado?.complemento ?? '—'} />
              </Card>
            </>
          )}

          {/* Sair */}
          <Botao variante="contorno" titulo="Sair da conta" onPress={handleSair} />
        </View>
      </ScrollView>
    </View>
  );
}

function LinhaPerfil({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <View style={styles.linha}>
      <Text style={styles.linhaRotulo}>{rotulo}</Text>
      <Text style={styles.linhaValor}>{valor}</Text>
    </View>
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

  /* Avatar */
  avatarArea: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: CORES.vermelho,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  nome: {
    color: CORES.branco,
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: CORES.card,
    borderColor: CORES.cardBorder,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop: 8,
  },
  badgeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: CORES.vermelho,
  },
  badgeTexto: {
    color: CORES.branco,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },

  /* Seções */
  secao: {
    color: CORES.textoSuave,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 2,
    marginTop: 4,
  },

  /* Linha de perfil */
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#1F1F1F',
  },
  linhaRotulo: {
    color: CORES.textoSuave,
    fontSize: 11,
    flex: 1,
  },
  linhaValor: {
    color: CORES.branco,
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
    textAlign: 'right',
  },
});
