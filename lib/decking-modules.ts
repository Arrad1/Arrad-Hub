export type PostCorner = "tl" | "tr" | "bl" | "br";
export type RailSide = "top" | "right" | "bottom" | "left";

export type DeckModule = {
  id: number;
  widthFt: number;
  widthMm: number;
  lengthFt: 6 | 8;
  lengthMm: 1850 | 2470;
  layout: "A" | "B";
  price: number;
  posts: PostCorner[];
  rails: RailSide[];
};

const widths = [
  { ft: 3, mm: 870, prices: [867, 612, 709, 984] },
  { ft: 4, mm: 1170, prices: [978, 724, 840, 1105] },
  { ft: 5, mm: 1480, prices: [1205, 861, 1013, 1337] },
  { ft: 6, mm: 1760, prices: [1205, 861, 1013, 1337] },
  { ft: 7, mm: 2080, prices: [1370, 1011, 1268, 1657] },
  { ft: 8, mm: 2470, prices: [1370, 1011, 1268, 1657] },
];

const variants: Array<Pick<DeckModule, "lengthFt" | "lengthMm" | "layout" | "posts" | "rails">> = [
  { lengthFt: 6, lengthMm: 1850, layout: "A", posts: ["tl", "tr", "bl"], rails: ["top", "left"] },
  { lengthFt: 6, lengthMm: 1850, layout: "B", posts: ["tr", "bl"], rails: ["top"] },
  { lengthFt: 8, lengthMm: 2470, layout: "A", posts: ["tr", "bl"], rails: ["top"] },
  { lengthFt: 8, lengthMm: 2470, layout: "B", posts: ["tl", "tr", "br"], rails: ["top", "right"] },
];

export const POST_SIZE_MM = 100;

export const deckModules: DeckModule[] = widths.flatMap((width, widthIndex) =>
  variants.map((variant, variantIndex) => ({
    id: widthIndex * 4 + variantIndex + 1,
    widthFt: width.ft,
    widthMm: width.mm,
    price: width.prices[variantIndex],
    ...variant,
  })),
);
