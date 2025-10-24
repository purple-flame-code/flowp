"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

// ===========================================
//  Escritos + Aura Penal – Wizard con Branding + Doctrina (tooltips + modal)
//  Self-contained UI (sin dependencias externas de UI)
//  **Actualización:** Catálogo completo de delitos (Libro Segundo) por Título → Capítulo → Delito
// ===========================================

type Rol = "Fiscalía" | "Defensa" | "Querella"; // Eliminado Órgano Judicial

type Entidad = "Ministerio Público" | "Defensa Pública" | "Despacho Privado";

type Estadio = "Preliminar" | "Formal" | "Intermedia" | "Juicio";

type EscritoTipo =
  | "Imputación (CPP 280-281)"
  | "Acusación (CPP 340)"
  | "Acusación autónoma (CPP 340)"
  | "Acción resarcitoria"
  | "Sobreseimiento (CPP 350)"
  | "Solicitudes varias"
  | "Archivo provisional (MP)"
  | "Solicitud de archivo (Defensa)";

interface Branding {
  entidad: Entidad;
  nombreEntidad: string; // MP: Fiscalía/Sección; DP: Unidad; Privado: nombre del estudio
  logoDataUrl?: string;
  colorPrimario?: string; // hex
  fuente?: "Times New Roman" | "Arial" | "Garamond";
  firmaNombre: string;
  firmaLinea: string; // cargo "Abogado Defensor Particular", "Fiscal de Circuito", etc.
  domicilio?: string;
  telefono?: string;
  correo?: string;
}

interface Destino {
  nombre: string; // Ej.: "Sección Primera de Delitos contra el Patrimonio – Fiscalía Metropolitana"
}

interface MetaCaso {
  circuito: string;
  provincia: string;
  juzgado?: string; // cuando aplique
  numeroCausa: string;
  noticiaCriminal?: string;
  delito: string;
  imputado: string;
  victima?: string;
  fecha: string; // dd/mm/aaaa
}

interface AuraIn {
  que: string; cuando: string; donde: string; relato: string;
  principiosCPP: string[]; principiosCP: string[];
  delitoCP: string; estadio: Estadio; grado: "consumado" | "tentativa";
  rol: Rol;
}

interface AuraOut {
  tipicidad: string;
  consumacion: string;
  penaMinMax?: { minMeses: number; maxMeses: number };
  bloquesSugeridos: string[];
  recomendado: EscritoTipo;
}

const hoyPA = () => new Date().toLocaleDateString("es-PA", { day: "2-digit", month: "2-digit", year: "numeric" });

// ===========================================
//  UI wrappers mínimos
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
function Btn({ children, onClick, disabled=false, variant="solid", className="" }: any) {
  const base = variant === "outline" ? "border border-white/20 text-slate-100 hover:bg-white/5" : variant === "secondary" ? "bg-slate-700/70 hover:bg-slate-700 text-white" : "bg-white/10 hover:bg-white/20 text-white";
  const state = disabled ? "opacity-50 cursor-not-allowed" : "";
  return (
    <button onClick={onClick} disabled={disabled} className={`px-3 py-2 rounded-xl text-sm transition ${base} ${state} ${className}`}>{children}</button>
  );
}
function Label({ children }: any) { return <label className="block text-xs text-slate-300 mb-1">{children}</label>; }
function Input({ value, onChange, placeholder = "", type = "text" }: any) {
  return <input type={type} value={value} onChange={onChange} placeholder={placeholder} className="w-full px-3 py-2 rounded-xl bg-slate-800/60 border border-white/10 outline-none focus:ring-2 focus:ring-white/20" />;
}
function Select({ value, onChange, options }: { value: any; onChange: (v:any)=>void; options: string[] }) {
  return (
    <select value={value} onChange={(e)=>onChange(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-slate-800/60 border border-white/10 outline-none focus:ring-2 focus:ring-white/20 text-sm">
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}
function Textarea({ value, onChange, className = "" }: any) {
  return <textarea value={value} onChange={onChange} className={`w-full px-3 py-2 rounded-xl bg-slate-800/60 border border-white/10 outline-none focus:ring-2 focus:ring-white/20 ${className}`} />;
}

// Tooltip minimalista con botón "Ver más"
function Tooltip({ title, excerpt, onVerMas }: { title: string; excerpt: string; onVerMas: ()=>void }) {
  return (
    <div className="absolute z-30 mt-2 w-80 max-w-[22rem] rounded-xl border border-white/10 bg-slate-900/95 p-3 shadow-xl backdrop-blur">
      <div className="text-xs font-semibold mb-1">{title}</div>
      <div className="text-xs text-slate-300 leading-relaxed">{excerpt}</div>
      <div className="mt-2 text-right">
        <Btn variant="outline" onClick={onVerMas} className="!px-2 !py-1 text-xs">Ver más</Btn>
      </div>
    </div>
  );
}

// Modal para doctrina extendida
function Modal({ open, onClose, children, title }: any) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-50 w-[min(840px,92vw)] max-h-[88vh] overflow-auto rounded-2xl border border-white/10 bg-slate-900 p-4 shadow-2xl">
        <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-2">
          <div className="text-sm font-semibold">{title}</div>
          <Btn variant="outline" onClick={onClose}>Cerrar</Btn>
        </div>
        <div className="prose prose-invert max-w-none text-sm leading-relaxed mt-3">
          {children}
        </div>
      </div>
    </div>
  );
}

// ===========================================
//  Catálogos
// ===========================================
// Principios procesales (CPP) – Libro I, Título I, arts. 1–28
const PRINCIPIOS_CPP = [
  "Interpretación y prevalencia de principios (art. 1)",
  "Legalidad procesal (art. 2)",
  "Principios del proceso (debido proceso, contradicción, oralidad, etc.) (art. 3)",
  "Juez natural (art. 4)",
  "Separación de funciones (art. 5)",
  "Independencia e imparcialidad (art. 6)",
  "Prohibición de doble juzgamiento (art. 7)",
  "Inocencia (art. 8)",
  "Publicidad del proceso (art. 9)",
  "Derecho a la defensa (art. 10)",
  "Libertades personales (art. 11)",
  "Control judicial de afectación de derechos (art. 12)",
  "Derecho a la intimidad (art. 13)",
  "Respeto a los derechos humanos (art. 14)",
  "Justicia en tiempo razonable (art. 15)",
  "Derecho a no declarar contra sí mismo (art. 16)",
  "Validez de la prueba (art. 17)",
  "Lealtad y buena fe (art. 18)",
  "Igualdad procesal (art. 19)",
  "Protección de la víctima y colaboradores (art. 20)",
  "Interpretación restrictiva (art. 21)",
  "Motivación (art. 22)",
  "Impugnación (art. 23)",
  "Investigación objetiva (art. 24)",
  "Control judicial de la pena (art. 25)",
  "Solución del conflicto (art. 26)",
  "Gratuidad (art. 27)",
  "Diversidad cultural (art. 28)",
  // Plus: mantenemos proporcionalidad 221 como ayuda para medidas
  "Proporcionalidad de medidas cautelares (CPP art. 221)",
];

// Principios penales (CP) – Libro I, con claves para tooltips doctrinales
const PRINCIPIOS_CP = [
  "Dignidad humana (art. 1)",
  "Intervención mínima (arts. 2–3)",
  "Legalidad penal y tipicidad (arts. 4, 9, 12, 16)",
  "Retroactividad favorable (art. 14)",
  "Necesidad, proporcionalidad y razonabilidad (art. 6)",
  "Funciones de la pena (art. 7)",
  "Inimputables y medidas de seguridad (art. 8)",
  "Dolo (arts. 26–27)",
  "Culpa (art. 28)",
  "Caso fortuito / fuerza mayor (art. 29)",
  "Error de tipo (art. 30)",
  "Causas de justificación (arts. 31–33)",
  "Exceso en causas de justificación (art. 34)",
  "Imputabilidad / inimputabilidad (arts. 35–38)",
  "Error de prohibición (art. 39)",
  "Obediencia debida / miedo insuperable (art. 40–42)",
  "Límites culturales a eximentes (art. 42-A)",
  "Autoría y participación (arts. 43–47)",
  "Tentativa y desistimiento (arts. 48–49)",
  "Error en la punibilidad (doctrina)",
  "Error de tipo permisivo (doctrina)",
];

// === Catálogo completo de Delitos (Libro Segundo del Código Penal) ===
// Estructura: Título → Capítulo → (opcional) Sección → Delitos (cuando el capítulo no detalla, usamos descriptor de capítulo)

interface DelitoNodo {
  titulo: string;
  capitulos: { nombre: string; secciones?: { nombre: string; delitos?: string[] }[]; delitos?: string[] }[];
}

const CATALOGO_DELITOS: DelitoNodo[] = [
  { titulo: "Título I - Delitos contra la Vida y la Integridad Personal",
    capitulos: [
      { nombre: "Capítulo I - Delitos contra la Vida Humana",
        secciones: [
          { nombre: "Sección 1ª - Homicidio", delitos: ["Homicidio doloso", "Homicidio agravado", "Homicidio culposo"] },
          { nombre: "Sección 2ª - Lesiones Personales", delitos: ["Lesiones personales", "Lesiones agravadas", "Lesiones culposas"] },
          { nombre: "Sección 3ª - Aborto Provocado", delitos: ["Aborto provocado", "Aborto consentido"] },
        ]
      },
      { nombre: "Capítulo II - Reproducción y Manipulación Genética" },
      { nombre: "Capítulo III - Abandono de Niños y otras Personas Incapaces" },
    ]
  },
  { titulo: "Título II - Delitos contra la Libertad",
    capitulos: [
      { nombre: "Capítulo I - Libertad Individual y Desaparición Forzada" },
      { nombre: "Capítulo II - Inviolabilidad del Domicilio o Lugar de Trabajo" },
      { nombre: "Capítulo III - Inviolabilidad del Secreto y Derecho a la Intimidad" },
      { nombre: "Capítulo IV - Libertad de Reunión y de Prensa" },
      { nombre: "Capítulo V - Libertad de Culto" },
    ]
  },
  { titulo: "Título III - Delitos contra la Libertad e Integridad Sexual",
    capitulos: [
      { nombre: "Capítulo I - Violación y otros Delitos Sexuales" },
      { nombre: "Capítulo II - Corrupción de Menores y Explotación Sexual Comercial" },
      { nombre: "Capítulo III - Disposición Común" },
    ]
  },
  { titulo: "Título IV - Delitos contra el Honor de la Persona Natural",
    capitulos: [
      { nombre: "Capítulo I - Injuria y Calumnia", delitos: ["Injuria", "Calumnia"] },
      { nombre: "Capítulo II - Disposiciones Comunes" },
    ]
  },
  { titulo: "Título V - Delitos contra el Orden Jurídico Familiar y el Estado Civil",
    capitulos: [
      { nombre: "Capítulo I - Violencia Doméstica", delitos: ["Violencia doméstica"] },
      { nombre: "Capítulo II - Maltrato de Niño, Niña o Adolescente" },
      { nombre: "Capítulo III - Identidad y Tráfico de Personas Menores de Edad" },
      { nombre: "Capítulo IV - Delitos contra la Familia" },
    ]
  },
  { titulo: "Título VI - Delitos contra el Patrimonio Económico",
    capitulos: [
      { nombre: "Capítulo I - Hurto", delitos: ["Hurto simple", "Hurto agravado"] },
      { nombre: "Capítulo II - Robo", delitos: ["Robo simple", "Robo agravado"] },
      { nombre: "Capítulo III - Estafa y otros Fraudes", delitos: ["Estafa", "Fraude", "Cheques sin fondos (si aplica por remisión)"] },
      { nombre: "Capítulo IV - Apropiación Indebida", delitos: ["Apropiación indebida"] },
      { nombre: "Capítulo V - Usurpación", delitos: ["Usurpación"] },
      { nombre: "Capítulo VI - Daños", delitos: ["Daños"] },
      { nombre: "Capítulo VII - Patrimonio Histórico de la Nación" },
      { nombre: "Capítulo VIII - Disposiciones Comunes" },
    ]
  },
  { titulo: "Título VII - Delitos contra el Orden Económico",
    capitulos: [
      { nombre: "Capítulo I - Libre Competencia y Derechos de Consumidores" },
      { nombre: "Capítulo II - Retención Indebida de Cuotas" },
      { nombre: "Capítulo III - Delitos Financieros" },
      { nombre: "Capítulo IV - Blanqueo de Capitales", delitos: ["Blanqueo de capitales"] },
      { nombre: "Capítulo V - Seguridad Económica" },
      { nombre: "Capítulo VI - Propiedad Intelectual",
        secciones: [
          { nombre: "Sección 1ª - Derecho de Autor y Conexos" },
          { nombre: "Sección 2ª - Propiedad Industrial" },
          { nombre: "Sección 3ª - Derechos Colectivos de Pueblos Indígenas" },
          { nombre: "Sección 4ª - Disposiciones Comunes" },
        ]
      },
      { nombre: "Capítulo VII - Insolvencias Punibles" },
      { nombre: "Capítulo VIII - Competencia Desleal" },
      { nombre: "Capítulo IX - Cheques y Tarjetas de Crédito" },
      { nombre: "Capítulo X - Revelación de Secretos Empresariales" },
      { nombre: "Capítulo XI - Contrabando y Defraudación Aduanera" },
      { nombre: "Capítulo XII - Delitos contra el Tesoro Nacional" },
    ]
  },
  { titulo: "Título VIII - Delitos contra la Seguridad Jurídica de los Medios Electrónicos",
    capitulos: [ { nombre: "Capítulo I - Delitos Contra la Seguridad Informática" } ]
  },
  { titulo: "Título IX - Delitos Contra la Seguridad Colectiva",
    capitulos: [
      { nombre: "Capítulo I - Terrorismo y Financiamiento" },
      { nombre: "Capítulo II - Peligro Común" },
      { nombre: "Capítulo III - Medios de Transporte" },
      { nombre: "Capítulo IV - Salud Pública" },
      { nombre: "Capítulo V - Drogas" },
      { nombre: "Capítulo VI - Piratería" },
      { nombre: "Capítulo VII - Delincuencia Organizada" },
      { nombre: "Capítulo VIII - Asociación Ilícita" },
      { nombre: "Capítulo IX - Armas y Explosivos" },
      { nombre: "Capítulo X - Material Ilícito (apropiación y sustracción violenta)" },
      { nombre: "Capítulo XI - Disposiciones Comunes" },
    ]
  },
  { titulo: "Título X - Delitos Contra la Administración Pública",
    capitulos: [
      { nombre: "Capítulo I - Peculado", delitos: ["Peculado"] },
      { nombre: "Capítulo II - Corrupción de Servidores Públicos", delitos: ["Corrupción de servidores públicos"] },
      { nombre: "Capítulo III - Enriquecimiento Injustificado" },
      { nombre: "Capítulo IV - Concusión y Exacción" },
      { nombre: "Capítulo V - Tráfico de influencias" },
      { nombre: "Capítulo VI - Abuso de Autoridad e Infracción de Deberes" },
      { nombre: "Capítulo VII - Delitos Contra los Servidores Públicos" },
      { nombre: "Capítulo VIII - Violación de Sellos Públicos" },
      { nombre: "Capítulo IX - Fraude en Contratación Pública" },
    ]
  },
  { titulo: "Título XI - Delitos Contra la Fe Pública",
    capitulos: [
      { nombre: "Capítulo I - Falsificación de Documento en General", delitos: ["Falsificación de documento"] },
      { nombre: "Capítulo II - Falsificación de Moneda y otros Valores" },
      { nombre: "Capítulo III - Falsificación de Sellos Públicos" },
      { nombre: "Capítulo IV - Ejercicio Ilegal de una Profesión" },
    ]
  },
  { titulo: "Título XII - Delitos contra la Administración de Justicia",
    capitulos: [
      { nombre: "Capítulo I - Simulación de Hechos Punibles y Calumnia en Actuaciones" },
      { nombre: "Capítulo II - Falso Testimonio" },
      { nombre: "Capítulo III - Prevaricato" },
      { nombre: "Capítulo IV - Encubrimiento" },
      { nombre: "Capítulo V - Tráfico y Receptación de Cosas Provenientes del Delito" },
      { nombre: "Capítulo VI - Evasión" },
      { nombre: "Capítulo VII - Hacerse Justicia por Sí Mismo" },
      { nombre: "Capítulo VIII - Quebrantamiento de Medidas de Protección y Sanciones" },
      { nombre: "Capítulo IX - Apología del Delito" },
    ]
  },
  { titulo: "Título XIII - Delitos Contra el Ambiente y el Orden Territorial",
    capitulos: [
      { nombre: "Capítulo I - Recursos Naturales" },
      { nombre: "Capítulo II - Vida Silvestre" },
      { nombre: "Capítulo III - Urbanístico Territorial" },
      { nombre: "Capítulo IV - Contra los Animales Domésticos" },
      { nombre: "Capítulo V - Disposiciones Comunes" },
    ]
  },
  { titulo: "Título XIV - Delitos Contra la Personalidad Jurídica del Estado",
    capitulos: [
      { nombre: "Capítulo I - Personalidad Internacional del Estado" },
      { nombre: "Capítulo II - Personalidad Interna del Estado" },
    ]
  },
  { titulo: "Título XV - Delitos contra la Humanidad",
    capitulos: [
      { nombre: "Capítulo I - Derechos Humanos (DIH)" },
      { nombre: "Capítulo II - Personas y Bienes Protegidos por DIH" },
      { nombre: "Capítulo III - Disposiciones Comunes" },
      { nombre: "Capítulo IV - Trata de Personas" },
      { nombre: "Capítulo V - Tráfico Ilícito de Migrantes" },
    ]
  },
];

// Utilidad: construir selects dependientes y valor final de "delitoCP"
const TITULOS = CATALOGO_DELITOS.map(t=>t.titulo);
function capitulosDe(titulo: string) { return (CATALOGO_DELITOS.find(t=>t.titulo===titulo)?.capitulos||[]).map(c=>c.nombre); }
function delitosDe(titulo: string, cap: string): string[] {
  const capObj = CATALOGO_DELITOS.find(t=>t.titulo===titulo)?.capitulos.find(c=>c.nombre===cap);
  const direct = capObj?.delitos||[];
  const secc = (capObj?.secciones||[]).flatMap(s=> s.delitos||[]);
  const all = [...direct, ...secc];
  // Si el capítulo no trae delitos desglosados, ofertamos el propio capítulo como selección
  return all.length ? all : [cap + " (todos)"];
}

// Mock de pena por tipo (solo para summary contextual)
const PENA_POR_DELITO: Record<string,{min:number,max:number}> = {
  "Homicidio doloso": {min:144, max:360},
  "Homicidio agravado": {min:180, max:420},
  "Homicidio culposo": {min:6, max:48},
  "Lesiones personales": {min:6, max:84},
  "Lesiones agravadas": {min:12, max:120},
  "Lesiones culposas": {min:3, max:24},
  "Aborto provocado": {min:12, max:72},
  "Aborto consentido": {min:6, max:48},
  "Hurto simple": {min:12, max:48},
  "Hurto agravado": {min:24, max:84},
  "Robo simple": {min:48, max:108},
  "Robo agravado": {min:60, max:144},
  "Estafa": {min:12, max:72},
  "Fraude": {min:12, max:72},
  "Cheques sin fondos (si aplica por remisión)": {min:6, max:36},
  "Apropiación indebida": {min:6, max:48},
  "Usurpación": {min:6, max:36},
  "Daños": {min:6, max:36},
  "Peculado": {min:72, max:180},
  "Corrupción de servidores públicos": {min:48, max:144},
  "Falsificación de documento": {min:24, max:96},
  "Blanqueo de capitales": {min:60, max:144},
  "Violencia doméstica": {min:12, max:60},
};

// ===========================================
//  Lógica: encabezados y reglas de dirigido a
// ===========================================
function construirEncabezado(branding: Branding, destino: Destino | null, tipo: EscritoTipo, meta: MetaCaso) {
  const fecha = meta.fecha || hoyPA();
  let tituloSuperior = "";
  if (branding.entidad === "Ministerio Público") {
    tituloSuperior = `República de Panamá – Ministerio Público\n${branding.nombreEntidad}`;
  } else if (branding.entidad === "Defensa Pública") {
    tituloSuperior = `República de Panamá – Defensa Pública\n${branding.nombreEntidad}`;
  } else {
    tituloSuperior = `Despacho ${branding.nombreEntidad}`; // Despacho privado
  }

  let dirigido = "";
  const esArchivoMP = (tipo === "Archivo provisional (MP)");
  const esSolicitudArchivoDef = (tipo === "Solicitud de archivo (Defensa)");

  if (esArchivoMP) {
    dirigido = ""; // solo rótulo del despacho MP
  } else if (esSolicitudArchivoDef && destino) {
    dirigido = `\nDirigido a: ${destino.nombre}`;
  } else if (destino) {
    dirigido = `\nDirigido a: ${destino.nombre}`;
  }

  return `${tituloSuperior}\n${meta.provincia}, ${fecha}${dirigido}\n\n`;
}

// ===========================================
//  Aura Penalista (mock determinista en front)
// ===========================================
function ejecutarAura(input: AuraIn): AuraOut {
  const pena = PENA_POR_DELITO[input.delitoCP];
  const bloques: string[] = [];
  let recomendado: EscritoTipo = "Solicitudes varias";

  if (input.rol === "Fiscalía") {
    if (input.estadio === "Intermedia" || input.estadio === "Juicio") recomendado = "Acusación (CPP 340)"; else recomendado = "Imputación (CPP 280-281)";
  } else if (input.rol === "Defensa") {
    if (input.estadio === "Preliminar" || input.estadio === "Formal") recomendado = "Solicitudes varias"; else recomendado = "Sobreseimiento (CPP 350)";
  } else if (input.rol === "Querella") {
    recomendado = "Acción resarcitoria";
  }

  // Bloques sugeridos básicos
  if (input.principiosCPP.includes("Proporcionalidad de medidas cautelares (CPP art. 221)")) bloques.push("proporcionalidad-221");
  if (input.principiosCP.some(p=>p.includes("Legalidad penal"))) bloques.push("legalidad");
  if (input.grado === "tentativa") bloques.push("tentativa-82");

  return {
    tipicidad: input.delitoCP,
    consumacion: input.grado,
    penaMinMax: pena ? {minMeses: pena.min, maxMeses: pena.max}: undefined,
    bloquesSugeridos: bloques,
    recomendado,
  };
}

// ===========================================
//  Plantillas (machotes) – expresiones panameñas
//  Sin "Con la venia…"; redacción forense local
// ===========================================
function bloqueFirma(branding: Branding) {
  const firma = [branding.firmaNombre, branding.firmaLinea, branding.entidad === "Despacho Privado" ? `Despacho ${branding.nombreEntidad}` : branding.nombreEntidad].filter(Boolean).join("\n");
  const contacto = [branding.domicilio, branding.telefono, branding.correo].filter(Boolean).join(" | ");
  return `\n\n__________________________________\n${firma}${contacto ? `\n${contacto}`: ""}`;
}

function plantillaImputacion(meta: MetaCaso, branding: Branding, destino: Destino | null, aura: AuraOut) {
  const enc = construirEncabezado(branding, destino, "Imputación (CPP 280-281)", meta);
  return (
`${enc}` +
`ASUNTO: IMPUTACIÓN (arts. 280 y 281 CPP)\n\n` +
`Comparece quien suscribe, actuando en mi condición de ${branding.firmaLinea}, y expone:\n\n` +
`I. HECHO PUNIBLE ATRIBUIDO\nSe atribuye al ciudadano ${meta.imputado} la comisión del delito de ${meta.delito}${meta.victima?` en perjuicio de ${meta.victima}`:""}.\n\n` +
`II. CALIFICACIÓN JURÍDICA PROVISIONAL\n${aura.tipicidad}${aura.consumacion === "tentativa"? " en grado de tentativa (art. 82 CP)":""}.\n\n` +
`III. ELEMENTOS DE CONVICCIÓN RELEVANTES\nSe enumeran sumariamente los elementos recabados en la investigación preliminar.\n\n` +
`IV. COMUNICACIÓN DE DERECHOS (art. 281 CPP)\nSe deja constancia de que se informan al imputado sus derechos y garantías.\n\n` +
`V. PETICIÓN\nSe tenga por formalizada la imputación y se continúe con el trámite legal correspondiente.\n` + bloqueFirma(branding)
  );
}

function plantillaAcusacion(meta: MetaCaso, branding: Branding, destino: Destino | null, aura: AuraOut) {
  const enc = construirEncabezado(branding, destino, "Acusación (CPP 340)", meta);
  return (
`${enc}` +
`ESCRITO DE ACUSACIÓN (art. 340 CPP)\n\n` +
`Comparece quien suscribe, en mi condición de ${branding.firmaLinea}, y solicita:\n\n` +
`I. IDENTIFICACIÓN DE LAS PARTES\nImputado: ${meta.imputado}. ${meta.victima? `Víctima: ${meta.victima}.` : ""}\n\n` +
`II. RELACIÓN CLARA Y PRECISA DE LOS HECHOS\n${aura.tipicidad}. Hechos conforme a las diligencias practicadas.\n\n` +
`III. CALIFICACIÓN JURÍDICA\n${aura.tipicidad}${aura.consumacion === "tentativa"? " en grado de tentativa (art. 82 CP)":""}.\n\n` +
`IV. FUNCIÓN Y PARTICIPACIÓN\nSe indica la forma de intervención del imputado.\n\n` +
`V. PRUEBAS OFRECIDAS Y SU PERTINENCIA\nListado de pruebas, finalidad y pertinencia.\n\n` +
`VI. PETITORIO\nSe solicita apertura a juicio oral y la práctica de los medios de prueba señalados.\n` + bloqueFirma(branding)
  );
}

function plantillaAcusacionAutonoma(meta: MetaCaso, branding: Branding, destino: Destino | null, aura: AuraOut) {
  const enc = construirEncabezado(branding, destino, "Acusación autónoma (CPP 340)", meta);
  return (
`${enc}` +
`ACUSACIÓN AUTÓNOMA (art. 340 CPP)\n\n` +
`Comparece quien suscribe, actuando como ${branding.firmaLinea}, y presenta acusación con los siguientes apartados:\n\n` +
`I. PARTES\nImputado: ${meta.imputado}. ${meta.victima? `Víctima: ${meta.victima}.` : ""}\n\n` +
`II. HECHOS\nRelación clara y circunstanciada.\n\n` +
`III. CALIFICACIÓN\n${aura.tipicidad}${aura.consumacion === "tentativa"? " en grado de tentativa (art. 82 CP)":""}.\n\n` +
`IV. PRUEBA\nEnumeración de medios probatorios y pertinencia.\n\n` +
`V. PETICIÓN\nSe admita la acusación y se fije audiencia conforme a derecho.\n` + bloqueFirma(branding)
  );
}

function plantillaResarcitoria(meta: MetaCaso, branding: Branding, destino: Destino | null) {
  const enc = construirEncabezado(branding, destino, "Acción resarcitoria", meta);
  return (
`${enc}` +
`ACCIÓN RESARCITORIA\n\n` +
`Comparezco en representación de la parte afectada y expongo:\n\n` +
`I. HECHOS DAÑOSOS\nNarrativa de los hechos y el daño ocasionado.\n\n` +
`II. NEXO CAUSAL Y RESPONSABILIDAD\nVinculación entre la acción y el daño.\n\n` +
`III. CUANTIFICACIÓN\nDetalle del quantum reclamado y su sustento.\n\n` +
`IV. PRUEBA\nRelación de documentos, peritajes y testigos.\n\n` +
`V. PETICIÓN\nSe acoja la pretensión resarcitoria y se condene al pago correspondiente.\n` + bloqueFirma(branding)
  );
}

function plantillaSobreseimiento(meta: MetaCaso, branding: Branding, destino: Destino | null) {
  const enc = construirEncabezado(branding, destino, "Sobreseimiento (CPP 350)", meta);
  return (
`${enc}` +
`SOLICITUD DE SOBRESEIMIENTO (art. 350 CPP)\n\n` +
`Comparece la defensa técnica y solicita:\n\n` +
`I. ANTECEDENTES\nSíntesis de la causa y actuaciones relevantes.\n\n` +
`II. CAUSAL INVOCADA\nSe fundamenta la causal del art. 350 aplicable (atipicidad, inexistencia de hecho, falta de autoría, prescripción, cosa juzgada, etc.).\n\n` +
`III. MOTIVACIÓN\nSe explica la incidencia jurídica y la improcedencia de continuar el proceso.\n\n` +
`IV. PETITORIO\nSe decrete el sobreseimiento en favor del imputado.\n` + bloqueFirma(branding)
  );
}

function plantillaSolicitudes(meta: MetaCaso, branding: Branding, destino: Destino | null) {
  const enc = construirEncabezado(branding, destino, "Solicitudes varias", meta);
  return (
`${enc}` +
`SOLICITUDES VARIAS\n\n` +
`Comparece esta parte y solicita lo siguiente:\n\n` +
`1) Advertencia de nulidad: se expone el defecto, su trascendencia y oportunidad.\n2) Práctica de actos de investigación: se justifica pertinencia, utilidad y conducencia.\n3) Consideraciones de la defensa/querella: fundamentos y solicitudes concretas.\n\n` +
`Se sirva proveer conforme a derecho.\n` + bloqueFirma(branding)
  );
}

function plantillaArchivoMP(meta: MetaCaso, branding: Branding) {
  const enc = construirEncabezado(branding, null, "Archivo provisional (MP)", meta);
  return (
`${enc}` +
`ARCHIVO PROVISIONAL\n\n` +
`I. ANTECEDENTES\nSe exponen los elementos recabados y su insuficiencia actual.\n\n` +
`II. MOTIVACIÓN\nNo se han reunido elementos de convicción suficientes para sustentar acusación, sin perjuicio de reabrir si surgen nuevos elementos.\n\n` +
`III. RESUELVO\nOrdenar el archivo provisional conforme al CPP.\n` + bloqueFirma(branding)
  );
}

function plantillaSolicitudArchivoDef(meta: MetaCaso, branding: Branding, destino: Destino) {
  const enc = construirEncabezado(branding, destino, "Solicitud de archivo (Defensa)", meta);
  return (
`${enc}` +
`SOLICITUD DE ARCHIVO\n\n` +
`La defensa técnica expone fundamentos de hecho y derecho que evidencian la improcedencia de continuar con la investigación, solicitando el archivo de las actuaciones.\n\n` +
`Fundamentos: insuficiencia de elementos de convicción, principio de intervención mínima, racionalidad investigativa.\n\n` +
`Petición: se disponga el archivo y se notifique conforme a derecho.\n` + bloqueFirma(branding)
  );
}

// Motor selector de plantilla
function generarEscrito(tipo: EscritoTipo, meta: MetaCaso, branding: Branding, destino: Destino | null, aura: AuraOut): string {
  switch (tipo) {
    case "Imputación (CPP 280-281)": return plantillaImputacion(meta, branding, destino, aura);
    case "Acusación (CPP 340)": return plantillaAcusacion(meta, branding, destino, aura);
    case "Acusación autónoma (CPP 340)": return plantillaAcusacionAutonoma(meta, branding, destino, aura);
    case "Acción resarcitoria": return plantillaResarcitoria(meta, branding, destino);
    case "Sobreseimiento (CPP 350)": return plantillaSobreseimiento(meta, branding, destino);
    case "Solicitudes varias": return plantillaSolicitudes(meta, branding, destino);
    case "Archivo provisional (MP)": return plantillaArchivoMP(meta, branding);
    case "Solicitud de archivo (Defensa)": return plantillaSolicitudArchivoDef(meta, branding, destino as Destino);
  }
}

// ===========================================
//  Página principal (Wizard 3 pasos)
// ===========================================
export default function EscritosWizard() {
  // Paso activo
  const [step, setStep] = useState<1|2|3>(1);

  // Paso 1 – Branding & Destino
  const [rol, setRol] = useState<Rol>("Defensa");
  const [entidad, setEntidad] = useState<Entidad>("Despacho Privado");
  const [branding, setBranding] = useState<Branding>({
    entidad: "Despacho Privado",
    nombreEntidad: "Bufete Ejemplar & Asociados",
    colorPrimario: "#0ea5e9",
    fuente: "Times New Roman",
    firmaNombre: "Licda. Andrea Gómez R.",
    firmaLinea: "Abogada Defensora Particular",
    domicilio: "Calle 50, Ciudad de Panamá",
    telefono: "+507 6000-0000",
    correo: "contacto@ejemplar.pa",
  });
  const [destino, setDestino] = useState<Destino>({ nombre: "Sección de Homicidios – Fiscalía Metropolitana" });
  const fileRef = useRef<HTMLInputElement|null>(null);

  // Paso 2 – Aura Penalista (inputs base)
  const [auraIn, setAuraIn] = useState<AuraIn>({
    que: "Agresión con arma blanca en vía pública",
    cuando: "12/07/2025, 21:30",
    donde: "Calidonia, Ciudad de Panamá",
    relato: "Relato breve de los hechos…",
    principiosCPP: ["Derecho a la defensa (art. 10)", "Proporcionalidad de medidas cautelares (CPP art. 221)"],
    principiosCP: ["Legalidad penal y tipicidad (arts. 4, 9, 12, 16)", "Dolo (arts. 26–27)"],
    delitoCP: "Robo agravado",
    estadio: "Intermedia",
    grado: "consumado",
    rol: "Defensa",
  });
  const auraOut = useMemo(()=> ejecutarAura(auraIn), [auraIn]);

  // Selección jerárquica de Delitos (Libro II)
  const [selTitulo, setSelTitulo] = useState<string>(TITULOS[0]);
  const [selCap, setSelCap] = useState<string>(capitulosDe(TITULOS[0])[0]);
  const [selDelito, setSelDelito] = useState<string>(delitosDe(TITULOS[0], capitulosDe(TITULOS[0])[0])[0]);

  // Sincroniza selección jerárquica con auraIn.delitoCP
  useEffect(()=>{
    setAuraIn(prev=> ({...prev, delitoCP: selDelito }));
  }, [selDelito]);

  // Al cambiar Título o Capítulo, recalcular las dependencias
  useEffect(()=>{
    const caps = capitulosDe(selTitulo);
    const cap = caps[0];
    setSelCap(cap);
    const dels = delitosDe(selTitulo, cap);
    setSelDelito(dels[0]);
  }, [selTitulo]);
  useEffect(()=>{
    const dels = delitosDe(selTitulo, selCap);
    setSelDelito(dels[0]);
  }, [selCap]);

  // Paso 3 – Redacción
  const [tipo, setTipo] = useState<EscritoTipo>("Sobreseimiento (CPP 350)");
  const [meta, setMeta] = useState<MetaCaso>({
    circuito: "Primer Circuito Judicial",
    provincia: "Panamá",
    juzgado: "Juzgado de Garantías del Primer Circuito Judicial",
    numeroCausa: "2025-000000",
    noticiaCriminal: "2025-123456",
    delito: "Robo agravado",
    imputado: "Juan Pérez Castillo",
    victima: "María López R.",
    fecha: hoyPA(),
  });
  const [texto, setTexto] = useState("");

  // Tooltip/Modal state
  const [hoverKey, setHoverKey] = useState<string|null>(null);
  const [modalKey, setModalKey] = useState<string|null>(null);

  // Persistencia de branding
  useEffect(()=>{
    const s = localStorage.getItem("flowp_branding");
    if (s) try { setBranding(JSON.parse(s)); } catch {}
  },[]);
  useEffect(()=>{
    localStorage.setItem("flowp_branding", JSON.stringify(branding));
  },[branding]);

  const cargarLogo = async (file: File) => {
    const reader = new FileReader();
    reader.onload = () => setBranding({ ...branding, logoDataUrl: String(reader.result) });
    reader.readAsDataURL(file);
  };

  const generar = () => {
    const doc = generarEscrito(tipo, meta, branding, (tipo==="Archivo provisional (MP)"? null : destino), auraOut);
    setTexto(doc);
  };

  const descargarPDF = async () => {
    if (!texto.trim()) return;
    // Normaliza texto eliminando leyendas heredadas
    const cleanText = texto
      .replace(/Generado\s+con\s+FlowPen(al|eal)\s+by\s+Lex\s+Vence/gi, "")
      .replace(/Con\s+la\s+venia\s+del\s+despacho,?\s*señor\s*juez:?/gi, "")
      .replace(/Con\s+la\s+venia\s+del\s*juez:?/gi, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    // Evitar error de build: usamos import dinámico NO literal
    const dynImport = (p: string) => import(/* @vite-ignore */ p as any);
    const pdfPath = ["..", "..", "/lib", "/pdf-generator"].join("");
    try {
      const mod: any = await dynImport(pdfPath);
      const contentStyled = `\f${branding.fuente}\n` + cleanText;
      const blob = await mod.generatePDF({ title: `${tipo} – ${meta.numeroCausa}`, content: contentStyled, branding: { color: branding.colorPrimario, logoUrl: branding.logoDataUrl } });
      mod.downloadPDF(blob, `${tipo.toLowerCase().replace(/\s+/g,"-")}-${Date.now()}.pdf`);
      return;
    } catch (e) {
      // Si el módulo no existe o falla, usamos fallback inmediato sin romper build
      console.warn("pdf-generator no disponible, usando fallback DOC/TXT", e);
    }
    // Fallback 1: DOC (abre en Word y permite guardar como PDF)
    try {
      const safe = (s:string)=>s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
      const html = `<!doctype html><html><head><meta charset=\"utf-8\"><style>body{font-family:${branding.fuente||"Times New Roman"};white-space:pre-wrap}</style></head><body>${safe(cleanText)}</body></html>`;
      const blob = new Blob([html], { type: "application/msword" });
      const url = URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download=`${tipo.toLowerCase().replace(/\s+/g,"-")}-${Date.now()}.doc`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
      return;
    } catch {}
    // Fallback 2: TXT
    const blob = new Blob([cleanText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download=`${tipo.toLowerCase().replace(/\s+/g,"-")}-${Date.now()}.txt`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  };
  const descargarDOC = () => {
    if (!texto.trim()) return;
    const cleanText = texto
      .replace(/Generado\s+con\s+FlowPen(al|eal)\s+by\s+Lex\s+Vence/gi, "")
      .replace(/Con\s+la\s+venia\s+del\s+despacho,?\s*señor\s*juez:?/gi, "")
      .replace(/Con\s+la\s+venia\s+del\s*juez:?/gi, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
    const safe = (s:string)=>s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
    const html = `<!doctype html><html><head><meta charset="utf-8"><style>body{font-family:${branding.fuente||"Times New Roman"};white-space:pre-wrap}</style></head><body>${safe(cleanText)}</body></html>`;
    const blob = new Blob([html], { type: "application/msword" });
    const url = URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download=`${tipo.toLowerCase().replace(/\s+/g,"-")}-${Date.now()}.doc`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  };

  // =====================
  // Test Cases (no modificar los existentes; agregamos nuevos)
  // =====================
  const test = (id:string) => {
    if (id === "acusacion-demo") {
      setRol("Fiscalía"); setEntidad("Ministerio Público"); setBranding(b=>({...b, entidad:"Ministerio Público", nombreEntidad:"Sección de Homicidios – Fiscalía Metropolitana", firmaLinea:"Fiscal de Circuito", firmaNombre:"Licdo. Carlos Rivera" }));
      setTipo("Acusación (CPP 340)"); setMeta(m=>({...m, delito:"Homicidio doloso", imputado:"Luis Delgado M.", victima:"Ana Castillo P.", numeroCausa:"2025-111111"}));
      setDestino({ nombre:"Juzgado de Juicio Oral del Primer Circuito" });
      setSelTitulo("Título I - Delitos contra la Vida y la Integridad Personal");
      setSelCap("Capítulo I - Delitos contra la Vida Humana");
      setSelDelito("Homicidio doloso");
    } else if (id === "sobreseimiento-demo") {
      setRol("Defensa"); setEntidad("Despacho Privado"); setBranding(b=>({...b, entidad:"Despacho Privado", nombreEntidad:"Despacho Justicia & Derecho", firmaLinea:"Abogado Defensor Particular", firmaNombre:"Licda. Sofía Torres" }));
      setTipo("Sobreseimiento (CPP 350)"); setMeta(m=>({...m, delito:"Estafa", imputado:"Pedro Moreno R.", victima:"Comercial ABC, S.A.", numeroCausa:"2025-222222"}));
      setDestino({ nombre:"Juzgado de Garantías del Primer Circuito" });
      setSelTitulo("Título VI - Delitos contra el Patrimonio Económico");
      setSelCap("Capítulo III - Estafa y otros Fraudes");
      setSelDelito("Estafa");
    } else if (id === "imputacion-demo") {
      setRol("Fiscalía"); setEntidad("Ministerio Público"); setBranding(b=>({...b, entidad:"Ministerio Público", nombreEntidad:"Fiscalía Metropolitana – Sección Patrimonio", firmaLinea:"Fiscal Adjunta", firmaNombre:"Licda. Mariel Pardo" }));
      setTipo("Imputación (CPP 280-281)"); setMeta(m=>({...m, delito:"Hurto agravado", imputado:"Javier Núñez L.", victima:"Laura Ríos T.", numeroCausa:"2025-333333"}));
      setDestino({ nombre:"Juzgado de Garantías del Primer Circuito" });
      setSelTitulo("Título VI - Delitos contra el Patrimonio Económico");
      setSelCap("Capítulo I - Hurto");
      setSelDelito("Hurto agravado");
    } else if (id === "archivo-mp-demo") {
      setRol("Fiscalía"); setEntidad("Ministerio Público"); setBranding(b=>({...b, entidad:"Ministerio Público", nombreEntidad:"Sección de Delitos Informáticos – Fiscalía Metropolitana", firmaLinea:"Fiscal de Sección", firmaNombre:"Licdo. Hugo Villar" }));
      setTipo("Archivo provisional (MP)"); setMeta(m=>({...m, delito:"Estafa", imputado:"N.N.", victima:"Tecnología Panamá S.A.", numeroCausa:"2025-444444"}));
      setSelTitulo("Título VI - Delitos contra el Patrimonio Económico");
      setSelCap("Capítulo III - Estafa y otros Fraudes");
      setSelDelito("Estafa");
    } else if (id === "sol-archivo-def-demo") {
      setRol("Defensa"); setEntidad("Despacho Privado"); setBranding(b=>({...b, entidad:"Despacho Privado", nombreEntidad:"Bufete Litoral", firmaLinea:"Abogado Defensor Particular", firmaNombre:"Licdo. Iván Salcedo" }));
      setTipo("Solicitud de archivo (Defensa)"); setMeta(m=>({...m, delito:"Robo agravado", imputado:"Roberto Díaz V.", victima:"SuperMercados Unidos S.A.", numeroCausa:"2025-555555"}));
      setDestino({ nombre:"Sección de Propiedad – Fiscalía Metropolitana" });
      setSelTitulo("Título VI - Delitos contra el Patrimonio Económico");
      setSelCap("Capítulo II - Robo");
      setSelDelito("Robo agravado");
    }
  };

  // Auto-genera si no hay texto y cambia parámetros
  useEffect(()=>{ if (!texto.trim()) setTexto(generarEscrito(tipo, meta, branding, (tipo==="Archivo provisional (MP)"?null:destino), auraOut)); /* eslint-disable-next-line */ },[tipo, meta, branding, destino, auraOut]);

  const puedeExportar = Boolean(texto.trim());

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      {/* Header */}
      <header className="border-b border-white/10 bg-slate-900/60 backdrop-blur sticky top-0 z-20">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-3">
          <Link href="/" className="inline-flex items-center text-slate-300 hover:text-white transition text-sm">← Inicio</Link>
          <div className="ml-auto flex items-center gap-2">
            <Btn variant="outline" onClick={()=>test("acusacion-demo")}>Test Acusación</Btn>
            <Btn variant="outline" onClick={()=>test("sobreseimiento-demo")}>Test Sobreseimiento</Btn>
            <Btn variant="outline" onClick={()=>test("imputacion-demo")}>Test Imputación</Btn>
            <Btn variant="outline" onClick={()=>test("archivo-mp-demo")}>Test Archivo MP</Btn>
            <Btn variant="outline" onClick={()=>test("sol-archivo-def-demo")}>Test Solicitud de Archivo (Defensa)</Btn>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6 space-y-6">
        {/* Paso 1 – Branding & Destino */}
        <Box>
          <Head title="Paso 1 – Identidad y destino" description="Rol, entidad, branding y despacho destinatario" />
          <Section className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label>Rol</Label>
                <Select value={rol} onChange={(v:Rol)=>setRol(v)} options={["Fiscalía","Defensa","Querella"]} />
              </div>
              <div>
                <Label>Tipo de entidad</Label>
                <Select value={entidad} onChange={(v:Entidad)=>{ setEntidad(v); setBranding({...branding, entidad:v}); }} options={["Ministerio Público","Defensa Pública","Despacho Privado"]} />
              </div>
              <div>
                <Label>Fuente del documento</Label>
                <Select value={branding.fuente||"Times New Roman"} onChange={(v:any)=>setBranding({...branding, fuente:v})} options={["Times New Roman","Arial","Garamond"]} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label>{entidad === "Despacho Privado" ? "Nombre del Estudio Jurídico" : "Nombre de la Fiscalía/Unidad"}</Label>
                <Input value={branding.nombreEntidad} onChange={(e:any)=>setBranding({...branding, nombreEntidad:e.target.value})} />
              </div>
              <div>
                <Label>Color institucional (hex)</Label>
                <Input type="color" value={branding.colorPrimario||"#0ea5e9"} onChange={(e:any)=>setBranding({...branding, colorPrimario:e.target.value})} />
              </div>
              <div>
                <Label>Logo (PNG/JPG)</Label>
                <div className="flex gap-2 items-center">
                  <Btn variant="secondary" onClick={()=>fileRef.current?.click()}>Subir logo</Btn>
                  {branding.logoDataUrl ? <span className="text-xs text-slate-400">Logo cargado</span> : <span className="text-xs text-slate-500">Sin logo</span>}
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e:any)=> e.target.files?.[0] && cargarLogo(e.target.files[0])} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label>Firma – Nombre</Label>
                <Input value={branding.firmaNombre} onChange={(e:any)=>setBranding({...branding, firmaNombre:e.target.value})} />
              </div>
              <div>
                <Label>Firma – Línea (cargo)</Label>
                <Input value={branding.firmaLinea} onChange={(e:any)=>setBranding({...branding, firmaLinea:e.target.value})} />
              </div>
              <div>
                <Label>Domicilio profesional (opcional)</Label>
                <Input value={branding.domicilio||""} onChange={(e:any)=>setBranding({...branding, domicilio:e.target.value})} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label>Teléfono (opcional)</Label>
                <Input value={branding.telefono||""} onChange={(e:any)=>setBranding({...branding, telefono:e.target.value})} />
              </div>
              <div>
                <Label>Correo (opcional)</Label>
                <Input value={branding.correo||""} onChange={(e:any)=>setBranding({...branding, correo:e.target.value})} />
              </div>
              <div>
                <Label>Despacho destinatario</Label>
                <Input value={destino?.nombre||""} onChange={(e:any)=>setDestino({ nombre:e.target.value })} />
              </div>
            </div>

            <div className="flex gap-2">
              <Btn onClick={()=>setStep(2)}>Continuar a Aura Penalista</Btn>
              <Btn variant="secondary" onClick={()=>setTexto("")}>Limpiar</Btn>
            </div>
          </Section>
        </Box>

        {/* Paso 2 – Aura Penalista */}
        {step>=2 && (
          <Box>
            <Head title="Paso 2 – Aura Penalista" description="Normaliza hechos, principios, delito y estadio; genera un resumen con doctrina (Meini)" />
            <Section className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <Label>¿Qué?</Label>
                  <Input value={auraIn.que} onChange={(e:any)=>setAuraIn({...auraIn, que:e.target.value})} />
                </div>
                <div>
                  <Label>¿Cuándo?</Label>
                  <Input value={auraIn.cuando} onChange={(e:any)=>setAuraIn({...auraIn, cuando:e.target.value})} />
                </div>
                <div>
                  <Label>¿Dónde?</Label>
                  <Input value={auraIn.donde} onChange={(e:any)=>setAuraIn({...auraIn, donde:e.target.value})} />
                </div>
              </div>
              <div>
                <Label>Relato</Label>
                <Textarea className="min-h-[120px]" value={auraIn.relato} onChange={(e:any)=>setAuraIn({...auraIn, relato:e.target.value})} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <Label>Principios (CPP)</Label>
                  <select multiple value={auraIn.principiosCPP} onChange={(e:any)=>{
                    const vals = Array.from(e.target.selectedOptions).map((o:any)=>o.value);
                    setAuraIn({...auraIn, principiosCPP: vals});
                  }} className="w-full px-3 py-2 rounded-xl bg-slate-800/60 border border-white/10 outline-none focus:ring-2 focus:ring-white/20 text-sm min-h-[160px]">
                    {PRINCIPIOS_CPP.map(p=> <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Principios penales (CP)</Label>
                  <select multiple value={auraIn.principiosCP} onChange={(e:any)=>{
                    const vals = Array.from(e.target.selectedOptions).map((o:any)=>o.value);
                    setAuraIn({...auraIn, principiosCP: vals});
                  }} className="w-full px-3 py-2 rounded-xl bg-slate-800/60 border border-white/10 outline-none focus:ring-2 focus:ring-white/20 text-sm min-h-[160px]">
                    {PRINCIPIOS_CP.map(p=> <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Delito (Libro II del CP)</Label>
                  {/* Selector jerárquico: Título → Capítulo → Delito */}
                  <div className="space-y-2">
                    <Select value={selTitulo} onChange={(v:any)=>setSelTitulo(v)} options={TITULOS} />
                    <Select value={selCap} onChange={(v:any)=>setSelCap(v)} options={capitulosDe(selTitulo)} />
                    <Select value={selDelito} onChange={(v:any)=>setSelDelito(v)} options={delitosDe(selTitulo, selCap)} />
                  </div>
                </div>
              </div>

              {/* Doctrina con tooltips y botón Ver más */}
              <Box>
                <Head title="Doctrina de excepciones (Meini)" description="Pasa el cursor por los íconos para leer y haz clic en Ver más" />
                <Section>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      "Error de tipo (art. 30)",
                      "Error de prohibición (art. 39)",
                      "Error en la punibilidad (doctrina)",
                      "Error de tipo permisivo (doctrina)",
                      "Causas de justificación (arts. 31–33)",
                      "Imputabilidad / inimputabilidad (arts. 35–38)",
                      "Tentativa y desistimiento (arts. 48–49)",
                    ].map((k)=>{
                      const item = DOCTRINA[k];
                      return (
                        <div key={k} className="relative">
                          <div className="flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-slate-800/50 px-3 py-2">
                            <div className="text-xs font-medium">{item.title}</div>
                            <button
                              onMouseEnter={()=>setHoverKey(k)}
                              onMouseLeave={()=>setHoverKey((prev)=> prev===k ? null : prev)}
                              onFocus={()=>setHoverKey(k)}
                              onBlur={()=>setHoverKey(null)}
                              className="text-xs px-2 py-1 rounded-lg border border-white/10 hover:bg-white/5"
                              aria-label={`Ver explicación breve de ${item.title}`}
                            >ℹ︎</button>
                          </div>
                          {hoverKey===k && (
                            <div className="relative">
                              <Tooltip title={item.title} excerpt={item.excerpt} onVerMas={()=>{ setModalKey(k); setHoverKey(null); }} />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-3">Fuente doctrinal: Iván Meini, <em>Teoría del Delito</em> (citas adaptadas para uso didáctico).</div>
                </Section>
              </Box>

              <Box className="border-white/10">
                <Head title="Resumen de Aura" />
                <Section>
                  <div className="text-sm">
                    <div><b>Tipicidad:</b> {auraOut.tipicidad}</div>
                    <div><b>Consumación:</b> {auraOut.consumacion}</div>
                    {auraOut.penaMinMax && <div><b>Pena (meses):</b> {auraOut.penaMinMax.minMeses} – {auraOut.penaMinMax.maxMeses}</div>}
                    <div><b>Bloques sugeridos:</b> {auraOut.bloquesSugeridos.join(", ") || "(ninguno)"}</div>
                    <div><b>Escrito recomendado:</b> {auraOut.recomendado}</div>
                  </div>
                </Section>
              </Box>

              <div className="flex gap-2">
                <Btn onClick={()=>{ setTipo(auraOut.recomendado); setStep(3); }}>Usar recomendado y continuar</Btn>
                <Btn variant="secondary" onClick={()=>setStep(3)}>Continuar sin cambiar</Btn>
              </div>
            </Section>
          </Box>
        )}

        {/* Paso 3 – Redacción y Exportación */}
        {step>=3 && (
          <Box>
            <Head title="Paso 3 – Redacción" description="Estructura por artículo aplicable (CPP/CP) con bloques sugeridos" />
            <Section className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <Label>Tipo de escrito</Label>
                  <Select value={tipo} onChange={(v:any)=>setTipo(v)} options={[
                    "Imputación (CPP 280-281)",
                    "Acusación (CPP 340)",
                    "Acusación autónoma (CPP 340)",
                    "Acción resarcitoria",
                    "Sobreseimiento (CPP 350)",
                    "Solicitudes varias",
                    "Archivo provisional (MP)",
                    "Solicitud de archivo (Defensa)"
                  ]} />
                </div>
                <div>
                  <Label>N° de causa</Label>
                  <Input value={meta.numeroCausa} onChange={(e:any)=>setMeta({...meta, numeroCausa:e.target.value})} />
                </div>
                <div>
                  <Label>Noticia criminal</Label>
                  <Input value={meta.noticiaCriminal||""} onChange={(e:any)=>setMeta({...meta, noticiaCriminal:e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <Label>Delito</Label>
                  <Input value={meta.delito} onChange={(e:any)=>setMeta({...meta, delito:e.target.value})} />
                </div>
                <div>
                  <Label>Imputado</Label>
                  <Input value={meta.imputado} onChange={(e:any)=>setMeta({...meta, imputado:e.target.value})} />
                </div>
                <div>
                  <Label>Víctima</Label>
                  <Input value={meta.victima||""} onChange={(e:any)=>setMeta({...meta, victima:e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <Label>Juzgado</Label>
                  <Input value={meta.juzgado||""} onChange={(e:any)=>setMeta({...meta, juzgado:e.target.value})} />
                </div>
                <div>
                  <Label>Circuito</Label>
                  <Input value={meta.circuito} onChange={(e:any)=>setMeta({...meta, circuito:e.target.value})} />
                </div>
                <div>
                  <Label>Provincia</Label>
                  <Input value={meta.provincia} onChange={(e:any)=>setMeta({...meta, provincia:e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <Label>Fecha</Label>
                  <Input value={meta.fecha} onChange={(e:any)=>setMeta({...meta, fecha:e.target.value})} />
                </div>
                <div>
                  <Label>Despacho destinatario</Label>
                  <Input value={destino?.nombre||""} onChange={(e:any)=>setDestino({ nombre:e.target.value })} />
                </div>
              </div>

              <div>
                <Label>Borrador editable</Label>
                <Textarea className="min-h-[360px]" value={texto} onChange={(e:any)=>setTexto(e.target.value)} />
              </div>

              <div className="flex flex-wrap gap-2">
                <Btn onClick={generar}>Regenerar con estructura legal</Btn>
                <Btn onClick={descargarPDF} disabled={!puedeExportar}>Descargar PDF</Btn>
                <Btn onClick={descargarDOC} disabled={!puedeExportar} variant="secondary">Descargar DOC</Btn>
              </div>
            </Section>
          </Box>
        )}
      </div>

      {/* Modal de doctrina extendida */}
      <Modal open={Boolean(modalKey)} onClose={()=>setModalKey(null)} title={modalKey ? DOCTRINA[modalKey].title : ""}>
        {modalKey ? DOCTRINA[modalKey].full : null}
        <hr className="my-3 border-white/10" />
        <p className="text-[11px] text-slate-400">Cita doctrinal: Iván Meini, <em>Teoría del Delito</em> (referencias para estudio y argumentación). Este módulo ofrece explicación pedagógica; la cita literal debe consultarse en la obra.</p>
      </Modal>
    </div>
  );
}
