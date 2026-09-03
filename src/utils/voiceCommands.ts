export type TipoComando =
  | 'YES'
  | 'NO'
  | 'NEXT'
  | 'BACK'
  | 'REPEAT'
  | 'FINISH'
  | 'OK'
  | 'ATTENTION'
  | 'PROBLEM'
  | 'UNKNOWN';

export type ComandoVoz = {
  tipo: TipoComando;
  texto: string;
};

const SIM = ['sim', 'pode ser', 'confirma', 'confirmar', 'ativo', 'ativar', 'ligar'];
const NAO = ['não', 'nao', 'não quero', 'cancelar', 'desativar', 'desligar'];
const PROXIMO = ['próximo passo', 'proximo passo', 'próximo', 'proximo', 'avançar', 'avanca', 'avançar passo', 'continuar', 'proximo item', 'próximo item'];
const VOLTAR = ['voltar', 'passo anterior', 'anterior', 'voltar passo'];
const REPITA = ['repita', 'repetir', 'falar novamente', 'como é', 'pode repetir', 'de novo'];
const FINALIZAR = ['finalizar', 'finalizar checklist', 'concluir', 'terminar', 'encerrar'];
const BOM = ['bom', 'está bom', 'esta bom', 'ok', 'ótimo', 'otimo', 'perfeito', 'excelente', 'bem'];
const ATENCAO = ['atenção', 'atencao', 'cuidado', 'prestar atenção', 'atenção cuidado', 'meio'];
const PROBLEMA = ['problema', 'ruim', 'quebrado', 'defeito', 'danificado', 'não funciona', 'nao funciona', 'com problema', 'feito'];

export function interpretarComando(texto: string): ComandoVoz {
  const lower = texto.toLowerCase().trim();

  if (PROXIMO.some((p) => lower.includes(p))) return { tipo: 'NEXT', texto };
  if (VOLTAR.some((p) => lower.includes(p))) return { tipo: 'BACK', texto };
  if (REPITA.some((p) => lower.includes(p))) return { tipo: 'REPEAT', texto };
  if (FINALIZAR.some((p) => lower.includes(p))) return { tipo: 'FINISH', texto };
  if (BOM.some((p) => lower.includes(p))) return { tipo: 'OK', texto };
  if (ATENCAO.some((p) => lower.includes(p))) return { tipo: 'ATTENTION', texto };
  if (PROBLEMA.some((p) => lower.includes(p))) return { tipo: 'PROBLEM', texto };
  if (SIM.some((p) => lower.includes(p))) return { tipo: 'YES', texto };
  if (NAO.some((p) => lower.includes(p))) return { tipo: 'NO', texto };

  return { tipo: 'UNKNOWN', texto };
}
