export const QUOTES_STORAGE_KEY = "quotes";

export type QuoteStatus = "Draft" | "Sent" | "Accepted" | "Declined";
export type QuoteItem = { id: string; description: string; quantity: number; unitPrice: number };

export type Quote = {
  id: string;
  customerName: string;
  holidayPark: string;
  quoteReference: string;
  description: string;
  quoteAmount: string;
  customerAddress: string;
  customerEmail: string;
  customerPhone: string;
  quoteDate: string;
  validUntil: string;
  status: QuoteStatus;
  notes: string;
  items?: QuoteItem[];
};

type StoredQuote = Partial<Quote> & Record<string, unknown>;

function text(value: unknown) {
  return typeof value === "string" ? value : "";
}

export function normaliseQuote(quote: StoredQuote, index: number): Quote {
  const status = text(quote.status);
  return {
    id: text(quote.id) || `legacy-${index}`,
    customerName: text(quote.customerName),
    holidayPark: text(quote.holidayPark),
    quoteReference: text(quote.quoteReference),
    description: text(quote.description),
    quoteAmount: text(quote.quoteAmount),
    customerAddress: text(quote.customerAddress),
    customerEmail: text(quote.customerEmail),
    customerPhone: text(quote.customerPhone),
    quoteDate: text(quote.quoteDate),
    validUntil: text(quote.validUntil),
    status: ["Draft", "Sent", "Accepted", "Declined"].includes(status)
      ? (status as QuoteStatus)
      : "Draft",
    notes: text(quote.notes),
    items: Array.isArray(quote.items) ? quote.items.filter((item): item is QuoteItem => Boolean(item && typeof item === "object")) : undefined,
  };
}

export function loadQuotes(): Quote[] {
  try {
    const stored = JSON.parse(localStorage.getItem(QUOTES_STORAGE_KEY) || "[]");
    return Array.isArray(stored)
      ? stored.map((quote, index) => normaliseQuote(quote, index))
      : [];
  } catch {
    return [];
  }
}

export function saveQuote(quote: Quote) {
  localStorage.setItem(QUOTES_STORAGE_KEY, JSON.stringify([...loadQuotes(), quote]));
}

export function updateQuote(quote: Quote) {
  const quotes = loadQuotes();
  const index = quotes.findIndex((record) => record.id === quote.id);
  const updated = index === -1 ? [...quotes, quote] : quotes.map((record) => record.id === quote.id ? quote : record);
  localStorage.setItem(QUOTES_STORAGE_KEY, JSON.stringify(updated));
}

export function findQuote(quotes: Quote[], id: string | null) {
  return id ? quotes.find((quote) => quote.id === id) : undefined;
}

export function formatMoney(value: string) {
  const amount = Number(value);
  return Number.isFinite(amount)
    ? new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(amount)
    : "£0.00";
}

export function formatDate(value: string) {
  if (!value) return "Not specified";
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("en-GB", { dateStyle: "long" }).format(date);
}
