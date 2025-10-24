"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

// ===========================================
//  Riesgos Procesales & Medidas Cautelares (CPP Panamá)
//  – Wizard con matriz de riesgos, arraigo y salida exportable
//  – 100% self-contained (sin UI libs externas)
//  – Campos binarios en UI con opciones "SI"/"NO" (no true/false visibles)
//  – Arraigo ampliado con nacionalidad y estatus migratorio
// ===========================================

type Rol = "Fiscalía" | "Defensa" | "Juez";

type Valoracion = "Leve" | "Moderado" | "Grave";

type RiesgoClave =
  | "Peligro de fuga"
  | "Obstaculización de la investigación"
  | "Peligro para la víctima"
  | "Peligro para la comunidad";

interface Indicador {
  id: string;
  nombre: string;
  descripcion?: string;
}

interface FilaRiesgo {
  riesgo: RiesgoClave;
  indicadores: Record<string, boolean>; // id -> marcado
  evidencia: string; // libre
  valoracion: Valoracion;
  medidasSugeridas: string[]; // no privativas sugeridas
  propuesta: string; // p.ej., prisión preventiva / alternativa
}

interface Arraigo {
  // Nuevo bloque de estatus personal/migratorio
  esNacional: boolean; // SI/NO en UI
  tieneOtrasCiudadanias: boolean; // SI/NO en UI
  residenciaLegalExtranjero: boolean; // SI/NO en UI
  estatusMigratorioPanama: "Regular" | "Irregular"; // selección

  // Bloque clásico
  domicilioFijo: boolean;
  tiempoResidenciaMeses: number; // si es nacional, no se exige capturar (se oculta)
  empleoFormal: boolean;
  contratoIndefinido: boolean;
  familiaPrimariaEnPA: boolean;
  estudiosActivos: boolean;
  antecedentesEvasion: boolean;
  pasaporteVigente: boolean;
  recursosParaFugarse: "Bajos" | "Medios" | "Altos";
}

const hoyPA = () =>
  new Date().toLocaleDateString("es-PA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

// ===========================================
//  Catálogo: indicadores por riesgo (CPP arts. 221, 227 y ccdc.)
// ===========================================
const INDICADORES: Record<RiesgoClave, Indicador[]> = {
  "Peligro de fuga": [
    {
      id: "sin-domicilio",
      nombre: "Falta de domicilio/residencia estable",
      descripcion: "Ausencia de domicilio fijo o información no verificable",
    },
    {
      id: "escasos-lazos",
      nombre: "Escaso arraigo familiar/laboral",
      descripcion: "Sin empleo formal ni núcleo familiar primario asentado",
    },
    {
      id: "pena-elevada",
      nombre: "Pena esperada elevada",
      descripcion: "Incentivo objetivo a sustraerse del proceso",
    },
    {
      id: "recursos-fuga",
      nombre: "Facilidades materiales para ocultarse/salir del país",
      descripcion: "Recursos económicos/medios logísticos",
    },
    {
      id: "hist-evasion",
      nombre: "Antecedentes de incomparecencia/evasión",
      descripcion: "Quebrantamientos, rebeldías o cambios de domicilio no informados",
    },
  ],
  "Obstaculización de la investigación": [
    {
      id: "amenazas-victima",
      nombre: "Intimidación a víctima/testigos",
      descripcion: "Conductas recientes orientadas a coaccionar",
    },
    {
      id: "destruccion-prueba",
      nombre: "Riesgo de destrucción de evidencia",
      descripcion: "Capacidad y oportunidad para alterar o suprimir prueba",
    },
    {
      id: "coordinacion-coimputados",
      nombre: "Coordinación con coimputados",
      descripcion: "Estructura para acordar versiones o eludir diligencias",
    },
    {
      id: "acceso-expediente",
      nombre: "Acceso privilegiado a fuentes de prueba",
      descripcion: "Posición o cargo que facilite influir indebidamente",
    },
  ],
  "Peligro para la víctima": [
    {
      id: "proximidad",
      nombre: "Proximidad geográfica/personal",
      descripcion: "Cercanía que incremente la exposición de la víctima",
    },
    {
      id: "violencia-previa",
      nombre: "Antecedentes de violencia o amenazas",
      descripcion: "Historial reciente con la víctima o su familia",
    },
    {
      id: "quebrantamiento",
      nombre: "Quebrantamiento de medidas previas",
      descripcion: "Incumplimientos de órdenes de alejamiento u otras",
    },
  ],
  "Peligro para la comunidad": [
    {
      id: "organizacion",
      nombre: "Vinculación a organización criminal",
      descripcion: "Recursos y logística para reiterar",
    },
    {
      id: "pluralidad-delitos",
      nombre: "Pluralidad/naturaleza de delitos",
      descripcion: "Hechos múltiples o especialmente graves",
    },
    {
      id: "condenas-vigentes",
      nombre: "Condenas vigentes relevantes",
      descripcion: "Ejecución pendiente u otras",
    },
  ],
};

const MEDIDAS_ALTERNATIVAS = [
  "Presentación periódica",
  "Prohibición de acercamiento y contacto",
  "Arresto domiciliario nocturno",
  "Arresto domiciliario total",
  "Localizador electrónico",
  "Prohibición de salida del país y retención de pasaporte",
  "Fianza",
  "Prohibición de concurrir a determinados lugares",
  "Suspensión del ejercicio de cargo o actividad",
];

// ===========================================
//  Utilidades de puntuación de arraigo y redacción
// ===========================================
function puntuarArraigo(a: Arraigo) {
  let score = 0; // 0-100 base

  // Pesos migratorios (nuevos)
  if (a.esNacional) score += 15;
  if (a.tieneOtrasCiudadanias) score -= 5;
  if (a.residenciaLegalExtranjero) score -= 10;
  score += a.estatusMigratorioPanama === "Regular" ? 10 : -15;

  // Pesos clásicos
  if (a.domicilioFijo) score += 20;
  if (!a.esNacional) {
    if (a.tiempoResidenciaMeses >= 24) score += 15;
    else if (a.tiempoResidenciaMeses >= 6) score += 8;
  }
  if (a.empleoFormal) score += 15;
  if (a.contratoIndefinido) score += 5;
  if (a.familiaPrimariaEnPA) score += 20;
  if (a.estudiosActivos) score += 5;
  if (a.antecedentesEvasion) score -= 25;
  if (a.pasaporteVigente) score -= 5;
  score += a.recursosParaFugarse === "Bajos" ? 10 : a.recursosParaFugarse === "Medios" ? 0 : -10;

  return Math.max(0, Math.min(100, score));
}

function clasificarArraigo(score: number): "Alto" | "Medio" | "Bajo" {
  if (score >= 70) return "Alto";
  if (score >= 40) return "Medio";
  return "Bajo";
}

// Redactor de conclusiones según rol
function redactarConclusiones(rol: Rol, filas: FilaRiesgo[], arraigoScore: number) {
  const nivelArraigo = clasificarArraigo(arraigoScore);
  const graves = filas.filter((f) => f.valoracion === "Grave");
  const moderados = filas.filter((f) => f.valoracion === "Moderado");

  if (rol === "Fiscalía") {
    const base =
      `Conforme al CPP (arts. 221, 227 y concordantes), los riesgos identificados justifican una medida de cautela idónea, necesaria y proporcional.`;
    if (graves.length > 0 || (moderados.length >= 2 && nivelArraigo !== "Alto")) {
      return (
        base +
        ` Se solicita la imposición de detención provisional o, subsidiariamente, ${MEDIDAS_ALTERNATIVAS.slice(
          0,
          3
        ).join(", ")}, dada la concurrencia de: ` +
        graves.map((g) => g.riesgo).join(", ") +
        (moderados.length ? ` y riesgos moderados concurrentes` : ``) +
        `, y un arraigo ${nivelArraigo.toLowerCase()}.`
      );
    }
    return (
      base +
      ` Se proponen medidas menos gravosas: ${MEDIDAS_ALTERNATIVAS.slice(0, 4).join(
        ", "
      )}, en atención a un arraigo ${nivelArraigo.toLowerCase()} y la ausencia de riesgos graves.`
    );
  }
  if (rol === "Defensa") {
    const base =
      `Bajo los principios de proporcionalidad y subsidiariedad (CPP art. 221), y atendiendo al control judicial estricto de afectación de derechos fundamentales, se plantea:`;
    if (graves.length === 0 && nivelArraigo !== "Bajo") {
      return (
        base +
        ` sustitución por medidas no privativas: ${[
          "Presentación periódica",
          "Prohibición de acercamiento",
          "Prohibición de salida del país",
        ].join(
          ", "
        )}, pues el arraigo es ${nivelArraigo.toLowerCase()} y los indicadores no alcanzan umbral de gravedad.`
      );
    }
    return (
      base +
      ` en caso de estimarse algún riesgo, su neutralización con medidas específicas y verificables (${MEDIDAS_ALTERNATIVAS.slice(
        0,
        5
      ).join(", ")}), descartando la detención por insuficiencia de elementos y por existir alternativas idóneas.`
    );
  }
  // Juez
  return `Se ponderan los riesgos a la luz de la excepcionalidad de la detención, valorando el arraigo ${nivelArraigo.toLowerCase()} y la posibilidad de medidas alternativas individualizadas. La decisión deberá motivarse en hechos concretos, con revisión periódica si se mantiene una medida intensiva.`;
}

// ===========================================
//  Componentes UI mínimos
// ===========================================
function Box({ children, className = "" }: any) {
  return <div className={`bg-slate-900/50 border border-white/10 rounded-2xl ${className}`}>{children}</div>;
}
function Head({ title, description }: { title: string; description?: string }) {
  return (
    <div className="p-4 border-b border-white/10">
      <div className="text-base font-semibold">{title}</div>
      {description ? <div className="text-xs text-slate-400 mt-0.5">{description}</div> : null}
    </div>
  );
}
function Section({ children, className = "" }: any) {
  return <div className={`p-4 ${className}`}>{children}</div>;
}
function Label({ children }: any) {
  return <label className="block text-xs text-slate-300 mb-1">{children}</label>;
}
function Input({ value, onChange, placeholder = "", type = "text" }: any) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-3 py-2 rounded-xl bg-slate-800/60 border border-white/10 outline-none focus:ring-2 focus:ring-white/20"
    />
  );
}
function Select({ value, onChange, options }: { value: any; onChange: (v: any) => void; options: string[] }) {
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
function Btn({ children, onClick, disabled = false, variant = "solid", className = "" }: any) {
  const base =
    variant === "outline"
      ? "border border-white/20 text-slate-100 hover:bg-white/5"
      : variant === "secondary"
      ? "bg-slate-700/70 hover:bg-slate-700 text-white"
      : "bg-white/10 hover:bg-white/20 text-white";
  const state = disabled ? "opacity-50 cursor-not-allowed" : "";
  return (
    <button onClick={onClick} disabled={disabled} className={`px-3 py-2 rounded-xl text-sm transition ${base} ${state} ${className}`}>
      {children}
    </button>
  );
}

// Helpers SI/NO <-> boolean
const siNo = (b: boolean) => (b ? "SI" : "NO");
const toBool = (v: string) => v === "SI";

// ===========================================
//  Página
// ===========================================
export default function RiesgosCautelares() {
  const [rol, setRol] = useState<Rol>("Defensa");

  // Datos del caso (mínimos para la portada del informe)
  const [meta, setMeta] = useState({
    provincia: "Panamá",
    circuito: "Primer Circuito Judicial",
    juzgado: "Juzgado de Garantías",
    numeroCausa: "2025-000000",
    imputado: "N.N.",
    delito: "",
    fecha: hoyPA(),
  });

  // Arraigo (UI SI/NO → boolean interno)
  const [arraigo, setArraigo] = useState<Arraigo>({
    // Nuevo bloque
    esNacional: true,
    tieneOtrasCiudadanias: false,
    residenciaLegalExtranjero: false,
    estatusMigratorioPanama: "Regular",

    // Clásico
    domicilioFijo: true,
    tiempoResidenciaMeses: 36,
    empleoFormal: true,
    contratoIndefinido: false,
    familiaPrimariaEnPA: true,
    estudiosActivos: false,
    antecedentesEvasion: false,
    pasaporteVigente: false,
    recursosParaFugarse: "Medios",
  });

  const arraigoScore = useMemo(() => puntuarArraigo(arraigo), [arraigo]);
  const arraigoNivel = useMemo(() => clasificarArraigo(arraigoScore), [arraigoScore]);

  // Matriz de riesgos (inicialización dinámica)
  const baseFilas: FilaRiesgo[] = useMemo(
    () =>
      (Object.keys(INDICADORES) as RiesgoClave[]).map((rk) => ({
        riesgo: rk,
        indicadores: Object.fromEntries(INDICADORES[rk].map((ind) => [ind.id, false])),
        evidencia: "",
        valoracion: "Leve",
        medidasSugeridas: [],
        propuesta: "",
      })),
    []
  );
  const [filas, setFilas] = useState<FilaRiesgo[]>(baseFilas);

  // Texto exportable
  const [informe, setInforme] = useState("");

  useEffect(() => {
    setInforme(generarInforme(rol, meta, filas, arraigo, arraigoScore));
  }, [rol, meta, filas, arraigo, arraigoScore]);

  function toggleIndicador(idx: number, idInd: string) {
    setFilas((prev) =>
      prev.map((f, i) => (i !== idx ? f : { ...f, indicadores: { ...f.indicadores, [idInd]: !f.indicadores[idInd] } }))
    );
  }
  function setEvidencia(idx: number, v: string) {
    setFilas((prev) => prev.map((f, i) => (i !== idx ? f : { ...f, evidencia: v })));
  }
  function setValoracion(idx: number, v: Valoracion) {
    setFilas((prev) => prev.map((f, i) => (i !== idx ? f : { ...f, valoracion: v })));
  }
  function setMedidas(idx: number, arr: string[]) {
    setFilas((prev) => prev.map((f, i) => (i !== idx ? f : { ...f, medidasSugeridas: arr })));
  }
  function setPropuesta(idx: number, v: string) {
    setFilas((prev) => prev.map((f, i) => (i !== idx ? f : { ...f, propuesta: v })));
  }

  function generarInforme(rol: Rol, meta: any, filas: FilaRiesgo[], a: Arraigo, aScore: number) {
    const titulo = `Matriz de riesgos procesales y medidas cautelares (CPP Panamá)\n`;
    const cab = `Provincia: ${meta.provincia} | Circuito: ${meta.circuito} | Órgano: ${meta.juzgado}\nCausa: ${meta.numeroCausa} | Imputado: ${meta.imputado} | Delito: ${meta.delito}\nFecha: ${meta.fecha}\nRol: ${rol}\n\n`;

    const arrInfoBase = [
      `Nacional: ${siNo(a.esNacional)}`,
      `Otras ciudadanías: ${siNo(a.tieneOtrasCiudadanias)}`,
      `Residencia legal en el extranjero: ${siNo(a.residenciaLegalExtranjero)}`,
      `Estatus migratorio en Panamá: ${a.estatusMigratorioPanama}`,
      `Domicilio: ${siNo(a.domicilioFijo)}`,
      a.esNacional ? null : `Antigüedad en Panamá: ${a.tiempoResidenciaMeses} meses`,
      `Empleo formal: ${siNo(a.empleoFormal)}${a.contratoIndefinido ? " (contrato indefinido)" : ""}`,
      `Familia primaria en Panamá: ${siNo(a.familiaPrimariaEnPA)}`,
      `Estudios activos: ${siNo(a.estudiosActivos)}`,
      `Antecedentes de evasión: ${siNo(a.antecedentesEvasion)}`,
      `Pasaporte vigente: ${siNo(a.pasaporteVigente)}`,
      `Recursos para fugarse: ${a.recursosParaFugarse}`,
    ].filter(Boolean) as string[];

    const arr = `Arraigo: ${clasificarArraigo(aScore)} (puntaje ${aScore}/100). Detalle: ${arrInfoBase.join(
      "; "
    )}.\n\n`;

    const cuerpo = filas
      .map((f) => {
        const inds =
          Object.entries(f.indicadores)
            .filter(([_, v]) => v)
            .map(([id]) => INDICADORES[f.riesgo].find((x) => x.id === id)?.nombre)
            .filter(Boolean)
            .join(", ") || "(sin indicadores marcados)";
        const meds = f.medidasSugeridas.join(", ") || "(no sugeridas)";
        const prop = f.propuesta || "(no indicada)";
        return `Riesgo: ${f.riesgo}
Indicadores: ${inds}
Evidencia: ${f.evidencia || "(sin detalle)"}
Valoración: ${f.valoracion}
Medidas alternativas sugeridas: ${meds}
Propuesta: ${prop}
`;
      })
      .join("\n");

    const conclusiones =
      `\nConclusión según rol (${rol}):\n` +
      redactarConclusiones(rol, filas, aScore) +
      `\n\nNotas: La detención es excepcional y sujeta a control judicial estricto. Se deben preferir medidas menos gravosas cuando neutralicen el riesgo (CPP arts. 221, 227 y concordantes).`;

    return titulo + cab + arr + cuerpo + conclusiones;
  }

  async function descargarPDF() {
    if (!informe.trim()) return;
    const dynImport = (p: string) => import(/* @vite-ignore */ (p as any));
    const pdfPath = ["..", "..", "/lib", "/pdf-generator"].join("");
    try {
      const mod: any = await dynImport(pdfPath);
      const contentStyled = `\fTimes New Roman\n` + informe;
      const blob = await mod.generatePDF({
        title: `Matriz de riesgos – ${meta.numeroCausa}`,
        content: contentStyled,
        branding: {},
      });
      mod.downloadPDF(blob, `matriz-riesgos-${Date.now()}.pdf`);
      return;
    } catch (e) {
      console.warn("pdf-generator no disponible, usando DOC", e);
    }
    // Fallback DOC
    const safe = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const html = `<!doctype html><html><head><meta charset="utf-8"><style>body{white-space:pre-wrap;font-family:Times New Roman}</style></head><body>${safe(
      informe
    )}</body></html>`;
    const blob = new Blob([html], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `matriz-riesgos-${Date.now()}.doc`;
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
    a.download = `matriz-riesgos-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  // =====================
  // Test cases (mantener y ampliar)
  // =====================
  function test(id: string) {
    if (id === "fiscalia-riesgo-alto") {
      setRol("Fiscalía");
      setMeta((m) => ({ ...m, delito: "Robo agravado", imputado: "Juan Pérez", numeroCausa: "2025-900001" }));
      setArraigo({
        esNacional: false,
        tieneOtrasCiudadanias: true,
        residenciaLegalExtranjero: true,
        estatusMigratorioPanama: "Irregular",
        domicilioFijo: false,
        tiempoResidenciaMeses: 4,
        empleoFormal: false,
        contratoIndefinido: false,
        familiaPrimariaEnPA: false,
        estudiosActivos: false,
        antecedentesEvasion: true,
        pasaporteVigente: true,
        recursosParaFugarse: "Altos",
      });
      setFilas((prev) =>
        prev.map((f) => {
          if (f.riesgo === "Peligro de fuga")
            return {
              ...f,
              valoracion: "Grave",
              indicadores: { ...f.indicadores, "sin-domicilio": true, "hist-evasion": true, "recursos-fuga": true, "pena-elevada": true },
              evidencia: "Registro de rebeldía previa y recursos para abandonar el país",
              medidasSugeridas: ["Arresto domiciliario total", "Localizador electrónico"],
              propuesta: "Detención provisional",
            };
          if (f.riesgo === "Obstaculización de la investigación")
            return {
              ...f,
              valoracion: "Moderado",
              indicadores: { ...f.indicadores, "coordinacion-coimputados": true },
              evidencia: "Comunicación sostenida con coimputados",
              medidasSugeridas: ["Prohibición de acercamiento", "Presentación periódica"],
              propuesta: "Subsidiaria a la detención",
            };
          return f;
        })
      );
    } else if (id === "defensa-riesgo-bajo") {
      setRol("Defensa");
      setMeta((m) => ({ ...m, delito: "Estafa", imputado: "María L.", numeroCausa: "2025-900002" }));
      setArraigo({
        esNacional: true,
        tieneOtrasCiudadanias: false,
        residenciaLegalExtranjero: false,
        estatusMigratorioPanama: "Regular",
        domicilioFijo: true,
        tiempoResidenciaMeses: 84, // se ignora en reporte si es nacional
        empleoFormal: true,
        contratoIndefinido: true,
        familiaPrimariaEnPA: true,
        estudiosActivos: false,
        antecedentesEvasion: false,
        pasaporteVigente: false,
        recursosParaFugarse: "Bajos",
      });
      setFilas((prev) =>
        prev.map((f) => ({
          ...f,
          valoracion: "Leve",
          indicadores: Object.fromEntries(Object.keys(f.indicadores).map((k) => [k, false])),
          evidencia: "",
          medidasSugeridas: ["Presentación periódica", "Prohibición de salida del país"],
          propuesta: "Medidas no privativas",
        }))
      );
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <header className="border-b border-white/10 bg-slate-900/60 backdrop-blur sticky top-0 z-20">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-3">
          <Link href="/" className="inline-flex items-center text-slate-300 hover:text-white transition text-sm">
            ← Inicio
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <Btn variant="outline" onClick={() => test("fiscalia-riesgo-alto")}>Test Fiscalía (alto)</Btn>
            <Btn variant="outline" onClick={() => test("defensa-riesgo-bajo")}>Test Defensa (bajo)</Btn>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6 space-y-6">
        {/* Paso 1: Rol y datos básicos */}
        <Box>
          <Head title="Paso 1 – Rol y datos del caso" description="Define el rol, órgano y datos mínimos para el informe" />
          <Section className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label>Rol</Label>
                <Select value={rol} onChange={(v: Rol) => setRol(v)} options={["Fiscalía", "Defensa", "Juez"]} />
              </div>
              <div>
                <Label>Provincia</Label>
                <Input value={meta.provincia} onChange={(e: any) => setMeta({ ...meta, provincia: e.target.value })} />
              </div>
              <div>
                <Label>Circuito</Label>
                <Input value={meta.circuito} onChange={(e: any) => setMeta({ ...meta, circuito: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label>Órgano</Label>
                <Input value={meta.juzgado} onChange={(e: any) => setMeta({ ...meta, juzgado: e.target.value })} />
              </div>
              <div>
                <Label>N.º de causa</Label>
                <Input value={meta.numeroCausa} onChange={(e: any) => setMeta({ ...meta, numeroCausa: e.target.value })} />
              </div>
              <div>
                <Label>Imputado</Label>
                <Input value={meta.imputado} onChange={(e: any) => setMeta({ ...meta, imputado: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label>Delito</Label>
                <Input value={meta.delito} onChange={(e: any) => setMeta({ ...meta, delito: e.target.value })} />
              </div>
              <div>
                <Label>Fecha</Label>
                <Input value={meta.fecha} onChange={(e: any) => setMeta({ ...meta, fecha: e.target.value })} />
              </div>
            </div>
          </Section>
        </Box>

        {/* Paso 2: Arraigo – bloque migratorio primero (SI/NO) */}
        <Box>
          <Head
            title="Paso 2 – Arraigo"
            description="Completa los factores de arraigo para ponderar el peligro de fuga (CPP art. 221 y concordantes)"
          />
          <Section className="space-y-3">
            {/* Bloque migratorio */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <Label>¿Es nacional panameño?</Label>
                <Select
                  value={siNo(arraigo.esNacional)}
                  onChange={(v: any) => setArraigo({ ...arraigo, esNacional: toBool(v) })}
                  options={["SI", "NO"]}
                />
              </div>
              <div>
                <Label>¿Tiene otras ciudadanías?</Label>
                <Select
                  value={siNo(arraigo.tieneOtrasCiudadanias)}
                  onChange={(v: any) => setArraigo({ ...arraigo, tieneOtrasCiudadanias: toBool(v) })}
                  options={["SI", "NO"]}
                />
              </div>
              <div>
                <Label>¿Residencia legal en el extranjero?</Label>
                <Select
                  value={siNo(arraigo.residenciaLegalExtranjero)}
                  onChange={(v: any) => setArraigo({ ...arraigo, residenciaLegalExtranjero: toBool(v) })}
                  options={["SI", "NO"]}
                />
              </div>
              <div>
                <Label>Estatus migratorio en Panamá</Label>
                <Select
                  value={arraigo.estatusMigratorioPanama}
                  onChange={(v: any) => setArraigo({ ...arraigo, estatusMigratorioPanama: v })}
                  options={["Regular", "Irregular"]}
                />
              </div>
            </div>

            {/* Bloque residencia/empleo/familia */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <Label>Domicilio fijo</Label>
                <Select
                  value={siNo(arraigo.domicilioFijo)}
                  onChange={(v: any) => setArraigo({ ...arraigo, domicilioFijo: toBool(v) })}
                  options={["SI", "NO"]}
                />
              </div>
              {!arraigo.esNacional && (
                <div>
                  <Label>Meses de residencia en Panamá</Label>
                  <Input
                    type="number"
                    value={arraigo.tiempoResidenciaMeses}
                    onChange={(e: any) => setArraigo({ ...arraigo, tiempoResidenciaMeses: Number(e.target.value || 0) })}
                  />
                </div>
              )}
              <div>
                <Label>Empleo formal</Label>
                <Select
                  value={siNo(arraigo.empleoFormal)}
                  onChange={(v: any) => setArraigo({ ...arraigo, empleoFormal: toBool(v) })}
                  options={["SI", "NO"]}
                />
              </div>
              <div>
                <Label>Contrato indefinido</Label>
                <Select
                  value={siNo(arraigo.contratoIndefinido)}
                  onChange={(v: any) => setArraigo({ ...arraigo, contratoIndefinido: toBool(v) })}
                  options={["SI", "NO"]}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <Label>Familia primaria en Panamá</Label>
                <Select
                  value={siNo(arraigo.familiaPrimariaEnPA)}
                  onChange={(v: any) => setArraigo({ ...arraigo, familiaPrimariaEnPA: toBool(v) })}
                  options={["SI", "NO"]}
                />
              </div>
              <div>
                <Label>Estudios activos</Label>
                <Select
                  value={siNo(arraigo.estudiosActivos)}
                  onChange={(v: any) => setArraigo({ ...arraigo, estudiosActivos: toBool(v) })}
                  options={["SI", "NO"]}
                />
              </div>
              <div>
                <Label>Antecedentes de evasión</Label>
                <Select
                  value={siNo(arraigo.antecedentesEvasion)}
                  onChange={(v: any) => setArraigo({ ...arraigo, antecedentesEvasion: toBool(v) })}
                  options={["SI", "NO"]}
                />
              </div>
              <div>
                <Label>Pasaporte vigente</Label>
                <Select
                  value={siNo(arraigo.pasaporteVigente)}
                  onChange={(v: any) => setArraigo({ ...arraigo, pasaporteVigente: toBool(v) })}
                  options={["SI", "NO"]}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <Label>Recursos para fugarse</Label>
                <Select
                  value={arraigo.recursosParaFugarse}
                  onChange={(v: any) => setArraigo({ ...arraigo, recursosParaFugarse: v })}
                  options={["Bajos", "Medios", "Altos"]}
                />
              </div>
              <div className="md:col-span-3 flex items-end">
                <div className="text-sm p-3 bg-slate-800/50 rounded-xl border border-white/10 w-full">
                  <div>
                    <b>Puntaje de arraigo:</b> {arraigoScore}/100
                  </div>
                  <div>
                    <b>Clasificación:</b> {arraigoNivel}
                  </div>
                </div>
              </div>
            </div>
          </Section>
        </Box>

        {/* Paso 3: Matriz de riesgos */}
        <Box>
          <Head title="Paso 3 – Matriz de riesgos" description="Marca indicadores, agrega evidencia, valora el riesgo y sugiere medidas alternativas" />
          <Section className="space-y-6">
            {(filas as FilaRiesgo[]).map((fila, idx) => (
              <div key={fila.riesgo} className="p-3 rounded-xl border border-white/10 bg-slate-900/40">
                <div className="text-sm font-semibold mb-2">{fila.riesgo}</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2">
                    <Label>Indicadores (marque los que correspondan)</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {INDICADORES[fila.riesgo].map((ind) => (
                        <label key={ind.id} className="flex items-start gap-2 text-sm bg-slate-800/40 p-2 rounded-lg border border-white/10">
                          <input type="checkbox" checked={!!fila.indicadores[ind.id]} onChange={() => toggleIndicador(idx, ind.id)} />
                          <span>
                            <b>{ind.nombre}</b>
                            {ind.descripcion && <div className="text-xs text-slate-400">{ind.descripcion}</div>}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label>Valoración</Label>
                    <Select value={fila.valoracion} onChange={(v: any) => setValoracion(idx, v)} options={["Leve", "Moderado", "Grave"]} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                  <div className="md:col-span-2">
                    <Label>Evidencia (hechos concretos)</Label>
                    <Textarea className="min-h-[72px]" value={fila.evidencia} onChange={(e: any) => setEvidencia(idx, e.target.value)} />
                  </div>
                  <div>
                    <Label>Medidas alternativas sugeridas</Label>
                    <div className="grid grid-cols-1 gap-1 max-h-40 overflow-auto p-2 bg-slate-800/40 rounded-lg border border-white/10">
                      {MEDIDAS_ALTERNATIVAS.map((m) => (
                        <label key={m} className="flex items-center gap-2 text-xs">
                          <input
                            type="checkbox"
                            checked={fila.medidasSugeridas.includes(m)}
                            onChange={(e: any) => {
                              const next = e.target.checked ? [...fila.medidasSugeridas, m] : fila.medidasSugeridas.filter((x) => x !== m);
                              setMedidas(idx, next);
                            }}
                          />
                          <span>{m}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  <Label>Propuesta concreta</Label>
                  <Input
                    value={fila.propuesta}
                    onChange={(e: any) => setPropuesta(idx, e.target.value)}
                    placeholder={rol === "Fiscalía" ? "Detención provisional / subsidiarias" : "Medidas no privativas concretas…"}
                  />
                </div>
              </div>
            ))}
          </Section>
        </Box>

        {/* Paso 4: Conclusiones y Exportación */}
        <Box>
          <Head title="Paso 4 – Conclusiones y exportación" description="Se genera el informe final con matriz y conclusiones conforme al rol" />
          <Section className="space-y-3">
            <div className="text-sm p-3 rounded-xl bg-slate-900/40 border border-white/10">
              <pre className="whitespace-pre-wrap leading-relaxed">{informe}</pre>
            </div>
            <div className="flex gap-2">
              <Btn onClick={descargarPDF}>Descargar PDF (con fallback)</Btn>
              <Btn variant="secondary" onClick={descargarTXT}>Descargar TXT</Btn>
            </div>
          </Section>
        </Box>
      </div>
    </div>
  );
}

