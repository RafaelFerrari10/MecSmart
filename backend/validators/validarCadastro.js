function validarEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function validarCPF(cpfOriginal) {
  const cpf = cpfOriginal.replace(/[^\d]/g, '');

  // CPF precisa ter 11 dígitos e não pode ser uma sequência repetida (111.111.111-11)
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) soma += parseInt(cpf.charAt(i)) * (10 - i);
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.charAt(9))) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(cpf.charAt(i)) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.charAt(10))) return false;

  return true;
}

function validarTelefone(telefone) {
  const numeros = telefone.replace(/[^\d]/g, '');
  return numeros.length >= 10 && numeros.length <= 11; // com ou sem 9º dígito
}

function validarDataNascimento(data) {
  const texto = String(data).trim();

  // O app envia a data no formato dd/mm/aaaa. Aceitamos também ISO (aaaa-mm-dd).
  // JS não interpreta "dd/mm/aaaa" com new Date() (ele espera mm/dd/aaaa ou ISO),
  // por isso extraímos os campos manualmente a partir da barra.
  const partes = texto.split('/');
  let ano, mes, dia;

  if (partes.length === 3) {
    dia = parseInt(partes[0], 10);
    mes = parseInt(partes[1], 10);
    ano = parseInt(partes[2], 10);
  } else {
    const d = new Date(texto);
    if (isNaN(d.getTime())) return false;
    ano = d.getFullYear();
    mes = d.getMonth() + 1;
    dia = d.getDate();
  }

  if (isNaN(dia) || isNaN(mes) || isNaN(ano)) return false;

  // Garante que a data realmente existe (ex.: 31/02 é inválida)
  const dataNasc = new Date(ano, mes - 1, dia);
  if (
    dataNasc.getFullYear() !== ano ||
    dataNasc.getMonth() !== mes - 1 ||
    dataNasc.getDate() !== dia
  ) {
    return false;
  }

  const hoje = new Date();
  let idade = hoje.getFullYear() - dataNasc.getFullYear();
  const aindaNaoFezAniversario =
    hoje.getMonth() < dataNasc.getMonth() ||
    (hoje.getMonth() === dataNasc.getMonth() && hoje.getDate() < dataNasc.getDate());
  if (aindaNaoFezAniversario) idade--;

  return idade >= 16 && idade <= 100;
}

function validarSenha(senha) {
  return typeof senha === 'string' && senha.length >= 6;
}

// Valida os campos comuns a qualquer usuário (documento usuarios/{uid})
// Usado tanto para cadastro de cliente quanto de mecânico.
function validarUsuarioComum(dados) {
  const erros = [];
  const { tipo, nome, email, senha, dataNascimento, telefone, cpf } = dados;

  if (!['cliente', 'mecanico'].includes(tipo)) {
    erros.push('O campo "tipo" deve ser "cliente" ou "mecanico".');
  }
  if (!nome || typeof nome !== 'string' || nome.trim().length < 3) {
    erros.push('Nome deve ter pelo menos 3 caracteres.');
  }
  if (!email || !validarEmail(email)) {
    erros.push('Email inválido.');
  }
  if (!senha || !validarSenha(senha)) {
    erros.push('Senha deve ter pelo menos 6 caracteres.');
  }
  if (!dataNascimento || !validarDataNascimento(dataNascimento)) {
    erros.push('Data de nascimento inválida (idade deve estar entre 16 e 100 anos).');
  }
  if (!telefone || !validarTelefone(telefone)) {
    erros.push('Telefone inválido (deve ter 10 ou 11 dígitos).');
  }
  if (!cpf || !validarCPF(cpf)) {
    erros.push('CPF inválido.');
  }

  return erros;
}

// Valida os campos extras do documento clientes/{uid}
function validarCliente(dados) {
  const erros = [];
  const { endereco, complemento } = dados;

  if (!endereco || typeof endereco !== 'string' || endereco.trim().length < 5) {
    erros.push('Endereço deve ter pelo menos 5 caracteres.');
  }
  if (complemento !== undefined && complemento !== null && typeof complemento !== 'string') {
    erros.push('Complemento inválido.');
  }

  return erros;
}

// Valida os campos extras do documento mecanicos/{uid}
function validarMecanico(dados) {
  const erros = [];
  const { especialidade, comissao, dataContratacao } = dados;

  if (!especialidade || typeof especialidade !== 'string' || especialidade.trim().length < 3) {
    erros.push('Especialidade deve ter pelo menos 3 caracteres.');
  }
  // Comissão é opcional no cadastro (a tela de cadastro não a envia).
  // Quando enviada, deve ser um número entre 0 e 100.
  if (
    comissao !== undefined &&
    comissao !== null &&
    (isNaN(comissao) || Number(comissao) < 0 || Number(comissao) > 100)
  ) {
    erros.push('Comissão deve ser um número entre 0 e 100 (%).');
  }
  if (dataContratacao !== undefined && dataContratacao !== null) {
    const data = new Date(dataContratacao);
    if (isNaN(data.getTime())) {
      erros.push('Data de contratação inválida.');
    }
  }

  return erros;
}

// Mantido por compatibilidade: valida o conjunto completo (comum + específico do tipo)
function validarCadastro(dados) {
  const erros = validarUsuarioComum(dados);

  if (dados.tipo === 'cliente') {
    erros.push(...validarCliente(dados));
  } else if (dados.tipo === 'mecanico') {
    erros.push(...validarMecanico(dados));
  }

  return erros;
}

module.exports = {
  validarUsuarioComum,
  validarCliente,
  validarMecanico,
  validarCadastro,
};
