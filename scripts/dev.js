// Sobe o backend (Express) e o Expo juntos com um único comando.
// Uso: npm run dev
const { spawn } = require('child_process');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const BACKEND = path.join(ROOT, 'backend');

const comandos = [
  {
    nome: 'Backend',
    comando: process.platform === 'win32' ? 'npx.cmd' : 'npx',
    args: ['node', 'server.js'],
    cwd: BACKEND,
    port: 3000,
  },
  {
    nome: 'Expo',
    comando: process.platform === 'win32' ? 'npx.cmd' : 'npx',
    args: ['expo', 'start'],
    cwd: ROOT,
    port: 8081,
  },
];

function prefixar(nome, linha) {
  return `[${nome}] ${linha}`;
}

comandos.forEach(({ nome, comando, args, cwd }) => {
  const proc = spawn(comando, args, { cwd, shell: true });

  proc.stdout.on('data', (d) =>
    process.stdout.write(prefixar(nome, d.toString())),
  );
  proc.stderr.on('data', (d) =>
    process.stderr.write(prefixar(nome, d.toString())),
  );

  proc.on('close', (code) => {
    console.log(prefixar(nome, `encerrado (código ${code})`));
  });

  proc.on('error', (err) => {
    console.error(prefixar(nome, `erro ao iniciar: ${err.message}`));
  });
});

console.log('Subindo backend (porta 3000) e Expo (porta 8081)...');
console.log('Aperte Ctrl+C para encerrar tudo.');
