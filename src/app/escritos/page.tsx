"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, FileText, Download, Eye } from "lucide-react";

export default function EscritosPage() {
  const [tipoEscrito, setTipoEscrito] = useState("imputacion");
  const [datos, setDatos] = useState<Record<string, string>>({});
  const [previsualizacion, setPrevisualizacion] = useState("");

  const templates: Record<string, any> = {
    imputacion: {
      nombre: "Imputación Formal",
      campos: [
        { id: "fecha", label: "Fecha del Hecho", tipo: "date" },
        { id: "lugar", label: "Lugar", tipo: "text" },
        { id: "modo", label: "Modo de Comisión", tipo: "textarea" },
        { id: "tipo_penal", label: "Tipo Penal", tipo: "text" },
        { id: "articulos", label: "Artículos del CP", tipo: "text" },
      ],
      generar: (d: Record<string, string>) => `
IMPUTACIÓN FORMAL

En el distrito judicial de Panamá, a los ${new Date().toLocaleDateString('es-PA')}.

HECHOS JURÍDICAMENTE RELEVANTES:

El día ${d.fecha}, en ${d.lugar}, se produjeron los siguientes hechos:

${d.modo}

CALIFICACIÓN JURÍDICA:

Los hechos descritos constituyen prima facie el delito de ${d.tipo_penal}, tipificado en el ${d.articulos} del Código Penal de la República de Panamá.

FUNDAMENTO LEGAL:
- CPP Art. 276-279 (Imputación formal)
- CP ${d.articulos}

Respetuosamente,
[FIRMA DEL FISCAL]
      `
    },
    oposicion_cautelar: {
      nombre: "Oposición a Medida Cautelar",
      campos: [
        { id: "riesgo_alegado", label: "Riesgo Alegado por Fiscalía", tipo: "text" },
        { id: "arraigo", label: "Arraigo del Imputado", tipo: "textarea" },
        { id: "alternativas", label: "Alternativas Propuestas", tipo: "textarea" },
      ],
      generar: (d: Record<string, string>) => `
OPOSICIÓN A SOLICITUD DE MEDIDA CAUTELAR

Señor Juez de Garantías:

${d.arraigo}

SOBRE EL RIESGO PROCESAL:

La Fiscalía alega ${d.riesgo_alegado}, sin embargo, mi representado cuenta con arraigo suficiente y no representa riesgo de fuga ni de obstaculización.

PROPORCIONALIDAD (CPP Art. 221):

En aplicación del principio de proporcionalidad, solicitamos:

${d.alternativas}

FUNDAMENTO LEGAL:
- CPP Art. 221 (Proporcionalidad de las medidas)
- CPP Art. 222-230 (Medidas cautelares)
- Constitución Art. 21-22 (Libertad personal)

Respetuosamente,
[FIRMA DEL DEFENSOR]
      `
    },
    querella: {
      nombre: "Querella Criminal",
      campos: [
        { id: "querellante", label: "Nombre del Querellante", tipo: "text" },
        { id: "hechos", label: "Relato de Hechos", tipo: "textarea" },
        { id: "tipificacion", label: "Tipificación Propuesta", tipo: "text" },
        { id: "peticion", label: "Petición", tipo: "textarea" },
      ],
      generar: (d: Record<string, string>) => `
QUERELLA CRIMINAL

Señor Fiscal Superior:

${d.querellante}, mayor de edad, con cédula de identidad personal número _____, comparezco ante usted para presentar QUERELLA CRIMINAL por los siguientes hechos:

HECHOS:

${d.hechos}

TIPIFICACIÓN:

Los hechos narrados configuran el delito de ${d.tipificacion}.

PETICIÓN:

${d.peticion}

FUNDAMENTO LEGAL:
- CPP Art. 93-105 (Querella y acción penal privada)

Respetuosamente,
[FIRMA DEL QUERELLANTE]
      `
    },
    anulacion: {
      nombre: "Recurso de Anulación",
      campos: [
        { id: "organo", label: "Órgano que Dictó la Resolución", tipo: "text" },
        { id: "fecha_resolucion", label: "Fecha de la Resolución", tipo: "date" },
        { id: "motivos", label: "Motivos de Anulación", tipo: "textarea" },
        { id: "causal", label: "Causal Legal (CPP)", tipo: "text" },
      ],
      generar: (d: Record<string, string>) => `
RECURSO DE ANULACIÓN

Honorable Tribunal Superior:

RECURSO DE ANULACIÓN contra la resolución dictada por ${d.organo} el día ${d.fecha_resolucion}.

MOTIVOS:

${d.motivos}

CAUSAL:

Se invoca el ${d.causal} del Código Procesal Penal.

FUNDAMENTO LEGAL:
- CPP Art. 437-440 (Recurso de anulación)
- ${d.causal}

PETICIÓN:

Se anule la resolución impugnada y se dicte nueva resolución conforme a derecho.

Respetuosamente,
[FIRMA DEL RECURRENTE]
      `
    },
    casacion_spa: {
      nombre: "Recurso de Casación (Sistema Acusatorio)",
      campos: [
        { id: "sentencia_tjuicio", label: "Sentencia del Tribunal de Juicio", tipo: "text" },
        { id: "causales", label: "Causales Invocadas", tipo: "textarea" },
        { id: "agravios", label: "Agravios", tipo: "textarea" },
        { id: "petitorio", label: "Petitorio", tipo: "textarea" },
      ],
      generar: (d: Record<string, string>) => `
RECURSO DE CASACIÓN

Honorable Corte Suprema de Justicia - Sala Penal:

RECURSO DE CASACIÓN contra la sentencia dictada por ${d.sentencia_tjuicio}.

CAUSALES:

${d.causales}

AGRAVIOS:

${d.agravios}

FUNDAMENTO LEGAL:
- CPP Art. 441-442 (Recurso de casación)
- CPP Art. 443 (Causales de casación)

PETITORIO:

${d.petitorio}

Respetuosamente,
[FIRMA DEL RECURRENTE]
      `
    },
    casacion_inquisitivo: {
      nombre: "Recurso de Casación (Sistema Inquisitivo)",
      campos: [
        { id: "sentencia_seg_instancia", label: "Sentencia de Segunda Instancia", tipo: "text" },
        { id: "causal", label: "Causal de Casación", tipo: "text" },
        { id: "errores_de_derecho", label: "Errores de Derecho Alegados", tipo: "textarea" },
      ],
      generar: (d: Record<string, string>) => `
RECURSO DE CASACIÓN

Honorable Corte Suprema de Justicia - Sala de lo Penal:

RECURSO DE CASACIÓN contra la sentencia de segunda instancia dictada por ${d.sentencia_seg_instancia}.

CAUSAL:

Se invoca el ${d.causal} del Código Judicial.

ERRORES DE DERECHO:

${d.errores_de_derecho}

FUNDAMENTO LEGAL:
- Código Judicial Art. 2397-2413 (Recurso de casación penal)
- ${d.causal}

PETITORIO:

Se case la sentencia impugnada por los vicios alegados.

Respetuosamente,
[FIRMA DEL RECURRENTE]
      `
    },
    adhesion: {
      nombre: "Adhesión a la Acusación",
      campos: [
        { id: "fiscalia_acusacion", label: "Acusación Fiscal", tipo: "text" },
        { id: "hechos", label: "Hechos Complementarios", tipo: "textarea" },
        { id: "articulos", label: "Artículos Adicionales", tipo: "text" },
      ],
      generar: (d: Record<string, string>) => `
ADHESIÓN A LA ACUSACIÓN FISCAL

Honorable Tribunal de Juicio:

Me adhiero a la acusación presentada por ${d.fiscalia_acusacion}.

HECHOS COMPLEMENTARIOS:

${d.hechos}

CALIFICACIÓN JURÍDICA ADICIONAL:

Sin perjuicio de lo alegado por la Fiscalía, consideramos aplicable también ${d.articulos}.

FUNDAMENTO LEGAL:
- CPP Art. 93-105 (Querellante adhesivo)
- CPP Art. 343 (Adhesión a la acusación)

PETICIÓN:

Se tenga por adhesionada esta parte a la acusación fiscal.

Respetuosamente,
[FIRMA DEL QUERELLANTE ADHESIVO]
      `
    },
    acusacion_autonoma: {
      nombre: "Acusación Autónoma",
      campos: [
        { id: "hechos", label: "Relato de Hechos", tipo: "textarea" },
        { id: "pruebas_previas", label: "Pruebas Recabadas", tipo: "textarea" },
        { id: "articulos", label: "Tipificación Legal", tipo: "text" },
        { id: "peticion", label: "Petición", tipo: "textarea" },
      ],
      generar: (d: Record<string, string>) => `
ACUSACIÓN AUTÓNOMA

Honorable Tribunal de Juicio:

El suscrito querellante, en ejercicio del derecho que me confiere el CPP, presento ACUSACIÓN AUTÓNOMA.

HECHOS:

${d.hechos}

PRUEBAS:

${d.pruebas_previas}

CALIFICACIÓN JURÍDICA:

Los hechos configuran el delito tipificado en ${d.articulos} del Código Penal.

FUNDAMENTO LEGAL:
- CPP Art. 104 (Acusación particular autónoma)
- CP ${d.articulos}

PETICIÓN:

${d.peticion}

Respetuosamente,
[FIRMA DEL QUERELLANTE]
      `
    },
    accion_resarcitoria: {
      nombre: "Acción Resarcitoria (Daños y Perjuicios)",
      campos: [
        { id: "victima", label: "Nombre de la Víctima", tipo: "text" },
        { id: "dano", label: "Daños Sufridos", tipo: "textarea" },
        { id: "cuantificacion", label: "Cuantificación del Daño", tipo: "text" },
        { id: "pretension", label: "Pretensión", tipo: "textarea" },
      ],
      generar: (d: Record<string, string>) => `
ACCIÓN RESARCITORIA

Honorable Tribunal:

${d.victima}, en calidad de víctima del delito, ejerzo la ACCIÓN RESARCITORIA.

DAÑOS SUFRIDOS:

${d.dano}

CUANTIFICACIÓN:

Los daños y perjuicios se cuantifican en ${d.cuantificacion}.

FUNDAMENTO LEGAL:
- CPP Art. 73-82 (Acción civil resarcitoria)
- Código Civil Art. 1644 y ss. (Responsabilidad civil)

PRETENSIÓN:

${d.pretension}

Respetuosamente,
[FIRMA DE LA VÍCTIMA O SU REPRESENTANTE]
      `
    }
  };

  const generarEscrito = () => {
    const template = templates[tipoEscrito];
    if (!template) return;

    const texto = template.generar(datos);
    setPrevisualizacion(texto);
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

      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-lex/10 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-lex" />
            </div>
            <h1 className="text-3xl md:text-4xl font-poppins font-bold text-foreground">
              Generador de Escritos
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Genere escritos profesionales con fundamento legal automático y su branding personalizado.
          </p>
        </div>

        <Tabs defaultValue="formulario" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-surface-dark border border-border-gray">
            <TabsTrigger value="formulario">Formulario</TabsTrigger>
            <TabsTrigger value="preview">Previsualización</TabsTrigger>
          </TabsList>

          <TabsContent value="formulario" className="space-y-6">
            <Card className="border-border-gray bg-card shadow-soft">
              <CardHeader>
                <CardTitle className="text-2xl font-poppins">Seleccione el Tipo de Escrito</CardTitle>
                <CardDescription>Plantillas prediseñadas con fundamento legal</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">

                <div className="space-y-2">
                  <Label htmlFor="tipo" className="text-base">Tipo de Escrito</Label>
                  <Select value={tipoEscrito} onValueChange={setTipoEscrito}>
                    <SelectTrigger id="tipo" className="bg-background border-border-gray text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="imputacion">Imputación Formal</SelectItem>
                      <SelectItem value="oposicion_cautelar">Oposición a Medida Cautelar</SelectItem>
                      <SelectItem value="querella">Querella Criminal</SelectItem>
                      <SelectItem value="anulacion">Recurso de Anulación</SelectItem>
                      <SelectItem value="casacion_spa">Recurso de Casación (SPA)</SelectItem>
                      <SelectItem value="casacion_inquisitivo">Recurso de Casación (Inquisitivo)</SelectItem>
                      <SelectItem value="adhesion">Adhesión a la Acusación</SelectItem>
                      <SelectItem value="acusacion_autonoma">Acusación Autónoma</SelectItem>
                      <SelectItem value="accion_resarcitoria">Acción Resarcitoria</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {templates[tipoEscrito] && (
                  <>
                    <div className="border-t border-border-gray pt-6">
                      <h3 className="font-poppins font-semibold text-lg text-foreground mb-4">
                        {templates[tipoEscrito].nombre}
                      </h3>

                      <div className="space-y-4">
                        {templates[tipoEscrito].campos.map((campo: any) => (
                          <div key={campo.id} className="space-y-2">
                            <Label htmlFor={campo.id} className="text-base">{campo.label}</Label>
                            {campo.tipo === "textarea" ? (
                              <Textarea
                                id={campo.id}
                                value={datos[campo.id] || ""}
                                onChange={(e) => setDatos({ ...datos, [campo.id]: e.target.value })}
                                className="bg-background border-border-gray text-base min-h-[100px]"
                                placeholder={`Ingrese ${campo.label.toLowerCase()}`}
                              />
                            ) : (
                              <Input
                                id={campo.id}
                                type={campo.tipo}
                                value={datos[campo.id] || ""}
                                onChange={(e) => setDatos({ ...datos, [campo.id]: e.target.value })}
                                className="bg-background border-border-gray text-base"
                                placeholder={`Ingrese ${campo.label.toLowerCase()}`}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button
                      onClick={generarEscrito}
                      className="w-full bg-blue-lex hover:bg-blue-lex/90 text-white font-semibold text-lg py-6"
                    >
                      <Eye className="w-5 h-5 mr-2" />
                      Generar Previsualización
                    </Button>
                  </>
                )}

              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview" className="space-y-6">
            <Card className="border-border-gray bg-card shadow-soft">
              <CardHeader>
                <CardTitle className="text-2xl font-poppins">Previsualización del Escrito</CardTitle>
                <CardDescription>Puede editar el texto antes de descargar</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">

                {previsualizacion ? (
                  <>
                    <Textarea
                      value={previsualizacion}
                      onChange={(e) => setPrevisualizacion(e.target.value)}
                      className="bg-background border-border-gray text-base font-merriweather min-h-[500px]"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button
                        variant="outline"
                        className="border-blue-lex text-blue-lex hover:bg-blue-lex hover:text-white"
                      >
                        <Download className="w-5 h-5 mr-2" />
                        Descargar DOCX
                      </Button>
                      <Button
                        className="bg-gold hover:bg-gold/90 text-bg-gradient-start"
                      >
                        <Download className="w-5 h-5 mr-2" />
                        Descargar PDF con Branding
                      </Button>
                    </div>

                    <div className="bg-gold/5 p-4 rounded-lg border border-gold/20">
                      <p className="text-sm text-muted-foreground">
                        <span className="font-semibold text-gold">Tip:</span> El PDF incluirá su logo,
                        colores institucionales y tipografía configurados en "Mi Marca".
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-16 text-muted-foreground">
                    <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p className="text-lg">Complete el formulario y genere la previsualización</p>
                  </div>
                )}

              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
