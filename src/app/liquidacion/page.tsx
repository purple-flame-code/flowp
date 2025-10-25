"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

/**
 * Liquidación de Penas – Unificación hasta 3 delitos
 * --------------------------------------------------
 * - Unifica penas (hasta 3 delitos) con tope legal configurable (p.ej., 50 años).
 * - Calcula 1/2 y 2/3, abonos por cautelares (CPP 232) y conmutación por trabajo/estudio/conducta (CP 99-104).
 * - Exporta a PDF (si existe /lib/pdf-generator) y fallback a DOC.
 *
 * Convenciones de cómputo interno:
 * - 1 mes = 30 días (cómputo administrativo).
 * - 1 año = 12 meses = 360 días.
 * - Todos los importes se normalizan a días para operar y luego se formatean a A/M/D.
 */

// =====================
// Tipos y utilidades
// =====================
type Rol = "Defensa" | "Fiscalía" | "Juez";

interface PenaImpuesta {
  anios: number;
  meses: number;
  dias: number;
}

interface Abonos {
  // Medidas cautelares (CPP 232) y otros abonos líquidos en días
  detencionPreventivaDias: number;
  arrestoDomiciliarioDias: number;
  otrasMedidasDias: number;

  // Conmutaciones (CP 99-104), expresadas ya en días de abono líquido
  trabajoDias: number;
  estudioDias: number;
  conductaDias: number;
}

interface DelitoEntrada {
  nombre: string;
  pena: PenaImpuesta;
  abonos: Abonos;
  fechaInicio?: string; // opcional, para referencia
}

interface ResultadoDelito {
  nombre: string;
  baseDias: number;     // pena base en días
  abonosDias: number;   // total de abonos en días (cautelares + conmutaciones)
  netoDias: number;     // base - abonos (no menor que 0)
}

interface UnificacionResultado {
  totalBaseDias: number;   // suma de bases
  totalAbonosDias: number; // suma de abonos
  totalNetoDias: number;   // totalBase - totalAbonos
  topadoDias: number;      // si hay tope legal, min(totalBase, tope); se recalcula neto en función del tope
  netoTrasTopeDias: number;// max(topado - totalAbonos, 0)
  mitadDias: number;       // 1/2 del topado
  dosTercioDias: number;   // 2/3 del topado
}

// Utils tiempo
const YMD = { DAYS_PER_MONTH: 30, MONTHS_PER_YEAR: 12, DAYS_PER_YEAR: 360 };
const clamp0 = (n: number) => (n < 0 ? 0 : n);
const toDays = (p: PenaImpuesta) =>
  p.anios * YMD.DAYS_PER_YEAR + p.meses * YMD.DAYS_PER_MONTH + p.dias;

function fromDays(days: number) {
  const a = Math.floor(days / YMD.DAYS_PER_YEAR);
  const remA = days - a * YMD.DAYS_PER_YEAR;
  const m = Math.floor(remA / YMD.DAYS_PER_MONTH);
  const d = remA - m * YMD.DAYS_PER_MONTH;
  return { anios: a, meses: m, dias: d };
}

function fmtYMD(days: number) {
  const { anios, meses, dias } = fromDays(Math.round(days));
  const parts = [];
  if (anios) parts.push(`${anios} año${anios !== 1 ? "s" : ""}`);
  if (meses) parts.push(`${meses} mes${meses !== 1 ? "es" : ""}`);
  if (dias || parts.length === 0) parts.push(`${dias} día${dias !== 1 ? "s" : ""}`);
  return parts.join(" ");
}

function sumAbonos(a: Abonos) {
  return (
    (a.detencionPreventivaDias || 0) +
    (a.arrestoDomiciliarioDias || 0) +
    (a.otrasMedidasDias || 0) +
    (a.trabajoDias || 0) +
    (a.estudioDias || 0) +
    (a.conductaDias || 0)
  );
}

// =====================
// UI mínimos
// =====================
function Box({ children, className = "" }: any) {
  return (
    <div className={`bg-slate-900/50 border border-white/10 rounded-2xl ${className}`}>
      {children}
    </div>
  );
}
function Head({ title, description }: { title: string; description?: string }) {
  return (
    <div className="p-4 border-b border-white/10">
      <div className="text-base font-semibold">{title}</div>
      {description ? (
        <div className="text-xs text-slate-400 mt-0.5">{description}</div>
      ) : null}
    </div>
  );
}
function Section({ children, className = "" }: any) {
  return <div className={`p-4 ${className}`}>{children}</div>;
}
function Label({ children }: any) {
  return <label className="block text-xs text-slate-300 mb-1">{children}</label>;
}
function Input({
  value,
  onChange,
  placeholder = "",
  type = "text",
  min,
}: any) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      min={min}
      className="w-full px-3 py-2 rounded-xl bg-slate-800/60 border border-white/10 outline-none focus:ring-2 focus:ring-white/20"
    />
  );
}
function Select({
  value,
  onChange,
  options,
}: {
  value: any;
  onChange: (v: any) => void;
  options: string[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 rounded-xl bg-slate-800/60 border border-white/10 outline-none focus:ring-2 focus:ring-white/20 text-sm"
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}
function Textarea({ value, onChange, className = "" }: any) {
  return (
    <textarea
      value={value}
      onChange={onChange}
      className={`w-full px-3 py-2 rounded-xl bg-slate-800/60 border border-white/10 outline-none focus:ring-2 focus:ring-white/20 ${className}`}
    />
  );
}
function Btn({
  children,
  onClick,
  disabled = false,
  variant = "solid",
  className = "",
}: any) {
  const base =
    variant === "outline"
      ? "border border-white/20 text-slate-100 hover:bg-white/5"
      : variant === "secondary"
      ? "bg-slate-700/70 hover:bg-slate-700 text-white"
      : "bg-white/10 hover:bg-white/20 text-white";
  const state = disabled ? "opacity-50 cursor-not-allowed" : "";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-3 py-2 rounded-xl text-sm transition ${base} ${state} ${className}`}
    >
      {children}
    </button>
  );
}

// =====================
// Página
// =====================
export default function LiquidacionPage() {
  const [rol, setRol] = useState<Rol>("Defensa");

  // Tope legal (editable). Por defecto 50 años.
  const [topeLegalAnios, setTopeLegalAnios] = useState<number>(50);

  // Delito 1 (obligatorio)
  const [d1, setD1] = useState<DelitoEntrada>({
    nombre: "Robo agravado",
    pena: { anios: 6, meses: 0, dias: 0 },
    abonos: {
      detencionPreventivaDias: 120,
      arrestoDomiciliarioDias: 0,
      otrasMedidasDias: 0,
      trabajoDias: 0,
      estudioDias: 0,
      conductaDias: 0,
    },
    fechaInicio: "",
  });

  // Delitos adicionales (opcionales)
  const [usarD2, setUsarD2] = useState<boolean>(false);
  const [usarD3, setUsarD3] = useState<boolean>(false);

  const [d2, setD2] = useState<DelitoEntrada>({
    nombre: "Lesiones personales",
    pena: { anios: 2, meses: 6, dias: 0 },
    abonos: {
      detencionPreventivaDias: 0,
      arrestoDomiciliarioDias: 0,
      otrasMedidasDias: 0,
      trabajoDias: 0,
      estudioDias: 0,
      conductaDias: 0,
    },
    fechaInicio: "",
  });

  const [d3, setD3] = useState<DelitoEntrada>({
    nombre: "Amenazas",
    pena: { anios: 1, meses: 0, dias: 0 },
    abonos: {
      detencionPreventivaDias: 0,
      arrestoDomiciliarioDias: 0,
      otrasMedidasDias: 0,
      trabajoDias: 0,
      estudioDias: 0,
      conductaDias: 0,
    },
    fechaInicio: "",
  });

  // Observaciones y texto final
  const [observaciones, setObservaciones] = useState<string>("");

  // Cálculo por delito → ResultadoDelito
  function liquidarDelito(inD: DelitoEntrada): ResultadoDelito {
    const baseDias = toDays(inD.pena);
    const ab = sumAbonos(inD.abonos);
    const neto = clamp0(baseDias - ab);
    return {
      nombre: inD.nombre || "(delito)",
      baseDias,
      abonosDias: ab,
      netoDias: neto,
    };
  }

  // Acumulación con tope legal
  const unificado: UnificacionResultado = useMemo(() => {
    const r1 = liquidarDelito(d1);
    const partes: ResultadoDelito[] = [r1];
    if (usarD2) partes.push(liquidarDelito(d2));
    if (usarD3) partes.push(liquidarDelito(d3));

    const totalBaseDias = partes.reduce((acc, p) => acc + p.baseDias, 0);
    const totalAbonosDias = partes.reduce((acc, p) => acc + p.abonosDias, 0);

    const topeDias = topeLegalAnios * YMD.DAYS_PER_YEAR; // 50 * 360 por convención interna
    const topadoDias = Math.min(totalBaseDias, topeDias);

    // Ojo: los abonos se aplican contra el topado para calcular el neto final efectivo
    const netoTrasTopeDias = clamp0(topadoDias - totalAbonosDias);

    const mitadDias = Math.floor(topadoDias / 2);
    const dosTercioDias = Math.floor((topadoDias * 2) / 3);

    return {
      totalBaseDias,
      totalAbonosDias,
      totalNetoDias: clamp0(totalBaseDias - totalAbonosDias),
      topadoDias,
      netoTrasTopeDias,
      mitadDias,
      dosTercioDias,
    };
  }, [d1, d2, d3, usarD2, usarD3, topeLegalAnios]);

  // Informe en texto
  const informe = useMemo(() => {
    const bloques: string[] = [];

    const dets: { label: string; del: DelitoEntrada }[] = [
      { label: "Delito 1", del: d1 },
    ];
    if (usarD2) dets.push({ label: "Delito 2", del: d2 });
    if (usarD3) dets.push({ label: "Delito 3", del: d3 });

    bloques.push(`LIQUIDACIÓN DE PENA – UNIFICACIÓN (Rol: ${rol})`);
    bloques.push(`Tope legal máximo considerado: ${topeLegalAnios} año(s).`);
    bloques.push("");

    dets.forEach(({ label, del }) => {
      const res = liquidarDelito(del);
      bloques.push(`${label}: ${del.nombre || "(sin nombre)"}`);
      bloques.push(`  Pena impuesta: ${fmtYMD(res.baseDias)}`);
      bloques.push(
        `  Abonos: ${fmtYMD(res.abonosDias)} (cautelares + conmutación)`
      );
      bloques.push(`  Neto por este delito: ${fmtYMD(res.netoDias)}`);
      if (del.fechaInicio?.trim()) {
        bloques.push(`  Fecha de inicio de cómputo: ${del.fechaInicio}`);
      }
      bloques.push("");
    });

    bloques.push(
      `Suma de penas (antes de tope): ${fmtYMD(unificado.totalBaseDias)}`
    );
    bloques.push(`Abonos totales: ${fmtYMD(unificado.totalAbonosDias)}`);
    if (unificado.topadoDias < unificado.totalBaseDias) {
      bloques.push(
        `Tope legal aplicado: ${fmtYMD(unificado.topadoDias)} (se reduce desde la suma)`
      );
    } else {
      bloques.push(`Tope legal aplicado: (no supera el tope)`);
    }
    bloques.push(
      `Pena efectiva tras tope y abonos: ${fmtYMD(unificado.netoTrasTopeDias)}`
    );
    bloques.push("");

    bloques.push(
      `Hitos: 1/2 = ${fmtYMD(unificado.mitadDias)}, 2/3 = ${fmtYMD(
        unificado.dosTercioDias
      )} (sobre la pena topada).`
    );

    if (observaciones.trim()) {
      bloques.push("");
      bloques.push(`Observaciones:`);
      bloques.push(observaciones.trim());
    }

    return bloques.join("\n");
  }, [rol, d1, d2, d3, usarD2, usarD3, unificado, topeLegalAnios, observaciones]);

  // Exportaciones
  async function descargarPDF() {
    if (!informe.trim()) return;
    // import dinámico para no romper build si no existe el módulo
    const dynImport = (p: string) => import(/* @vite-ignore */ (p as any));
    const pdfPath = ["..", "..", "/lib", "/pdf-generator"].join("");
    try {
      const mod: any = await dynImport(pdfPath);
      const contentStyled = `\fTimes New Roman\n` + informe;
      const blob = await mod.generatePDF({
        title: `Liquidación unificada`,
        content: contentStyled,
        branding: {},
      });
      mod.downloadPDF(blob, `liquidacion-unificada-${Date.now()}.pdf`);
      return;
    } catch (e) {
      console.warn("pdf-generator no disponible, usando DOC", e);
    }
    // Fallback DOC
    const safe = (s: string) =>
      s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const html = `<!doctype html><html><head><meta charset="utf-8"><style>body{white-space:pre-wrap;font-family:Times New Roman}</style></head><body>${safe(
      informe
    )}</body></html>`;
    const blob = new Blob([html], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `liquidacion-unificada-${Date.now()}.doc`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function descargarTXT() {
    if (!informe.trim()) return;
    const blob = new Blob([informe], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `liquidacion-unificada-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  // Helpers setters
  const setPena =
    (which: "d1" | "d2" | "d3") =>
    (field: keyof PenaImpuesta, val: number) => {
      const set = which === "d1" ? setD1 : which === "d2" ? setD2 : setD3;
      const cur = which === "d1" ? d1 : which === "d2" ? d2 : d3;
      set({
        ...cur,
        pena: { ...cur.pena, [field]: Number.isFinite(val) ? Math.max(0, val) : 0 },
      });
    };

  const setAbono =
    (which: "d1" | "d2" | "d3") =>
    (field: keyof Abonos, val: number) => {
      const set = which === "d1" ? setD1 : which === "d2" ? setD2 : setD3;
      const cur = which === "d1" ? d1 : which === "d2" ? d2 : d3;
      set({
        ...cur,
        abonos: {
          ...cur.abonos,
          [field]: Number.isFinite(val) ? Math.max(0, val) : 0,
        },
      });
    };

  const setNombre =
    (which: "d1" | "d2" | "d3") =>
    (v: string) => {
      const set = which === "d1" ? setD1 : which === "d2" ? setD2 : setD3;
      const cur = which === "d1" ? d1 : which === "d2" ? d2 : d3;
      set({ ...cur, nombre: v });
    };

  const setFecha =
    (which: "d1" | "d2" | "d3") =>
    (v: string) => {
      const set = which === "d1" ? setD1 : which === "d2" ? setD2 : setD3;
      const cur = which === "d1" ? d1 : which === "d2" ? d2 : d3;
      set({ ...cur, fechaInicio: v });
    };

  // =====================
  // Test Cases
  // =====================
  function runTest(id: string) {
    if (id === "uno-delito") {
      setUsarD2(false);
      setUsarD3(false);
      setD1({
        nombre: "Hurto agravado",
        pena: { anios: 3, meses: 0, dias: 0 },
        abonos: {
          detencionPreventivaDias: 90,
          arrestoDomiciliarioDias: 0,
          otrasMedidasDias: 0,
          trabajoDias: 30,
          estudioDias: 0,
          conductaDias: 0,
        },
        fechaInicio: "",
      });
      setTopeLegalAnios(50);
    } else if (id === "dos-delitos") {
      setUsarD2(true);
      setUsarD3(false);
      setD1({
        nombre: "Robo agravado",
        pena: { anios: 6, meses: 0, dias: 0 },
        abonos: {
          detencionPreventivaDias: 120,
          arrestoDomiciliarioDias: 0,
          otrasMedidasDias: 0,
          trabajoDias: 60,
          estudioDias: 0,
          conductaDias: 0,
        },
        fechaInicio: "",
      });
      setD2({
        nombre: "Lesiones personales",
        pena: { anios: 2, meses: 6, dias: 0 },
        abonos: {
          detencionPreventivaDias: 0,
          arrestoDomiciliarioDias: 30,
          otrasMedidasDias: 0,
          trabajoDias: 0,
          estudioDias: 30,
          conductaDias: 0,
        },
        fechaInicio: "",
      });
      setTopeLegalAnios(50);
    } else if (id === "tres-delitos-tope") {
      setUsarD2(true);
      setUsarD3(true);
      setD1({
        nombre: "Homicidio doloso",
        pena: { anios: 25, meses: 0, dias: 0 },
        abonos: {
          detencionPreventivaDias: 300,
          arrestoDomiciliarioDias: 0,
          otrasMedidasDias: 0,
          trabajoDias: 0,
          estudioDias: 0,
          conductaDias: 0,
        },
        fechaInicio: "",
      });
      setD2({
        nombre: "Robo agravado",
        pena: { anios: 10, meses: 0, dias: 0 },
        abonos: {
          detencionPreventivaDias: 100,
          arrestoDomiciliarioDias: 0,
          otrasMedidasDias: 0,
          trabajoDias: 0,
          estudioDias: 0,
          conductaDias: 0,
        },
        fechaInicio: "",
      });
      setD3({
        nombre: "Estafa",
        pena: { anios: 8, meses: 0, dias: 0 },
        abonos: {
          detencionPreventivaDias: 60,
          arrestoDomiciliarioDias: 0,
          otrasMedidasDias: 0,
          trabajoDias: 0,
          estudioDias: 0,
          conductaDias: 0,
        },
        fechaInicio: "",
      });
      // Forzamos demostración de tope (por ejemplo 35 años)
      setTopeLegalAnios(35);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <header className="border-b border-white/10 bg-slate-900/60 backdrop-blur sticky top-0 z-20">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center text-slate-300 hover:text-white transition text-sm"
          >
            ← Inicio
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <Btn variant="outline" onClick={() => runTest("uno-delito")}>
              Test 1 Delito
            </Btn>
            <Btn variant="outline" onClick={() => runTest("dos-delitos")}>
              Test 2 Delitos (unificado)
            </Btn>
            <Btn variant="outline" onClick={() => runTest("tres-delitos-tope")}>
              Test 3 Delitos + Tope
            </Btn>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6 space-y-6">
        {/* Configuración general */}
        <Box>
          <Head
            title="Liquidación de Penas – Unificación"
            description="Agregue hasta tres delitos para unificar. Ajuste abonos (CPP 232) y conmutación (CP 99-104)."
          />
          <Section className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <Label>Rol</Label>
                <Select
                  value={rol}
                  onChange={(v: Rol) => setRol(v)}
                  options={["Defensa", "Fiscalía", "Juez"]}
                />
              </div>
              <div>
                <Label>Tope legal máximo (años)</Label>
                <Input
                  type="number"
                  min={1}
                  value={topeLegalAnios}
                  onChange={(e: any) =>
                    setTopeLegalAnios(Math.max(1, Number(e.target.value || 1)))
                  }
                />
              </div>
            </div>
          </Section>
        </Box>

        {/* Delito 1 (obligatorio) */}
        <DelitoCard
          titulo="Delito 1 (obligatorio)"
          d={d1}
          onNombre={setNombre("d1")}
          onPena={setPena("d1")}
          onAbono={setAbono("d1")}
          onFecha={setFecha("d1")}
        />

        {/* Delito 2 (opcional) */}
        <Box>
          <Head title="Delito 2 (opcional)" />
          <Section className="space-y-3">
            <div className="flex items-center gap-3">
              <Label>¿Agregar segundo delito?</Label>
              <Select
                value={usarD2 ? "SI" : "NO"}
                onChange={(v) => setUsarD2(v === "SI")}
                options={["NO", "SI"]}
              />
            </div>
            {usarD2 && (
              <DelitoFields
                d={d2}
                onNombre={setNombre("d2")}
                onPena={setPena("d2")}
                onAbono={setAbono("d2")}
                onFecha={setFecha("d2")}
              />
            )}
          </Section>
        </Box>

        {/* Delito 3 (opcional) */}
        <Box>
          <Head title="Delito 3 (opcional)" />
          <Section className="space-y-3">
            <div className="flex items-center gap-3">
              <Label>¿Agregar tercer delito?</Label>
              <Select
                value={usarD3 ? "SI" : "NO"}
                onChange={(v) => setUsarD3(v === "SI")}
                options={["NO", "SI"]}
              />
            </div>
            {usarD3 && (
              <DelitoFields
                d={d3}
                onNombre={setNombre("d3")}
                onPena={setPena("d3")}
                onAbono={setAbono("d3")}
                onFecha={setFecha("d3")}
              />
            )}
          </Section>
        </Box>

        {/* Observaciones */}
        <Box>
          <Head title="Observaciones (opcional)" />
          <Section>
            <Textarea
              className="min-h-[100px]"
              value={observaciones}
              onChange={(e: any) => setObservaciones(e.target.value)}
            />
          </Section>
        </Box>

        {/* Resumen y Exportación */}
        <Box>
          <Head title="Resumen unificado y exportación" />
          <Section className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="text-sm p-3 bg-slate-900/40 border border-white/10 rounded-xl">
                <div className="font-semibold mb-2">Totales</div>
                <div>Suma de penas (antes de tope): {fmtYMD(unificado.totalBaseDias)}</div>
                <div>Abonos totales: {fmtYMD(unificado.totalAbonosDias)}</div>
                <div>Tope legal aplicado: {fmtYMD(unificado.topadoDias)}</div>
                <div>Pena efectiva tras tope y abonos: {fmtYMD(unificado.netoTrasTopeDias)}</div>
                <div className="mt-2">Hitos: 1/2 = {fmtYMD(unificado.mitadDias)} | 2/3 = {fmtYMD(unificado.dosTercioDias)}</div>
              </div>
              <div className="text-sm p-3 bg-slate-900/40 border border-white/10 rounded-xl">
                <div className="font-semibold mb-2">Criterios</div>
                <div>Convención de cómputo: 1 mes = 30 días; 1 año = 12 meses.</div>
                <div>Conmutaciones (trabajo/estudio/conducta) ingresadas como días líquidos de abono.</div>
                <div>Tope legal configurable para concursar penas (editable).</div>
              </div>
            </div>

            <div className="text-sm p-3 bg-slate-900/40 border border-white/10 rounded-xl">
              <pre className="whitespace-pre-wrap leading-relaxed">{informe}</pre>
            </div>

            <div className="flex gap-2">
              <Btn onClick={descargarPDF}>Descargar PDF (con fallback)</Btn>
              <Btn variant="secondary" onClick={descargarTXT}>
                Descargar TXT
              </Btn>
            </div>
          </Section>
        </Box>
      </div>
    </div>
  );
}

// =====================
// Subcomponentes
// =====================
function DelitoCard({
  titulo,
  d,
  onNombre,
  onPena,
  onAbono,
  onFecha,
}: {
  titulo: string;
  d: DelitoEntrada;
  onNombre: (v: string) => void;
  onPena: (f: keyof PenaImpuesta, v: number) => void;
  onAbono: (f: keyof Abonos, v: number) => void;
  onFecha: (v: string) => void;
}) {
  return (
    <Box>
      <Head title={titulo} />
      <Section className="space-y-4">
        <DelitoFields d={d} onNombre={onNombre} onPena={onPena} onAbono={onAbono} onFecha={onFecha} />
      </Section>
    </Box>
  );
}

function DelitoFields({
  d,
  onNombre,
  onPena,
  onAbono,
  onFecha,
}: {
  d: DelitoEntrada;
  onNombre: (v: string) => void;
  onPena: (f: keyof PenaImpuesta, v: number) => void;
  onAbono: (f: keyof Abonos, v: number) => void;
  onFecha: (v: string) => void;
}) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div>
          <Label>Delito</Label>
          <Input value={d.nombre} onChange={(e: any) => onNombre(e.target.value)} />
        </div>
        <div>
          <Label>Pena – Años</Label>
          <Input type="number" min={0} value={d.pena.anios} onChange={(e: any) => onPena("anios", Number(e.target.value || 0))} />
        </div>
        <div>
          <Label>Pena – Meses</Label>
          <Input type="number" min={0} value={d.pena.meses} onChange={(e: any) => onPena("meses", Number(e.target.value || 0))} />
        </div>
        <div>
          <Label>Pena – Días</Label>
          <Input type="number" min={0} value={d.pena.dias} onChange={(e: any) => onPena("dias", Number(e.target.value || 0))} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div>
          <Label>Abono – Detención preventiva (días)</Label>
          <Input
            type="number"
            min={0}
            value={d.abonos.detencionPreventivaDias}
            onChange={(e: any) => onAbono("detencionPreventivaDias", Number(e.target.value || 0))}
          />
        </div>
        <div>
          <Label>Abono – Arresto domiciliario (días)</Label>
          <Input
            type="number"
            min={0}
            value={d.abonos.arrestoDomiciliarioDias}
            onChange={(e: any) => onAbono("arrestoDomiciliarioDias", Number(e.target.value || 0))}
          />
        </div>
        <div>
          <Label>Abono – Otras medidas (días)</Label>
          <Input
            type="number"
            min={0}
            value={d.abonos.otrasMedidasDias}
            onChange={(e: any) => onAbono("otrasMedidasDias", Number(e.target.value || 0))}
          />
        </div>
        <div>
          <Label>Inicio de cómputo (opcional)</Label>
          <Input value={d.fechaInicio || ""} onChange={(e: any) => onFecha(e.target.value)} placeholder="dd/mm/aaaa" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <Label>Conmutación – Trabajo (días)</Label>
          <Input
            type="number"
            min={0}
            value={d.abonos.trabajoDias}
            onChange={(e: any) => onAbono("trabajoDias", Number(e.target.value || 0))}
          />
        </div>
        <div>
          <Label>Conmutación – Estudio (días)</Label>
          <Input
            type="number"
            min={0}
            value={d.abonos.estudioDias}
            onChange={(e: any) => onAbono("estudioDias", Number(e.target.value || 0))}
          />
        </div>
        <div>
          <Label>Conmutación – Conducta (días)</Label>
          <Input
            type="number"
            min={0}
            value={d.abonos.conductaDias}
            onChange={(e: any) => onAbono("conductaDias", Number(e.target.value || 0))}
          />
        </div>
      </div>
    </>
  );
}

