export type Condicao = 'ok' | 'atencao' | 'problema';
export type TipoUsuario = 'cliente' | 'mecanico';
export type Perfil = TipoUsuario;

export const STATUS_OS = [
  'PENDENTE',
  'EM ANÁLISE',
  'VISTORIA REALIZADA',
  'AGUARDANDO APROVAÇÃO',
  'APROVADA',
  'RETIRADA SOLICITADA',
] as const;

export const CHECKLIST_ITENS = [
  'Motor',
  'Freios',
  'Pneus',
  'Suspensão',
  'Elétrica',
  'Iluminação',
  'Bateria',
  'Fluidos',
  'Carroceria',
  'Interior',
];

export interface Usuario {
  uid: string;
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  dataNascimento: string;
  tipo: TipoUsuario;
  criadoEm: string;
  ativo: boolean;
}

export interface Mecanico {
  uid: string;
  especialidade: string;
  comissao: number;
  dataContratacao: string;
  ativo: boolean;
}

export interface Cliente {
  uid: string;
  endereco: string;
  complemento: string;
  ativo: boolean;
}

export type Combustivel = 'Gasolina' | 'Flex' | 'Diesel' | 'Elétrico' | 'Híbrido';

export const COMBUSTIVEIS: Combustivel[] = ['Gasolina', 'Flex', 'Diesel', 'Elétrico', 'Híbrido'];

export interface Veiculo {
  id: string;
  clienteId: string;
  placa: string;
  marca: string;
  modelo: string;
  ano: number;
  cor: string;
  quilometragem: number;
  combustivel?: Combustivel;
  foto: string;
  ativo: boolean;
}

export interface OrdemServico {
  id: string;
  numero: number;
  clienteId: string;
  veiculoId: string;
  mecanicoId: string;
  status: string;
  dataAbertura: string;
  dataConclusao: string | null;
  valorTotal: number;
  valorDesconto: number;
  valorFinal: number;
  observacoes: string;
  problemas: string[];
  condicao: Condicao;
  aprovada?: boolean;
  retiradaSolicitada?: boolean;
}

export interface Servico {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  tempoEstimado: number;
  ativo: boolean;
}

export interface Peca {
  id: string;
  codigo: string;
  nome: string;
  marca: string;
  precoCusto: number;
  precoVenda: number;
  estoqueAtual: number;
  estoqueMinimo: number;
  ativo: boolean;
}

export interface ItemOS {
  id: string;
  ordemServicoId: string;
  tipo: string;
  itemId: string;
  nome: string;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
}

export interface Financeiro {
  id: string;
  ordemServicoId: string;
  clienteId: string;
  valor: number;
  formaPagamento: string;
  status: string;
  dataPagamento: string | null;
  parcelas: number;
}

export interface Agendamento {
  id: string;
  clienteId: string;
  mecanicoId: string;
  veiculoId: string;
  data: string;
  hora: string;
  servicos: string[];
  status: string;
  observacoes: string;
}

export interface ChecklistItem {
  nome: string;
  condicao: Condicao;
}

export const VEICULO_VAZIO: Veiculo = {
  id: '',
  clienteId: '',
  placa: '',
  marca: '',
  modelo: '',
  ano: 2024,
  cor: '',
  quilometragem: 0,
  combustivel: 'Gasolina',
  foto: '',
  ativo: true,
};

/* ------------------------------------------------------------------ */
/* Coleções em memória (serão preenchidas pelo Firebase)               */
/* ------------------------------------------------------------------ */
export const usuarios: Usuario[] = [];
export const mecanicos: Mecanico[] = [];
export const clientes: Cliente[] = [];
export let veiculos: Veiculo[] = [];
export let ordensServico: OrdemServico[] = [];
export const servicos: Servico[] = [];
export const pecas: Peca[] = [];
export const itensOS: ItemOS[] = [];
export const financeiro: Financeiro[] = [];
export const agendamentos: Agendamento[] = [];

export let perfilAtual: Perfil = 'cliente';

export function definirPerfil(perfil: Perfil) {
  perfilAtual = perfil;
}

/* ------------------------------------------------------------------ */
/* Usuário autenticado (retornado pelo backend)                        */
/* ------------------------------------------------------------------ */
export interface UsuarioLogado {
  uid: string;
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  dataNascimento: string;
  tipo: Perfil;
  criadoEm: string;
  ativo: boolean;
  especialidade?: string;
  comissao?: number;
  dataContratacao?: string;
  endereco?: string;
  complemento?: string | null;
}

export let usuarioLogado: UsuarioLogado | null = null;

export function definirUsuarioLogado(usuario: UsuarioLogado | null) {
  usuarioLogado = usuario;
  if (usuario) {
    definirPerfil(usuario.tipo);
  }
}

export function buscarUsuario(uid: string): Usuario | undefined {
  return usuarios.find((u) => u.uid === uid);
}

export function buscarVeiculo(id: string): Veiculo | undefined {
  return veiculos.find((v) => v.id === id);
}

export function adicionarVeiculo(veiculo: Veiculo) {
  veiculos = [...veiculos, veiculo];
}

export function adicionarOrdemServico(os: OrdemServico) {
  ordensServico = [os, ...ordensServico];
}

export function atualizarOrdemServico(id: string, mudanca: Partial<OrdemServico>) {
  ordensServico = ordensServico.map((os) => (os.id === id ? { ...os, ...mudanca } : os));
}

/* ------------------------------------------------------------------ */
/* Chave do mecânico (recepção de vistorias pelo código)               */
/* ------------------------------------------------------------------ */
function gerarChaveAleatoria() {
  const caracteres = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let chave = '';
  for (let i = 0; i < 6; i++) {
    chave += caracteres[Math.floor(Math.random() * caracteres.length)];
  }
  return chave;
}

export const CODIGO_MECANICO = gerarChaveAleatoria();

export let codigoMecanicoSolicitado = '';

export function definirCodigoSolicitado(codigo: string) {
  codigoMecanicoSolicitado = codigo;
}

/* ------------------------------------------------------------------ */
/* Vistoria em andamento (fluxo do mecânico)                           */
/* ------------------------------------------------------------------ */
export function itemChecklistInicial(): ChecklistItem[] {
  return CHECKLIST_ITENS.map((nome) => ({ nome, condicao: 'ok' as Condicao }));
}

export const vistoriaEmAndamento = {
  veiculo: { ...VEICULO_VAZIO },
  data: '',
  problemasIdentificados: '',
  checklist: itemChecklistInicial(),
  observacoes: '',
};