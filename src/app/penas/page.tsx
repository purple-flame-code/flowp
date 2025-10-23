"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Calculator, Download } from "lucide-react";
import { generatePDF, downloadPDF } from "@/lib/pdf-generator";

const AGRAVANTES = [
  "Alevosía (Art. 37.1)",
  "Premeditación (Art. 37.2)",
  "Ensañamiento (Art. 37.3)",
  "Abuso de superioridad (Art. 37.4)",
  "Aprovechamiento de calamidad (Art. 37.5)",
  "Uso de menor de edad",
  "Violencia de género",
];

const ATENUANTES = [
  "Arrepentimiento espontáneo (Art. 38.1)",
  "Reparación del daño (Art. 38.2)",
  "Confesión (Art. 38.3)",
  "Provocación o amenaza (Art. 38.4)",
  "Estado de emoción (Art. 38.5)",
  "Obcecación por injusta conducta",
  "Colaboración con autoridades",
];

export default function PenasPage() {
  const [minMeses, setMinMeses] = useState("");
  const [maxMeses, setMaxMeses] = useState("");
  const [agravantes, setAgravantes] = useState<string[]>([]);
  const [atenuantes, setAtenuantes] = useState<string[]>([]);
  const [concurso, setConcurso] = useState("ninguno");
  const [resultado, setResultado] = useState<any>(null);

  const descargarPDF = async () => {
    if (!resultado) return;

    const branding = JSON.parse(localStorage.getItem("flowpenal_brand") || "{}");

    const content = `CÁLCULO DE PENAS

Marco Punitivo:
- Pena Mínima: ${resultado.penaMin} meses (${Math.floor(resultado.penaMin / 12)} años ${resultado.penaMin % 12} meses)
- Pena Máxima: ${resultado.penaMax} meses (${Math.floor(resultado.penaMax / 12)} años ${resultado.penaMax % 12} meses)
- Pena Probable: ${resultado.penaProbable} meses (${Math.floor(resultado.penaProbable / 12)} años ${resultado.penaProbable % 12} meses)

Agravantes Aplicadas:
${resultado.agravantes && resultado.agravantes.length > 0 ? resultado.agravantes.map((a: string) => `- ${a}`).join('\n') : '- Ninguna'}

Atenuantes Aplicadas:
${resultado.atenuantes && resultado.atenuantes.length > 0 ? resultado.atenuantes.map((a: string) => `- ${a}`).join('\n') : '- Ninguna'}

Subrogados Aplicables:
${resultado.subrogados.map((s: string) => `- ${s}`).join('\n')}

Fundamento Legal:
${resultado.fundamento.map((f: string) => `- ${f}`).join('\n')}

Fecha de generación: ${new Date().toLocaleDateString('es-PA', { year: 'numeric', month: 'long', day: 'numeric' })}
`;

    const blob = await generatePDF({
      title: "Cálculo de Penas",
      content,
      branding: {
        nombreEstudio: branding.nombreEstudio,
        color: branding.color || "#F5C542",
        logoUrl: branding.logoUrl,
      },
    });

    downloadPDF(blob, `calculo-penas-${new Date().getTime()}.pdf`);
  };

  const calcular = () => {
    const min = parseInt(minMeses);
    const max = parseInt(maxMeses);

    if (!min || !max || min > max) {
      alert("Por favor ingrese un rango válido de pena");
      return;
    }

    let penaMin = min;
    let penaMax = max;
    let penaProbable = Math.floor((min + max) / 2);

    // Aplicar agravantes (incremento hacia el máximo)
    if (agravantes.length > 0) {
      const factorAgravante = agravantes.length * 0.1;
      penaProbable = Math.min(Math.floor(penaProbable * (1 + factorAgravante)), penaMax);
    }

    // Aplicar atenuantes (reducción hacia el mínimo)
    if (atenuantes.length > 0) {
      const factorAtenuante = atenuantes.length * 0.1;
      penaProbable = Math.max(Math.floor(penaProbable * (1 - factorAtenuante)), penaMin);
    }

    // Subrogados aplicables
    const subrogados = [];
    if (penaMax <= 36) {
      subrogados.push("Suspensión condicional de la pena (CP 93)");
    }
    if (penaMax <= 24) {
      subrogados.push("Libertad condicional anticipada");
    }

    setResultado({
      penaMin,
      penaMax,
      penaProbable,
      agravantes,
      atenuantes,
      subrogados,
      fundamento: ["CP Art. 33-39 (Individualización)", "CP Art. 37 (Agravantes)", "CP Art. 38 (Atenuantes)", "CP Art. 86 (Concurso)", "CP Art. 93-98 (Subrogados)"]
    });
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border-gray bg-surface-dark/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-gold hover:text-gold/80">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold">Volver</span>
          </Link>
          <h1 className="text-xl font-poppins font-bold text-foreground">
            FlowPenal <span className="text-gold">by Lex Vence</span>
          </h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gold/10 rounded-lg flex items-center justify-center">
              <Calculator className="w-6 h-6 text-gold" />
            </div>
            <h1 className="text-3xl md:text-4xl font-poppins font-bold text-foreground">
              Cálculo de Penas
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Calcule el rango de pena aplicable con agravantes, atenuantes y subrogados según el Código Penal.
          </p>
        </div>

        <Card className="border-border-gray bg-card shadow-soft">
          <CardHeader>
            <CardTitle className="text-2xl font-poppins">Datos del Delito</CardTitle>
            <CardDescription>Ingrese el marco punitivo y circunstancias modificativas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">

            {/* Marco Punitivo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="min" className="text-base">Pena Mínima (meses)</Label>
                <Input
                  id="min"
                  type="number"
                  placeholder="12"
                  value={minMeses}
                  onChange={(e) => setMinMeses(e.target.value)}
                  className="bg-background border-border-gray text-base"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max" className="text-base">Pena Máxima (meses)</Label>
                <Input
                  id="max"
                  type="number"
                  placeholder="120"
                  value={maxMeses}
                  onChange={(e) => setMaxMeses(e.target.value)}
                  className="bg-background border-border-gray text-base"
                />
              </div>
            </div>

            {/* Agravantes */}
            <div className="space-y-3">
              <Label className="text-base font-semibold text-accent-legal">Agravantes (CP Art. 37)</Label>
              <div className="grid grid-cols-1 gap-2">
                {AGRAVANTES.map((ag, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`ag-${i}`}
                      checked={agravantes.includes(ag)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setAgravantes([...agravantes, ag]);
                        } else {
                          setAgravantes(agravantes.filter(a => a !== ag));
                        }
                      }}
                      className="w-4 h-4 accent-accent-legal"
                    />
                    <Label htmlFor={`ag-${i}`} className="text-sm cursor-pointer">{ag}</Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Atenuantes */}
            <div className="space-y-3">
              <Label className="text-base font-semibold text-blue-lex">Atenuantes (CP Art. 38)</Label>
              <div className="grid grid-cols-1 gap-2">
                {ATENUANTES.map((at, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`at-${i}`}
                      checked={atenuantes.includes(at)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setAtenuantes([...atenuantes, at]);
                        } else {
                          setAtenuantes(atenuantes.filter(a => a !== at));
                        }
                      }}
                      className="w-4 h-4 accent-blue-lex"
                    />
                    <Label htmlFor={`at-${i}`} className="text-sm cursor-pointer">{at}</Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Concurso */}
            <div className="space-y-2">
              <Label htmlFor="concurso" className="text-base">Tipo de Concurso</Label>
              <Select value={concurso} onValueChange={setConcurso}>
                <SelectTrigger id="concurso" className="bg-background border-border-gray text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ninguno">Ninguno</SelectItem>
                  <SelectItem value="ideal">Concurso Ideal</SelectItem>
                  <SelectItem value="real">Concurso Real</SelectItem>
                  <SelectItem value="medial">Concurso Medial</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={calcular}
              className="w-full bg-gold hover:bg-gold/90 text-bg-gradient-start font-semibold text-lg py-6"
            >
              <Calculator className="w-5 h-5 mr-2" />
              Calcular Pena
            </Button>

          </CardContent>
        </Card>

        {/* Resultado */}
        {resultado && (
          <Card className="border-gold bg-card shadow-glow mt-6">
            <CardHeader>
              <CardTitle className="text-2xl font-poppins text-gold">Resultado del Cálculo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-background/50 p-4 rounded-lg border border-border-gray">
                  <p className="text-sm text-muted-foreground mb-1">Pena Mínima</p>
                  <p className="text-2xl font-bold text-foreground">{resultado.penaMin} meses</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    ({Math.floor(resultado.penaMin / 12)} años {resultado.penaMin % 12} meses)
                  </p>
                </div>

                <div className="bg-gold/10 p-4 rounded-lg border border-gold">
                  <p className="text-sm text-gold mb-1">Pena Probable</p>
                  <p className="text-2xl font-bold text-gold">{resultado.penaProbable} meses</p>
                  <p className="text-sm text-gold/80 mt-1">
                    ({Math.floor(resultado.penaProbable / 12)} años {resultado.penaProbable % 12} meses)
                  </p>
                </div>

                <div className="bg-background/50 p-4 rounded-lg border border-border-gray">
                  <p className="text-sm text-muted-foreground mb-1">Pena Máxima</p>
                  <p className="text-2xl font-bold text-foreground">{resultado.penaMax} meses</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    ({Math.floor(resultado.penaMax / 12)} años {resultado.penaMax % 12} meses)
                  </p>
                </div>
              </div>

              {resultado.subrogados.length > 0 && (
                <div className="bg-blue-lex/10 p-4 rounded-lg border border-blue-lex">
                  <h3 className="font-poppins font-semibold text-lg text-blue-lex mb-3">
                    Subrogados Aplicables
                  </h3>
                  <ul className="space-y-2">
                    {resultado.subrogados.map((sub: string, i: number) => (
                      <li key={i} className="text-foreground flex items-start gap-2">
                        <span className="text-blue-lex mt-1">•</span>
                        <span>{sub}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="bg-background/50 p-4 rounded-lg border border-border-gray">
                <h3 className="font-poppins font-semibold text-lg text-foreground mb-3">
                  Fundamento Legal
                </h3>
                <ul className="space-y-2">
                  {resultado.fundamento.map((fund: string, i: number) => (
                    <li key={i} className="text-muted-foreground flex items-start gap-2 text-sm">
                      <span className="text-gold mt-1">•</span>
                      <span>{fund}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                variant="outline"
                onClick={descargarPDF}
                className="w-full border-gold text-gold hover:bg-gold hover:text-bg-gradient-start"
              >
                <Download className="w-5 h-5 mr-2" />
                Descargar PDF
              </Button>

            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
