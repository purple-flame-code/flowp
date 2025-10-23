"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Clock, Download } from "lucide-react";

// Fechas de entrada del SPA por distrito
const SPA_DATES: Record<string, string> = {
  "Coclé": "2011-09-02",
  "Veraguas": "2011-09-02",
  "Herrera": "2012-01-02",
  "Los Santos": "2012-01-02",
  "Chiriquí": "2012-09-02",
  "Bocas del Toro": "2012-09-02",
  "Colón": "2015-09-02",
  "Panamá Oeste": "2015-09-02",
  "Panamá": "2016-09-02",
  "Darién": "2016-09-02",
  "Comarcas": "2017-01-01",
};

export default function PrescripcionPage() {
  const [fechaHecho, setFechaHecho] = useState("");
  const [distrito, setDistrito] = useState("");
  const [penaMaxAnos, setPenaMaxAnos] = useState("");
  const [tipoConsumacion, setTipoConsumacion] = useState("instantanea");
  const [resultado, setResultado] = useState<any>(null);

  const calcular = () => {
    if (!fechaHecho || !distrito || !penaMaxAnos) {
      alert("Por favor complete todos los campos");
      return;
    }

    const fechaHechoDate = new Date(fechaHecho);
    const spaDate = SPA_DATES[distrito] ? new Date(SPA_DATES[distrito]) : null;

    // Determinar régimen
    const regimen = spaDate && fechaHechoDate >= spaDate ? "CPP" : "CJ";

    // Calcular plazo base según régimen
    let plazoBaseAnos = 0;
    const pena = parseInt(penaMaxAnos);

    if (regimen === "CPP") {
      if (pena <= 6) {
        plazoBaseAnos = 6;
      } else {
        plazoBaseAnos = pena;
      }
    } else {
      // CJ 1968-B (sistema inquisitivo)
      if (pena <= 3) {
        plazoBaseAnos = 3;
      } else if (pena <= 6) {
        plazoBaseAnos = 5;
      } else {
        plazoBaseAnos = 10;
      }
    }

    // Fecha estimada de prescripción
    const fechaEstimada = new Date(fechaHechoDate);
    fechaEstimada.setFullYear(fechaEstimada.getFullYear() + plazoBaseAnos);

    const hoy = new Date();
    const diasRestantes = Math.floor((fechaEstimada.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
    const prescrito = diasRestantes < 0;

    setResultado({
      regimen,
      plazoBaseAnos,
      fechaInicioComputo: fechaHecho,
      fechaEstimativa: fechaEstimada.toISOString().split('T')[0],
      diasRestantes: prescrito ? 0 : diasRestantes,
      prescrito,
      fundamento: regimen === "CPP"
        ? ["CPP Art. 91-93 (Prescripción de la acción penal)", "CPP Art. 557 (Aplicación del SPA)"]
        : ["CJ Art. 1968-B (Prescripción en sistema inquisitivo)", "CJ Art. 1968-C/D (Suspensión e interrupción)"]
    });
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border-gray bg-surface-dark/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-blue-lex hover:text-blue-lex/80">
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
            <div className="w-12 h-12 bg-blue-lex/10 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-lex" />
            </div>
            <h1 className="text-3xl md:text-4xl font-poppins font-bold text-foreground">
              Prescripción Penal
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Determine el plazo de prescripción aplicable según CPP (SPA) o Código Judicial (sistema inquisitivo).
          </p>
        </div>

        <Card className="border-border-gray bg-card shadow-soft">
          <CardHeader>
            <CardTitle className="text-2xl font-poppins">Datos del Hecho Punible</CardTitle>
            <CardDescription>El régimen se determina automáticamente según la fecha y el distrito</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fechaHecho" className="text-base">Fecha del Hecho</Label>
                <Input
                  id="fechaHecho"
                  type="date"
                  value={fechaHecho}
                  onChange={(e) => setFechaHecho(e.target.value)}
                  className="bg-background border-border-gray text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="distrito" className="text-base">Distrito Judicial</Label>
                <Select value={distrito} onValueChange={setDistrito}>
                  <SelectTrigger id="distrito" className="bg-background border-border-gray text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(SPA_DATES).map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="penaMax" className="text-base">Pena Máxima (años)</Label>
                <Input
                  id="penaMax"
                  type="number"
                  placeholder="5"
                  value={penaMaxAnos}
                  onChange={(e) => setPenaMaxAnos(e.target.value)}
                  className="bg-background border-border-gray text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="consumacion" className="text-base">Tipo de Consumación</Label>
                <Select value={tipoConsumacion} onValueChange={setTipoConsumacion}>
                  <SelectTrigger id="consumacion" className="bg-background border-border-gray text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instantanea">Instantánea</SelectItem>
                    <SelectItem value="permanente">Permanente</SelectItem>
                    <SelectItem value="continuada">Continuada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="bg-blue-lex/5 p-4 rounded-lg border border-blue-lex/20">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-blue-lex">Nota:</span> El Sistema Penal Acusatorio (SPA) entró
                en vigencia gradualmente por distrito. Este cálculo determina automáticamente si aplica CPP o CJ
                según la fecha del hecho y el distrito judicial.
              </p>
            </div>

            <Button
              onClick={calcular}
              className="w-full bg-blue-lex hover:bg-blue-lex/90 text-white font-semibold text-lg py-6"
            >
              <Clock className="w-5 h-5 mr-2" />
              Calcular Prescripción
            </Button>

          </CardContent>
        </Card>

        {/* Resultado */}
        {resultado && (
          <Card className={`${resultado.prescrito ? 'border-accent-legal' : 'border-blue-lex'} bg-card shadow-glow mt-6`}>
            <CardHeader>
              <CardTitle className="text-2xl font-poppins text-blue-lex">Resultado del Cálculo</CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  resultado.regimen === 'CPP' ? 'bg-blue-lex/20 text-blue-lex' : 'bg-gold/20 text-gold'
                }`}>
                  Régimen: {resultado.regimen}
                </span>
                {resultado.prescrito && (
                  <span className="px-3 py-1 rounded-full text-sm font-semibold bg-accent-legal/20 text-accent-legal">
                    PRESCRITO
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-background/50 p-4 rounded-lg border border-border-gray">
                  <p className="text-sm text-muted-foreground mb-1">Plazo de Prescripción</p>
                  <p className="text-3xl font-bold text-blue-lex">{resultado.plazoBaseAnos} años</p>
                </div>

                <div className="bg-background/50 p-4 rounded-lg border border-border-gray">
                  <p className="text-sm text-muted-foreground mb-1">Fecha Estimada</p>
                  <p className="text-2xl font-bold text-foreground">
                    {new Date(resultado.fechaEstimativa).toLocaleDateString('es-PA', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              {!resultado.prescrito && (
                <div className="bg-blue-lex/10 p-4 rounded-lg border border-blue-lex">
                  <p className="text-sm text-blue-lex mb-1">Días Restantes</p>
                  <p className="text-3xl font-bold text-blue-lex">{resultado.diasRestantes} días</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Aproximadamente {Math.floor(resultado.diasRestantes / 365)} años y {Math.floor((resultado.diasRestantes % 365) / 30)} meses
                  </p>
                </div>
              )}

              <div className="bg-background/50 p-4 rounded-lg border border-border-gray">
                <h3 className="font-poppins font-semibold text-lg text-foreground mb-3">
                  Fundamento Legal
                </h3>
                <ul className="space-y-2">
                  {resultado.fundamento.map((fund: string, i: number) => (
                    <li key={i} className="text-muted-foreground flex items-start gap-2 text-sm">
                      <span className="text-blue-lex mt-1">•</span>
                      <span>{fund}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-gold/5 p-4 rounded-lg border border-gold/20">
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-gold">Advertencia:</span> Este cálculo es estimativo y no considera
                  suspensiones (rebeldía, extradición) ni interrupciones (imputación, acusación). Consulte con el expediente
                  para un cálculo preciso.
                </p>
              </div>

              <Button
                variant="outline"
                className="w-full border-blue-lex text-blue-lex hover:bg-blue-lex hover:text-white"
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
