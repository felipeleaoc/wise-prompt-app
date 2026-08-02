# Prompt Certo

Crie uma aplicação SaaS chamada PromptCerto.

Objetivo:

Ajudar pequenos empresários e profissionais autônomos a usar inteligência artificial corretamente, transformando pedidos simples em prompts profissionais e conteúdos prontos.

Stack:

- React

- TypeScript

- Tailwind CSS

- Supabase

- Interface responsiva

- Integração com uma API de inteligência artificial por função segura no backend

- Nunca exponha chaves de API no frontend

Funcionalidades:

1. Página inicial

- apresentação do produto;

- benefícios;

- exemplos;

- preços;

- chamada para cadastro.

2. Cadastro e login

- autenticação por e-mail e senha;

- recuperação de senha;

- sessão persistente.

3. Painel principal

- quantidade de gerações disponíveis;

- últimos prompts;

- atalhos para criar conteúdo.

4. Diagnóstico de prompt

O usuário digita um pedido simples.

O sistema deve:

- calcular uma pontuação de 0 a 100;

- identificar informações ausentes;

- fazer perguntas complementares;

- gerar um prompt profissional.

5. Geradores

- anúncio para Instagram;

- descrição de produto;

- resposta para WhatsApp;

- roteiro de vídeo;

- e-mail profissional.

6. Resultado

Mostrar:

- pontuação;

- informações ausentes;

- prompt profissional;

- conteúdo gerado;

- botão copiar;

- botão melhorar;

- botão encurtar;

- botão deixar mais persuasivo;

- botão gerar nova versão.

7. Perfil da empresa

Campos:

- nome;

- segmento;

- público-alvo;

- produtos;

- diferenciais;

- tom de comunicação;

- cidade;

- WhatsApp.

8. Histórico

Salvar:

- tipo da geração;

- entrada do usuário;

- prompt final;

- resposta da IA;

- data;

- pontuação.

9. Planos

Plano gratuito:

- 5 gerações mensais.

Plano profissional:

- mais gerações;

- histórico completo;

- perfil da empresa;

- modelos avançados.

10. Segurança

- políticas de acesso no Supabase;

- cada usuário só pode acessar seus próprios registros;

- chaves secretas devem ficar em variáveis de ambiente;

- nunca coloque chave de IA no navegador.

Design:

- moderno;

- profissional;

- cores azul escuro, roxo e branco;

- aparência de produto SaaS;

- totalmente responsivo;

- textos em português do Brasil.

Crie todas as páginas, tabelas, componentes, rotas e estados necessários.

Não use apenas dados simulados.

Implemente o fluxo completo de cadastro, geração e histórico.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://wise-prompt-app.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/04477f5b-fa74-4964-adfb-dd549bb02647).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
