"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Calendar, Download, AlertCircle } from "lucide-react";

type ActuacionKey =
  | "anulacion_interposicion"
  | "anulacion_sustentacion"
  | "casacion_anuncio_formalizacion";

type Resultado = {
  actuacion: ActuacionKey;
  actuacionLabel: string;
  plazo: number;
  fechaBase: string;
  fechaInicio: string;
  fechaLimite: string;
  calendario: Array<{
    fecha: string;
    dia: number;
    nombre: string;
    esVencimiento: boolean;
  }>;
  diasHabilesRestantes: number;
  vencido: boolean;
  fundamento: string[];
  nota: string;
};

const ACTUACIONES: Record<
  ActuacionKey,
  {
    label: string;
    plazo: number;
    baseLabel: string;
    fundamento: string[];
    nota: string;
    requiereTribunalJuicio?: boolean;
  }
> = {
  anulacion_interposicion: {
    label: "Anulación: interposición",
    plazo: 2,
    baseLabel: "Fecha en que se escuchó/notificó la decisión",
    fundamento: [
      "CPP Art. 175: la anulación se interpone al momento de escuchar la decisión o dentro de los dos días siguientes.",
    ],
    nota:
      "Use esta opción para calcular el término máximo para interponer el recurso de anulación.",
  },
  anulacion_sustentacion: {
    label: "Anulación: sustentación escrita",
    plazo: 10,
    baseLabel: "Fecha de lectura de la sentencia",
    fundamento: [
      "CPP Art. 175: el recurso de anulación se sustenta por escrito dentro de los diez días siguientes de la lectura de la sentencia.",
      "CPP Art. 176: presentado el recurso, se corre traslado común de cinco días a las otras partes para oposición.",
    ],
    nota:
      "Use esta opción cuando el recurso ya fue interpuesto y se necesita calcular el término para sustentarlo por escrito.",
  },
  casacion_anuncio_formalizacion: {
    label: "Casación: anuncio / formalización",
    plazo: 15,
    baseLabel: "Fecha de notificación de la sentencia",
    fundamento: [
      "CPP Art. 181: el recurso de casación procede contra sentencias dictadas por el Tribunal de Juicio.",
      "CPP Art. 185: el recurso de casación se anuncia por escrito o en la diligencia de notificación y, dentro de los quince días siguientes, se formaliza por escrito.",
      "CPP Art. 186: la Sala Penal decide la admisibilidad u ordena corrección.",
    ],
    nota:
      "Use esta opción para calcular el término de anuncio/formalización del recurso de casación.",
    requiereTribunalJuicio: true,
  },
};

const MESES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

const DIAS = [
  "domingo",
  "lunes",
  "martes",
  "miércoles",
  "jueves",
  "viernes",
  "sábado",
];

function crearFechaLocal(fechaISO: string): Date {
  const [year, month, day] = fechaISO.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatearFechaISO(fecha: Date): string {
  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, "0");
  const day = String(fecha.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatearFechaLarga(fechaISO: string): string {
  const fecha = crearFechaLocal(fechaISO);
  return `${DIAS[fecha.getDay()]}, ${fecha.getDate()} de ${
    MESES[fecha.getMonth()]
  } de ${fecha.getFullYear()}`;
}

function sumarDias(fecha: Date, dias: number): Date {
  const nueva = new Date(fecha);
  nueva.setDate(nueva.getDate() + dias);
  return nueva;
}

function obtenerDomingoPascua(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;

  return new Date(year, month - 1, day);
}

function obtenerFeriadosPanama(year: number): Set<string> {
  const feriados = new Set<string>();

  const agregar = (month: number, day: number) => {
    feriados.add(formatearFechaISO(new Date(year, month - 1, day)));
  };

  agregar(1, 1);
  agregar(1, 9);
  agregar(5, 1);
  agregar(11, 3);
  agregar(11, 4);
  agregar(11, 5);
  agregar(11, 10);
  agregar(11, 28);
  agregar(12, 8);
  agregar(12, 20);
  agregar(12, 25);

  const domingoPascua = obtenerDomingoPascua(year);

  const lunesCarnaval = sumarDias(domingoPascua, -48);
  const martesCarnaval = sumarDias(domingoPascua, -47);
  const viernesSanto = sumarDias(domingoPascua, -2);

  feriados.add(formatearFechaISO(lunesCarnaval));
  feriados.add(formatearFechaISO(martesCarnaval));
  feriados.add(formatearFechaISO(viernesSanto));

  return feriados;
}

function normalizarFechasAdicionales(valor: string): Set<string> {
  const fechas = new Set<string>();

  valor
    .split(/[\n,;]+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .forEach((item) => {
      if (/^\d{4}-\d{2}-\d{2}$/.test(item)) {
        fechas.add(item);
      }
    });

  return fechas;
}

function esFinDeSemana(fecha: Date): boolean {
  const dia = fecha.getDay();
  return dia === 0 || dia === 6;
}

function esDiaHabil(fecha: Date, fechasNoHabiles: Set<string>): boolean {
  const iso = formatearFechaISO(fecha);
  return !esFinDeSemana(fecha) && !fechasNoHabiles.has(iso);
}

function obtenerFechasNoHabiles(
  fechaBase: Date,
  fechasAdicionales: Set<string>
): Set<string> {
  const years = [
    fechaBase.getFullYear() - 1,
    fechaBase.getFullYear(),
    fechaBase.getFullYear() + 1,
  ];

  const fechas = new Set<string>();

  years.forEach((year) => {
    obtenerFeriadosPanama(year).forEach((fecha) => fechas.add(fecha));
  });

  fechasAdicionales.forEach((fecha) => fechas.add(fecha));

  return fechas;
}

function calcularTermino(
  actuacion: ActuacionKey,
  fechaBaseISO: string,
  fechasAdicionalesTexto: string
): Resultado {
  const config = ACTUACIONES[actuacion];
  const fechaBase = crearFechaLocal(fechaBaseISO);
  const fechasAdicionales = normalizarFechasAdicionales(fechasAdicionalesTexto);
  const fechasNoHabiles = obtenerFechasNoHabiles(fechaBase, fechasAdicionales);

  let fechaActual = sumarDias(fechaBase, 1);
  let contador = 0;
  let fechaInicio = "";
  const calendario: Resultado["calendario"] = [];

  while (contador < config.plazo) {
    if (esDiaHabil(fechaActual, fechasNoHabiles)) {
      contador += 1;

      const iso = formatearFechaISO(fechaActual);

      if (contador === 1) {
        fechaInicio = iso;
      }

      calendario.push({
        fecha: iso,
        dia: contador,
        nombre: formatearFechaLarga(iso),
        esVencimiento: contador === config.plazo,
      });
    }

    fechaActual = sumarDias(fechaActual, 1);
  }

  const fechaLimite = calendario[calendario.length - 1].fecha;

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const limite = crearFechaLocal(fechaLimite);
  limite.setHours(0, 0, 0, 0);

  const vencido = hoy > limite;

  let diasHabilesRestantes = 0;

  if (!vencido) {
    let cursor = new Date(hoy);

    while (cursor <= limite) {
      if (esDiaHabil(cursor, fechasNoHabiles)) {
        diasHabilesRestantes += 1;
      }

      cursor = sumarDias(cursor, 1);
    }
  }

  return {
    actuacion,
    actuacionLabel: config.label,
    plazo: config.plazo,
    fechaBase: fechaBaseISO,
    fechaInicio,
    fechaLimite,
    calendario,
    diasHabilesRestantes,
    vencido,
    fundamento: config.fundamento,
    nota: config.nota,
  };
}

function descargarCalendario(resultado: Resultado) {
  const lineas = [
    "Cálculo de término procesal",
    "",
    `Actuación: ${resultado.actuacionLabel}`,
    `Fecha base: ${formatearFechaLarga(resultado.fechaBase)}`,
    `Inicio del cómputo: ${formatearFechaLarga(resultado.fechaInicio)}`,
    `Plazo: ${resultado.plazo} días hábiles`,
    `Fecha límite: ${formatearFechaLarga(resultado.fechaLimite)}`,
    `Estado: ${resultado.vencido ? "Vencido" : "Vigente"}`,
    "",
    "Calendario de días hábiles:",
    ...resultado.calendario.map(
      (item) =>
        `Día ${item.dia}: ${item.nombre}${
          item.esVencimiento ? " - VENCIMIENTO" : ""
        }`
    ),
    "",
    "Fundamento:",
    ...resultado.fundamento.map((item) => `- ${item}`),
    "",
    `Nota: ${resultado.nota}`,
  ];

  const blob = new Blob([lineas.join("\n")], {
    type: "text/plain;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");

  enlace.href = url;
  enlace.download = `calculo-termino-${resultado.actuacion}.txt`;
  enlace.click();

  URL.revokeObjectURL(url);
}

export default function RecursosPage() {
  const [actuacion, setActuacion] = useState<ActuacionKey>(
    "anulacion_interposicion"
  );
  const [fechaBase, setFechaBase] = useState("");
  const [origenSentencia, setOrigenSentencia] = useState<
    "tribunal_juicio" | "juez_garantias" | "juez_municipal" | ""
  >("");
  const [fechasAdicionales, setFechasAdicionales] = useState("");
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [error, setError] = useState("");

  const actuacionSeleccionada = useMemo(() => ACTUACIONES[actuacion], [
    actuacion,
  ]);

  const requiereValidacionTribunal =
    actuacionSeleccionada.requiereTribunalJuicio === true;

  const casacionConOrigenIncorrecto =
    requiereValidacionTribunal &&
    origenSentencia !== "" &&
    origenSentencia !== "tribunal_juicio";

  const handleCalcular = () => {
    setError("");

    if (!fechaBase) {
      setError("Debe seleccionar una fecha base para calcular el término.");
      setResultado(null);
      return;
    }

    if (requiereValidacionTribunal && !origenSentencia) {
      setError(
        "Para calcular casación debe indicar si la sentencia fue dictada por Tribunal de Juicio."
      );
      setResultado(null);
      return;
    }

    if (casacionConOrigenIncorrecto) {
      setError(
        "El recurso de casación procede contra sentencias dictadas por el Tribunal de Juicio. Revise si corresponde anulación u otra actuación."
      );
      setResultado(null);
      return;
    }

    const calculo = calcularTermino(actuacion, fechaBase, fechasAdicionales);
    setResultado(calculo);
  };

  const handleLimpiar = () => {
    setActuacion("anulacion_interposicion");
    setFechaBase("");
    setOrigenSentencia("");
    setFechasAdicionales("");
    setResultado(null);
    setError("");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-3">
            <Calendar className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Recursos y Términos</h1>
          </div>
          <p className="text-muted-foreground">
            Calculadora de términos procesales en días hábiles para recursos de
            anulación y casación.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Cálculo de términos</CardTitle>
              <CardDescription>
                Seleccione la actuación procesal, indique la fecha base y el
                sistema calculará el vencimiento en días hábiles.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="actuacion">Actuación a calcular</Label>
                <Select
                  value={actuacion}
                  onValueChange={(value) => {
                    setActuacion(value as ActuacionKey);
                    setResultado(null);
                    setError("");

                    if (value !== "casacion_anuncio_formalizacion") {
                      setOrigenSentencia("");
                    }
                  }}
                >
                  <SelectTrigger id="actuacion">
                    <SelectValue placeholder="Seleccione la actuación" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="anulacion_interposicion">
                      Anulación: interposición — 2 días hábiles
                    </SelectItem>
                    <SelectItem value="anulacion_sustentacion">
                      Anulación: sustentación escrita — 10 días hábiles
                    </SelectItem>
                    <SelectItem value="casacion_anuncio_formalizacion">
                      Casación: anuncio / formalización — 15 días hábiles
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {requiereValidacionTribunal && (
                <div className="space-y-2">
                  <Label htmlFor="origen">Origen de la sentencia</Label>
                  <Select
                    value={origenSentencia}
                    onValueChange={(value) =>
                      setOrigenSentencia(
                        value as
                          | "tribunal_juicio"
                          | "juez_garantias"
                          | "juez_municipal"
                      )
                    }
                  >
                    <SelectTrigger id="origen">
                      <SelectValue placeholder="Seleccione el origen de la sentencia" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tribunal_juicio">
                        Tribunal de Juicio
                      </SelectItem>
                      <SelectItem value="juez_garantias">
                        Juez de Garantías
                      </SelectItem>
                      <SelectItem value="juez_municipal">
                        Juez Municipal
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  {casacionConOrigenIncorrecto && (
                    <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                      La casación procede contra sentencias dictadas por el
                      Tribunal de Juicio conforme al CPP Art. 181.
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="fechaBase">
                  {actuacionSeleccionada.baseLabel}
                </Label>
                <Input
                  id="fechaBase"
                  type="date"
                  value={fechaBase}
                  onChange={(event) => {
                    setFechaBase(event.target.value);
                    setResultado(null);
                    setError("");
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  La fecha base no se cuenta. El cómputo inicia desde el día
                  hábil siguiente.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fechasAdicionales">
                  Feriados o suspensiones judiciales adicionales
                </Label>
                <textarea
                  id="fechasAdicionales"
                  className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="Ejemplo: 2025-02-14, 2025-04-21"
                  value={fechasAdicionales}
                  onChange={(event) => {
                    setFechasAdicionales(event.target.value);
                    setResultado(null);
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Ingrese fechas en formato AAAA-MM-DD, separadas por coma,
                  punto y coma o salto de línea.
                </p>
              </div>

              {error && (
                <div className="flex gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button className="w-full" onClick={handleCalcular}>
                  Calcular término
                </Button>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={handleLimpiar}
                >
                  Limpiar
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Base legal aplicada</CardTitle>
                <CardDescription>
                  La herramienta usa los términos procesales indicados para cada
                  actuación.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 text-sm">
                <div className="rounded-lg border p-4">
                  <h3 className="font-semibold">Recurso de anulación</h3>
                  <p className="mt-2 text-muted-foreground">
                    CPP Art. 175: se interpone al momento de escuchar la
                    decisión o dentro de los dos días siguientes. La
                    sustentación escrita se presenta dentro de los diez días
                    siguientes de la lectura de la sentencia.
                  </p>
                </div>

                <div className="rounded-lg border p-4">
                  <h3 className="font-semibold">Recurso de casación</h3>
                  <p className="mt-2 text-muted-foreground">
                    CPP Art. 181: procede contra sentencias dictadas por el
                    Tribunal de Juicio. CPP Art. 185: se anuncia por escrito o
                    en la diligencia de notificación y se formaliza dentro de
                    los quince días siguientes.
                  </p>
                </div>

                <div className="rounded-lg border p-4">
                  <h3 className="font-semibold">Días hábiles</h3>
                  <p className="mt-2 text-muted-foreground">
                    El cálculo excluye sábados, domingos, feriados nacionales y
                    las suspensiones judiciales adicionales que el usuario
                    ingrese.
                  </p>
                </div>
              </CardContent>
            </Card>

            {resultado && (
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle>Resultado</CardTitle>
                      <CardDescription>
                        {resultado.actuacionLabel}
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => descargarCalendario(resultado)}
                      title="Descargar calendario"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-5">
                  <div
                    className={`rounded-lg border p-4 ${
                      resultado.vencido
                        ? "border-destructive/30 bg-destructive/10"
                        : "border-primary/30 bg-primary/10"
                    }`}
                  >
                    <p className="text-sm text-muted-foreground">
                      Fecha límite
                    </p>
                    <p className="mt-1 text-2xl font-bold">
                      {formatearFechaLarga(resultado.fechaLimite)}
                    </p>
                    <p
                      className={`mt-2 text-sm font-medium ${
                        resultado.vencido
                          ? "text-destructive"
                          : "text-primary"
                      }`}
                    >
                      {resultado.vencido
                        ? "El término se encuentra vencido."
                        : `Término vigente. Días hábiles restantes: ${resultado.diasHabilesRestantes}.`}
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg border p-3">
                      <p className="text-xs text-muted-foreground">
                        Fecha base
                      </p>
                      <p className="font-medium">
                        {formatearFechaLarga(resultado.fechaBase)}
                      </p>
                    </div>

                    <div className="rounded-lg border p-3">
                      <p className="text-xs text-muted-foreground">
                        Inicio del cómputo
                      </p>
                      <p className="font-medium">
                        {formatearFechaLarga(resultado.fechaInicio)}
                      </p>
                    </div>

                    <div className="rounded-lg border p-3">
                      <p className="text-xs text-muted-foreground">Plazo</p>
                      <p className="font-medium">
                        {resultado.plazo} días hábiles
                      </p>
                    </div>

                    <div className="rounded-lg border p-3">
                      <p className="text-xs text-muted-foreground">Estado</p>
                      <p className="font-medium">
                        {resultado.vencido ? "Vencido" : "Vigente"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-3 font-semibold">
                      Calendario de días hábiles
                    </h3>
                    <div className="max-h-[320px] space-y-2 overflow-auto pr-2">
                      {resultado.calendario.map((item) => (
                        <div
                          key={item.fecha}
                          className={`flex items-center justify-between rounded-md border p-3 text-sm ${
                            item.esVencimiento
                              ? "border-primary/40 bg-primary/10"
                              : ""
                          }`}
                        >
                          <div>
                            <p className="font-medium">Día {item.dia}</p>
                            <p className="text-muted-foreground">
                              {item.nombre}
                            </p>
                          </div>
                          {item.esVencimiento && (
                            <span className="rounded-full bg-primary px-2 py-1 text-xs font-medium text-primary-foreground">
                              Vencimiento
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-lg border p-4">
                    <h3 className="font-semibold">Fundamento</h3>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                      {resultado.fundamento.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-lg border p-4 text-sm text-muted-foreground">
                    {resultado.nota}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
