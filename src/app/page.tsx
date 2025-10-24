"use client";

import Link from "next/link";

// ===========================================
// Home – FlowPenal (launcher)
// Tarjetas de acceso rápido a los módulos principales
// 100% self-contained, sin dependencias externas
// ===========================================

function Card({ title, description, href }: { title: string; description: string; href: string }) {
  return (
    <Link href={href} className="group block rounded-2xl border border-white/10 bg-slate-900/40 hover:bg-slate-900/60 transition shadow-sm">
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
      <header className="border-b border-white/10 bg-slate-900/60 backdrop-blur sticky top-0 z-20">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <h1 className="text-lg font-semibold">FlowPenal</h1>
          <p className="text-xs text-slate-400">Herramientas de análisis penal y redacción procesal – Panamá</p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card
            title="Redacción de Escritos"
            description="Wizard de 3 pasos: branding, Aura Penalista y borrador con estructura legal (CPP/CP). Exporta a PDF/DOC."
            href="/escritos"
          />

          <Card
            title="Riesgos Procesales y Medidas Cautelares"
            description="Matriz de riesgos (fuga, obstaculización, víctima, comunidad), puntaje de arraigo, conclusiones por rol y exportación."
            href="/riesgos"
          />

          {/* En caso de existir el módulo de cálculo de penas en /penas, descomentar: */}
          {/* <Card
            title="Cálculo de Penas"
            description="Circunstancias atenuantes/agravantes, grado de ejecución y rango sancionatorio orientativo."
            href="/penas"
          /> */}
        </section>

        <section className="mt-8">
          <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4">
            <h2 className="text-sm font-semibold">Notas</h2>
            <ul className="mt-2 text-xs text-slate-400 list-disc list-inside space-y-1">
              <li>Todos los módulos operan sin dependencias visuales externas; compatibles con entornos restringidos.</li>
              <li>La exportación a PDF usa importación dinámica; si no está disponible, hay fallback a DOC/TXT.</li>
              <li>Las plantillas y matrices se ajustan al derecho panameño y usan lenguaje forense local.</li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}
