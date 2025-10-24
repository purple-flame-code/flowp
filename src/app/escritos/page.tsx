"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

// ===========================
//  ⚠️ Nota de compatibilidad
// ===========================
// Para evitar errores de resolución de rutas en sandbox, este archivo NO depende
// de componentes externos (Button/Card/etc.). Implementamos wrappers mínimos
// con elementos nativos y Tailwind para que compile en cualquier entorno.

// Wrappers UI básicos (autónomos)
function UIContainer({ children, className = "" }: any) {
  return <div className={`bg-slate-900/50 border border-white/10 rounded-2xl ${className}`}>{children}</div>;
}
function UIHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="p-4 border-b border-white/10">
      <div className="text-base font-semibold">{title}</div>
      {description ? <div className="text-xs text-slate-400 mt-0.5">{description}</div> : null}
    </div>
  );
}
function UISection({ children, className = "" }: any) {
  return <div className={`p-4 ${className}`}>{children}</div>;
}
function UIButton({ children, className = "", variant = "solid", disabled = false, onClick }: any) {
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
function UILabel({ children }: any) {
  return <label className="block text-xs text-slate-300 mb-1">{children}</label>;
}
function UIInput({ value, onChange, placeholder = "", type = "text", inputMode }: any) {
  return (
    <input
      type={type}
      inputMode={inputMode}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-3 py-2 rounded-xl bg-slate-800/60 border border-white/10 outline-none focus:ring-2 focus:ring-white/20"
    />
  );
}
function UISelect({ value, onChange, children }: any) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 rounded-xl bg-slate-800/60 border border-white/10 outline-none focus:ring-2 focus:ring-white/20 text-sm"
    >
      {children}
    </select>
  );
}
function UITextarea({ value, onChange, className = "" }: any) {
  return (
    <textarea
      value={value}
      onChange={onChange}
      className={`w-full px-3 py-2 rounded-xl bg-slate-800/60 border border-white/10 outline-none focus:ring-2 focus:ring-white/20 ${className}`}
    />
  );
}

// ===========================================
//  Tipos y utilidades
// ===========================================

type Rol = "Fiscalía" | "Defensa" | "Juez";

type EscritoTipo =
  | "Acusación"
  | "Querella"
  | "Solicitud de Medida Cautelar"
  | "Recurso de Anulación"
  | "Recurso de Casación"
  | "Archivo Provisional";

interface MetaCaso {
  juzgado: string;
  circuito: string;
  provincia: string;
  numeroCausa: string;
  noticiaCriminal?: string;
  delito: string;
  imputado: string;
  victima?: string;
  juez?: string;
  fiscal?: string;
  defensor?: string;
  fecha: string; // dd/mm/aaaa
}

const hoyPA = () => new Date().toLocaleDateString("es-PA", { day: "2-digit", month: "2-digit", year: "numeric" });

function encabezado(meta: MetaCaso, _rol: Rol) {
  const { juzgado, circuito, provincia, numeroCausa, noticiaCriminal, fecha } = meta;
  const lineaNC = noticiaCriminal ? `\nNOTICIA CRIMINAL: ${noticiaCriminal}` : "";
  return (
    `REPÚBLICA DE PANAMÁ\nÓRGANO JUDICIAL\n\n${juzgado.toUpperCase()}\n${circuito} – ${provincia}\n\nPROCESO PENAL Nº ${numeroCausa}${lineaNC}\n\n` +
    `Panamá, ${fecha || hoyPA()}\n\n`
  );
}

// ===========================================
//  Plantillas (machotes)
// ===========================================

function plantillaAcusacion(meta: MetaCaso, rol: Rol) {
  const { delito, imputado, victima, fiscal } = meta;
  return (
    encabezado(meta, rol) +
    `ESCRITO DE ACUSACIÓN\n\n` +
    `Con la venia del despacho, señor Juez:\n\n` +
    `I. HECHOS\n` +
    `1. Se atribuye a ${imputado} la presunta comisión del delito de ${delito}${victima ? `, en perjuicio de ${victima}` : ""}.\n` +
    `2. Los hechos se desarrollan conforme a lo actuado en investigación, constando en cadena de custodia, entrevistas y demás elementos colectados.\n\n` +
    `II. FUNDAMENTOS DE DERECHO\n` +
    `– Código Procesal Penal (arts. 340 y ss. – acusación).\n` +
    `– Código Penal (tipicidad, antijuridicidad y culpabilidad del tipo imputado).\n` +
    `– Principios: legalidad, motivación, proporcionalidad y debido proceso.\n\n` +
    `III. PETICIÓN\n` +
    `Se solicita admitir la presente acusación, ordenar la apertura a juicio oral y la práctica de las pruebas individualizadas en el listado anexo.\n\n` +
    `Atentamente,\n${fiscal || "Fiscal de Circuito"}`
  );
}

function plantillaQuerella(meta: MetaCaso, rol: Rol) {
  const { delito, victima, defensor, imputado } = meta;
  return (
    encabezado(meta, rol) +
    `QUERELLA\n\n` +
    `Yo, ${victima || "[Nombre de la víctima]"}, en mi calidad de víctima/querellante, interpongo querella contra ${imputado} por el delito de ${delito}.\n\n` +
    `I. HECHOS\nSe narran de manera clara, precisa y circunstanciada los hechos, indicando fecha, lugar, modo y ocasión.\n\n` +
    `II. FUNDAMENTOS DE DERECHO\n– Código Procesal Penal (arts. sobre admisión de querella y legitimación).\n– Principios de tutela judicial efectiva y acceso a la justicia.\n\n` +
    `III. PETICIÓN\nSe solicite la admisión de la presente querella, el reconocimiento de la calidad de víctima y se ordene la práctica de diligencias de investigación propuestas.\n\n` +
    `Atentamente,\n${victima || "Querellante"}${defensor ? `\nPatrocinio: ${defensor}` : ""}`
  );
}

function plantillaMedidaCautelar(meta: MetaCaso, rol: Rol) {
  const { delito, imputado, fiscal } = meta;
  return (
    encabezado(meta, rol) +
    `SOLICITUD DE MEDIDA CAUTELAR PERSONAL\n\n` +
    `Con la venia del despacho, señor Juez:\n\n` +
    `I. HECHOS\nSe investiga a ${imputado} por el delito de ${delito}. Consta noticia criminal, informe policial y entrevistas.\n\n` +
    `II. FUNDAMENTOS DE DERECHO\n– Código Procesal Penal, art. 221 (proporcionalidad y subsidiariedad).\n– Requisitos: fumus boni iuris y periculum libertatis (riesgos de fuga, obstaculización o reiteración).\n\n` +
    `III. PETICIÓN\nSe solicita imponer [detención provisional / presentación periódica / prohibición de salida / otra], debidamente motivada y proporcional al riesgo advertido.\n\n` +
    `Atentamente,\n${fiscal || "Fiscal"}`
  );
}

function plantillaAnulacion(meta: MetaCaso, rol: Rol) {
  const { defensor, numeroCausa } = meta;
  return (
    encabezado(meta, rol) +
    `RECURSO DE ANULACIÓN\n\n` +
    `Contra la Sentencia recurrida dictada dentro de la causa N° ${numeroCausa}, respetuosamente expongo:\n\n` +
    `I. ANTECEDENTES\nSe sintetizan actos procesales relevantes y la decisión impugnada.\n\n` +
    `II. CAUSALES DE ANULACIÓN\n– Vulneración de garantías y/o errónea aplicación de la ley sustantiva/procesal.\n– Falta de motivación suficiente.\n\n` +
    `III. PETITORIO\nSe solicite a la Sala Penal casar/anular la sentencia y dictar la que en derecho corresponda o disponer la reposición.\n\n` +
    `Atentamente,\n${defensor || "Defensor"}`
  );
}

function plantillaCasacion(meta: MetaCaso, rol: Rol) {
  const { defensor, numeroCausa } = meta;
  return (
    encabezado(meta, rol) +
    `RECURSO DE CASACIÓN\n\n` +
    `Se formaliza recurso de casación contra la sentencia proferida en el proceso N° ${numeroCausa}, por las siguientes razones:\n\n` +
    `I. BREVE SÍNTESIS FÁCTICA\nSe exponen sucintamente los hechos probados conforme a la sentencia.\n\n` +
    `II. CAUSALES EN LA LEY\n– Infracción de ley sustantiva.\n– Infracción de normas procesales determinantes.\n\n` +
    `III. ALCANCE\nSe solicita casar la decisión y adoptar el pronunciamiento de fondo o el reenvío conforme a derecho.\n\n` +
    `Atentamente,\n${defensor || "Defensor"}`
  );
}

function plantillaArchivoProvisional(meta: MetaCaso, rol: Rol) {
  const { fiscal, noticiaCriminal, delito, imputado, victima } = meta;
  return (
    encabezado(meta, rol) +
    `ARCHIVO PROVISIONAL N°\n\n` +
    `NOTICIA CRIMINAL ${noticiaCriminal || "[N°]"}\n\n` +
    `I. ANTECEDENTES\nSe investigó la presunta comisión del delito de ${delito} atribuida a ${imputado}${victima ? `, en perjuicio de ${victima}` : ""}.\n\n` +
    `II. MOTIVACIÓN\nNo se han reunido elementos de convicción suficientes para sustentar acusación, sin perjuicio de continuar la investigación si surgen nuevos elementos.\n\n` +
    `III. RESUELVO\nOrdenar el archivo provisional conforme al CPP.\n\n` +
    `Atentamente,\n${fiscal || "Fiscal"}`
  );
}

const PLANTILLAS: Record<EscritoTipo, (m: MetaCaso, r: Rol) => string> = {
  "Acusación": plantillaAcusacion,
  "Querella": plantillaQuerella,
  "Solicitud de Medida Cautelar": plantillaMedidaCautelar,
  "Recurso de Anulación": plantillaAnulacion,
  "Recurso de Casación": plantillaCasacion,
  "Archivo Provisional": plantillaArchivoProvisional,
};

// ===========================================
//  Página
// ===========================================

export default function EscritosPage() {
  const [rol, setRol] = useState<Rol>("Fiscalía");
  const [tipo, setTipo] = useState<EscritoTipo>("Acusación");

  const [meta, setMeta] = useState<MetaCaso>({
    juzgado: "Juzgado de Garantías del Primer Circuito Judicial",
    circuito: "Primer Circuito Judicial",
    provincia: "Panamá",
    numeroCausa: "2025-000000",
    noticiaCriminal: "",
    delito: "Homicidio Doloso (Tentativa)",
    imputado: "[Nombre del Imputado]",
    victima: "[Nombre de la Víctima]",
    juez: "[Nombre del Juez]",
    fiscal: "[Nombre del Fiscal]",
    defensor: "[Nombre del Defensor]",
    fecha: hoyPA(),
  });

  const [texto, setTexto] = useState("");

  const generar = () => {
    const tpl = PLANTILLAS[tipo];
    const borrador = tpl(meta, rol);
    setTexto(borrador);
  };

  const limpiar = () => setTexto("");

  // Exportar PDF (lazy import del generador); fallback TXT si no existe
  const descargarPDF = async () => {
    if (!texto.trim()) return;
    try {
      const mod = await import("../../lib/pdf-generator");
      const blob = await mod.generatePDF({
        title: `${tipo} – ${meta.numeroCausa}`,
        content: texto,
        branding: JSON.parse(localStorage.getItem("flowpenal_brand") || "{}"),
      });
      mod.downloadPDF(blob, `${tipo.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}.pdf`);
    } catch (e) {
      const blob = new Blob([texto], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${tipo.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    }
  };

  // Exportar como DOC (HTML simple)
  const descargarDOC = () => {
    if (!texto.trim()) return;
    const html = `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><title>${tipo}</title></head><body><pre style="font-family: 'Times New Roman', serif; white-space: pre-wrap;">${texto
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")}</pre></body></html>`;
    const blob = new Blob([html], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${tipo.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}.doc`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  // Casos de prueba (para validar el flujo rápidamente)
  const testCase = (id: string) => {
    if (id === "acusacion-homicidio") {
      setRol("Fiscalía");
      setTipo("Acusación");
      setMeta((m) => ({
        ...m,
        delito: "Homicidio Doloso (Tentativa)",
        imputado: "SANTIAGO ARAÚZ CARRETERO",
        victima: "MARIO AUGUSTO RIVERA DELGADO",
        numeroCausa: "201300005960",
        juez: "[Juez de Garantías]",
        fiscal: "Licda. Yuriel Medina Rojas",
        fecha: hoyPA(),
      }));
    } else if (id === "anulacion-violacion") {
      setRol("Fiscalía");
      setTipo("Recurso de Anulación");
      setMeta((m) => ({
        ...m,
        delito: "Violación Agravada",
        imputado: "ANÍBAL JAMETH SÁNCHEZ GONZÁLEZ",
        victima: "MEYBELINE MICHELL VILLAVERDE MOSQUERA",
        numeroCausa: "202000049001",
        fiscal: "[Fiscal Sustentante]",
        fecha: hoyPA(),
      }));
    } else if (id === "archivo-provisional") {
      setRol("Fiscalía");
      setTipo("Archivo Provisional");
      setMeta((m) => ({
        ...m,
        delito: "Violación Agravada",
        imputado: "BLEIDER STEVEN SEIJAS",
        victima: "A.A.C.C.",
        noticiaCriminal: "202400043614",
        numeroCausa: "2024-000000",
        fiscal: "[Fiscal de Sección]",
        fecha: "14/01/2025",
      }));
    } else if (id === "querella-basica") {
      setRol("Defensa");
      setTipo("Querella");
      setMeta((m) => ({
        ...m,
        delito: "Injurias y Calumnias",
        imputado: "[Imputado]",
        victima: "[Querellante]",
        numeroCausa: "2025-111111",
        fecha: hoyPA(),
      }));
    } else if (id === "cautelar-riesgos") {
      setRol("Fiscalía");
      setTipo("Solicitud de Medida Cautelar");
      setMeta((m) => ({
        ...m,
        delito: "Robo Agravado",
        imputado: "[Imputado]",
        numeroCausa: "2025-222222",
        fecha: hoyPA(),
      }));
    }
  };

  // Generación automática al cambiar meta/tipo si el texto está vacío
  useEffect(() => {
    if (!texto.trim()) {
      const tpl = PLANTILLAS[tipo];
      setTexto(tpl(meta, rol));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rol, tipo, meta]);

  const puedeExportar = Boolean(texto.trim());

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      {/* Header */}
      <header className="border-b border-white/10 bg-slate-900/60 backdrop-blur sticky top-0 z-20">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-3">
          <Link href="/" className="inline-flex items-center text-slate-300 hover:text-white transition text-sm">
            ← Inicio
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <UIButton onClick={() => testCase("acusacion-homicidio")} className="!text-xs" variant="outline">Test Acusación</UIButton>
            <UIButton onClick={() => testCase("anulacion-violacion")} className="!text-xs" variant="outline">Test Anulación</UIButton>
            <UIButton onClick={() => testCase("archivo-provisional")} className="!text-xs" variant="outline">Test Archivo</UIButton>
            <UIButton onClick={() => testCase("querella-basica")} className="!text-xs" variant="outline">Test Querella</UIButton>
            <UIButton onClick={() => testCase("cautelar-riesgos")} className="!text-xs" variant="outline">Test Cautelar</UIButton>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuración */}
        <UIContainer className="lg:col-span-1">
          <UIHeader title="Configuración del escrito" description="Rol, tipo y metadatos del caso" />
          <UISection className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <div>
                <UILabel>Rol</UILabel>
                <UISelect value={rol} onChange={(v: Rol) => setRol(v)}>
                  <option value="Fiscalía">Fiscalía</option>
                  <option value="Defensa">Defensa</option>
                  <option value="Juez">Juez</option>
                </UISelect>
              </div>
              <div>
                <UILabel>Tipo de escrito</UILabel>
                <UISelect value={tipo} onChange={(v: EscritoTipo) => setTipo(v)}>
                  <option value="Acusación">Acusación</option>
                  <option value="Querella">Querella</option>
                  <option value="Solicitud de Medida Cautelar">Solicitud de Medida Cautelar</option>
                  <option value="Recurso de Anulación">Recurso de Anulación</option>
                  <option value="Recurso de Casación">Recurso de Casación</option>
                  <option value="Archivo Provisional">Archivo Provisional</option>
                </UISelect>
              </div>

              <div>
                <UILabel>Juzgado</UILabel>
                <UIInput value={meta.juzgado} onChange={(e: any) => setMeta({ ...meta, juzgado: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <UILabel>Circuito</UILabel>
                  <UIInput value={meta.circuito} onChange={(e: any) => setMeta({ ...meta, circuito: e.target.value })} />
                </div>
                <div>
                  <UILabel>Provincia</UILabel>
                  <UIInput value={meta.provincia} onChange={(e: any) => setMeta({ ...meta, provincia: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <UILabel>N° de Causa</UILabel>
                  <UIInput value={meta.numeroCausa} onChange={(e: any) => setMeta({ ...meta, numeroCausa: e.target.value })} />
                </div>
                <div>
                  <UILabel>Noticia Criminal</UILabel>
                  <UIInput value={meta.noticiaCriminal || ""} onChange={(e: any) => setMeta({ ...meta, noticiaCriminal: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <UILabel>Delito</UILabel>
                  <UIInput value={meta.delito} onChange={(e: any) => setMeta({ ...meta, delito: e.target.value })} />
                </div>
                <div>
                  <UILabel>Fecha</UILabel>
                  <UIInput value={meta.fecha} onChange={(e: any) => setMeta({ ...meta, fecha: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <UILabel>Imputado</UILabel>
                  <UIInput value={meta.imputado} onChange={(e: any) => setMeta({ ...meta, imputado: e.target.value })} />
                </div>
                <div>
                  <UILabel>Víctima</UILabel>
                  <UIInput value={meta.victima || ""} onChange={(e: any) => setMeta({ ...meta, victima: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <UILabel>Juez</UILabel>
                  <UIInput value={meta.juez || ""} onChange={(e: any) => setMeta({ ...meta, juez: e.target.value })} />
                </div>
                <div>
                  <UILabel>Fiscal</UILabel>
                  <UIInput value={meta.fiscal || ""} onChange={(e: any) => setMeta({ ...meta, fiscal: e.target.value })} />
                </div>
                <div>
                  <UILabel>Defensor</UILabel>
                  <UIInput value={meta.defensor || ""} onChange={(e: any) => setMeta({ ...meta, defensor: e.target.value })} />
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <UIButton onClick={generar} className="flex-1">Generar</UIButton>
                <UIButton onClick={limpiar} variant="secondary">Limpiar</UIButton>
              </div>
            </div>
          </UISection>
        </UIContainer>

        {/* Editor */}
        <UIContainer className="lg:col-span-2">
          <UIHeader title="Borrador editable" description="Revisa y ajusta la redacción antes de exportar" />
          <UISection className="space-y-3">
            <UITextarea className="min-h-[480px]" value={texto} onChange={(e: any) => setTexto(e.target.value)} />
            <div className="flex flex-wrap gap-2">
              <UIButton onClick={descargarPDF} disabled={!puedeExportar}>Descargar PDF</UIButton>
              <UIButton onClick={descargarDOC} disabled={!puedeExportar} variant="secondary">Descargar DOC</UIButton>
            </div>
          </UISection>
        </UIContainer>
      </div>
    </div>
  );
}
