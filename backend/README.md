# Backend MecSmart

API REST (Express) com banco de dados JSON local, embarcada no projeto MecSmart.

## Rodar

Para subir apenas o backend (porta `http://localhost:3000`):

```bash
cd backend
npm install   # primeira vez
npm start
```

Para subir **backend + app Expo juntos** com um comando só, a partir da raiz do projeto:

```bash
npm install          # na raiz do MecSmart
npm run dev
```

- Backend → `http://localhost:3000`
- Expo → `http://localhost:8081`

## Como o aplicativo conecta na API

O app resolve automaticamente o endereço da API (`src/services/api.ts`):

- **Web** → `http://localhost:3000/api`
- **Emulador/dispositivo físico** → usa o IP da máquina que roda o Expo (via `Constants.expoConfig.hostUri`), para alcançar o backend pela rede.

Se precisar apontar para outro endereço, edite a constante `PORT` (e o host) em `src/services/api.ts`.

## Banco de dados

Os dados ficam em arquivos `.json` na raiz da pasta `backend/` (ignorados pelo git):

- `banco.json` (usuários), `clientes.json`, `mecanicos.json`, `veiculos.json`, `pecas.json`, `itensOS.json`, `financeiro.json`, `agendamentos.json`

Para limpar os dados de teste, basta apagar esses arquivos (são recriados vazios).

## Firebase (opcional)

Existem endpoints de Firestore no código, mas eles dependem de um arquivo de credenciais
(`mecsmart-*-firebase-adminsdk-*.json`) que é ignorado pelo git. Sem esse arquivo, o servidor
sobe normalmente e **todos os endpoints JSON funcionam**; apenas os endpoints `-firebase` ficam
indisponíveis (retornam erro). Isso é intencional para desenvolvimento/teste.

## Endpoints principais

- `POST /api/cadastro` – criar usuário (cliente/mecânico)
- `POST /api/login` – autenticar (e-mail + senha, bcrypt)
- `/api/veiculos` – CRUD de veículos
- `/api/pecas` – CRUD + movimentação de estoque (adicionar/retirar)
- `/api/itensOS` – CRUD de itens de ordem de serviço
- `/api/financeiro` – lançamentos + pagar/cancelar/estornar
- `/api/agendamentos` – CRUD + mudança de status
