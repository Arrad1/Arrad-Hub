"use client";

import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { deckModules, POST_SIZE_MM, type DeckModule, type PostCorner } from "@/lib/decking-modules";

type PlacedModule = { instanceId: string; moduleId: number; x: number; y: number; rotated: boolean; siteLengthMm?: number; siteWidthMm?: number };
type DragState = { instanceId: string; offsetX: number; offsetY: number } | null;

const SCALE = 0.055;
const GRID = 10;
const CANVAS_WIDTH = 1100;
const CANVAS_HEIGHT = 720;
const CARAVAN_LENGTH_MM = 11582;
const CARAVAN_WIDTH_MM = 3658;
const money = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 });

function modulePixels(module: DeckModule, rotated: boolean, siteLengthMm: number = module.lengthMm, siteWidthMm: number = module.widthMm) {
  const width = siteLengthMm * SCALE;
  const height = siteWidthMm * SCALE;
  return rotated ? { width: height, height: width } : { width, height };
}

function ModuleDrawing({ module, compact = false, presentation = false }: { module: DeckModule; compact?: boolean; presentation?: boolean }) {
  const post = Math.max(compact ? 7 : POST_SIZE_MM * SCALE, 7);
  return (
    <div className={`relative h-full w-full rounded-sm border-2 shadow-sm ${presentation ? "border-[#222a2c] bg-[#3f4b4f]" : "border-[#4d4f4c] bg-[#d9b77d]"}`} style={presentation ? { backgroundImage: "repeating-linear-gradient(0deg, transparent 0 7px, rgba(255,255,255,.10) 7px 8px)" } : undefined}>
      <div className={`absolute inset-x-1 top-1 border-t-2 ${presentation ? "border-slate-200/70" : "border-[#686a67]"}`} />
      {module.posts.map((corner) => <Post key={corner} corner={corner} size={post} presentation={presentation} />)}
      {!presentation && <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded bg-white/90 px-1.5 py-0.5 text-[10px] font-black text-slate-900 shadow-sm sm:text-xs">#{module.id}</span>}
    </div>
  );
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
  const [caravanVertical, setCaravanVertical] = useState(true);
  const [finalView, setFinalView] = useState(false);
  const [canvasZoom, setCanvasZoom] = useState(1);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = localStorage.getItem("arrad-deck-design-v1");
        if (saved) setPlaced(JSON.parse(saved));
      } catch { /* start with a clean plan if saved data is invalid */ }
      setLoaded(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem("arrad-deck-design-v1", JSON.stringify(placed));
  }, [placed, loaded]);

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
      y: y ?? Math.min(30 + offset, CANVAS_HEIGHT - size.height - 10), rotated: false,
      siteLengthMm: moduleDefinition.lengthMm, siteWidthMm: moduleDefinition.widthMm,
    };
    setPlaced((current) => [...current, item]);
    setSelected(item.instanceId);
  }

  function startMove(event: ReactPointerEvent<HTMLButtonElement>, item: PlacedModule) {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setSelected(item.instanceId);
    setDrag({ instanceId: item.instanceId, offsetX: (event.clientX - rect.left) / canvasZoom - item.x, offsetY: (event.clientY - rect.top) / canvasZoom - item.y });
  }

  function move(event: ReactPointerEvent<HTMLButtonElement>) {
    if (!drag) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPlaced((current) => current.map((item) => {
      if (item.instanceId !== drag.instanceId) return item;
      const moduleDefinition = deckModules.find((candidate) => candidate.id === item.moduleId)!;
      const size = modulePixels(moduleDefinition, item.rotated, item.siteLengthMm, item.siteWidthMm);
      const x = Math.round(Math.max(0, Math.min((event.clientX - rect.left) / canvasZoom - drag.offsetX, CANVAS_WIDTH - size.width)) / GRID) * GRID;
      const y = Math.round(Math.max(0, Math.min((event.clientY - rect.top) / canvasZoom - drag.offsetY, CANVAS_HEIGHT - size.height)) / GRID) * GRID;
      return { ...item, x, y };
    }));
  }

  function updateSelected(action: "rotate" | "duplicate" | "delete") {
    const item = placed.find((candidate) => candidate.instanceId === selected);
    if (!item) return;
    if (action === "delete") {
      setPlaced((current) => current.filter((candidate) => candidate.instanceId !== selected)); setSelected(null); return;
    }
    if (action === "duplicate") {
      const copy = { ...item, instanceId: crypto.randomUUID(), x: item.x + 20, y: item.y + 20 };
      setPlaced((current) => [...current, copy]); setSelected(copy.instanceId); return;
    }
    setPlaced((current) => current.map((candidate) => candidate.instanceId === selected ? { ...candidate, rotated: !candidate.rotated } : candidate));
  }

  function updateSelectedMeasurement(field: "siteLengthMm" | "siteWidthMm", value: number) {
    if (!selected || !Number.isFinite(value)) return;
    setPlaced((current) => current.map((item) => item.instanceId === selected ? { ...item, [field]: Math.max(100, value) } : item));
  }

  const selectedItem = placed.find((item) => item.instanceId === selected);
  const selectedDefinition = selectedItem ? deckModules.find((item) => item.id === selectedItem.moduleId) : undefined;
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
          <div><span className="text-sm text-slate-500">Boxes: </span><strong>{placed.length}</strong><span className="ml-4 text-sm text-slate-500">Net total: </span><strong className="text-xl">{money.format(total)}</strong></div>
          <div className="flex flex-wrap gap-2">
            <div className="inline-flex rounded-lg border border-slate-300 bg-slate-100 p-1" aria-label="Plan appearance">
              <button type="button" onClick={() => setFinalView(false)} className={`rounded-md px-3 py-1.5 text-sm font-bold ${!finalView ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}>Plan view</button>
              <button type="button" onClick={() => setFinalView(true)} className={`rounded-md px-3 py-1.5 text-sm font-bold ${finalView ? "bg-[#4d4f4c] text-white shadow-sm" : "text-slate-500"}`}>Final view</button>
            </div>
            <button type="button" disabled={!selected} onClick={() => updateSelected("rotate")} className="secondary-button">↻ Rotate</button>
            <button type="button" disabled={!selected} onClick={() => updateSelected("duplicate")} className="secondary-button">Duplicate</button>
            <button type="button" disabled={!selected} onClick={() => updateSelected("delete")} className="rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm font-bold text-rose-700 disabled:opacity-40">Remove</button>
            <button type="button" onClick={() => setCaravanVertical((current) => !current)} className="secondary-button">↻ Rotate caravan</button>
            <button type="button" disabled={!placed.length} onClick={() => { setPlaced([]); setSelected(null); }} className="secondary-button">Clear plan</button>
          </div>
        </div>
        {selectedItem && selectedDefinition && <div className="mb-3 grid gap-3 rounded-xl border-2 border-[#cdeba1] bg-[#f7fdea] p-3 sm:grid-cols-[auto_1fr_1fr] sm:items-end">
          <div className="pr-3"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Selected box</p><p className="text-lg font-black text-slate-950">#{selectedDefinition.id} · {selectedDefinition.widthFt} ft × {selectedDefinition.lengthFt} ft</p></div>
          <label><span className="field-label">Actual site length (mm)</span><input type="number" min="100" step="1" className="form-input" value={selectedItem.siteLengthMm ?? selectedDefinition.lengthMm} onChange={(event) => updateSelectedMeasurement("siteLengthMm", Number(event.target.value))} /></label>
          <label><span className="field-label">Actual site width (mm)</span><input type="number" min="100" step="1" className="form-input" value={selectedItem.siteWidthMm ?? selectedDefinition.widthMm} onChange={(event) => updateSelectedMeasurement("siteWidthMm", Number(event.target.value))} /></label>
        </div>}
        <div ref={viewportRef} className="overflow-hidden rounded-xl border border-slate-300 bg-white p-1 shadow-sm sm:p-3">
          <div className="relative mx-auto" style={{ width: CANVAS_WIDTH * canvasZoom, height: CANVAS_HEIGHT * canvasZoom }}>
          <div ref={canvasRef} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); const id = Number(event.dataTransfer.getData("text/module-id")); const rect = canvasRef.current?.getBoundingClientRect(); if (id && rect) addModule(id, (event.clientX - rect.left) / canvasZoom - 60, (event.clientY - rect.top) / canvasZoom - 35); }} className={`relative origin-top-left touch-none overflow-hidden rounded-lg border-2 ${finalView ? "border-emerald-950/40" : "border-dashed border-slate-300"}`} style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT, transform: `scale(${canvasZoom})`, backgroundColor: finalView ? "#55753c" : "#f8faf7", backgroundImage: finalView ? "radial-gradient(circle at 20% 30%, rgba(255,255,255,.12) 0 1px, transparent 2px), radial-gradient(circle at 70% 65%, rgba(20,60,20,.20) 0 1px, transparent 2px)" : "linear-gradient(#dfe7da 1px, transparent 1px), linear-gradient(90deg, #dfe7da 1px, transparent 1px)", backgroundSize: finalView ? "13px 17px, 19px 23px" : `${GRID}px ${GRID}px` }}>
            <div className={`pointer-events-none absolute z-0 rounded-xl border-4 shadow-xl ${finalView ? "border-[#5e5548] bg-[#f2eee5]" : "border-slate-500/70 bg-sky-100/70"}`} style={{ left: (CANVAS_WIDTH - caravanSize.width) / 2, top: (CANVAS_HEIGHT - caravanSize.height) / 2, width: caravanSize.width, height: caravanSize.height }}>
              <div className={`absolute inset-3 rounded-lg border ${finalView ? "border-[#d8d0c2]" : "border-dashed border-slate-400/70"}`} />
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-white/90 px-4 py-2 text-center shadow-sm"><strong className="block text-base text-slate-800">CARAVAN</strong><span className="text-sm font-bold text-slate-600">38 ft × 12 ft</span></div>
              <span className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-slate-700 px-2 py-1 text-xs font-bold text-white">{caravanVertical ? "12 ft · 3,658 mm" : "38 ft · 11,582 mm"}</span>
              <span className="absolute -right-16 top-1/2 -translate-y-1/2 rotate-90 whitespace-nowrap rounded bg-slate-700 px-2 py-1 text-xs font-bold text-white">{caravanVertical ? "38 ft · 11,582 mm" : "12 ft · 3,658 mm"}</span>
            </div>
            {!placed.length && <div className="pointer-events-none absolute inset-0 z-10 flex items-end justify-center pb-5"><div className="rounded-xl bg-white/90 px-6 py-4 text-center shadow-sm"><p className="font-bold text-slate-700">Add decking around the caravan</p><p className="mt-1 text-sm text-slate-500">Choose a numbered box section to begin.</p></div></div>}
            {placed.map((item) => {
              const moduleDefinition = deckModules.find((candidate) => candidate.id === item.moduleId)!;
              const size = modulePixels(moduleDefinition, item.rotated, item.siteLengthMm, item.siteWidthMm);
              return <button key={item.instanceId} type="button" aria-label={`Move module ${moduleDefinition.id}`} onPointerDown={(event) => startMove(event, item)} onPointerMove={move} onPointerUp={() => setDrag(null)} onPointerCancel={() => setDrag(null)} className={`absolute cursor-grab touch-none select-none ${selected === item.instanceId && !finalView ? "z-20 ring-4 ring-[#7ac400] ring-offset-2" : "z-10"}`} style={{ left: item.x, top: item.y, width: size.width, height: size.height }}><ModuleDrawing module={moduleDefinition} presentation={finalView} />{!finalView && <span className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-slate-900 px-1.5 py-0.5 text-[10px] font-bold text-white">{item.siteLengthMm ?? moduleDefinition.lengthMm} mm</span>}</button>;
            })}
          </div>
          </div>
        </div>
        <p className="mt-3 text-xs text-slate-500">The plan automatically fits your screen, including Samsung S24. Use Plan View for positioning and Final View for the cleaner customer layout.</p>
      </section>
    </div>
  );
}
