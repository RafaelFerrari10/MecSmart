import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { CORES } from './ui';

export function PopupConfirmacao({
  visivel,
  titulo,
  mensagem,
  textoConfirmar,
  onCancelar,
  onConfirmar,
}: {
  visivel: boolean;
  titulo: string;
  mensagem: string;
  textoConfirmar: string;
  onCancelar: () => void;
  onConfirmar: () => void;
}) {
  return (
    <Modal transparent visible={visivel} animationType="fade" onRequestClose={onCancelar}>
      <View style={styles.overlay}>
        <View style={styles.cartao}>
          <View style={styles.iconeArea}>
            <Ionicons name="warning" size={32} color={CORES.vermelho} />
          </View>
          <Text style={styles.mensagem}>{mensagem}</Text>

          <View style={styles.botoes}>
            <Pressable
              style={({ pressed }) => [styles.botao, styles.botaoCancelar, pressed && { opacity: 0.7 }]}
              onPress={onCancelar}
            >
              <Text style={styles.botaoCancelarTexto}>Cancelar</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.botao, styles.botaoConfirmar, pressed && { opacity: 0.7 }]}
              onPress={onConfirmar}
            >
              <Text style={styles.botaoConfirmarTexto}>{textoConfirmar}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  cartao: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: CORES.card,
    borderColor: CORES.cardBorder,
    borderWidth: 1,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  iconeArea: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(243,34,42,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  mensagem: {
    color: CORES.branco,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  botoes: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  botao: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoCancelar: {
    backgroundColor: CORES.vermelho,
  },
  botaoCancelarTexto: {
    color: CORES.branco,
    fontSize: 13,
    fontWeight: '800',
  },
  botaoConfirmar: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: CORES.vermelho,
  },
  botaoConfirmarTexto: {
    color: CORES.branco,
    fontSize: 13,
    fontWeight: '800',
  },
});
