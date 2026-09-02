import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { Condicao } from '@/store';

export const CORES = {
  preto: '#000000',
  branco: '#FFFFFF',
  vermelho: '#F3222A',
  vermelhoEscuro: '#A90008',
  card: '#141414',
  cardBorder: '#262626',
  input: '#303030',
  label: '#BDBDBD',
  textoSuave: '#8D8D8D',
  verde: '#4CD964',
  amarelo: '#F5A623',
  laranja: '#FF8A3D',
  azul: '#4DA6FF',
  roxo: '#A78BFA',
};

export const GRADIENT = ['#A90008', '#570005', '#000000'] as const;
export const GRADIENT_LOCATIONS = [0, 0.22, 0.52] as const;

export const STATUS_CORES: Record<string, string> = {
  PENDENTE: CORES.amarelo,
  'EM ANÁLISE': CORES.azul,
  'VISTORIA REALIZADA': CORES.laranja,
  'AGUARDANDO APROVAÇÃO': CORES.laranja,
  APROVADA: CORES.verde,
  'RETIRADA SOLICITADA': CORES.roxo,
};

export const CONDICAO_CORES: Record<Condicao, string> = {
  ok: CORES.verde,
  atencao: CORES.amarelo,
  problema: CORES.vermelho,
};

export const CONDICAO_LABEL: Record<Condicao, string> = {
  ok: 'BOM',
  atencao: 'ATENÇÃO',
  problema: 'PROBLEMA',
};

export function GradientBackground() {
  return (
    <LinearGradient
      colors={GRADIENT}
      locations={GRADIENT_LOCATIONS}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={StyleSheet.absoluteFill}
    />
  );
}

export function ScreenHeader({
  titulo,
  voltar,
  direita,
}: {
  titulo: string;
  voltar?: boolean;
  direita?: React.ReactNode;
}) {
  return (
    <View style={styles.header}>
      {voltar ? (
        <Pressable style={styles.headerSide} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={CORES.branco} />
        </Pressable>
      ) : (
        <View style={styles.headerSide} />
      )}
      <Text style={styles.headerTitle}>{titulo}</Text>
      {direita ?? <View style={styles.headerSide} />}
    </View>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function StatusBadge({ status }: { status: string }) {
  const cor = STATUS_CORES[status] ?? CORES.textoSuave;
  return (
    <View style={[styles.badge, { borderColor: cor }]}>
      <View style={[styles.badgeDot, { backgroundColor: cor }]} />
      <Text style={[styles.badgeText, { color: cor }]}>{status}</Text>
    </View>
  );
}

export function CondicaoItem({ nome, condicao }: { nome: string; condicao: Condicao }) {
  const cor = CONDICAO_CORES[condicao];
  return (
    <View style={styles.condicaoRow}>
      <Text style={styles.condicaoNome}>{nome}</Text>
      <View style={styles.condicaoDireita}>
        <View style={[styles.condicaoDot, { backgroundColor: cor }]} />
        <Text style={[styles.condicaoValor, { color: cor }]}>{CONDICAO_LABEL[condicao]}</Text>
      </View>
    </View>
  );
}

export function Botao({
  titulo,
  onPress,
  variante = 'primario',
  estilo,
}: {
  titulo: string;
  onPress?: () => void;
  variante?: 'primario' | 'verde' | 'contorno' | 'perigo';
  estilo?: ViewStyle;
}) {
  const corFundo =
    variante === 'verde' ? CORES.verde : variante === 'contorno' ? 'transparente' : CORES.vermelho;
  const corTexto =
    variante === 'contorno' ? CORES.branco : variante === 'verde' ? CORES.preto : CORES.branco;
  const borda = variante === 'contorno' ? 1 : 0;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.botao,
        { backgroundColor: corFundo, borderWidth: borda, borderColor: CORES.cardBorder },
        pressed && styles.botaoPressionado,
        estilo,
      ]}
    >
      <Text style={[styles.botaoTexto, { color: corTexto }]}>{titulo}</Text>
    </Pressable>
  );
}

export function Campo({ label, ...props }: TextInputProps & { label: string }) {
  return (
    <View style={styles.campoContainer}>
      <Text style={styles.campoLabel}>{label}</Text>
      <TextInput
        style={[styles.campoInput, props.multiline && styles.campoMultiline]}
        placeholderTextColor="#9A9A9A"
        {...props}
      />
    </View>
  );
}

export function Linha({ children }: { children: React.ReactNode }) {
  return <View style={styles.linha}>{children}</View>;
}

export function InfoCard({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <View style={styles.infoCard}>
      <Text style={styles.infoRotulo}>{rotulo}</Text>
      <Text style={styles.infoValor}>{valor}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSide: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    color: CORES.branco,
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  card: {
    backgroundColor: CORES.card,
    borderColor: CORES.cardBorder,
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
    gap: 6,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  botao: {
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  botaoPressionado: {
    opacity: 0.75,
  },
  botaoTexto: {
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  campoContainer: {
    marginBottom: 14,
  },
  campoLabel: {
    color: CORES.label,
    fontSize: 10,
    marginBottom: 6,
    marginLeft: 2,
  },
  campoInput: {
    height: 38,
    backgroundColor: CORES.input,
    borderRadius: 9,
    paddingHorizontal: 12,
    color: CORES.branco,
    fontSize: 12,
  },
  campoMultiline: {
    height: 80,
    paddingTop: 10,
    textAlignVertical: 'top',
  },
  condicaoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1F1F1F',
  },
  condicaoNome: {
    color: CORES.branco,
    fontSize: 13,
    fontWeight: '600',
  },
  condicaoDireita: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  condicaoDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  condicaoValor: {
    fontSize: 11,
    fontWeight: '800',
  },
  linha: {
    flexDirection: 'row',
    gap: 10,
  },
  infoCard: {
    flex: 1,
    backgroundColor: CORES.input,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  infoRotulo: {
    color: CORES.textoSuave,
    fontSize: 9,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  infoValor: {
    color: CORES.branco,
    fontSize: 12,
    fontWeight: '700',
  },
});