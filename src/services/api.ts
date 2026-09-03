import Constants from 'expo-constants';

// Resolve a base da API automaticamente:
// - Na web (ou quando não há host disponível) usa localhost.
// - Em emulador/dispositivo físico usa o IP do servidor Expo (a máquina
//   que está rodando o backend), para que seja alcançável pela rede.
const PORT = 3000;

// Permite sobrescrever manualmente o endereço da API, ex.:
//   EXPO_PUBLIC_API_URL=http://192.168.0.39:3000/api  npx expo start
// Útil quando o auto-detect não encontra o IP da máquina (ex.: emulador/túnel).
const API_URL = (() => {
  const manual = process.env.EXPO_PUBLIC_API_URL;
  if (manual) {
    return manual.replace(/\/+$/, '');
  }
  try {
    const hostUri = Constants.expoConfig?.hostUri;
    const host = hostUri?.split(':')[0];
    if (host && host !== 'localhost' && host !== '127.0.0.1') {
      return `http://${host}:${PORT}/api`;
    }
  } catch {
    // ignora e segue para o padrão
  }
  return `http://localhost:${PORT}/api`;
})();

console.log(`[api] usando base: ${API_URL}`);

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
  const timeoutMs = 8000;
  const controle = new AbortController();
  const temporizador = setTimeout(() => controle.abort(), timeoutMs);

  let resposta: Response;
  try {
    resposta = await fetch(`${API_URL}${rota}`, {
      method: metodo,
      headers: corpo !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: corpo !== undefined ? JSON.stringify(corpo) : undefined,
      signal: controle.signal,
    });
  } catch (erro) {
    throw new Error(
      (erro as Error)?.name === 'AbortError'
        ? 'Não foi possível conectar ao servidor. Verifique se o backend está rodando.'
        : 'Não foi possível conectar ao servidor.',
    );
  } finally {
    clearTimeout(temporizador);
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
  // 🔥 ALTERADO: Agora chama a rota Firebase!
  return requisicao<{ usuario: UsuarioCompleto }>('POST', '/cadastro-firebase', dados);
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
  // 🔥 ALTERADO: Agora chama a rota Firebase!
  return requisicao<{ veiculo: Veiculo }>('POST', '/veiculos-firebase', dados);
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
  // 🔥 ALTERADO: Agora chama a rota Firebase!
  return requisicao<{ peca: Peca }>('POST', '/pecas-firebase', dados);
}

export async function buscarPeca(id: string): Promise<{ peca: Peca }> {
  return requisicao<{ peca: Peca }>('GET', `/pecas/${id}`);
}

export async function atualizarPeca(
  id: string,
  dados: Partial<Peca>,
): Promise<{ peca: Peca }> {
  return requisicao<{ peca: Peca }>('PUT', `/pecas/${id}`, dados);
}

export async function excluirPeca(id: string): Promise<{ peca: Peca }> {
  return requisicao<{ peca: Peca }>('DELETE', `/pecas/${id}`);
}

export async function desativarPeca(id: string): Promise<{ peca: Peca }> {
  return requisicao<{ peca: Peca }>('PATCH', `/pecas/${id}/desativar`);
}

export async function adicionarEstoquePeca(
  id: string,
  quantidade: number,
): Promise<{ peca: Peca }> {
  return requisicao<{ peca: Peca }>('PATCH', `/pecas/${id}/adicionar`, { quantidade });
}

export async function retirarEstoquePeca(
  id: string,
  quantidade: number,
): Promise<{ peca: Peca }> {
  return requisicao<{ peca: Peca }>('PATCH', `/pecas/${id}/retirar`, { quantidade });
}

/* --------------------------- ItensOS --------------------------- */

export async function listarItensOS(
  ordemServicoId?: string,
): Promise<{ itensOS: ItemOS[]; total: number }> {
  const qs = ordemServicoId ? `?ordemServicoId=${encodeURIComponent(ordemServicoId)}` : '';
  return requisicao<{ itensOS: ItemOS[]; total: number }>('GET', `/itensOS${qs}`);
}

export async function criarItemOS(dados: Partial<ItemOS>): Promise<{ itemOS: ItemOS }> {
  // 🔥 ALTERADO: Agora chama a rota Firebase!
  return requisicao<{ itemOS: ItemOS }>('POST', '/itensOS-firebase', dados);
}

export async function buscarItemOS(id: string): Promise<{ itemOS: ItemOS }> {
  return requisicao<{ itemOS: ItemOS }>('GET', `/itensOS/${id}`);
}

export async function atualizarItemOS(
  id: string,
  dados: Partial<ItemOS>,
): Promise<{ itemOS: ItemOS }> {
  return requisicao<{ itemOS: ItemOS }>('PUT', `/itensOS/${id}`, dados);
}

export async function excluirItemOS(id: string): Promise<{ itemOS: ItemOS }> {
  return requisicao<{ itemOS: ItemOS }>('DELETE', `/itensOS/${id}`);
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
  // 🔥 ALTERADO: Agora chama a rota Firebase!
  return requisicao<{ financeiro: Financeiro }>('POST', '/financeiro-firebase', dados);
}

export async function pagarLancamento(id: string): Promise<{ financeiro: Financeiro }> {
  return requisicao<{ financeiro: Financeiro }>('PATCH', `/financeiro/${id}/pagar`);
}

export async function cancelarLancamento(id: string): Promise<{ financeiro: Financeiro }> {
  return requisicao<{ financeiro: Financeiro }>('PATCH', `/financeiro/${id}/cancelar`);
}

export async function estornarLancamento(id: string): Promise<{ financeiro: Financeiro }> {
  return requisicao<{ financeiro: Financeiro }>('PATCH', `/financeiro/${id}/estornar`);
}

export async function excluirLancamento(id: string): Promise<{ financeiro: Financeiro }> {
  return requisicao<{ financeiro: Financeiro }>('DELETE', `/financeiro/${id}`);
}

export async function buscarLancamento(
  id: string,
): Promise<{ financeiro: Financeiro }> {
  return requisicao<{ financeiro: Financeiro }>('GET', `/financeiro/${id}`);
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
  // 🔥 ALTERADO: Agora chama a rota Firebase!
  return requisicao<{ agendamento: Agendamento }>('POST', '/agendamentos-firebase', dados);
}

export async function alterarStatusAgendamento(
  id: string,
  status: string,
): Promise<{ agendamento: Agendamento }> {
  return requisicao<{ agendamento: Agendamento }>('PATCH', `/agendamentos/${id}/${status}`);
}

export async function buscarAgendamento(
  id: string,
): Promise<{ agendamento: Agendamento }> {
  return requisicao<{ agendamento: Agendamento }>('GET', `/agendamentos/${id}`);
}

export async function atualizarAgendamento(
  id: string,
  dados: Partial<Agendamento>,
): Promise<{ agendamento: Agendamento }> {
  return requisicao<{ agendamento: Agendamento }>('PUT', `/agendamentos/${id}`, dados);
}

export async function excluirAgendamento(
  id: string,
): Promise<{ agendamento: Agendamento }> {
  return requisicao<{ agendamento: Agendamento }>('DELETE', `/agendamentos/${id}`);
}