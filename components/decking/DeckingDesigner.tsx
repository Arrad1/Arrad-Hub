"use client";

import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { deckModules, POST_SIZE_MM, type DeckModule, type PostCorner, type RailSide } from "@/lib/decking-modules";

type PlacedModule = { instanceId: string; moduleId: number; x: number; y: number; rotated: boolean; flipped?: boolean; siteLengthMm?: number; siteWidthMm?: number };
type DragState = { instanceId: string; offsetX: number; offsetY: number } | null;
type AccessoryKind = "steps" | "gate";
type PlacedAccessory = { instanceId: string; kind: AccessoryKind; x: number; y: number; rotated: boolean; widthMm: number; treads?: number; riseMm?: number; goingMm?: number };

const SCALE = 0.055;
const ONE_FOOT_GRID = 304.8 * SCALE;
const GRID = ONE_FOOT_GRID / 2;
const EDGE_SNAP_DISTANCE = 12;
const CANVAS_WIDTH = 720;
const CANVAS_HEIGHT = 1100;
const CARAVAN_LENGTH_MM = 11582;
const CARAVAN_WIDTH_MM = 3658;
const CARAVAN_RIGHT_GAP = ONE_FOOT_GRID * 4;
const money = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 });

function modulePixels(module: DeckModule, rotated: boolean, siteLengthMm: number = module.lengthMm, siteWidthMm: number = module.widthMm) {
  const width = siteLengthMm * SCALE;
  const height = siteWidthMm * SCALE;
  return rotated ? { width: height, height: width } : { width, height };
}

function accessoryPixels(item: Pick<PlacedAccessory, "kind" | "rotated" | "widthMm" | "treads" | "goingMm">) {
  const width = item.widthMm * SCALE;
  const depth = item.kind === "steps" ? (item.treads ?? 3) * (item.goingMm ?? 250) * SCALE : Math.max(14, 180 * SCALE);
  return item.rotated ? { width: depth, height: width } : { width, height: depth };
}

function AccessoryDrawing({ item, presentation }: { item: PlacedAccessory; presentation: boolean }) {
  const treadDirection = item.rotated ? "90deg" : "0deg";
  if (item.kind === "gate") {
    return <div className={`relative h-full w-full border-2 ${presentation ? "border-slate-200 bg-[#303a3d]" : "border-slate-700 bg-white/90"}`}><span className="absolute inset-0 bg-[linear-gradient(to_bottom_right,transparent_47%,currentColor_48%,currentColor_52%,transparent_53%)] text-slate-700" /><span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded bg-white/90 px-1 text-[9px] font-black text-slate-900">GATE</span></div>;
  }
  return <div className={`relative h-full w-full border-2 border-slate-700 ${presentation ? "bg-[#3f4b4f]" : "bg-[#d9b77d]"}`} style={{ backgroundImage: `repeating-linear-gradient(${treadDirection}, transparent 0 calc(${100 / (item.treads ?? 3)}% - 1px), rgba(30,41,59,.75) calc(${100 / (item.treads ?? 3)}% - 1px) ${100 / (item.treads ?? 3)}%)` }}>
    {(["tl", "tr", "bl", "br"] as PostCorner[]).map((corner) => <Post key={corner} corner={corner} size={7} presentation={presentation} />)}
    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded bg-white/90 px-1 text-[9px] font-black text-slate-900">{item.treads} STEP{item.treads === 1 ? "" : "S"}</span>
  </div>;
}

function ModuleDrawing({ module, compact = false, presentation = false, rotated = false, flipped = false }: { module: DeckModule; compact?: boolean; presentation?: boolean; rotated?: boolean; flipped?: boolean }) {
  const post = Math.max(compact ? 7 : POST_SIZE_MM * SCALE, 7);
  const rotateCorner: Record<PostCorner, PostCorner> = { tl: "tr", tr: "br", br: "bl", bl: "tl" };
  const rotateRail: Record<RailSide, RailSide> = { top: "right", right: "bottom", bottom: "left", left: "top" };
  const mirrorCorner: Record<PostCorner, PostCorner> = { tl: "tr", tr: "tl", br: "bl", bl: "br" };
  const mirrorRail: Record<RailSide, RailSide> = { top: "top", right: "left", bottom: "bottom", left: "right" };
  const rotatedPosts = rotated ? module.posts.map((corner) => rotateCorner[corner]) : module.posts;
  const rotatedRails = rotated ? module.rails.map((side) => rotateRail[side]) : module.rails;
  const posts = flipped ? rotatedPosts.map((corner) => mirrorCorner[corner]) : rotatedPosts;
  const rails = flipped ? rotatedRails.map((side) => mirrorRail[side]) : rotatedRails;
  return (
    <div className={`relative h-full w-full rounded-sm border-2 shadow-sm ${presentation ? "border-[#222a2c] bg-[#3f4b4f]" : "border-[#4d4f4c] bg-[#d9b77d]"}`} style={presentation ? { backgroundImage: "repeating-linear-gradient(0deg, transparent 0 7px, rgba(255,255,255,.10) 7px 8px)" } : undefined}>
      {rails.map((side) => <Rail key={side} side={side} presentation={presentation} />)}
      {posts.map((corner) => <Post key={corner} corner={corner} size={post} presentation={presentation} />)}
      {!presentation && <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded bg-white/90 px-1.5 py-0.5 text-[10px] font-black text-slate-900 shadow-sm sm:text-xs">#{module.id}</span>}
    </div>
  );
}

function Rail({ side, presentation }: { side: RailSide; presentation: boolean }) {
  const colour = presentation ? "border-slate-200/70" : "border-[#686a67]";
  const positions: Record<RailSide, string> = {
    top: `absolute inset-x-1 top-1 border-t-2 ${colour}`,
    right: `absolute inset-y-1 right-1 border-r-2 ${colour}`,
    bottom: `absolute inset-x-1 bottom-1 border-b-2 ${colour}`,
    left: `absolute inset-y-1 left-1 border-l-2 ${colour}`,
  };
  return <span className={positions[side]} />;
}

function Post({ corner, size, presentation = false }: { corner: PostCorner; size: number; presentation?: boolean }) {
  const positions: Record<PostCorner, string> = {
    tl: "-left-1 -top-1", tr: "-right-1 -top-1", bl: "-bottom-1 -left-1", br: "-bottom-1 -right-1",
  };
  return <span className={`absolute z-10 border border-slate-700 ${presentation ? "bg-[#1f2729]" : "bg-slate-100"} ${positions[corner]}`} style={{ width: size, height: size }} aria-label="100 mm post" />;
}

export default function DeckingDesigner() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [widthFilter, setWidthFilter] = useState<number | "all">("all");
  const [placed, setPlaced] = useState<PlacedModule[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [drag, setDrag] = useState<DragState>(null);
  const [accessories, setAccessories] = useState<PlacedAccessory[]>([]);
  const [selectedAccessory, setSelectedAccessory] = useState<string | null>(null);
  const [accessoryDrag, setAccessoryDrag] = useState<DragState>(null);
  const [caravanVertical, setCaravanVertical] = useState(true);
  const [finalView, setFinalView] = useState(false);
  const [canvasZoom, setCanvasZoom] = useState(1);
  const [loaded, setLoaded] = useState(false);
  const [measurementDraft, setMeasurementDraft] = useState({ siteLengthMm: "", siteWidthMm: "" });
  const [accessoryDraft, setAccessoryDraft] = useState({ widthMm: "", riseMm: "", goingMm: "" });

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = localStorage.getItem("arrad-deck-design-v1");
        if (saved) {
          const items: PlacedModule[] = JSON.parse(saved);
          setPlaced(items.map((item) => {
            const definition = deckModules.find((candidate) => candidate.id === item.moduleId);
            if (!definition) return item;
            const migratedWidth = item.moduleId >= 21 && item.moduleId <= 24 && item.siteWidthMm === 2470 ? 2370 : item.siteWidthMm;
            const size = modulePixels(definition, item.rotated, item.siteLengthMm, migratedWidth);
            return { ...item, siteWidthMm: migratedWidth, x: Math.max(0, Math.min(item.x, CANVAS_WIDTH - size.width)), y: Math.max(0, Math.min(item.y, CANVAS_HEIGHT - size.height)) };
          }));
        }
        const savedAccessories = localStorage.getItem("arrad-deck-accessories-v1");
        if (savedAccessories) setAccessories(JSON.parse(savedAccessories));
      } catch { /* start with a clean plan if saved data is invalid */ }
      setLoaded(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem("arrad-deck-design-v1", JSON.stringify(placed));
  }, [placed, loaded]);

  useEffect(() => {
    if (loaded) localStorage.setItem("arrad-deck-accessories-v1", JSON.stringify(accessories));
  }, [accessories, loaded]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const fitCanvas = () => setCanvasZoom(Math.min(1, Math.max(0.28, (viewport.clientWidth - 2) / CANVAS_WIDTH)));
    fitCanvas();
    const observer = new ResizeObserver(fitCanvas);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, []);

  const visibleModules = widthFilter === "all" ? deckModules : deckModules.filter((item) => item.widthFt === widthFilter);
  const total = useMemo(() => placed.reduce((sum, item) => sum + (deckModules.find((module) => module.id === item.moduleId)?.price ?? 0), 0), [placed]);

  function addModule(moduleId: number, x?: number, y?: number) {
    const moduleDefinition = deckModules.find((item) => item.id === moduleId)!;
    const size = modulePixels(moduleDefinition, false);
    const offset = placed.length * 14;
    const item: PlacedModule = {
      instanceId: crypto.randomUUID(), moduleId,
      x: x ?? Math.min(30 + offset, CANVAS_WIDTH - size.width - 10),
      y: y ?? Math.min(30 + offset, CANVAS_HEIGHT - size.height - 10), rotated: false, flipped: false,
      siteLengthMm: moduleDefinition.lengthMm, siteWidthMm: moduleDefinition.widthMm,
    };
    setPlaced((current) => [...current, item]);
    setSelected(item.instanceId);
    setSelectedAccessory(null);
  }

  function addAccessory(kind: AccessoryKind, x?: number, y?: number) {
    const item: PlacedAccessory = { instanceId: crypto.randomUUID(), kind, x: x ?? 40, y: y ?? 80, rotated: false, widthMm: kind === "steps" ? 760 : 740, ...(kind === "steps" ? { treads: 3, riseMm: 150, goingMm: 250 } : {}) };
    setAccessories((current) => [...current, item]);
    setSelectedAccessory(item.instanceId);
    setSelected(null);
  }

  function startMove(event: ReactPointerEvent<HTMLButtonElement>, item: PlacedModule) {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setSelected(item.instanceId);
    setSelectedAccessory(null);
    setDrag({ instanceId: item.instanceId, offsetX: (event.clientX - rect.left) / canvasZoom - item.x, offsetY: (event.clientY - rect.top) / canvasZoom - item.y });
  }

  function startAccessoryMove(event: ReactPointerEvent<HTMLButtonElement>, item: PlacedAccessory) {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setSelectedAccessory(item.instanceId);
    setSelected(null);
    setAccessoryDrag({ instanceId: item.instanceId, offsetX: (event.clientX - rect.left) / canvasZoom - item.x, offsetY: (event.clientY - rect.top) / canvasZoom - item.y });
  }

  function moveAccessory(event: ReactPointerEvent<HTMLButtonElement>) {
    if (!accessoryDrag) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    setAccessories((current) => current.map((item) => {
      if (item.instanceId !== accessoryDrag.instanceId) return item;
      const size = accessoryPixels(item);
      const x = Math.round(Math.max(0, Math.min((event.clientX - rect.left) / canvasZoom - accessoryDrag.offsetX, CANVAS_WIDTH - size.width)) / GRID) * GRID;
      const y = Math.round(Math.max(0, Math.min((event.clientY - rect.top) / canvasZoom - accessoryDrag.offsetY, CANVAS_HEIGHT - size.height)) / GRID) * GRID;
      return { ...item, x, y };
    }));
  }

  function updateSelectedAccessory(action: "rotate" | "duplicate" | "delete") {
    const item = accessories.find((candidate) => candidate.instanceId === selectedAccessory);
    if (!item) return;
    if (action === "delete") { setAccessories((current) => current.filter((candidate) => candidate.instanceId !== selectedAccessory)); setSelectedAccessory(null); return; }
    if (action === "duplicate") {
      const copy = { ...item, instanceId: crypto.randomUUID(), x: item.x + 20, y: item.y + 20 };
      setAccessories((current) => [...current, copy]); setSelectedAccessory(copy.instanceId); return;
    }
    setAccessories((current) => current.map((candidate) => candidate.instanceId === selectedAccessory ? { ...candidate, rotated: !candidate.rotated } : candidate));
  }

  function commitAccessoryMeasurement(field: "widthMm" | "riseMm" | "goingMm") {
    if (!selectedAccessoryItem) return;
    const value = Number(accessoryDraft[field]);
    if (Number.isFinite(value) && value >= 50) {
      setAccessories((current) => current.map((item) => item.instanceId === selectedAccessory ? { ...item, [field]: value } : item));
    } else {
      const fallback = field === "widthMm" ? selectedAccessoryItem.widthMm : field === "riseMm" ? selectedAccessoryItem.riseMm ?? 150 : selectedAccessoryItem.goingMm ?? 250;
      setAccessoryDraft((current) => ({ ...current, [field]: String(fallback) }));
    }
  }

  function move(event: ReactPointerEvent<HTMLButtonElement>) {
    if (!drag) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPlaced((current) => current.map((item) => {
      if (item.instanceId !== drag.instanceId) return item;
      const moduleDefinition = deckModules.find((candidate) => candidate.id === item.moduleId)!;
      const size = modulePixels(moduleDefinition, item.rotated, item.siteLengthMm, item.siteWidthMm);
      let x = Math.round(Math.max(0, Math.min((event.clientX - rect.left) / canvasZoom - drag.offsetX, CANVAS_WIDTH - size.width)) / GRID) * GRID;
      let y = Math.round(Math.max(0, Math.min((event.clientY - rect.top) / canvasZoom - drag.offsetY, CANVAS_HEIGHT - size.height)) / GRID) * GRID;

      for (const neighbour of current) {
        if (neighbour.instanceId === item.instanceId) continue;
        const neighbourDefinition = deckModules.find((candidate) => candidate.id === neighbour.moduleId)!;
        const neighbourSize = modulePixels(neighbourDefinition, neighbour.rotated, neighbour.siteLengthMm, neighbour.siteWidthMm);
        const overlapsVertically = y < neighbour.y + neighbourSize.height + EDGE_SNAP_DISTANCE && y + size.height > neighbour.y - EDGE_SNAP_DISTANCE;
        const overlapsHorizontally = x < neighbour.x + neighbourSize.width + EDGE_SNAP_DISTANCE && x + size.width > neighbour.x - EDGE_SNAP_DISTANCE;

        if (overlapsVertically && Math.abs(x - (neighbour.x + neighbourSize.width)) <= EDGE_SNAP_DISTANCE) x = neighbour.x + neighbourSize.width;
        else if (overlapsVertically && Math.abs(x + size.width - neighbour.x) <= EDGE_SNAP_DISTANCE) x = neighbour.x - size.width;

        if (overlapsHorizontally && Math.abs(y - (neighbour.y + neighbourSize.height)) <= EDGE_SNAP_DISTANCE) y = neighbour.y + neighbourSize.height;
        else if (overlapsHorizontally && Math.abs(y + size.height - neighbour.y) <= EDGE_SNAP_DISTANCE) y = neighbour.y - size.height;

        if (Math.abs(y - neighbour.y) <= EDGE_SNAP_DISTANCE) y = neighbour.y;
        else if (Math.abs(y + size.height - (neighbour.y + neighbourSize.height)) <= EDGE_SNAP_DISTANCE) y = neighbour.y + neighbourSize.height - size.height;
        if (Math.abs(x - neighbour.x) <= EDGE_SNAP_DISTANCE) x = neighbour.x;
        else if (Math.abs(x + size.width - (neighbour.x + neighbourSize.width)) <= EDGE_SNAP_DISTANCE) x = neighbour.x + neighbourSize.width - size.width;
      }

      x = Math.max(0, Math.min(x, CANVAS_WIDTH - size.width));
      y = Math.max(0, Math.min(y, CANVAS_HEIGHT - size.height));
      return { ...item, x, y };
    }));
  }

  function updateSelected(action: "rotate" | "flip" | "duplicate" | "delete") {
    const item = placed.find((candidate) => candidate.instanceId === selected);
    if (!item) return;
    if (action === "delete") {
      setPlaced((current) => current.filter((candidate) => candidate.instanceId !== selected)); setSelected(null); return;
    }
    if (action === "duplicate") {
      const copy = { ...item, instanceId: crypto.randomUUID(), x: item.x + 20, y: item.y + 20 };
      setPlaced((current) => [...current, copy]); setSelected(copy.instanceId); return;
    }
    if (action === "flip") {
      setPlaced((current) => current.map((candidate) => candidate.instanceId === selected ? { ...candidate, flipped: !candidate.flipped } : candidate)); return;
    }
    setPlaced((current) => current.map((candidate) => candidate.instanceId === selected ? { ...candidate, rotated: !candidate.rotated } : candidate));
  }

  function commitSelectedMeasurement(field: "siteLengthMm" | "siteWidthMm") {
    if (!selected) return;
    const value = Number(measurementDraft[field]);
    if (Number.isFinite(value) && value >= 100) {
      setPlaced((current) => current.map((item) => item.instanceId === selected ? { ...item, [field]: value } : item));
      return;
    }
    const item = placed.find((candidate) => candidate.instanceId === selected);
    const definition = item ? deckModules.find((candidate) => candidate.id === item.moduleId) : undefined;
    if (item && definition) setMeasurementDraft((current) => ({ ...current, [field]: String(item[field] ?? definition[field === "siteLengthMm" ? "lengthMm" : "widthMm"]) }));
  }

  const selectedItem = placed.find((item) => item.instanceId === selected);
  const selectedDefinition = selectedItem ? deckModules.find((item) => item.id === selectedItem.moduleId) : undefined;
  const selectedAccessoryItem = accessories.find((item) => item.instanceId === selectedAccessory);
  useEffect(() => {
    if (selectedAccessoryItem) setAccessoryDraft({ widthMm: String(selectedAccessoryItem.widthMm), riseMm: String(selectedAccessoryItem.riseMm ?? 150), goingMm: String(selectedAccessoryItem.goingMm ?? 250) });
  }, [selectedAccessory, selectedAccessoryItem]);
  useEffect(() => {
    if (!selectedItem || !selectedDefinition) return;
    setMeasurementDraft({
      siteLengthMm: String(selectedItem.siteLengthMm ?? selectedDefinition.lengthMm),
      siteWidthMm: String(selectedItem.siteWidthMm ?? selectedDefinition.widthMm),
    });
  }, [selected, selectedDefinition, selectedItem]);
  const caravanLengthPx = CARAVAN_LENGTH_MM * SCALE;
  const caravanWidthPx = CARAVAN_WIDTH_MM * SCALE;
  const caravanSize = caravanVertical
    ? { width: caravanWidthPx, height: caravanLengthPx }
    : { width: caravanLengthPx, height: caravanWidthPx };

  return (
    <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
      <aside className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3"><div><h2 className="font-bold text-slate-950">Modular box sections</h2><p className="mt-1 text-xs text-slate-500">Tap Add, or drag onto the plan.</p></div><span className="rounded-full bg-[#e9f7d4] px-2.5 py-1 text-xs font-black text-[#4d8100]">24 boxes</span></div>
        <label className="mt-4 block text-sm font-semibold text-slate-700">Filter by deck width</label>
        <select className="small-select mt-2 w-full" value={widthFilter} onChange={(e) => setWidthFilter(e.target.value === "all" ? "all" : Number(e.target.value))}>
          <option value="all">All widths</option>{[3, 4, 5, 6, 7, 8].map((width) => <option key={width} value={width}>{width} ft wide</option>)}
        </select>
        <div className="mt-4 rounded-xl border-2 border-[#cdeba1] bg-[#f7fdea] p-3">
          <h3 className="font-bold text-slate-950">Steps and gates</h3>
          <p className="mt-1 text-xs text-slate-600">Tap Add on a phone, or drag onto the plan.</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <article draggable onDragStart={(event) => event.dataTransfer.setData("text/accessory-kind", "steps")} className="rounded-lg border border-slate-200 bg-white p-2 text-center">
              <div className="mx-auto grid h-12 w-16 grid-rows-3 border-2 border-slate-700 bg-[#d9b77d]"><span className="border-b border-slate-600" /><span className="border-b border-slate-600" /><span /></div>
              <p className="mt-2 text-xs font-black text-slate-800">Steps · 760 mm</p>
              <button type="button" onClick={() => addAccessory("steps")} className="mt-2 w-full rounded-md bg-[#7ac400] px-2 py-2 text-xs font-black text-[#242624]">+ Add steps</button>
            </article>
            <article draggable onDragStart={(event) => event.dataTransfer.setData("text/accessory-kind", "gate")} className="rounded-lg border border-slate-200 bg-white p-2 text-center">
              <div className="relative mx-auto h-12 w-16 border-2 border-slate-700 bg-white"><span className="absolute inset-0 bg-[linear-gradient(to_bottom_right,transparent_47%,#334155_48%,#334155_52%,transparent_53%)]" /></div>
              <p className="mt-2 text-xs font-black text-slate-800">Gate · 740 mm</p>
              <button type="button" onClick={() => addAccessory("gate")} className="mt-2 w-full rounded-md bg-[#7ac400] px-2 py-2 text-xs font-black text-[#242624]">+ Add gate</button>
            </article>
          </div>
        </div>
        <div className="mt-4 grid max-h-[640px] grid-cols-2 gap-3 overflow-y-auto pr-1">
          {visibleModules.map((module) => (
            <article key={module.id} draggable onDragStart={(event) => event.dataTransfer.setData("text/module-id", String(module.id))} className="rounded-lg border border-slate-200 bg-slate-50 p-2">
              <div className="mx-auto h-16" style={{ width: module.lengthFt === 8 ? 112 : 88 }}><ModuleDrawing module={module} compact /></div>
              <p className="mt-2 text-center text-xs font-bold text-slate-800">{module.widthFt} ft × {module.lengthFt} ft · {module.layout}</p>
              <p className="text-center text-xs font-black text-[#5e9e00]">{money.format(module.price)} net</p>
              <button type="button" onClick={() => addModule(module.id)} className="mt-2 w-full rounded-md bg-[#7ac400] px-2 py-2 text-xs font-black text-[#242624]">+ Add to plan</button>
            </article>
          ))}
        </div>
      </aside>

      <section className="min-w-0">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <div><span className="text-sm text-slate-500">Boxes: </span><strong>{placed.length}</strong><span className="ml-3 text-sm text-slate-500">Steps/gates: </span><strong>{accessories.length}</strong><span className="ml-4 text-sm text-slate-500">Net total: </span><strong className="text-xl">{money.format(total)}</strong></div>
          <div className="flex flex-wrap gap-2">
            <div className="inline-flex rounded-lg border border-slate-300 bg-slate-100 p-1" aria-label="Plan appearance">
              <button type="button" onClick={() => setFinalView(false)} className={`rounded-md px-3 py-1.5 text-sm font-bold ${!finalView ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}>Plan view</button>
              <button type="button" onClick={() => setFinalView(true)} className={`rounded-md px-3 py-1.5 text-sm font-bold ${finalView ? "bg-[#4d4f4c] text-white shadow-sm" : "text-slate-500"}`}>Final view</button>
            </div>
            <button type="button" disabled={!selected} onClick={() => updateSelected("rotate")} className="secondary-button">↻ Rotate</button>
            <button type="button" disabled={!selected} onClick={() => updateSelected("flip")} className="secondary-button">⇄ Flip / mirror</button>
            <button type="button" disabled={!selected} onClick={() => updateSelected("duplicate")} className="secondary-button">Duplicate</button>
            <button type="button" disabled={!selected} onClick={() => updateSelected("delete")} className="rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm font-bold text-rose-700 disabled:opacity-40">Remove</button>
            <button type="button" onClick={() => setCaravanVertical((current) => !current)} className="secondary-button">↻ Rotate caravan</button>
            <button type="button" disabled={!placed.length && !accessories.length} onClick={() => { setPlaced([]); setAccessories([]); setSelected(null); setSelectedAccessory(null); }} className="secondary-button">Clear plan</button>
          </div>
        </div>
        {selectedItem && selectedDefinition && <div className="mb-3 grid gap-3 rounded-xl border-2 border-[#cdeba1] bg-[#f7fdea] p-3 sm:grid-cols-[auto_1fr_1fr] sm:items-end">
          <div className="pr-3"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Selected box</p><p className="text-lg font-black text-slate-950">#{selectedDefinition.id} · {selectedDefinition.widthFt} ft × {selectedDefinition.lengthFt} ft</p></div>
          <label><span className="field-label">Actual site length (mm)</span><input type="number" inputMode="numeric" min="100" step="1" className="form-input" value={measurementDraft.siteLengthMm} onChange={(event) => setMeasurementDraft((current) => ({ ...current, siteLengthMm: event.target.value }))} onBlur={() => commitSelectedMeasurement("siteLengthMm")} onKeyDown={(event) => { if (event.key === "Enter") event.currentTarget.blur(); }} /></label>
          <label><span className="field-label">Actual site width (mm)</span><input type="number" inputMode="numeric" min="100" step="1" className="form-input" value={measurementDraft.siteWidthMm} onChange={(event) => setMeasurementDraft((current) => ({ ...current, siteWidthMm: event.target.value }))} onBlur={() => commitSelectedMeasurement("siteWidthMm")} onKeyDown={(event) => { if (event.key === "Enter") event.currentTarget.blur(); }} /></label>
        </div>}
        {selectedAccessoryItem && <div className="mb-3 grid gap-3 rounded-xl border-2 border-[#cdeba1] bg-[#f7fdea] p-3 sm:grid-cols-[auto_1fr_auto] sm:items-end">
          <div className="pr-3"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Selected item</p><p className="text-lg font-black capitalize text-slate-950">{selectedAccessoryItem.kind}</p></div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {selectedAccessoryItem.kind === "steps" && <label><span className="field-label">Number of treads</span><select className="form-input" value={selectedAccessoryItem.treads ?? 3} onChange={(event) => setAccessories((current) => current.map((item) => item.instanceId === selectedAccessory ? { ...item, treads: Number(event.target.value) } : item))}>{[1, 2, 3, 4, 5, 6].map((count) => <option key={count} value={count}>{count} tread{count === 1 ? "" : "s"}</option>)}</select></label>}
            <label><span className="field-label">{selectedAccessoryItem.kind === "gate" ? "Gate" : "Step"} width (mm)</span><input type="number" inputMode="numeric" min="100" step="1" className="form-input" value={accessoryDraft.widthMm} onChange={(event) => setAccessoryDraft((current) => ({ ...current, widthMm: event.target.value }))} onBlur={() => commitAccessoryMeasurement("widthMm")} onKeyDown={(event) => { if (event.key === "Enter") event.currentTarget.blur(); }} /></label>
            {selectedAccessoryItem.kind === "steps" && <label><span className="field-label">Rise per tread (mm)</span><input type="number" inputMode="numeric" min="50" step="1" className="form-input" value={accessoryDraft.riseMm} onChange={(event) => setAccessoryDraft((current) => ({ ...current, riseMm: event.target.value }))} onBlur={() => commitAccessoryMeasurement("riseMm")} onKeyDown={(event) => { if (event.key === "Enter") event.currentTarget.blur(); }} /></label>}
            {selectedAccessoryItem.kind === "steps" && <label><span className="field-label">Going per tread (mm)</span><input type="number" inputMode="numeric" min="50" step="1" className="form-input" value={accessoryDraft.goingMm} onChange={(event) => setAccessoryDraft((current) => ({ ...current, goingMm: event.target.value }))} onBlur={() => commitAccessoryMeasurement("goingMm")} onKeyDown={(event) => { if (event.key === "Enter") event.currentTarget.blur(); }} /></label>}
          </div>
          <div className="flex flex-wrap gap-2"><button type="button" onClick={() => updateSelectedAccessory("rotate")} className="secondary-button">↻ Rotate</button><button type="button" onClick={() => updateSelectedAccessory("duplicate")} className="secondary-button">Duplicate</button><button type="button" onClick={() => updateSelectedAccessory("delete")} className="rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm font-bold text-rose-700">Remove</button></div>
        </div>}
        <div ref={viewportRef} className="overflow-hidden rounded-xl border border-slate-300 bg-white p-1 shadow-sm sm:p-3">
          <div className="relative mx-auto" style={{ width: CANVAS_WIDTH * canvasZoom, height: CANVAS_HEIGHT * canvasZoom }}>
          <div ref={canvasRef} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); const id = Number(event.dataTransfer.getData("text/module-id")); const kind = event.dataTransfer.getData("text/accessory-kind") as AccessoryKind; const rect = canvasRef.current?.getBoundingClientRect(); if (!rect) return; const x = (event.clientX - rect.left) / canvasZoom - 50; const y = (event.clientY - rect.top) / canvasZoom - 30; if (id) addModule(id, x, y); else if (kind === "steps" || kind === "gate") addAccessory(kind, x, y); }} className={`relative origin-top-left touch-none overflow-hidden rounded-lg border-2 ${finalView ? "border-emerald-950/40" : "border-dashed border-slate-300"}`} style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT, transform: `scale(${canvasZoom})`, backgroundColor: finalView ? "#55753c" : "#f8faf7", backgroundImage: finalView ? "radial-gradient(circle at 20% 30%, rgba(255,255,255,.12) 0 1px, transparent 2px), radial-gradient(circle at 70% 65%, rgba(20,60,20,.20) 0 1px, transparent 2px)" : "linear-gradient(#d2ded0 1px, transparent 1px), linear-gradient(90deg, #d2ded0 1px, transparent 1px)", backgroundSize: finalView ? "13px 17px, 19px 23px" : `${ONE_FOOT_GRID}px ${ONE_FOOT_GRID}px` }}>
            <div className={`pointer-events-none absolute z-0 rounded-xl border-4 shadow-xl ${finalView ? "border-[#5e5548] bg-[#f2eee5]" : "border-slate-500/70 bg-sky-100/70"}`} style={{ left: CANVAS_WIDTH - caravanSize.width - CARAVAN_RIGHT_GAP, top: (CANVAS_HEIGHT - caravanSize.height) / 2, width: caravanSize.width, height: caravanSize.height }}>
              <div className={`absolute inset-3 rounded-lg border ${finalView ? "border-[#d8d0c2]" : "border-dashed border-slate-400/70"}`} />
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-white/90 px-4 py-2 text-center shadow-sm"><strong className="block text-base text-slate-800">CARAVAN</strong><span className="text-sm font-bold text-slate-600">38 ft × 12 ft</span></div>
              <span className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-slate-700 px-2 py-1 text-xs font-bold text-white">{caravanVertical ? "12 ft · 3,658 mm" : "38 ft · 11,582 mm"}</span>
              <span className="absolute -right-16 top-1/2 -translate-y-1/2 rotate-90 whitespace-nowrap rounded bg-slate-700 px-2 py-1 text-xs font-bold text-white">{caravanVertical ? "38 ft · 11,582 mm" : "12 ft · 3,658 mm"}</span>
            </div>
            {!placed.length && !accessories.length && <div className="pointer-events-none absolute inset-0 z-10 flex items-end justify-center pb-5"><div className="rounded-xl bg-white/90 px-6 py-4 text-center shadow-sm"><p className="font-bold text-slate-700">Add decking around the caravan</p><p className="mt-1 text-sm text-slate-500">Choose a box section, steps or gate to begin.</p></div></div>}
            {placed.map((item) => {
              const moduleDefinition = deckModules.find((candidate) => candidate.id === item.moduleId)!;
              const size = modulePixels(moduleDefinition, item.rotated, item.siteLengthMm, item.siteWidthMm);
              return <button key={item.instanceId} type="button" aria-label={`Move module ${moduleDefinition.id}`} onPointerDown={(event) => startMove(event, item)} onPointerMove={move} onPointerUp={() => setDrag(null)} onPointerCancel={() => setDrag(null)} className={`absolute cursor-grab touch-none select-none ${selected === item.instanceId && !finalView ? "z-20 ring-4 ring-[#7ac400] ring-offset-2" : "z-10"}`} style={{ left: item.x, top: item.y, width: size.width, height: size.height }}><ModuleDrawing module={moduleDefinition} presentation={finalView} rotated={item.rotated} flipped={item.flipped} />{!finalView && <span className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-slate-900 px-1.5 py-0.5 text-[10px] font-bold text-white">{item.siteLengthMm ?? moduleDefinition.lengthMm} mm</span>}</button>;
            })}
            {accessories.map((item) => {
              const size = accessoryPixels(item);
              return <button key={item.instanceId} type="button" aria-label={`Move ${item.kind}`} onPointerDown={(event) => startAccessoryMove(event, item)} onPointerMove={moveAccessory} onPointerUp={() => setAccessoryDrag(null)} onPointerCancel={() => setAccessoryDrag(null)} className={`absolute cursor-grab touch-none select-none ${selectedAccessory === item.instanceId && !finalView ? "z-30 ring-4 ring-[#7ac400] ring-offset-2" : "z-20"}`} style={{ left: item.x, top: item.y, width: size.width, height: size.height }}><AccessoryDrawing item={item} presentation={finalView} />{!finalView && <span className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-slate-900 px-1.5 py-0.5 text-[10px] font-bold text-white">{item.widthMm} mm</span>}</button>;
            })}
          </div>
          </div>
        </div>
        <p className="mt-3 text-xs text-slate-500">Portrait drawing sheet. Each graph square represents 1 ft (304.8 mm). The plan automatically fits phones, tablets and computers.</p>
      </section>
    </div>
  );
}
