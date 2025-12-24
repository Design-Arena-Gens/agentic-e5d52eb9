# Sora 2 Video Studio

Aplicação web Next.js para elaborar prompts profissionais e disparar jobs de geração de vídeo com o Sora 2 (OpenAI). O app oferece presets curados, guia estruturado para briefing e suporte a configuração avançada em JSON.

## Requisitos

- Node.js 18+
- npm 9+
- Variável de ambiente `SORA_API_KEY` ou `OPENAI_API_KEY` com permissão para o endpoint de vídeos do Sora 2

## Instalação

```bash
npm install
```

## Desenvolvimento

```bash
npm run dev
```

Acesse `http://localhost:3000` para utilizar a interface.

## Build de Produção

```bash
npm run build
npm run start
```

## Deploy

A aplicação está pronta para deploy na Vercel. Certifique-se de definir `SORA_API_KEY` (ou `OPENAI_API_KEY`) no painel de variáveis de ambiente antes de publicar.

## Estrutura

```
app/
  api/generate/route.ts  → Proxy para a API do Sora/OpenAI
  page.tsx               → Interface principal do estúdio
lib/
  presets.ts             → Presets profissionais de prompt
  schema.ts              → Validação e tipagem do formulário
```

## Licença

MIT
