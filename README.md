# FlowPenal by Lex Vence 

**Herramienta Jurídica Profesional para Abogados en Panamá**

Una aplicación web de acceso abierto diseñada para cálculo de penas, prescripción penal, liquidación de pena y generación de escritos con branding personalizado.

---

## 🎯 Características Principales

### 1. **Cálculo de Penas** ⚖️
- Marco punitivo con mínimo y máximo
- Agravantes y atenuantes
- Tentativa (reducción según CP)
- Confesión (reducción discrecional)
- Concurso de delitos (ideal, real, medial)
- Subrogados penales aplicables
- Fundamento legal automático

### 2. **Prescripción Penal** ⏰
- Determina régimen CPP o CJ según fecha y distrito
- Fechas de entrada del SPA por distrito judicial
- Tipos de consumación (instantánea, permanente, continuada)
- Cálculo de plazos base
- Alertas de suspensiones e interrupciones
- Días restantes hasta prescripción

### 3. **Liquidación de Pena** 📊
- Cálculo de ½ y ⅔ de pena
- Abonos de medidas cautelares (CPP Art. 232):
  - Detención preventiva (1:1)
  - Arresto domiciliario (1:1)
  - Prohibición de salida (1:5)
  - Presentación periódica (1 día por 5 presentaciones)
  - Permanencia en domicilio (1:2)
- Conmutación por trabajo, estudio y conducta
- Fechas clave para subrogados

### 4. **Generador de Escritos** 📝
- Plantillas profesionales:
  - Imputación formal
  - Oposición a medida cautelar
  - Querella criminal
  - Recurso de anulación
  - Recurso de casación
  - Adhesión a la acusación
- Fundamento legal automático
- Branding personalizado en PDFs

### 5. **Mi Marca** 🎨
- Configuración de logo del estudio
- Selección de color institucional (dorado, azul, gris, negro, blanco)
- Tipografía de documentos (Serif/Sans-serif)
- Exportar/Importar perfil de branding
- Persistencia en localStorage

### 6. **Documentos de Referencia** 📚
- Biblioteca de normativa legal
- Códigos Penal, Procesal Penal y Judicial
- Constitución Política de Panamá
- Manuales y guías de liquidación
- Jurisprudencia compilada

---

## 🎨 Diseño

### Paleta de Colores
- **Primario (Dorado)**: `#F5C542` - Acciones principales
- **Secundario (Azul Lex)**: `#376BFF` - Acciones auxiliares
- **Fondo**: Degradado `#0C0E18 → #111111`
- **Bordes**: `#3A3D4A`
- **Texto**: `#F9FAFB`
- **Acento Legal**: `#8B0000`

### Tipografía
- **Títulos**: Poppins Bold (40-48px hero, 24-28px módulos)
- **Texto**: Inter Regular/SemiBold (16-18px base)
- **Documentos**: Merriweather (serif)
- **Interlineado**: 1.8
- **Tamaño mínimo**: 14px (accesibilidad AA/AAA)

---

## 📁 Estructura del Proyecto

```
flowpenal-lexvence/
├── public/
│   ├── assets/              # Logos, íconos, hero images
│   │   ├── logo_lexvence.svg
│   │   ├── hero_lexvence.png
│   │   └── icons/
│   └── docs/                # PDFs legales
│       ├── codigo_penal.pdf
│       ├── cpp.pdf
│       ├── codigo_judicial.pdf
│       └── ...
├── src/
│   ├── app/
│   │   ├── page.tsx         # Home con hero y módulos
│   │   ├── penas/           # Cálculo de Penas
│   │   ├── prescripcion/    # Prescripción Penal
│   │   ├── liquidacion/     # Liquidación de Pena
│   │   ├── escritos/        # Generador de Escritos
│   │   ├── brand/           # Mi Marca
│   │   ├── docs/            # Documentos
│   │   └── r/[rid]/         # Vista pública de resultados
│   └── components/
│       └── ui/              # Componentes shadcn/ui
└── netlify.toml             # Configuración de despliegue
```

---

## 🚀 Inicio Rápido

### Requisitos Previos
- Node.js 18+ o Bun
- Archivos de assets (logos, PDFs)

### Instalación

```bash
# Clonar el repositorio
cd flowpenal-lexvence

# Instalar dependencias
bun install

# Ejecutar servidor de desarrollo
bun run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

### Agregar Assets

1. **Logo del estudio**: Subir a `/public/assets/logo_lexvence.svg` (o `.png`)
2. **Hero image**: Subir a `/public/assets/hero_lexvence.png`
3. **PDFs legales**: Subir a `/public/docs/`

---

## 📦 Despliegue en Netlify

### Opción 1: Despliegue Automático

```bash
# Build de producción
bun run build

# Desplegar
netlify deploy --prod
```

### Opción 2: Desde GitHub

1. Conectar repositorio a Netlify
2. Configuración de build:
   - **Build command**: `bun run build`
   - **Publish directory**: `.next`

El archivo `netlify.toml` ya está configurado.

---

## 🛠️ Tecnologías

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (customizado)
- **Tipografía**: Google Fonts (Poppins, Inter, Merriweather)
- **Icons**: Lucide React
- **Package Manager**: Bun

---

## 📝 Próximas Mejoras

- [ ] Generación de PDFs con jsPDF/react-pdf
- [ ] Códigos QR para compartir resultados
- [ ] Validación de formularios con Zod
- [ ] Tooltips con referencias legales
- [ ] Modo de impresión optimizado
- [ ] Exportación a DOCX
- [ ] Integración con correo electrónico

---

## 🔒 Privacidad

- **Sin registro**: Acceso abierto sin necesidad de login
- **Sin almacenamiento en servidor**: Cálculos procesados en el cliente
- **Sin PII en logs**: Respeto a la privacidad del usuario
- **Opción "no guardar"**: Por defecto, no se guarda información

---

## 📄 Licencia

© 2025 Lex Vence - Panamá
Sistema Penal Acusatorio

---

## 🆘 Soporte

Para asistencia técnica o consultas sobre la herramienta, contactar a support@lexvence.com

---
