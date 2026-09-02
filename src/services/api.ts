const API_URL = 'http://localhost:3000/api';

export type TipoUsuario = 'cliente' | 'mecanico';

export interface UsuarioCompleto {
  uid: string;
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  dataNascimento: string;
  tipo: TipoUsuario;
  criadoEm: string;
  ativo: boolean;
  senha?: string;
  especialidade?: string;
  comissao?: number;
  dataContratacao?: string;
  endereco?: string;
  complemento?: string | null;
}

export interface Veiculo {
  id: string;
  clienteId: string;
  placa: string;
  marca: string;
  modelo: string;
  ano: number;
  cor: string;
  quilometragem: number;
  foto?: string | null;
  criadoEm?: string;
  ativo: boolean;
}

// Projeta o Veiculo retornado pela API para a forma usada no store (foto string).
export function tipoVeiculo(v: Veiculo) {
  return v;
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
  tipo: 'peca' | 'servico';
  itemId: string | null;
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

interface RespostaErro {
  sucesso: false;
  erros?: string[];
}

async function requisicao<T>(metodo: string, rota: string, corpo?: unknown): Promise<T> {
  let resposta: Response;
  try {
    resposta = await fetch(`${API_URL}${rota}`, {
      method: metodo,
      headers: corpo !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: corpo !== undefined ? JSON.stringify(corpo) : undefined,
    });
  } catch {
    throw new Error('Não foi possível conectar ao servidor.');
  }

  const dados = await resposta.json().catch(() => null);

  if (!resposta.ok) {
    const mensagens = (dados as RespostaErro | null)?.erros ?? ['Erro na requisição.'];
    throw new Error(mensagens.join(' '));
  }

  return dados as T;
}

/* ------------------------- Cadastro / Login ------------------------- */

export async function cadastrar(
  dados: Record<string, unknown>,
): Promise<{ usuario: UsuarioCompleto }> {
  return requisicao<{ usuario: UsuarioCompleto }>('POST', '/cadastro', dados);
}

export async function login(
  email: string,
  senha: string,
): Promise<{ usuario: UsuarioCompleto }> {
  return requisicao<{ usuario: UsuarioCompleto }>('POST', '/login', { email, senha });
}

export async function listarUsuarios(
  tipo?: TipoUsuario,
  ativo?: boolean,
): Promise<{ usuarios: UsuarioCompleto[] }> {
  const params = new URLSearchParams();
  if (tipo) params.set('tipo', tipo);
  if (ativo !== undefined) params.set('ativo', String(ativo));
  const qs = params.toString();
  return requisicao<{ usuarios: UsuarioCompleto[] }>('GET', `/usuarios${qs ? `?${qs}` : ''}`);
}

export async function buscarUsuario(
  uid: string,
): Promise<{ usuario: UsuarioCompleto }> {
  return requisicao<{ usuario: UsuarioCompleto }>('GET', `/usuarios/${uid}`);
}

/* --------------------------- Veiculos --------------------------- */

export async function listarVeiculos(
  clienteId?: string,
): Promise<{ veiculos: Veiculo[] }> {
  const qs = clienteId ? `?clienteId=${encodeURIComponent(clienteId)}` : '';
  return requisicao<{ veiculos: Veiculo[] }>('GET', `/veiculos${qs}`);
}

export async function buscarVeiculo(id: string): Promise<{ veiculo: Veiculo }> {
  return requisicao<{ veiculo: Veiculo }>('GET', `/veiculos/${id}`);
}

export async function criarVeiculo(
  dados: Omit<Veiculo, 'id' | 'ativo' | 'criadoEm'>,
): Promise<{ veiculo: Veiculo }> {
  return requisicao<{ veiculo: Veiculo }>('POST', '/veiculos', dados);
}

export async function atualizarVeiculo(
  id: string,
  dados: Partial<Veiculo>,
): Promise<{ veiculo: Veiculo }> {
  return requisicao<{ veiculo: Veiculo }>('PUT', `/veiculos/${id}`, dados);
}

/* --------------------------- Pecas --------------------------- */

export async function listarPecas(busca?: string): Promise<{ pecas: Peca[] }> {
  const qs = busca ? `?busca=${encodeURIComponent(busca)}` : '';
  return requisicao<{ pecas: Peca[] }>('GET', `/pecas${qs}`);
}

export async function criarPeca(dados: Partial<Peca>): Promise<{ peca: Peca }> {
  return requisicao<{ peca: Peca }>('POST', '/pecas', dados);
}

/* --------------------------- ItensOS --------------------------- */

export async function listarItensOS(
  ordemServicoId?: string,
): Promise<{ itensOS: ItemOS[]; total: number }> {
  const qs = ordemServicoId ? `?ordemServicoId=${encodeURIComponent(ordemServicoId)}` : '';
  return requisicao<{ itensOS: ItemOS[]; total: number }>('GET', `/itensOS${qs}`);
}

export async function criarItemOS(dados: Partial<ItemOS>): Promise<{ itemOS: ItemOS }> {
  return requisicao<{ itemOS: ItemOS }>('POST', '/itensOS', dados);
}

/* --------------------------- Financeiro --------------------------- */

export async function listarFinanceiro(
  clienteId?: string,
  status?: string,
): Promise<{ financeiro: Financeiro[] }> {
  const params = new URLSearchParams();
  if (clienteId) params.set('clienteId', clienteId);
  if (status) params.set('status', status);
  const qs = params.toString();
  return requisicao<{ financeiro: Financeiro[] }>('GET', `/financeiro${qs ? `?${qs}` : ''}`);
}

export async function criarLancamento(
  dados: Partial<Financeiro>,
): Promise<{ financeiro: Financeiro }> {
  return requisicao<{ financeiro: Financeiro }>('POST', '/financeiro', dados);
}

export async function pagarLancamento(id: string): Promise<{ financeiro: Financeiro }> {
  return requisicao<{ financeiro: Financeiro }>('PATCH', `/financeiro/${id}/pagar`);
}

/* --------------------------- Agendamentos --------------------------- */

export async function listarAgendamentos(
  mecanicoId?: string,
  data?: string,
  status?: string,
): Promise<{ agendamentos: Agendamento[] }> {
  const params = new URLSearchParams();
  if (mecanicoId) params.set('mecanicoId', mecanicoId);
  if (data) params.set('data', data);
  if (status) params.set('status', status);
  const qs = params.toString();
  return requisicao<{ agendamentos: Agendamento[] }>(
    'GET',
    `/agendamentos${qs ? `?${qs}` : ''}`,
  );
}

export async function criarAgendamento(
  dados: Partial<Agendamento>,
): Promise<{ agendamento: Agendamento }> {
  return requisicao<{ agendamento: Agendamento }>('POST', '/agendamentos', dados);
}

export async function alterarStatusAgendamento(
  id: string,
  status: string,
): Promise<{ agendamento: Agendamento }> {
  return requisicao<{ agendamento: Agendamento }>('PATCH', `/agendamentos/${id}/${status}`);
}