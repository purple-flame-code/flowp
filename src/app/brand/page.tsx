"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Palette, Upload, Download, Save } from "lucide-react";

export default function BrandPage() {
  const [color, setColor] = useState("#F5C542");
  const [nombreEstudio, setNombreEstudio] = useState("");
  const [tipografia, setTipografia] = useState("serif");
  const [logoUrl, setLogoUrl] = useState("");

  useEffect(() => {
    // Cargar preferencias de localStorage
    const saved = localStorage.getItem("flowpenal_brand");
    if (saved) {
      try {
        const brand = JSON.parse(saved);
        setColor(brand.color || "#F5C542");
        setNombreEstudio(brand.nombreEstudio || "");
        setTipografia(brand.tipografia || "serif");
        setLogoUrl(brand.logoUrl || "");
      } catch (e) {
        console.error("Error cargando preferencias:", e);
      }
    }
  }, []);

  const guardar = () => {
    const brand = {
      color,
      nombreEstudio,
      tipografia,
      logoUrl,
      fechaActualizacion: new Date().toISOString(),
    };
    localStorage.setItem("flowpenal_brand", JSON.stringify(brand));
    alert("Preferencias guardadas correctamente");
  };

  const exportarPerfil = () => {
    const brand = {
      color,
      nombreEstudio,
      tipografia,
      logoUrl,
      exportadoEn: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(brand, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "perfil_lexvence.json";
    a.click();
  };

  const importarPerfil = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const brand = JSON.parse(event.target?.result as string);
        setColor(brand.color || "#F5C542");
        setNombreEstudio(brand.nombreEstudio || "");
        setTipografia(brand.tipografia || "serif");
        setLogoUrl(brand.logoUrl || "");
        localStorage.setItem("flowpenal_brand", JSON.stringify(brand));
        alert("Perfil importado correctamente");
      } catch (err) {
        alert("Error al importar el perfil");
      }
    };
    reader.readAsText(file);
  };

  const subirLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convertir a base64 o URL
    const reader = new FileReader();
    reader.onload = (event) => {
      setLogoUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const coloresPreset = [
    { nombre: "Dorado (Default)", valor: "#F5C542" },
    { nombre: "Azul Lex", valor: "#376BFF" },
    { nombre: "Gris Profesional", valor: "#3A3D4A" },
    { nombre: "Negro", valor: "#000000" },
    { nombre: "Blanco", valor: "#FFFFFF" },
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

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gold/10 rounded-lg flex items-center justify-center">
              <Palette className="w-6 h-6 text-gold" />
            </div>
            <h1 className="text-3xl md:text-4xl font-poppins font-bold text-foreground">
              Mi Marca
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Personalice el branding de sus documentos PDF (logo, colores, tipografía).
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Formulario */}
          <div className="lg:col-span-2 space-y-6">

            <Card className="border-border-gray bg-card shadow-soft">
              <CardHeader>
                <CardTitle className="text-2xl font-poppins">Configuración de Marca</CardTitle>
                <CardDescription>Estas preferencias se aplicarán a todos los PDFs generados</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">

                {/* Nombre del Estudio */}
                <div className="space-y-2">
                  <Label htmlFor="nombre" className="text-base">Nombre del Estudio / Abogado</Label>
                  <Input
                    id="nombre"
                    type="text"
                    value={nombreEstudio}
                    onChange={(e) => setNombreEstudio(e.target.value)}
                    placeholder="Ej: Estudio Jurídico Lex Vence"
                    className="bg-background border-border-gray text-base"
                  />
                </div>

                {/* Logo */}
                <div className="space-y-2">
                  <Label htmlFor="logo" className="text-base">Logo del Estudio</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      id="logo"
                      type="file"
                      accept="image/*"
                      onChange={subirLogo}
                      className="bg-background border-border-gray text-base"
                    />
                    <Button variant="outline" className="border-gold text-gold" onClick={() => document.getElementById("logo")?.click()}>
                      <Upload className="w-4 h-4 mr-2" />
                      Subir
                    </Button>
                  </div>
                  {logoUrl && (
                    <div className="mt-3 p-3 bg-background/50 rounded border border-border-gray">
                      <img src={logoUrl} alt="Logo" className="max-h-16 object-contain" />
                    </div>
                  )}
                </div>

                {/* Color Institucional */}
                <div className="space-y-2">
                  <Label htmlFor="color" className="text-base">Color Institucional</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {coloresPreset.map((c) => (
                      <button
                        key={c.valor}
                        onClick={() => setColor(c.valor)}
                        className={`p-3 rounded-lg border-2 flex items-center gap-3 transition-all ${
                          color === c.valor ? 'border-gold bg-gold/10' : 'border-border-gray hover:border-gold/50'
                        }`}
                      >
                        <div className="w-6 h-6 rounded" style={{ backgroundColor: c.valor }} />
                        <span className="text-sm text-foreground">{c.nombre}</span>
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 mt-3">
                    <Label htmlFor="custom-color" className="text-sm">Color personalizado:</Label>
                    <Input
                      id="custom-color"
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-20 h-10 bg-background border-border-gray"
                    />
                    <span className="text-sm text-muted-foreground font-mono">{color}</span>
                  </div>
                </div>

                {/* Tipografía */}
                <div className="space-y-2">
                  <Label htmlFor="tipografia" className="text-base">Tipografía de Documentos</Label>
                  <Select value={tipografia} onValueChange={setTipografia}>
                    <SelectTrigger id="tipografia" className="bg-background border-border-gray text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="serif">Serif (Merriweather)</SelectItem>
                      <SelectItem value="sans">Sans-serif (Inter)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Botones de Acción */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4">
                  <Button
                    onClick={guardar}
                    className="bg-gold hover:bg-gold/90 text-bg-gradient-start font-semibold"
                  >
                    <Save className="w-5 h-5 mr-2" />
                    Guardar Preferencias
                  </Button>
                  <Button
                    onClick={exportarPerfil}
                    variant="outline"
                    className="border-blue-lex text-blue-lex hover:bg-blue-lex hover:text-white"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Exportar Perfil
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="import" className="text-base">Importar Perfil</Label>
                  <Input
                    id="import"
                    type="file"
                    accept=".json"
                    onChange={importarPerfil}
                    className="bg-background border-border-gray text-base"
                  />
                </div>

              </CardContent>
            </Card>

          </div>

          {/* Preview */}
          <div className="space-y-6">
            <Card className="border-border-gray bg-card shadow-soft sticky top-24">
              <CardHeader>
                <CardTitle className="text-xl font-poppins">Vista Previa</CardTitle>
                <CardDescription>Cómo se verá en el PDF</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">

                {/* Encabezado del PDF */}
                <div
                  className="p-4 rounded-lg border-2"
                  style={{ borderColor: color }}
                >
                  {logoUrl && (
                    <img src={logoUrl} alt="Logo" className="max-h-12 mb-3 object-contain" />
                  )}
                  <h3
                    className="font-bold text-lg"
                    style={{ color: color }}
                  >
                    {nombreEstudio || "Nombre del Estudio"}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date().toLocaleDateString('es-PA', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>

                {/* Pie de página */}
                <div className="p-4 bg-background/50 rounded-lg border border-border-gray">
                  <p className="text-xs text-center text-muted-foreground">
                    Generado con <span style={{ color: color }} className="font-semibold">FlowPenal by Lex Vence</span>
                  </p>
                </div>

                {/* Info */}
                <div className="bg-blue-lex/5 p-3 rounded-lg border border-blue-lex/20">
                  <p className="text-xs text-muted-foreground">
                    Los PDFs incluirán su logo, color institucional y tipografía seleccionada.
                  </p>
                </div>

              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}
