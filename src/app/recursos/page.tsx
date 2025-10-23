"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Calendar, Download, AlertCircle } from "lucide-react";

export default function RecursosPage() {
  const [tipoRecurso, setTipoRecurso] = useState("anulacion");
  const [organoDecisor, setOrganoDecisor] = useState("JuezGarantias");
  const [fechaNotificacion, setFechaNotificacion] = useState("");
  const [distrito, setDistrito] = useState("");
  const [feriadosExtra, setFeriadosExtra] = useState<string[]>([]);
  const [resultado, setResultado] = useState<any>(null);

  // Feriados nacionales 2025 (ejemplo)
  const feriadosNacionales = [
    "2025-01-01", // Año Nuevo
    "2025-01-09", // Día de los Mártires
    "2025-02-24", // Carnaval
    "2025-02-25", // Carnaval
    "2025-04-18", // Viernes Santo
    "2025-05-01", // Día del Trabajo
    "2025-11-03", // Separación de Colombia
    "2025-11-04", // Día de la Bandera
    "2025-11-10", // Primer Grito de Independencia
    "2025-11-28", // Independencia de Panamá
    "2025-12-08", // Día de la Madre
    "2025-12-25", // Navidad
  ];

  const esDiaHabil = (fecha: Date, feriados: string[]): boolean => {
    const diaSemana = fecha.getDay();
    // 0 = Domingo, 6 = Sábado
    if (diaSemana === 0 || diaSemana === 6) return false;

    const fechaStr = fecha.toISOString().split('T')[0];
    if (feriados.includes(fechaStr)) return false;

    return true;
  };

  const siguienteDiaHabil = (fecha: Date, feriados: string[]): Date => {
    const siguiente = new Date(fecha);
    siguiente.setDate(siguiente.getDate() + 1);

    while (!esDiaHabil(siguiente, feriados)) {
      siguiente.setDate(siguiente.getDate() + 1);
    }

    return siguiente;
  };

  const agregarDiasHabiles = (fechaInicio: Date, diasHabiles: number, feriados: string[]): Date => {
    let fecha = new Date(fechaInicio);
    let diasContados = 0;

    while (diasContados < diasHabiles) {
      fecha = siguienteDiaHabil(fecha, feriados);
      diasContados++;
    }

    return fecha;
  };

  const calcular = () => {
    if (!fechaNotificacion || !distrito) {
      alert("Por favor complete todos los campos");
      return;
    }

    // Validar que casación requiere Tribunal de Juicio
    if (tipoRecurso === "casacion" && organoDecisor !== "TribunalJuicio") {
      alert("El recurso de casación solo procede contra sentencias del Tribunal de Juicio");
      return;
    }

    // Plazos según CPP
    const plazos: Record<string, number> = {
      "anulacion": 5, // CPP 437: 5 días hábiles
      "casacion": 10, // CPP 441: 10 días hábiles
    };

    const plazo = plazos[tipoRecurso];
    const todosFeriados = [...feriadosNacionales, ...feriadosExtra];

    const fechaNotif = new Date(fechaNotificacion);
    const inicioComputo = siguienteDiaHabil(fechaNotif, todosFeriados);
    const fechaLimite = agregarDiasHabiles(inicioComputo, plazo, todosFeriados);

    // Generar calendario
    const calendario = [];
    let fechaActual = new Date(inicioComputo);
    let diaContado = 1;

    while (fechaActual <= fechaLimite) {
      if (esDiaHabil(fechaActual, todosFeriados)) {
        calendario.push({
          fecha: fechaActual.toISOString().split('T')[0],
          dia: diaContado,
          nombre: fechaActual.toLocaleDateString('es-PA', { weekday: 'long' }),
        });
        diaContado++;
      }
      fechaActual.setDate(fechaActual.getDate() + 1);
    }

    const hoy = new Date();
    const diasRestantes = Math.max(0, Math.floor((fechaLimite.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24)));
    const vencido = fechaLimite < hoy;

    setResultado({
      tipoRecurso,
      organoDecisor,
      plazo,
      fechaNotificacion,
      fechaInicio: inicioComputo.toISOString().split('T')[0],
      fechaLimite: fechaLimite.toISOString().split('T')[0],
      calendario,
      diasRestantes,
      vencido,
      fundamento: tipoRecurso === "anulacion"
        ? ["CPP Art. 437 (Recurso de anulación - 5 días hábiles)", "CPP Art. 103 (Cómputo de plazos)"]
        : ["CPP Art. 441-442 (Recurso de casación - 10 días hábiles)", "CPP Art. 103 (Cómputo de plazos)"],
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
              <Calendar className="w-6 h-6 text-gold" />
            </div>
            <h1 className="text-3xl md:text-4xl font-poppins font-bold text-foreground">
              Recursos y Términos
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Calcule los plazos exactos para interponer recursos con cómputo de días hábiles según CPP.
          </p>
        </div>

        <Card className="border-border-gray bg-card shadow-soft">
          <CardHeader>
            <CardTitle className="text-2xl font-poppins">Datos del Recurso</CardTitle>
            <CardDescription>Los plazos se calculan en días hábiles (excluyendo fines de semana y feriados)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tipo" className="text-base">Tipo de Recurso</Label>
                <Select value={tipoRecurso} onValueChange={setTipoRecurso}>
                  <SelectTrigger id="tipo" className="bg-background border-border-gray text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="anulacion">Recurso de Anulación (5 días)</SelectItem>
                    <SelectItem value="casacion">Recurso de Casación (10 días)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="organo" className="text-base">Órgano Decisor</Label>
                <Select value={organoDecisor} onValueChange={setOrganoDecisor}>
                  <SelectTrigger id="organo" className="bg-background border-border-gray text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="JuezGarantias">Juez de Garantías</SelectItem>
                    <SelectItem value="TribunalJuicio">Tribunal de Juicio</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fechaNotif" className="text-base">Fecha de Notificación</Label>
                <Input
                  id="fechaNotif"
                  type="date"
                  value={fechaNotificacion}
                  onChange={(e) => setFechaNotificacion(e.target.value)}
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
                    <SelectItem value="panama">Panamá</SelectItem>
                    <SelectItem value="panama_oeste">Panamá Oeste</SelectItem>
                    <SelectItem value="colon">Colón</SelectItem>
                    <SelectItem value="chiriqui">Chiriquí</SelectItem>
                    <SelectItem value="cocle">Coclé</SelectItem>
                    <SelectItem value="veraguas">Veraguas</SelectItem>
                    <SelectItem value="herrera">Herrera</SelectItem>
                    <SelectItem value="los_santos">Los Santos</SelectItem>
                    <SelectItem value="bocas">Bocas del Toro</SelectItem>
                    <SelectItem value="darien">Darién</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {tipoRecurso === "casacion" && organoDecisor !== "TribunalJuicio" && (
              <div className="bg-accent-legal/10 p-4 rounded-lg border border-accent-legal/30 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-accent-legal mt-0.5" />
                <div>
                  <p className="font-semibold text-accent-legal">Advertencia</p>
                  <p className="text-sm text-muted-foreground">
                    El recurso de casación solo procede contra sentencias del Tribunal de Juicio (CPP 441).
                  </p>
                </div>
              </div>
            )}

            <div className="bg-blue-lex/5 p-4 rounded-lg border border-blue-lex/20">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-blue-lex">Feriados incluidos:</span> El cálculo considera
                automáticamente los feriados nacionales de Panamá para 2025. Los fines de semana también se excluyen.
              </p>
            </div>

            <Button
              onClick={calcular}
              className="w-full bg-gold hover:bg-gold/90 text-bg-gradient-start font-semibold text-lg py-6 shadow-glow"
            >
              <Calendar className="w-5 h-5 mr-2" />
              Calcular Término
            </Button>

          </CardContent>
        </Card>

        {/* Resultado */}
        {resultado && (
          <Card className={`${resultado.vencido ? 'border-accent-legal' : 'border-gold'} bg-card shadow-glow mt-6`}>
            <CardHeader>
              <CardTitle className="text-2xl font-poppins text-gold">Resultado del Cálculo</CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-3 py-1 rounded-full text-sm font-semibold bg-gold/20 text-gold">
                  {resultado.tipoRecurso === "anulacion" ? "Anulación" : "Casación"}
                </span>
                {resultado.vencido && (
                  <span className="px-3 py-1 rounded-full text-sm font-semibold bg-accent-legal/20 text-accent-legal">
                    TÉRMINO VENCIDO
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-background/50 p-4 rounded-lg border border-border-gray">
                  <p className="text-sm text-muted-foreground mb-1">Plazo Legal</p>
                  <p className="text-3xl font-bold text-blue-lex">{resultado.plazo} días</p>
                  <p className="text-sm text-muted-foreground mt-1">Días hábiles</p>
                </div>

                <div className="bg-gold/10 p-4 rounded-lg border border-gold">
                  <p className="text-sm text-gold mb-1">Fecha Límite</p>
                  <p className="text-xl font-bold text-gold">
                    {new Date(resultado.fechaLimite).toLocaleDateString('es-PA', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <p className="text-sm text-gold/80 mt-1">Último día para interponer</p>
                </div>

                {!resultado.vencido && (
                  <div className="bg-blue-lex/10 p-4 rounded-lg border border-blue-lex">
                    <p className="text-sm text-blue-lex mb-1">Días Restantes</p>
                    <p className="text-3xl font-bold text-blue-lex">{resultado.diasRestantes}</p>
                    <p className="text-sm text-blue-lex/80 mt-1">Días calendario</p>
                  </div>
                )}
              </div>

              {/* Calendario de Días Hábiles */}
              <div className="bg-background/50 p-6 rounded-lg border border-border-gray">
                <h3 className="font-poppins font-semibold text-lg text-foreground mb-4">
                  Calendario de Días Hábiles
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {resultado.calendario.map((dia: any, i: number) => (
                    <div key={i} className="bg-gold/5 p-2 rounded border border-gold/20 text-center">
                      <p className="text-xs text-gold font-semibold">Día {dia.dia}</p>
                      <p className="text-sm text-foreground font-medium mt-1">
                        {new Date(dia.fecha).toLocaleDateString('es-PA', { month: 'short', day: 'numeric' })}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">{dia.nombre}</p>
                    </div>
                  ))}
                </div>
              </div>

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

              <div className="bg-accent-legal/5 p-4 rounded-lg border border-accent-legal/20">
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-accent-legal">Importante:</span> Este cálculo es referencial.
                  Verifique siempre con el expediente físico o electrónico la fecha exacta de notificación y considere
                  cualquier suspensión de términos que pudiera aplicar.
                </p>
              </div>

              <Button
                variant="outline"
                className="w-full border-gold text-gold hover:bg-gold hover:text-bg-gradient-start"
              >
                <Download className="w-5 h-5 mr-2" />
                Descargar PDF con Calendario
              </Button>

            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
