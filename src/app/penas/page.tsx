"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
// RUTAS RELATIVAS (sin alias "@") para funcionar en sandbox y entornos sin tsconfig paths
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { ArrowLeft, Calculator, Download } from "lucide-react";
import { generatePDF, downloadPDF } from "../../lib/pdf-generator";

// ========================
//  Circunstancias CP Panamá
// ========================
//   Agravantes comunes – Art. 88 CP
const AGRAVANTES = [
  "Abuso de superioridad o medios que limiten la defensa (Art. 88.1 CP)",
  "Inundación, incendio, veneno, explosión u otros medios que causen grandes estragos; o aprovechar calamidad (Art. 88.2 CP)",
  "Ensañamiento (Art. 88.3 CP)",
  "Precio o recompensa (Art. 88.4 CP)",
  "Astucia, fraude o disfraz (Art. 88.5 CP)",
  "Abuso de autoridad, confianza pública, profesión o cargo (Art. 88.6 CP)",
  "Con armas o con ayuda de otras personas (Art. 88.7 CP)",
  "Escalamiento o fractura sobre las cosas (Art. 88.8 CP)",
  "Abuso de relaciones domésticas, prestación de obras/servicios, cohabitación u hospitalidad (Art. 88.9 CP)",
  "Embriaguez preordenada (Art. 88.10 CP)",
  "Víctima con discapacidad o incapaz de velar por su seguridad o salud (Art. 88.11 CP)",
  "Valerse de persona menor de edad o con discapacidad (Art. 88.12 CP)",
  "Reincidencia (Art. 88.13 CP)",
  "Planificar/coordinar/ordenar desde centro penitenciario (Art. 88.14 CP)",
];

//   Atenuantes comunes – Art. 90 CP
const ATENUANTES = [
  "Motivos nobles o altruistas (Art. 90.1 CP)",
  "No quiso causar un mal tan grave (Art. 90.2 CP)",
  "Condiciones físicas o psíquicas de inferioridad (Art. 90.3 CP)",
  "Arrepentimiento eficaz: disminuye o intenta disminuir consecuencias (Art. 90.4 CP)",
  "Colaboración efectiva (Art. 90.5 CP)",
  "Imputabilidad disminuida (Art. 90.6 CP)",
  "Otra circunstancia relevante a juicio del Tribunal (Art. 90.7 CP)",
];

// ========================
//  Tipos/ayudas locales
// ========================
type Intensidad = "leve" | "moderada" | "grave";
type GradoEjecucion = "consumado" | "tentativa";
type Parentesco = "ninguno" | "agrava" | "atenua";

function fraccionPorIntensidad(nivel: Intensidad): number {
  switch (nivel) {
    case "leve":
      return 1 / 6;
    case "grave":
      return 1 / 3;
    default:
      return 1 / 4; // moderada
  }
}

export default function PenasPage() {
  // Marco punitivo (en meses)
  const [minMeses, setMinMeses] = useState("");
  const [maxMeses, setMaxMeses] = useState("");

  // Selección de circunstancias
  const [selAgravantes, setSelAgravantes] = useState<string[]>([]);
  const [selAtenuantes, setSelAtenuantes] = useState<string[]>([]);

  // Parámetros judiciales elegibles por el usuario
  const [intAgrav, setIntAgrav] = useState<Intensidad>("moderada");
  const [intAten, setIntAten] = useState<Intensidad>("moderada");
  const [grado, setGrado] = useState<GradoEjecucion>("consumado");
  const [parentesco, setParentesco] = useState<Parentesco>("ninguno");

  const [resultado, setResultado] = useState<null | {
    penaMin: number;
    penaMax: number;
    penaProbable: number;
    subrogados: string[];
    fundamento: string[];
  }>(null);

  const min = useMemo(() => parseInt(minMeses || "0", 10) || 0, [minMeses]);
  const max = useMemo(() => parseInt(maxMeses || "0", 10) || 0, [maxMeses]);

  function toggleCheck(list: string[], setList: (v: string[]) => void, item: string) {
    setList(list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);
  }

  const calcular = () => {
    if (!min || !max || min <= 0 || max <= 0 || min > max) {
      alert("Ingrese un marco punitivo válido (mínimo y máximo en meses).");
      return;
    }

    let penaMin = min;
    let penaMax = max;

    // Grado de ejecución (Art. 82 CP – tentativa)
    if (grado === "tentativa") {
      // No menor de la mitad del mínimo ni mayor de los dos tercios del máximo
      penaMin = Math.max(1, Math.ceil(min * 0.5));
      penaMax = Math.max(penaMin, Math.floor(max * (2 / 3)));
    }

    // Base de dosificación: punto medio del marco ajustado
    let penaBase = Math.floor((penaMin + penaMax) / 2);

    // Orden de aplicación (Art. 96 CP): primero AGRAVANTES, luego ATENUANTES
    const fracAgrav = fraccionPorIntensidad(intAgrav);
    let incremento = selAgravantes.length * fracAgrav;
    let penaTrasAgrav = Math.floor(penaBase * (1 + incremento));

    // Parentesco como AGRAVANTE si así se elige (Art. 91 CP)
    if (parentesco === "agrava") {
      penaTrasAgrav = Math.floor(penaTrasAgrav * (1 + fracAgrav));
    }

    // Tope de agravación: no exceder más de la mitad del máximo (criterio práctico)
    const topeAgrav = Math.floor(penaMax + penaMax * 0.5);
    if (penaTrasAgrav > topeAgrav) penaTrasAgrav = topeAgrav;

    // Aplicar ATENUANTES
    const fracAten = fraccionPorIntensidad(intAten);
    let disminucionTotal = selAtenuantes.length * fracAten;
    let penaTrasAten = Math.floor(penaTrasAgrav * (1 - disminucionTotal));

    // Parentesco como ATENUANTE si así se elige (Art. 91 CP)
    if (parentesco === "atenua") {
      penaTrasAten = Math.floor(penaTrasAten * (1 - fracAten));
    }

    // No bajar del mínimo legal (Art. 93 CP)
    if (penaTrasAten < penaMin) penaTrasAten = penaMin;

    const penaProbable = penaTrasAten;

    // Subrogados – marcador simple (las reglas específicas dependen del delito y CPP)
    const subrogados: string[] = [];
    if (penaMax <= 36) subrogados.push("Suspensión condicional de la ejecución de la pena (si cumple requisitos)");
    if (penaMax <= 24) subrogados.push("Reemplazo de penas cortas / libertad condicional (según CP Tít. IV)");

    setResultado({
      penaMin,
      penaMax,
      penaProbable,
      subrogados,
      fundamento: [
        "CP Art. 79 (Criterios de dosificación)",
        "CP Art. 82 (Tentativa)",
        "CP Art. 88 (Agravantes comunes)",
        "CP Art. 90 (Atenuantes comunes)",
        "CP Art. 91 (Parentesco cercano)",
        "CP Art. 92-93 (Fracciones 1/6 a 1/3 y límites)",
        "CP Art. 96 (Orden: primero agravantes, luego atenuantes)",
      ],
    });
  };

  const descargarPDF = async () => {
    if (!resultado) return;

    const branding = JSON.parse(localStorage.getItem("flowpenal_brand") || "{}");

    const content = `CÁLCULO DE PENAS\n\n` +
      `Marco Punitivo (ajustado por grado de ejecución cuando aplique):\n` +
      `- Mínimo: ${resultado.penaMin} meses\n` +
      `- Máximo: ${resultado.penaMax} meses\n` +
      `- Pena probable: ${resultado.penaProbable} meses\n\n` +
      `Parámetros de dosificación:\n` +
      `- Grado de ejecución: ${grado.toUpperCase()}\n` +
      `- Intensidad AGRAVANTES: ${intAgrav}\n` +
      `- Intensidad ATENUANTES: ${intAten}\n` +
      `- Parentesco: ${parentesco}\n\n` +
      `Agravantes seleccionadas (intensidad: ${intAgrav}):\n` +
      `${selAgravantes.map((a) => "• " + a).join("\n") || "(ninguna)"}\n\n` +
      `Atenuantes seleccionadas (intensidad: ${intAten}):\n` +
      `${selAtenuantes.map((a) => "• " + a).join("\n") || "(ninguna)"}\n\n` +
      `Subrogados potenciales:\n` +
      `${resultado.subrogados.map((s) => "• " + s).join("\n") || "(ninguno)"}\n\n` +
      `Fundamento normativo:\n` +
      `${resultado.fundamento.map((f) => "• " + f).join("\n")}\n\n` +
      `Fecha de generación: ${new Date().toLocaleDateString("es-PA", { year: "numeric", month: "long", day: "numeric" })}`;

    const blob = await generatePDF({
      title: "Cálculo de Penas",
      content,
      branding: {
        nombreEstudio: branding.nombreEstudio,
        color: branding.color || "#F5C542",
        logoUrl: branding.logoUrl,
      },
    });

    downloadPDF(blob, `calculo-penas-${Date.now()}.pdf`);
  };

  // =====================
  // DEV TEST CASES (UI)
  // =====================
  const cargarCaso = (id: string) => {
    // restablecer
    setSelAgravantes([]);
    setSelAtenuantes([]);
    setParentesco("ninguno");
    setIntAgrav("moderada");
    setIntAten("moderada");
    setGrado("consumado");

    if (id === "base") {
      setMinMeses("72");
      setMaxMeses("180");
    } else if (id === "tentativa-agrav") {
      setMinMeses("60");
      setMaxMeses("120");
      setGrado("tentativa");
      setIntAgrav("grave");
      setSelAgravantes([
        AGRAVANTES[0], // superioridad
        AGRAVANTES[2], // ensañamiento
      ]);
    } else if (id === "consumado-atenua") {
      setMinMeses("36");
      setMaxMeses("84");
      setIntAten("grave");
      setSelAtenuantes([
        ATENUANTES[3], // arrepentimiento eficaz
        ATENUANTES[4], // colaboración
      ]);
      setParentesco("atenua");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      {/* Header */}
      <header className="border-b border-white/10 bg-slate-900/60 backdrop-blur sticky top-0 z-20">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center gap-3">
          <Link href="/" className="inline-flex items-center text-slate-300 hover:text-white transition">
            <ArrowLeft className="w-4 h-4 mr-2" /> Inicio
          </Link>
          <div className="ml-auto text-xs text-slate-400">LEX VENCE · FlowP · Cálculo de penas (CP Panamá)</div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-6 space-y-6">
        <Card className="bg-slate-900/50 border-white/10">
          <CardHeader>
            <CardTitle className="text-xl">Cálculo de penas</CardTitle>
            <CardDescription>
              Marco punitivo en meses, circunstancias comunes del Código Penal panameño y parámetros judiciales graduables.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Marco punitivo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Mínimo (meses)</Label>
                <Input inputMode="numeric" value={minMeses} onChange={(e) => setMinMeses(e.target.value)} placeholder="p. ej., 72" />
              </div>
              <div>
                <Label>Máximo (meses)</Label>
                <Input inputMode="numeric" value={maxMeses} onChange={(e) => setMaxMeses(e.target.value)} placeholder="p. ej., 180" />
              </div>
              <div className="flex items-end">
                <Button onClick={calcular} className="w-full">
                  <Calculator className="w-4 h-4 mr-2" /> Calcular
                </Button>
              </div>
            </div>

            {/* Parámetros judiciales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Grado de ejecución (Art. 82)</Label>
                <Select value={grado} onValueChange={(v) => setGrado(v as GradoEjecucion)}>
                  <SelectTrigger><SelectValue placeholder="Seleccione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consumado">Consumado</SelectItem>
                    <SelectItem value="tentativa">Tentativa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Parentesco cercano de la víctima (Art. 91)</Label>
                <Select value={parentesco} onValueChange={(v) => setParentesco(v as Parentesco)}>
                  <SelectTrigger><SelectValue placeholder="Seleccione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ninguno">Ninguno</SelectItem>
                    <SelectItem value="agrava">Tratar como agravante</SelectItem>
                    <SelectItem value="atenua">Tratar como atenuante</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Intensidad AGRAVANTES (1/6–1/3)</Label>
                <Select value={intAgrav} onValueChange={(v) => setIntAgrav(v as Intensidad)}>
                  <SelectTrigger><SelectValue placeholder="Seleccione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="leve">Leve (1/6)</SelectItem>
                    <SelectItem value="moderada">Moderada (1/4)</SelectItem>
                    <SelectItem value="grave">Grave (1/3)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Intensidad ATENUANTES (1/6–1/3)</Label>
                <Select value={intAten} onValueChange={(v) => setIntAten(v as Intensidad)}>
                  <SelectTrigger><SelectValue placeholder="Seleccione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="leve">Leve (1/6)</SelectItem>
                    <SelectItem value="moderada">Moderada (1/4)</SelectItem>
                    <SelectItem value="grave">Grave (1/3)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Listas marcables */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Agravantes comunes (Art. 88)</h3>
                <div className="space-y-2 max-h-64 overflow-auto pr-2">
                  {AGRAVANTES.map((item) => (
                    <label key={item} className="flex items-start gap-2 text-sm">
                      <input
                        type="checkbox"
                        className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-800"
                        checked={selAgravantes.includes(item)}
                        onChange={() => toggleCheck(selAgravantes, setSelAgravantes, item)}
                      />
                      <span>{item}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Atenuantes comunes (Art. 90)</h3>
                <div className="space-y-2 max-h-64 overflow-auto pr-2">
                  {ATENUANTES.map((item) => (
                    <label key={item} className="flex items-start gap-2 text-sm">
                      <input
                        type="checkbox"
                        className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-800"
                        checked={selAtenuantes.includes(item)}
                        onChange={() => toggleCheck(selAtenuantes, setSelAtenuantes, item)}
                      />
                      <span>{item}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Test cases (dev) */}
            <div className="border-t border-white/10 pt-4">
              <div className="text-xs text-slate-400 mb-2">Casos de prueba (rellenan el formulario y puedes presionar "Calcular")</div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => cargarCaso("base")}>Caso Base (72–180, sin circunstancias)</Button>
                <Button variant="outline" onClick={() => cargarCaso("tentativa-agrav")}>Tentativa + Agravantes Graves</Button>
                <Button variant="outline" onClick={() => cargarCaso("consumado-atenua")}>Consumado + Atenuantes Graves</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {resultado && (
          <Card className="bg-slate-900/50 border-white/10">
            <CardHeader>
              <CardTitle className="text-lg">Resultado</CardTitle>
              <CardDescription>Valores expresados en meses.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 rounded-xl bg-slate-800/60">
                  <div className="text-xs text-slate-400">Mínimo</div>
                  <div className="text-2xl font-semibold">{resultado.penaMin}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/60">
                  <div className="text-xs text-slate-400">Máximo</div>
                  <div className="text-2xl font-semibold">{resultado.penaMax}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/60">
                  <div className="text-xs text-slate-400">Pena probable</div>
                  <div className="text-2xl font-semibold">{resultado.penaProbable}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-slate-400 mb-1">Agravantes marcadas</div>
                  <ul className="list-disc pl-5 text-sm space-y-1">
                    {selAgravantes.length ? selAgravantes.map((x) => <li key={x}>{x}</li>) : <li>(ninguna)</li>}
                  </ul>
                </div>
                <div>
                  <div className="text-xs text-slate-400 mb-1">Atenuantes marcadas</div>
                  <ul className="list-disc pl-5 text-sm space-y-1">
                    {selAtenuantes.length ? selAtenuantes.map((x) => <li key={x}>{x}</li>) : <li>(ninguna)</li>}
                  </ul>
                </div>
              </div>

              <div className="text-xs text-slate-400">Fundamento: {resultado.fundamento.join(" · ")}</div>

              <div className="pt-2">
                <Button onClick={descargarPDF} className="w-full">
                  <Download className="w-4 h-4 mr-2" /> Descargar PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
