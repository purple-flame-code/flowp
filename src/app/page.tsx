import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Scale, Clock, Calculator, FileText, Calendar } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border-gray bg-surface-dark/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gold rounded flex items-center justify-center">
              <Scale className="w-6 h-6 text-bg-gradient-start" />
            </div>
            <h1 className="text-xl font-poppins font-bold text-foreground">
              FlowPenal <span className="text-gold">by Lex Vence</span>
            </h1>
          </div>
          <nav className="flex gap-4">
            <Link href="/brand">
              <Button variant="ghost" className="text-foreground hover:text-gold">Mi Marca</Button>
            </Link>
            <Link href="/docs">
              <Button variant="ghost" className="text-foreground hover:text-gold">Documentos</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-4xl md:text-5xl font-poppins font-bold text-foreground leading-tight">
            Herramienta Jurídica Profesional
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Cálculo de penas, prescripción penal, liquidación y generación de escritos
            con branding profesional para abogados en Panamá.
          </p>
          <div className="pt-4">
            <Button
              size="lg"
              className="bg-gold hover:bg-gold/90 text-bg-gradient-start font-semibold text-lg px-8 py-6 shadow-glow"
              asChild
            >
              <a href="#modules">Iniciar Herramienta</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Modules Grid */}
      <section id="modules" className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">

          {/* Recursos y Términos */}
          <Link href="/recursos">
            <Card className="border-border-gray bg-card hover:border-gold transition-all duration-300 shadow-soft hover:shadow-glow cursor-pointer h-full group">
              <CardHeader>
                <div className="w-12 h-12 bg-gold/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-gold/20 transition-colors">
                  <Calendar className="w-6 h-6 text-gold" />
                </div>
                <CardTitle className="text-2xl font-poppins font-bold text-foreground">
                  Recursos y Términos
                </CardTitle>
                <CardDescription className="text-base text-muted-foreground mt-2">
                  Calcule plazos exactos para recursos de anulación y casación con cómputo
                  de días hábiles y calendario detallado (CPP 437, 441).
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          {/* Cálculo de Penas */}
          <Link href="/penas">
            <Card className="border-border-gray bg-card hover:border-gold transition-all duration-300 shadow-soft hover:shadow-glow cursor-pointer h-full group">
              <CardHeader>
                <div className="w-12 h-12 bg-gold/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-gold/20 transition-colors">
                  <Calculator className="w-6 h-6 text-gold" />
                </div>
                <CardTitle className="text-2xl font-poppins font-bold text-foreground">
                  Cálculo de Penas
                </CardTitle>
                <CardDescription className="text-base text-muted-foreground mt-2">
                  Calcule penas con agravantes, atenuantes, tentativa, confesión y concursos.
                  Determine subrogados penales aplicables según el Código Penal.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          {/* Prescripción Penal */}
          <Link href="/prescripcion">
            <Card className="border-border-gray bg-card hover:border-blue-lex transition-all duration-300 shadow-soft hover:shadow-glow cursor-pointer h-full group">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-lex/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-lex/20 transition-colors">
                  <Clock className="w-6 h-6 text-blue-lex" />
                </div>
                <CardTitle className="text-2xl font-poppins font-bold text-foreground">
                  Prescripción Penal
                </CardTitle>
                <CardDescription className="text-base text-muted-foreground mt-2">
                  Determine plazos de prescripción según CPP o CJ (sistema inquisitivo).
                  Incluye suspensiones, interrupciones y cómputo por distrito.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          {/* Liquidación de Pena */}
          <Link href="/liquidacion">
            <Card className="border-border-gray bg-card hover:border-gold transition-all duration-300 shadow-soft hover:shadow-glow cursor-pointer h-full group">
              <CardHeader>
                <div className="w-12 h-12 bg-gold/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-gold/20 transition-colors">
                  <Scale className="w-6 h-6 text-gold" />
                </div>
                <CardTitle className="text-2xl font-poppins font-bold text-foreground">
                  Liquidación de Pena
                </CardTitle>
                <CardDescription className="text-base text-muted-foreground mt-2">
                  Calcule ½ y ⅔ de pena con abonos de medidas cautelares (CPP 232)
                  y conmutación por trabajo, estudio y conducta (CP 99-104).
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          {/* Generador de Escritos */}
          <Link href="/escritos">
            <Card className="border-border-gray bg-card hover:border-blue-lex transition-all duration-300 shadow-soft hover:shadow-glow cursor-pointer h-full group">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-lex/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-lex/20 transition-colors">
                  <FileText className="w-6 h-6 text-blue-lex" />
                </div>
                <CardTitle className="text-2xl font-poppins font-bold text-foreground">
                  Generador de Escritos
                </CardTitle>
                <CardDescription className="text-base text-muted-foreground mt-2">
                  Genere escritos profesionales (imputación, recursos, querellas) con
                  su branding personalizado y fundamento legal automático.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border-gray mt-24 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          <p>© 2025 <span className="text-gold font-semibold">FlowPenal by Lex Vence</span> | Herramienta Jurídica Profesional</p>
          <p className="mt-2">Panamá • Sistema Penal Acusatorio</p>
        </div>
      </footer>
    </div>
  );
}
