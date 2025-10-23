import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Scale, ArrowLeft } from "lucide-react";

export function generateStaticParams() {
  return [{ rid: 'ejemplo' }];
}

export default async function PublicResultPage({ params }: { params: Promise<{ rid: string }> }) {
  const { rid } = await params;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border-gray bg-surface-dark/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gold rounded flex items-center justify-center">
              <Scale className="w-6 h-6 text-bg-gradient-start" />
            </div>
            <h1 className="text-xl font-poppins font-bold text-foreground">
              FlowPenal <span className="text-gold">by Lex Vence</span>
            </h1>
          </div>
          <Link href="/">
            <Button variant="outline" className="border-gold text-gold hover:bg-gold hover:text-bg-gradient-start">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Ir a FlowPenal
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-4xl">

        <Card className="border-gold bg-card shadow-glow">
          <CardHeader>
            <CardTitle className="text-2xl font-poppins text-gold">
              Resultado Público
            </CardTitle>
            <p className="text-muted-foreground mt-2">ID: {rid}</p>
          </CardHeader>
          <CardContent className="space-y-6">

            <div className="bg-blue-lex/10 p-6 rounded-lg border border-blue-lex">
              <h3 className="font-poppins font-semibold text-lg text-blue-lex mb-3">
                Vista Solo Lectura
              </h3>
              <p className="text-foreground">
                Este es un enlace público generado por FlowPenal. Los resultados compartidos mediante
                código QR se muestran aquí en formato de solo lectura.
              </p>
            </div>

            <div className="bg-background/50 p-6 rounded-lg border border-border-gray">
              <h3 className="font-poppins font-semibold text-lg text-foreground mb-4">
                Ejemplo de Resultado
              </h3>
              <div className="space-y-3 text-muted-foreground">
                <p>• <span className="text-foreground font-semibold">Tipo:</span> Cálculo de Penas</p>
                <p>• <span className="text-foreground font-semibold">Fecha:</span> {new Date().toLocaleDateString('es-PA')}</p>
                <p>• <span className="text-foreground font-semibold">Estado:</span> Activo</p>
              </div>
            </div>

            <div className="bg-gold/5 p-4 rounded-lg border border-gold/20">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-gold">Nota:</span> En la versión de producción,
                esta página mostrará los resultados específicos del cálculo compartido. Los resultados
                se almacenan de forma segura y con enlaces firmados de acceso limitado.
              </p>
            </div>

            <div className="text-center pt-4">
              <Link href="/">
                <Button className="bg-gold hover:bg-gold/90 text-bg-gradient-start font-semibold">
                  Crear mi propio cálculo
                </Button>
              </Link>
            </div>

          </CardContent>
        </Card>

        {/* Footer marca */}
        <div className="text-center mt-12 text-muted-foreground text-sm">
          <p>Generado con <span className="text-gold font-semibold">FlowPenal by Lex Vence</span></p>
          <p className="mt-1">Herramienta Jurídica Profesional • Panamá</p>
        </div>

      </div>
    </div>
  );
}
