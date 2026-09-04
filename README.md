# MecSmart

Aplicativo mobile para gestão de oficinas mecânicas, desenvolvido com Expo (React Native). Conecta clientes e mecânicos em um fluxo completo de vistoria, aprovação e acompanhamento de serviços automotivos.

## Como funciona

### Fluxo do Cliente

1. **Cadastro e login** - O cliente cria sua conta e acessa o app Selecionando o perfil "Cliente".
2. **Cadastro de veículo** - Registra um ou mais veículos (placa, marca, modelo, ano, cor, quilometragem, foto).
3. **Nova vistoria** - Solicita uma vistoria para o veículo. O sistema gera uma Ordem de Serviço e notifica o mecânico.
4. **Aprovação** - Após a vistoria, o cliente recebe o checklist completo (condições do motor, freios, pneus, elétrica, etc.) e decide se aprova ou solicita esclarecimentos.
5. **Retirada** - Após aprovação, o cliente pode acompanhar o status até a retirada do veículo.

### Fluxo do Mecânico

1. **Cadastro e login** - O mecânico acessa o app selecionando o perfil "Mecânico".
2. **Painel inicial** - Visualiza indicadores de OS para hoje, em andamento e finalizadas.
3. **Recepção de vistorias** - Recebe as OS atribuídas, realiza a vistoria preenchendo um checklist detalhado (19 itens: motor, freios, pneus, suspensão, elétrica, etc.).
4. **Itens de OS** - Adiciona peças e serviços utilizados na ordem de serviço.
5. **Estoque** - Gerencia o estoque de peças: busca, cadastra, adiciona e retira itens.
6. **Financeiro** - Registra lançamentos, acompanha pagamentos e status financeiro das OS.
7. **Agendamentos** - Agenda e gerencia compromissos com clientes.

### Assistente de voz

O app possui um assistente de voz (disponível em dispositivos móveis) que permite navegar e executar comandos por voz, tornando o uso mais prático durante o trabalho na oficina.

## Módulos principais

| Módulo | Descrição |
|---|---|
| **Vistorias** | Checklist completo com 19 itens de inspeção, registro de fotos e problemas |
| **Ordens de Serviço** | Fluxo completo: PENDENTE > EM ANALISE > VISTORIA REALIZADA > AGUARDANDO APROVACAO > APROVADA > RETIRADA SOLICITADA |
| **Estoque** | Gestão de peças com busca, cadastro, controle de estoque mínimo |
| **Financeiro** | Lançamentos, pagamentos, parcelamentos e estornos |
| **Agendamentos** | Agenda de serviços com vinculação a cliente, veículo e mecânico |
| **Cadastro de veículos** | CRUD completo de veículos com foto |

## Stack tecnológica

- **Frontend:** Expo SDK 57, React Native, Expo Router (file-based routing)
- **Backend:** API REST (porta 3000) com persistência via Firebase
- **Idioma:** TypeScript
- **Extras:** expo-speech (TEX-to-speech), expo-speech-recognition (reconhecimento de voz), expo-camera, expo-image

## Pré-requisitos

- Node.js >= 18
- Backend rodando na porta 3000 (pasta `backend/`)

## Como rodar

```bash
# Instalar dependências
npm install

# Iniciar o backend (em outro terminal)
npm run backend

# Iniciar o app
npx expo start
```

O app detecta automaticamente o IP da máquina para se conectar ao backend. Para sobrescrever manualmente:

```bash
EXPO_PUBLIC_API_URL=http://192.168.0.39:3000/api npx expo start
```

## Estrutura do projeto

```
src/
  app/                  # Telas (file-based routing do Expo Router)
    index.tsx           # Splash screen
    login.tsx           # Login
    cadastro.tsx        # Cadastro de usuário
    home.tsx            # Tela inicial (cliente ou mecânico)
    carro.tsx           # Detalhes do veículo
    vistorias.tsx       # Lista de vistorias
    nova-vistoria.tsx   # Nova vistoria
    checklist.tsx       # Checklist da vistoria
    aprovacao.tsx       # Aprovação do cliente
    estoque.tsx         # Estoque de peças
    financeiro.tsx      # Gestão financeira
    agendamentos.tsx    # Agenda de serviços
    itens-os.tsx        # Itens da ordem de serviço
    ...
  components/           # Componentes reutilizáveis (UI, cards, popups)
  contexts/             # Context providers (VoiceAssistant)
  services/api.ts       # Chamadas à API REST
  store.ts              # Estado global em memória
  utils/                # Utilitários (comandos de voz)
```
