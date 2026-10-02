# ARCHITECTURE — O Universo de Renan & Michele

## Conceito

Cada estrela é uma memória. Toda decisão técnica existe para sustentar essa metáfora:
quanto mais perto a câmera chega de uma estrela, mais a fotografia guardada nela aparece.

## Stack real do projeto

O repositório roda em **TanStack Start (React 19 + Vite 8 + TypeScript)** com roteamento
por arquivos, e não Next.js. É o equivalente direto (SSR, rotas, funções de servidor) e
foi mantido para não reescrever a fundação existente. Demais peças conforme pedido:

- React Three Fiber + drei + three (galáxia, portal, cena final)
- Tailwind CSS v4 (design tokens em `src/styles.css`)
- Lovable Cloud (banco Postgres, Auth e Storage — Supabase gerenciado)
- TanStack Query (cache de dados)
- Animações: CSS/WebGL com damping por delta-time (GSAP não foi instalado — as transições
  necessárias são feitas com `useFrame` + damping exponencial, evitando dependência extra)

## Fluxo da experiência

```
convite (DOM)  →  portal (WebGL warp)  →  universo (WebGL)  →  memória  →  universo  →  final R ♥ M
```

Estados controlados em `src/routes/index.tsx` (`invitation | portal | universe | finale`).

## Estrutura

```
src/
  routes/
    index.tsx                     experiência principal (ssr: false)
    timeline.tsx                  navegação alternativa / fallback
    auth.tsx                      login privado (e-mail + Google)
    _authenticated/route.tsx      portão de rotas privadas
    _authenticated/admin.tsx      painel /admin
  components/
    intro/EnvelopeIntro.tsx       envelope, selo de cera R & M
    universe/PortalTransition.tsx viagem interdimensional
    universe/UniverseScene.tsx    canvas, câmera, constelações
    universe/GalaxyDust.tsx       poeira cósmica (budget de partículas)
    universe/MemoryStar.tsx       estrela → luz → silhueta → foto
    universe/FinalScene.tsx       estrelas formam o coração R ♥ M
    universe/UniverseLoader.tsx   loading temático
    memories/MemoryExperience.tsx abertura da memória e álbum
    admin/MemoryForm.tsx          formulário e uploads
    audio/AudioController.tsx     trilha ambiente pós-interação
  lib/
    memories.ts                   leitura de dados + signed URLs
    star-layout.ts                posicionamento determinístico das estrelas
    three-helpers.ts              textura de brilho, qualidade adaptativa, WebGL check
    universe-types.ts             tipos do domínio
```

## Banco de dados

- `categories` — constelações (12 capítulos já semeados)
- `memories` — título, descrição, data, local, constelação, importância
  (`normal | special | legendary`), `secret`, `visibility` (`public | secret | private`), capa
- `memory_media` — álbum (várias fotos/vídeos por estrela), com `position`
- `user_roles` + `has_role()` — papéis fora da tabela de usuários (evita escalonamento de privilégio)
- `claim_admin()` — a primeira conta criada vira administradora; depois disso a função não concede mais nada

## Storage

Bucket **privado** `memories`, organizado por ano: `memories/<ano>/<uuid>-<arquivo>`.
As fotos das memórias gerenciadas no painel são lidas por **signed URLs** de 6 horas,
geradas sob demanda e cacheadas em memória.

A coleção de fotos cuja publicação foi solicitada pelo Founder em 02/10/2026 é versionada
em `src/assets/published-memories/`, com catálogo em `src/lib/published-memories.ts`.
Essas imagens são públicas, recebem URLs de assets do Vite e acompanham cada deploy.
`fetchPublicUniverse()` reúne os sete álbuns com as memórias gerenciadas; as categorias
são associadas pelo slug, preservando IDs e ordem do catálogo do Supabase.
`fetchMemoryMedia()` resolve os álbuns publicados sem chamadas ao Storage.
O painel continua consultando apenas as memórias editáveis do Supabase.

## Segurança

- RLS ativo em todas as tabelas; escrita apenas para `has_role(auth.uid(),'admin')`
- Leitura pública só de memórias com `visibility <> 'private'`
- Políticas de `storage.objects`: escrita só admin; leitura via signed URL
- Nenhuma chave de serviço no frontend; `.env.example` sem valores reais
- `noindex, nofollow` em todas as rotas e `robots.txt` bloqueando indexação
- Risco documentado: um signed URL compartilhado permanece válido até expirar

## Performance

- Orçamento de partículas por tier (`high 9000 / balanced 4500 / low 1800`), detectado por
  núcleos de CPU, user agent e `prefers-reduced-motion`
- Estrela distante carrega **nenhuma** imagem; a capa só é baixada quando a câmera entra na
  faixa de revelação; o álbum completo só ao abrir a memória
- `dpr` limitado, antialias desligado no tier baixo, `delta` clampado, damping exponencial
- Código 3D fora do SSR (`ssr: false`) e carregado só na rota da experiência

## Acessibilidade

Linha do tempo como caminho alternativo completo, fallback automático sem WebGL,
teclado (Esc / setas) na memória aberta, `alt` em todas as imagens, foco visível,
respeito a `prefers-reduced-motion`.
