"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Scale, Download, Plus, Trash2 } from "lucide-react";

type Medida = {
  tipo: string;
  desde: string;
  hasta: string;
  presentaciones?: number;
};

type Conmutacion = {
  tipo: string;
  dias: number;
};

export default function LiquidacionPage() {
  const [penaAnos, setPenaAnos] = useState("");
  const [penaMeses, setPenaMeses] = useState("");
  const [penaDias, setPenaDias] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [medidas, setMedidas] = useState<Medida[]>([]);
  const [conmutaciones, setConmutaciones] = useState<Conmutacion[]>([]);
  const [resultado, setResultado] = useState<any>(null);

  const agregarMedida = () => {
    setMedidas([...medidas, { tipo: "detencion_preventiva", desde: "", hasta: "", presentaciones: 0 }]);
  };

  const eliminarMedida = (index: number) => {
    setMedidas(medidas.filter((_, i) => i !== index));
  };

  const actualizarMedida = (index: number, campo: string, valor: any) => {
    const nuevasMedidas = [...medidas];
    (nuevasMedidas[index] as any)[campo] = valor;
    setMedidas(nuevasMedidas);
  };

  const agregarConmutacion = () => {
    setConmutaciones([...conmutaciones, { tipo: "trabajo", dias: 0 }]);
  };

  const eliminarConmutacion = (index: number) => {
    setConmutaciones(conmutaciones.filter((_, i) => i !== index));
  };

  const actualizarConmutacion = (index: number, campo: string, valor: any) => {
    const nuevasConmutaciones = [...conmutaciones];
    (nuevasConmutaciones[index] as any)[campo] = valor;
    setConmutaciones(nuevasConmutaciones);
  };

  const calcularDiasEntreFechas = (desde: string, hasta: string): number => {
    const d1 = new Date(desde);
    const d2 = new Date(hasta);
    return Math.floor((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
  };

  const calcular = () => {
    if (!penaAnos && !penaMeses && !penaDias) {
      alert("Por favor ingrese la pena impuesta");
      return;
    }
    if (!fechaInicio) {
      alert("Por favor ingrese la fecha de inicio de cumplimiento");
      return;
    }

    // Total días de pena
    const totalDias = (parseInt(penaAnos || "0") * 365) + (parseInt(penaMeses || "0") * 30) + parseInt(penaDias || "0");

    // Calcular abonos según CPP 232
    let abonosMedidas = 0;
    medidas.forEach(medida => {
      if (!medida.desde || !medida.hasta) return;

      const dias = calcularDiasEntreFechas(medida.desde, medida.hasta);

      switch (medida.tipo) {
        case "detencion_preventiva":
        case "arresto_domiciliario":
          abonosMedidas += dias; // 1:1
          break;
        case "prohibicion_salida":
          abonosMedidas += Math.floor(dias / 5); // 1 día de pena por 5 días
          break;
        case "presentacion_periodica":
          abonosMedidas += Math.floor((medida.presentaciones || 0) / 5); // 1 día por 5 presentaciones
          break;
        case "permanencia_domicilio":
          abonosMedidas += Math.floor(dias / 2); // 1 día de pena por 2 días
          break;
      }
    });

    // Calcular conmutación según CP 99-104
    let abonosConmutacion = 0;
    conmutaciones.forEach(conm => {
      const dias = parseInt(conm.dias.toString()) || 0;

      switch (conm.tipo) {
        case "trabajo":
        case "estudio":
          // 2 días de trabajo/estudio = 1 día de pena
          abonosConmutacion += Math.floor(dias / 2);
          break;
        case "instruccion":
        case "tratamiento":
          // 3 días de instrucción/tratamiento = 1 día de pena
          abonosConmutacion += Math.floor(dias / 3);
          break;
        case "conducta":
          // Conducta ejemplar: variable según auto judicial
          abonosConmutacion += Math.floor(dias * 0.1); // 10% estimado
          break;
      }
    });

    const saldoEfectivo = Math.max(totalDias - abonosMedidas - abonosConmutacion, 0);

    // Calcular fechas clave
    const inicio = new Date(fechaInicio);

    const mediaPena = new Date(inicio);
    mediaPena.setDate(mediaPena.getDate() + Math.floor(saldoEfectivo / 2));

    const dosTercios = new Date(inicio);
    dosTercios.setDate(dosTercios.getDate() + Math.floor((saldoEfectivo * 2) / 3));

    const cumplimiento = new Date(inicio);
    cumplimiento.setDate(cumplimiento.getDate() + saldoEfectivo);

    setResultado({
      totalDias,
      abonosMedidas,
      abonosConmutacion,
      saldoEfectivo,
      fechas: {
        mediaPena: mediaPena.toISOString().split('T')[0],
        dosTercios: dosTercios.toISOString().split('T')[0],
        cumplimiento: cumplimiento.toISOString().split('T')[0],
      },
      fundamento: [
        "CPP Art. 232 (Abono de medidas cautelares)",
        "CPP Art. 500-514 (Ejecución de la pena)",
        "CP Art. 99-104 (Conmutación y redención de pena)",
        "CP Art. 93 (Libertad condicional: requiere ½ de pena)"
      ]
    });
  };

  const nombreMedida = (tipo: string) => {
    const nombres: Record<string, string> = {
      "detencion_preventiva": "Detención Preventiva (1:1)",
      "arresto_domiciliario": "Arresto Domiciliario (1:1)",
      "prohibicion_salida": "Prohibición de Salida (1:5)",
      "presentacion_periodica": "Presentación Periódica",
      "permanencia_domicilio": "Permanencia en Domicilio (1:2)",
    };
    return nombres[tipo] || tipo;
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
              <Scale className="w-6 h-6 text-gold" />
            </div>
            <h1 className="text-3xl md:text-4xl font-poppins font-bold text-foreground">
              Liquidación de Pena
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Calcule ½ y ⅔ de pena con abonos de medidas cautelares según CPP Art. 232.
          </p>
        </div>

        <Card className="border-border-gray bg-card shadow-soft mb-6">
          <CardHeader>
            <CardTitle className="text-2xl font-poppins">Pena Impuesta</CardTitle>
            <CardDescription>Ingrese la pena total a cumplir</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="anos" className="text-base">Años</Label>
                <Input
                  id="anos"
                  type="number"
                  placeholder="0"
                  value={penaAnos}
                  onChange={(e) => setPenaAnos(e.target.value)}
                  className="bg-background border-border-gray text-base"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="meses" className="text-base">Meses</Label>
                <Input
                  id="meses"
                  type="number"
                  placeholder="0"
                  value={penaMeses}
                  onChange={(e) => setPenaMeses(e.target.value)}
                  className="bg-background border-border-gray text-base"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dias" className="text-base">Días</Label>
                <Input
                  id="dias"
                  type="number"
                  placeholder="0"
                  value={penaDias}
                  onChange={(e) => setPenaDias(e.target.value)}
                  className="bg-background border-border-gray text-base"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="inicio" className="text-base">Fecha de Inicio de Cumplimiento</Label>
              <Input
                id="inicio"
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="bg-background border-border-gray text-base"
              />
            </div>

          </CardContent>
        </Card>

        <Card className="border-border-gray bg-card shadow-soft mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-poppins">Medidas Cautelares a Abonar</CardTitle>
                <CardDescription>Según CPP Art. 232 (equivalencias)</CardDescription>
              </div>
              <Button onClick={agregarMedida} className="bg-blue-lex hover:bg-blue-lex/90">
                <Plus className="w-4 h-4 mr-2" />
                Agregar
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">

            {medidas.length === 0 && (
              <p className="text-muted-foreground text-center py-8">
                No hay medidas cautelares agregadas. Haga clic en "Agregar" para incluir medidas.
              </p>
            )}

            {medidas.map((medida, index) => (
              <div key={index} className="bg-background/50 p-4 rounded-lg border border-border-gray space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-foreground">Medida {index + 1}</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => eliminarMedida(index)}
                    className="text-accent-legal hover:text-accent-legal/80"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-sm">Tipo de Medida</Label>
                    <Select
                      value={medida.tipo}
                      onValueChange={(v) => actualizarMedida(index, "tipo", v)}
                    >
                      <SelectTrigger className="bg-background border-border-gray">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="detencion_preventiva">Detención Preventiva (1:1)</SelectItem>
                        <SelectItem value="arresto_domiciliario">Arresto Domiciliario (1:1)</SelectItem>
                        <SelectItem value="prohibicion_salida">Prohibición de Salida (1:5)</SelectItem>
                        <SelectItem value="presentacion_periodica">Presentación Periódica</SelectItem>
                        <SelectItem value="permanencia_domicilio">Permanencia en Domicilio (1:2)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {medida.tipo !== "presentacion_periodica" ? (
                    <>
                      <div className="space-y-2">
                        <Label className="text-sm">Desde</Label>
                        <Input
                          type="date"
                          value={medida.desde}
                          onChange={(e) => actualizarMedida(index, "desde", e.target.value)}
                          className="bg-background border-border-gray"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">Hasta</Label>
                        <Input
                          type="date"
                          value={medida.hasta}
                          onChange={(e) => actualizarMedida(index, "hasta", e.target.value)}
                          className="bg-background border-border-gray"
                        />
                      </div>
                    </>
                  ) : (
                    <div className="space-y-2">
                      <Label className="text-sm">Número de Presentaciones</Label>
                      <Input
                        type="number"
                        value={medida.presentaciones}
                        onChange={(e) => actualizarMedida(index, "presentaciones", parseInt(e.target.value))}
                        className="bg-background border-border-gray"
                        placeholder="0"
                      />
                      <p className="text-xs text-muted-foreground">1 día de pena por cada 5 presentaciones</p>
                    </div>
                  )}
                </div>
              </div>
            ))}

          </CardContent>
        </Card>

        <Card className="border-border-gray bg-card shadow-soft mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-poppins">Conmutación y Redención de Pena</CardTitle>
                <CardDescription>Según CP Art. 99-104 (trabajo, estudio, conducta)</CardDescription>
              </div>
              <Button onClick={agregarConmutacion} className="bg-blue-lex hover:bg-blue-lex/90">
                <Plus className="w-4 h-4 mr-2" />
                Agregar
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">

            {conmutaciones.length === 0 && (
              <p className="text-muted-foreground text-center py-8">
                No hay conmutaciones agregadas. Haga clic en "Agregar" para incluir días de trabajo, estudio o conducta.
              </p>
            )}

            {conmutaciones.map((conm, index) => (
              <div key={index} className="bg-background/50 p-4 rounded-lg border border-border-gray space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-foreground">Conmutación {index + 1}</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => eliminarConmutacion(index)}
                    className="text-accent-legal hover:text-accent-legal/80"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-sm">Tipo de Actividad</Label>
                    <Select
                      value={conm.tipo}
                      onValueChange={(v) => actualizarConmutacion(index, "tipo", v)}
                    >
                      <SelectTrigger className="bg-background border-border-gray">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="trabajo">Trabajo (2:1)</SelectItem>
                        <SelectItem value="estudio">Estudio (2:1)</SelectItem>
                        <SelectItem value="instruccion">Instrucción (3:1)</SelectItem>
                        <SelectItem value="tratamiento">Tratamiento (3:1)</SelectItem>
                        <SelectItem value="conducta">Conducta Ejemplar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Días Acumulados</Label>
                    <Input
                      type="number"
                      value={conm.dias}
                      onChange={(e) => actualizarConmutacion(index, "dias", parseInt(e.target.value))}
                      className="bg-background border-border-gray"
                      placeholder="0"
                    />
                    <p className="text-xs text-muted-foreground">
                      {conm.tipo === "trabajo" || conm.tipo === "estudio" ? "2 días actividad = 1 día pena" :
                       conm.tipo === "instruccion" || conm.tipo === "tratamiento" ? "3 días actividad = 1 día pena" :
                       "Variable según auto judicial"}
                    </p>
                  </div>
                </div>
              </div>
            ))}

          </CardContent>
        </Card>

        <Button
          onClick={calcular}
          className="w-full bg-gold hover:bg-gold/90 text-bg-gradient-start font-semibold text-lg py-6 shadow-glow"
        >
          <Scale className="w-5 h-5 mr-2" />
          Calcular Liquidación
        </Button>

        {/* Resultado */}
        {resultado && (
          <Card className="border-gold bg-card shadow-glow mt-6">
            <CardHeader>
              <CardTitle className="text-2xl font-poppins text-gold">Resultado de Liquidación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-background/50 p-4 rounded-lg border border-border-gray">
                  <p className="text-sm text-muted-foreground mb-1">Pena Total</p>
                  <p className="text-2xl font-bold text-foreground">{resultado.totalDias} días</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {Math.floor(resultado.totalDias / 365)} años {Math.floor((resultado.totalDias % 365) / 30)} meses
                  </p>
                </div>

                <div className="bg-blue-lex/10 p-4 rounded-lg border border-blue-lex">
                  <p className="text-sm text-blue-lex mb-1">Abonos (CPP 232)</p>
                  <p className="text-2xl font-bold text-blue-lex">{resultado.abonosMedidas} días</p>
                  <p className="text-sm text-blue-lex/80 mt-1">Medidas cautelares</p>
                </div>

                <div className="bg-gold/10 p-4 rounded-lg border border-gold">
                  <p className="text-sm text-gold mb-1">Saldo Efectivo</p>
                  <p className="text-2xl font-bold text-gold">{resultado.saldoEfectivo} días</p>
                  <p className="text-sm text-gold/80 mt-1">
                    {Math.floor(resultado.saldoEfectivo / 365)} años {Math.floor((resultado.saldoEfectivo % 365) / 30)} meses
                  </p>
                </div>
              </div>

              <div className="bg-background/50 p-6 rounded-lg border border-border-gray space-y-4">
                <h3 className="font-poppins font-semibold text-xl text-foreground mb-4">
                  Fechas Clave para Subrogados
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gold/5 p-4 rounded-lg border border-gold/30">
                    <p className="text-sm text-gold font-semibold mb-2">½ Pena (Libertad Condicional)</p>
                    <p className="text-2xl font-bold text-foreground">
                      {new Date(resultado.fechas.mediaPena).toLocaleDateString('es-PA', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>

                  <div className="bg-blue-lex/5 p-4 rounded-lg border border-blue-lex/30">
                    <p className="text-sm text-blue-lex font-semibold mb-2">⅔ Pena</p>
                    <p className="text-2xl font-bold text-foreground">
                      {new Date(resultado.fechas.dosTercios).toLocaleDateString('es-PA', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                <div className="bg-accent-legal/5 p-4 rounded-lg border border-accent-legal/30 mt-4">
                  <p className="text-sm text-muted-foreground mb-2">Cumplimiento Total</p>
                  <p className="text-2xl font-bold text-foreground">
                    {new Date(resultado.fechas.cumplimiento).toLocaleDateString('es-PA', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
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

              <Button
                variant="outline"
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
