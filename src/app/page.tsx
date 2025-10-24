"use client";

import Link from "next/link";

// ===========================================
// Home – FlowPenal (launcher principal)
// Tarjetas de acceso rápido a los módulos principales
// Autocontenido y estilizado en Tailwind
// ===========================================

function Card({ title, description, href }: { title: string; description: string; href: string }) {
  return (
    <Link
      href={href}
      className="group block rounded-2xl border border-white/10 bg-slate-900/40 hover:bg-slate-900/60 transition shadow-sm"
    >
      <div className="p-4">
        <div className="text-base font-semibold text-white group-hover:text-white">{title}</div>
        <p className="mt-1 text-xs text-slate-400 group-hover:text-slate-300">{description}</p>
        <div className="mt-3 inline-flex items-center text-[12px] text-sky-300 group-hover:text-sky-200">
          Abrir →
        </div>
      </div>
    </Link>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      {/* Encabezado */}
      <header className="border-b border-white/10 bg-slate-900/60 backdrop-blur sticky top-0 z-20">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <h1 className="text-lg font-semibold">FlowPenal</h1>
          <p className="text-xs text-slate-400">
            Herramientas de análisis penal y redacción procesal – Panamá
          </p>
        </div>
      </header>

      {/* Cuerpo principal */}
      <main className="mx-auto max-w-6xl px-4 py-6 space-y-8">
        {/* Tarjetas principales */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card
            title="Redacción de Escritos"
            description="Wizard guiado: branding, Aura Penalista, argumentación jurídica y estructura legal conforme al CPP y CP. Exporta a PDF/DOC."
            href="/escritos"
          />

          <Card
            title="Riesgos Procesales y Medidas Cautelares"
            description="Analiza riesgos de fuga, obstaculización, peligro para la víctima o la comunidad. Calcula arraigo, genera matriz y conclusiones según rol."
            href="/riesgos"
          />

          <Card
            title="Cálculo de Penas"
            description="Herramienta de estimación de penas conforme al Código Penal. Incluye agravantes, atenuantes, grado de ejecución y rango orientativo."
            href="/penas"
          />

          <Card
            title="Atenuantes y Agravantes"
            description="Selección de circunstancias comunes y específicas conforme al Código Penal panameño, con cálculo del impacto proporcional en la pena."
            href="/circunstancias"
          />

          <Card
            title="Aura Penalista"
            description="Asistente de análisis penal. Permite ingresar hechos, principios procesales y penales, y obtiene un resumen doctrinal y tipicidad probable."
            href="/aura"
          />

          <Card
            title="Calculadora de Honorarios"
            description="Calcula honorarios profesionales según la complejidad, etapa procesal y tipo de actuación. Incluye generador de contrato y cláusulas automáticas."
            href="/honorarios"
          />
        </section>

        {/* Notas generales */}
        <section>
          <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4">
            <h2 className="text-sm font-semibold">Notas</h2>
            <ul className="mt-2 text-xs text-slate-400 list-disc list-inside space-y-1">
              <li>
                Todos los módulos funcionan sin dependencias visuales externas y son compatibles con
                entornos restringidos.
              </li>
              <li>
                La exportación a PDF usa importación dinámica; si no está disponible, existe fallback
                automático a DOC o TXT.
              </li>
              <li>
                Las plantillas, matrices y argumentos están adaptados al derecho panameño, siguiendo
                el Código Penal y el Código Procesal Penal.
              </li>
              <li>
                Los textos generados pueden incorporarse directamente en los escritos creados por
                Aura Penalista o descargarse como documentos independientes.
              </li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}
