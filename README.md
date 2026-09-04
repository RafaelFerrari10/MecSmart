<div align="center">

# 🔧 MecSmart

### Gestão inteligente de oficinas mecânicas

![Expo](https://img.shields.io/badge/Expo-SDK_57-black?style=flat-square&logo=expo)
![React Native](https://img.shields.io/badge/React_Native-0.86-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178c6?style=flat-square&logo=typescript)
![Firebase](https://img.shields.io/badge/Firebase-11-FFCA28?style=flat-square&logo=firebase)

Conecta clientes e mecânicos em um fluxo completo de **vistoria**, **aprovação** e **acompanhamento** de serviços automotivos.

</div>

---

## 📱 Como o app funciona

O MecSmart possui **dois perfis** com experiências totalmente diferentes:

### 👤 Cliente

```
📝 Cadastro → 🚗 Cadastro do veículo → 🔍 Solicita vistoria → ✅ Aprova ou solicita esclarecimentos → 🎉 Retira o veículo
```

| Etapa | O que acontece |
|:---:|---|
| **1** | Cria conta e seleciona o perfil "Cliente" |
| **2** | Registra um ou mais veículos (placa, marca, modelo, ano, cor, foto) |
| **3** | Solicita uma vistoria — o sistema gera uma OS e notifica o mecânico |
| **4** | Recebe o checklist completo (motor, freios, pneus, elétrica...) e aprova ou pede esclarecimentos |
| **5** | Acompanha o status até a retirada do veículo |

### 🔩 Mecânico

```
📋 Painel → 🔧 Recebe vistoria → ✏️ Preenche checklist → 🧩 Adiciona itens à OS → 💰 Lança financeiro → 📅 Agenda
```

| Etapa | O que acontece |
|:---:|---|
| **1** | Acessa o app com perfil "Mecânico" |
| **2** | Visualiza indicadores: OS para hoje, em andamento e finalizadas |
| **3** | Realiza a vistoria com checklist detalhado (19 itens de inspeção) |
| **4** | Adiciona peças e serviços utilizados na ordem de serviço |
| **5** | Gerencia estoque de peças |
| **6** | Registra lançamentos financeiros e acompanha pagamentos |
| **7** | Agenda e gerencia compromissos com clientes |

### 🗣️ Assistente de voz

O app conta com um **assistente de voz** para dispositivos móveis, permitindo navegar e executar comandos por voz — ideal para usar as mãos ocupadas na oficina.

---

## 🧩 Módulos

<div align="center">

| | Módulo | O que faz |
|:---:|---|---|
| 🔍 | **Vistorias** | Checklist com 19 itens, registro de fotos e problemas |
| 📄 | **Ordens de Serviço** | Fluxo completo: `PENDENTE` → `EM ANÁLISE` → `VISTORIA REALIZADA` → `AGUARDANDO APROVAÇÃO` → `APROVADA` → `RETIRADA SOLICITADA` |
| 📦 | **Estoque** | Busca, cadastro e controle de estoque mínimo de peças |
| 💵 | **Financeiro** | Lançamentos, pagamentos, parcelamentos e estornos |
| 📅 | **Agendamentos** | Agenda de serviços vinculada a cliente, veículo e mecânico |
| 🚗 | **Veículos** | CRUD completo com suporte a fotos |

</div>

---

## 🛠️ Stack

<div align="center">

| Camada | Tecnologia |
|---|---|
| **Frontend** | Expo SDK 57 · React Native · Expo Router |
| **Backend** | API REST (porta 3000) · Firebase |
| **Linguagem** | TypeScript 6.0 |
| **Extras** | 🎤 expo-speech · 🎙️ expo-speech-recognition · 📷 expo-camera |

</div>

---

## 🚀 Como rodar

**Pré-requisitos:** Node.js >= 18 · Backend rodando na pasta `backend/`

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar o backend (em outro terminal)
npm run backend

# 3. Iniciar o app
npx expo start
```

> 💡 O app detecta automaticamente o IP da máquina para se conectar ao backend.
> Para sobrescrever manualmente:
> ```bash
> EXPO_PUBLIC_API_URL=http://192.168.0.39:3000/api npx expo start
> ```

---

## 📁 Estrutura

```
src/
├── app/                    # 📱 Telas (file-based routing)
│   ├── index.tsx           #   Splash screen
│   ├── login.tsx           #   Login
│   ├── cadastro.tsx        #   Cadastro de usuário
│   ├── home.tsx            #   Tela inicial (cliente / mecânico)
│   ├── carro.tsx           #   Detalhes do veículo
│   ├── vistorias.tsx       #   Lista de vistorias
│   ├── nova-vistoria.tsx   #   Criar vistoria
│   ├── checklist.tsx       #   Checklist da vistoria
│   ├── aprovacao.tsx       #   Aprovação do cliente
│   ├── estoque.tsx         #   Estoque de peças
│   ├── financeiro.tsx      #   Gestão financeira
│   ├── agendamentos.tsx    #   Agenda de serviços
│   └── itens-os.tsx        #   Itens da OS
├── components/             # 🧩 UI reutilizável (cards, popups, botões)
├── contexts/               # 🎤 Providers (VoiceAssistant)
├── services/api.ts         # 🌐 Chamadas à API REST
├── store.ts                # 📦 Estado global em memória
└── utils/                  # 🔧 Utilitários (comandos de voz)
```

---

<div align="center">

Feito com ❤️ usando **Expo** e **React Native**

</div>
