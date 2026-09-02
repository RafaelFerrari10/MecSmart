import { Modal, StyleSheet, Text, View } from 'react-native';
import { CORES, Botao } from './ui';

export function Popup({
  visivel,
  titulo,
  mensagem,
  onConfirmar,
}: {
  visivel: boolean;
  titulo: string;
  mensagem: string;
  onConfirmar: () => void;
}) {
  return (
    <Modal transparent visible={visivel} animationType="fade" onRequestClose={onConfirmar}>
      <View style={styles.overlay}>
        <View style={styles.cartao}>
          <Text style={styles.titulo}>{titulo}</Text>
          <Text style={styles.mensagem}>{mensagem}</Text>
          <Botao titulo="OK" onPress={onConfirmar} estilo={styles.botao} />
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
    padding: 20,
    alignItems: 'center',
  },
  titulo: {
    color: CORES.branco,
    fontSize: 15,
    fontWeight: '800',
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  mensagem: {
    color: CORES.textoSuave,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 12,
  },
  botao: {
    alignSelf: 'stretch',
  },
});