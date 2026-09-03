export type TipoComando = 'YES' | 'NO' | 'UNKNOWN';

export type ComandoVoz = {
  tipo: TipoComando;
  texto: string;
};

const SIM = ['sim', 'pode ser', 'confirma', 'confirmar', 'ativo', 'ativar', 'ligar'];
const NAO = ['não', 'nao', 'não quero', 'cancelar', 'desativar', 'desligar'];

export function interpretarComando(texto: string): ComandoVoz {
  const lower = texto.toLowerCase().trim();

  if (SIM.some((p) => lower.includes(p))) return { tipo: 'YES', texto };
  if (NAO.some((p) => lower.includes(p))) return { tipo: 'NO', texto };

  return { tipo: 'UNKNOWN', texto };
}
