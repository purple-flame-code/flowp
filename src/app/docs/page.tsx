import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileText, Download, BookOpen } from "lucide-react";

export default function DocsPage() {
  const documentos = [
    {
      categoria: "Normativa Principal",
      items: [
        { nombre: "Código Penal de Panamá", descripcion: "Ley 14 de 2007", archivo: "/docs/codigo_penal.pdf" },
        { nombre: "Código Procesal Penal", descripcion: "Ley 63 de 2008", archivo: "/docs/cpp.pdf" },
        { nombre: "Código Judicial", descripcion: "Sistema inquisitivo (aplicable pre-SPA)", archivo: "/docs/codigo_judicial.pdf" },
        { nombre: "Constitución Política de Panamá", descripcion: "1972 con reformas", archivo: "/docs/constitucion.pdf" },
      ]
    },
    {
      categoria: "Doctrina y Jurisprudencia",
      items: [
        { nombre: "Manual de Liquidación de Pena", descripcion: "Órgano Judicial", archivo: "/docs/manual_liquidacion.pdf" },
        { nombre: "Guía de Prescripción Penal", descripcion: "Criterios unificados", archivo: "/docs/guia_prescripcion.pdf" },
        { nombre: "Resoluciones de la Sala Penal", descripcion: "Compilación 2020-2024", archivo: "/docs/jurisprudencia_penal.pdf" },
      ]
    },
    {
      categoria: "Herramientas y Plantillas",
      items: [
        { nombre: "Tabla de Delitos y Penas", descripcion: "Referencia rápida CP", archivo: "/docs/tabla_delitos.pdf" },
        { nombre: "Calendario de Feriados Judiciales", descripcion: "2025", archivo: "/docs/feriados_2025.pdf" },
      ]
    }
  ];

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

      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-lex/10 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-blue-lex" />
            </div>
            <h1 className="text-3xl md:text-4xl font-poppins font-bold text-foreground">
              Documentos de Referencia
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Biblioteca legal con normativa, doctrina y herramientas para el ejercicio profesional.
          </p>
        </div>

        {/* Nota informativa */}
        <Card className="border-gold/30 bg-gold/5 mb-8">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-gold mt-1" />
              <div>
                <p className="text-foreground font-semibold mb-1">Instrucciones de Carga</p>
                <p className="text-muted-foreground text-sm">
                  Los documentos PDF deben ser cargados por el usuario en la carpeta <code className="bg-background px-2 py-1 rounded text-gold">/public/docs/</code>.
                  Los archivos listados a continuación son referenciales y deben ser provistos por usted.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Categorías de documentos */}
        <div className="space-y-8">
          {documentos.map((categoria, idx) => (
            <div key={idx}>
              <h2 className="text-2xl font-poppins font-bold text-foreground mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-gold rounded" />
                {categoria.categoria}
              </h2>

              <div className="grid grid-cols-1 gap-4">
                {categoria.items.map((doc, docIdx) => (
                  <Card key={docIdx} className="border-border-gray bg-card shadow-soft hover:border-gold/50 transition-all group">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg font-poppins text-foreground group-hover:text-gold transition-colors">
                            {doc.nombre}
                          </CardTitle>
                          <CardDescription className="text-sm mt-1">{doc.descripcion}</CardDescription>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-blue-lex text-blue-lex hover:bg-blue-lex hover:text-white"
                          asChild
                        >
                          <a href={doc.archivo} download target="_blank" rel="noopener noreferrer">
                            <Download className="w-4 h-4 mr-2" />
                            Descargar
                          </a>
                        </Button>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Info */}
        <Card className="border-blue-lex/30 bg-blue-lex/5 mt-12">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <BookOpen className="w-5 h-5 text-blue-lex mt-1" />
              <div>
                <p className="text-foreground font-semibold mb-1">Actualización de Documentos</p>
                <p className="text-muted-foreground text-sm">
                  Se recomienda mantener los documentos actualizados según las últimas reformas legislativas y
                  jurisprudencia vigente. Los documentos provistos son de referencia y deben ser verificados
                  con fuentes oficiales.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
