import cotidiano01 from "@/assets/published-memories/cotidiano-01.jpeg";
import cotidiano02 from "@/assets/published-memories/cotidiano-02.jpeg";
import cotidiano03 from "@/assets/published-memories/cotidiano-03.jpeg";
import encontros01 from "@/assets/published-memories/encontros-01.jpeg";
import encontros02 from "@/assets/published-memories/encontros-02.jpeg";
import encontros03 from "@/assets/published-memories/encontros-03.jpeg";
import encontros04 from "@/assets/published-memories/encontros-04.jpeg";
import caminho01 from "@/assets/published-memories/caminho-01.jpeg";
import caminho02 from "@/assets/published-memories/caminho-02.jpeg";
import caminho03 from "@/assets/published-memories/caminho-03.jpeg";
import passeio01 from "@/assets/published-memories/passeio-01.jpeg";
import passeio02 from "@/assets/published-memories/passeio-02.jpeg";
import passeio03 from "@/assets/published-memories/passeio-03.jpeg";
import passeio04 from "@/assets/published-memories/passeio-04.jpeg";
import passeio05 from "@/assets/published-memories/passeio-05.jpeg";
import passeio06 from "@/assets/published-memories/passeio-06.jpeg";
import natureza01 from "@/assets/published-memories/natureza-01.jpeg";
import natureza02 from "@/assets/published-memories/natureza-02.jpeg";
import natureza03 from "@/assets/published-memories/natureza-03.jpeg";
import natureza04 from "@/assets/published-memories/natureza-04.jpeg";
import natureza05 from "@/assets/published-memories/natureza-05.jpeg";
import natureza06 from "@/assets/published-memories/natureza-06.jpeg";
import natureza07 from "@/assets/published-memories/natureza-07.jpeg";
import natureza08 from "@/assets/published-memories/natureza-08.jpeg";
import natureza09 from "@/assets/published-memories/natureza-09.jpeg";
import porDoSol01 from "@/assets/published-memories/por-do-sol-01.jpeg";
import sonho01 from "@/assets/published-memories/sonho-01.jpeg";
import type { Category, Importance, Memory, MemoryMedia } from "./universe-types";

export interface PublishedAlbum {
  id: string;
  title: string;
  description: string;
  categorySlug: string;
  importance: Importance;
  photos: readonly { src: string; caption: string }[];
}

export const publishedAlbums: readonly PublishedAlbum[] = [
  {
    id: "published-dia-a-dia",
    title: "Nosso dia a dia",
    description: "Os pequenos momentos também merecem um lugar entre as estrelas.",
    categorySlug: "dias-comuns",
    importance: "normal",
    photos: [
      { src: cotidiano01, caption: "Um sorriso lado a lado, em preto e branco." },
      {
        src: cotidiano02,
        caption: "Nós dois de óculos escuros, diante de uma varanda de tijolos.",
      },
      { src: cotidiano03, caption: "Um beijo no rosto e a varanda ao fundo." },
    ],
  },
  {
    id: "published-encontros",
    title: "Nossos encontros",
    description: "Sorrisos, cumplicidade e a alegria de estar perto.",
    categorySlug: "nosso-namoro",
    importance: "special",
    photos: [
      { src: encontros01, caption: "Selfie juntos, com casacos verde e lilás." },
      { src: encontros02, caption: "Dois sorrisos e um coração entre nós." },
      { src: encontros03, caption: "Selfie lado a lado, entre mesas e luzes." },
      {
        src: encontros04,
        caption: "Mais um sorriso juntos, com teto de madeira ao fundo.",
      },
    ],
  },
  {
    id: "published-caminho",
    title: "Juntos pelo caminho",
    description: "O caminho fica mais bonito quando estamos juntos.",
    categorySlug: "nossas-aventuras",
    importance: "normal",
    photos: [
      { src: caminho01, caption: "Selfie lado a lado dentro do carro." },
      { src: caminho02, caption: "Um beijo no rosto durante uma selfie no carro." },
      { src: caminho03, caption: "Nossos sorrisos, com os bancos do carro ao fundo." },
    ],
  },
  {
    id: "published-passeios-ao-sol",
    title: "Passeios ao sol",
    description: "Olhares, beijos e sorrisos iluminados pelo sol.",
    categorySlug: "nossas-aventuras",
    importance: "special",
    photos: [
      {
        src: passeio01,
        caption: "Um olhar para o outro sob uma árvore, em um dia de sol.",
      },
      {
        src: passeio02,
        caption: "Sorrisos frente a frente, com óculos escuros e céu azul.",
      },
      {
        src: passeio03,
        caption: "Um beijo ao sol, com os galhos de uma árvore ao fundo.",
      },
      { src: passeio04, caption: "Selfie de óculos escuros, com céu azul ao fundo." },
      { src: passeio05, caption: "Dois sorrisos, com uma palmeira ao fundo." },
      { src: passeio06, caption: "Sob os galhos, dois sorrisos na mesma foto." },
    ],
  },
  {
    id: "published-entre-arvores-e-abracos",
    title: "Entre árvores e abraços",
    description: "O verde ao redor e nós dois bem perto.",
    categorySlug: "nossas-viagens",
    importance: "special",
    photos: [
      { src: natureza01, caption: "Juntos de casaco, em um caminho cercado de verde." },
      { src: natureza02, caption: "Uma selfie com beijinhos, junto a uma estrada." },
      {
        src: natureza03,
        caption: "Testas encostadas e olhos fechados entre as árvores.",
      },
      {
        src: natureza04,
        caption: "Um beijo no rosto, cercados de árvores e luz do sol.",
      },
      { src: natureza05, caption: "Nossos sorrisos entre as árvores." },
      { src: natureza06, caption: "Selfie bem perto, com um lago e árvores ao fundo." },
      { src: natureza07, caption: "Um beijo entre nós, com árvores ao fundo." },
      {
        src: natureza08,
        caption: "Um beijinho para a câmera e um sorriso entre as árvores.",
      },
      {
        src: natureza09,
        caption: "Um abraço e as testas próximas, junto a uma árvore.",
      },
    ],
  },
  {
    id: "published-por-do-sol",
    title: "Nosso pôr do sol",
    description: "O mar, a luz dourada do céu e os nossos sorrisos.",
    categorySlug: "nossas-viagens",
    importance: "legendary",
    photos: [
      {
        src: porDoSol01,
        caption: "Selfie na praia, com o sol refletido no mar ao fundo.",
      },
    ],
  },
  {
    id: "published-sonho-a-dois",
    title: "Um sonho a dois",
    description: "Uma imagem para os sonhos que queremos dividir.",
    categorySlug: "nosso-futuro",
    importance: "legendary",
    photos: [
      {
        src: sonho01,
        caption: "Nós dois com trajes de casamento, entre flores brancas e um lago.",
      },
    ],
  },
];

const publishedCategories: readonly Category[] = [
  {
    id: "published-category-nosso-namoro",
    name: "Nosso namoro",
    slug: "nosso-namoro",
    position: 2,
  },
  {
    id: "published-category-nossas-aventuras",
    name: "Nossas aventuras",
    slug: "nossas-aventuras",
    position: 4,
  },
  {
    id: "published-category-nossas-viagens",
    name: "Nossas viagens",
    slug: "nossas-viagens",
    position: 5,
  },
  {
    id: "published-category-dias-comuns",
    name: "Dias comuns que ficaram especiais",
    slug: "dias-comuns",
    position: 6,
  },
  {
    id: "published-category-nosso-futuro",
    name: "Nosso futuro",
    slug: "nosso-futuro",
    position: 12,
  },
];

export function mergePublishedCategories(categories: Category[]): Category[] {
  const existingSlugs = new Set(categories.map((category) => category.slug));
  const missing = publishedCategories.filter((category) => !existingSlugs.has(category.slug));
  return [...categories, ...missing].sort((left, right) => left.position - right.position);
}

function createPublishedMedia(album: PublishedAlbum): MemoryMedia[] {
  return album.photos.map((photo, position) => ({
    id: `${album.id}-photo-${String(position + 1).padStart(2, "0")}`,
    memory_id: album.id,
    type: "image",
    storage_path: "",
    caption: photo.caption,
    position,
    url: photo.src,
  }));
}

export function getPublishedMemories(categories: Category[]): Memory[] {
  const categoryIds = new Map(
    mergePublishedCategories(categories).map((category) => [category.slug, category.id]),
  );
  return publishedAlbums.map((album) => ({
    id: album.id,
    title: album.title,
    description: album.description,
    memory_date: null,
    location: null,
    category_id: categoryIds.get(album.categorySlug) ?? null,
    importance: album.importance,
    secret: false,
    visibility: "public",
    cover_image: null,
    // Publication timestamp; the photographs do not establish the event dates.
    created_at: "2026-10-02T23:20:00.000Z",
    coverUrl: album.photos[0]?.src ?? null,
    media: createPublishedMedia(album),
  }));
}

export function getPublishedMemoryMedia(memoryId: string): MemoryMedia[] | undefined {
  const album = publishedAlbums.find((entry) => entry.id === memoryId);
  return album ? createPublishedMedia(album) : undefined;
}
