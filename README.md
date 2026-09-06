# O Universo de Renan & Michele

Uma experiência digital onde cada estrela é uma memória.
Convite → portal → galáxia → constelações → estrelas → fotografias e histórias.

## Como adicionar uma nova memória (o mais importante)

1. Abra o site e vá para `/admin` (pelo celular funciona igual).
2. Entre com o seu e-mail e senha (ou com o Google). **A primeira conta criada vira a administradora** — crie a sua antes de compartilhar o link com a Michele.
3. Toque em **+ Adicionar memória**.
4. Escolha a **foto principal** (arraste no computador ou selecione do celular — dá para usar a câmera).
5. Preencha **título**, **data**, **local** (opcional) e **a história**.
6. Escolha a **constelação** (capítulo), a **importância** (Normal / Especial / Lendária) e a **visibilidade**.
   - Marque **Memória escondida** para virar uma estrela secreta.
7. Se essa lembrança tiver várias fotos ou vídeos, selecione todos em **Álbum** — eles ficam dentro da mesma estrela.
8. Toque em **Adicionar ao nosso universo**. A estrela nasce sozinha, já posicionada na galáxia, na linha do tempo e no contador.

Para várias memórias diferentes de uma vez, repita o passo 3 — cada memória vira uma estrela.
Para 30 fotos da mesma viagem, é uma memória só com as 30 no campo **Álbum**.

## Rodando o projeto

```bash
bun install
bun run dev      # http://localhost:8080
bun run build    # build de produção
```

Variáveis de ambiente: copie `.env.example` para `.env`. Os valores do Lovable Cloud já são
injetados automaticamente no projeto; nunca coloque a chave de serviço no frontend.

## Backend

- **Banco**: `categories` (constelações), `memories` (a estrela), `memory_media` (o álbum),
  `user_roles` (quem é administrador).
- **Storage**: bucket privado `memories`, arquivos em `memories/<ano>/…`.
  As fotos nunca ficam em `/public`; são servidas por links assinados temporários.
- **Segurança**: RLS ligada em tudo. Só o administrador cria, edita e apaga.
  Memórias privadas não aparecem para visitantes.
- **Backup**: no painel, **Exportar nossas memórias** baixa um JSON com tudo.

## Navegação alternativa

`/timeline` mostra as memórias por ano e mês. É o caminho para leitores de tela,
para aparelhos sem 3D e para quem quiser encontrar algo rápido.

## Documentos

- `ARCHITECTURE.md` — arquitetura, banco, storage, segurança, performance
- `IMPLEMENTATION_PLAN.md` — fases e próximas evoluções
