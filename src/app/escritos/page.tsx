"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";

type TipoPoderdante = "persona_natural" | "persona_juridica";

type FormState = {
  nombreFirma: string;
  sloganFirma: string;
  telefonosFirma: string;
  faxFirma: string;
  webFirma: string;
  correoFirma: string;
  direccionFirma: string;

  headerMembreteDataUrl: string;
  logoDataUrl: string;
  firmaManuscritaDataUrl: string;

  abogadoNombre: string;
  abogadoGenero: "mujer" | "varon";
  abogadoNacionalidad: string;
  abogadoCedula: string;
  abogadoCargo: string;
  abogadoOficinas: string;
  abogadoTelefonos: string;
  abogadoCorreos: string;
  abogadoRecibeNotificaciones: string;

  tipoPoderdante: TipoPoderdante;
  clienteNombre: string;
  clienteGenero: "varon" | "mujer";
  clienteNacionalidad: string;
  clienteCedulaPasaporte: string;
  clienteDomicilio: string;
  clienteTelefono: string;
  clienteCorreos: string;

  sociedadNombre: string;
  sociedadTipo: string;
  sociedadFolio: string;
  representanteCargo: string;

  numeroCarpetilla: string;
  autoridadDestino: string;
  descripcionInvestigacion: string;
  tipoProceso: string;
  contraparte: string;
  delitoOMateria: string;
  perjudicado: string;
  finalidadPoder: string;

  ciudad: string;
  fechaTexto: string;
  usarFechaPresentacion: boolean;
  incluirFacultadesRecursos: boolean;
  incluirFacultadesTransaccion: boolean;
  incluirFacultadesSustitucion: boolean;
  facultadesAdicionales: string;
};

const initialForm: FormState = {
  nombreFirma: "RAMOS CHUE & ASOCIADOS",
  sloganFirma: "Calidad y Seguimiento",
  telefonosFirma: "(507) 201-5532/33",
  faxFirma: "(507) 201-5534",
  webFirma: "www.rachlaw.com",
  correoFirma: "info@rachlaw.com",
  direccionFirma:
    "APARTADO 0831-00674, ZONA PAITILLA\nPANAMÁ, REP. DE PANAMÁ\nCALLE 54 OBARRIO (diagonal a Generali)\nEDIFICIO TWIST TOWER 54 (Global Hotel)\nPISO 30, OFICINAS 30-D",

  headerMembreteDataUrl: "",
  logoDataUrl: "",
  firmaManuscritaDataUrl: "",

  abogadoNombre: "EDNA RAMOS CHUE",
  abogadoGenero: "mujer",
  abogadoNacionalidad: "panameña",
  abogadoCedula: "8-235-1312",
  abogadoCargo: "abogada en ejercicio",
  abogadoOficinas:
    "Calle 54 Este, Urbanización Obarrio, Edificio PH Twist Tower (Global Hotel), Piso 30, Oficina 30-D, de esta ciudad",
  abogadoTelefonos: "201-5533",
  abogadoCorreos: "info@rachlaw.com",
  abogadoRecibeNotificaciones:
    "lugar donde recibe notificaciones personales",

  tipoPoderdante: "persona_natural",
  clienteNombre: "",
  clienteGenero: "varon",
  clienteNacionalidad: "panameño",
  clienteCedulaPasaporte: "",
  clienteDomicilio: "",
  clienteTelefono: "",
  clienteCorreos: "",

  sociedadNombre: "",
  sociedadTipo: "sociedad anónima",
  sociedadFolio: "",
  representanteCargo: "Presidente y Representante Legal",

  numeroCarpetilla: "",
  autoridadDestino:
    "SEÑOR(A) FISCAL DE ATENCIÓN PRIMARIA DE LA FISCALÍA METROPOLITANA:",
  descripcionInvestigacion: "",
  tipoProceso: "Investigación seguida",
  contraparte: "",
  delitoOMateria: "",
  perjudicado: "",
  finalidadPoder:
    "que asuman mi representación dentro del proceso indicado, presenten las solicitudes que correspondan y ejerzan las acciones legales necesarias para la defensa de mis derechos e intereses",

  ciudad: "Panamá",
  fechaTexto: "",
  usarFechaPresentacion: true,
  incluirFacultadesRecursos: true,
  incluirFacultadesTransaccion: true,
  incluirFacultadesSustitucion: true,
  facultadesAdicionales: "",
};

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <label className="mb-1 block text-sm font-medium text-slate-300">
      {children}
    </label>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-white outline-none transition focus:border-yellow-400/60 focus:ring-2 focus:ring-yellow-400/20"
    />
  );
}

function TextArea({
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      rows={rows}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-white outline-none transition focus:border-yellow-400/60 focus:ring-2 focus:ring-yellow-400/20"
    />
  );
}

function SelectInput({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-white outline-none transition focus:border-yellow-400/60 focus:ring-2 focus:ring-yellow-400/20"
    >
      {children}
    </select>
  );
}

function Card({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-slate-950/60 shadow-xl shadow-black/20">
      <div className="border-b border-white/10 p-5">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-slate-400">{description}</p>
        )}
      </div>
      <div className="space-y-4 p-5">{children}</div>
    </section>
  );
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function paragraph(value: string) {
  return escapeHtml(value).replaceAll("\n", "<br />");
}

function nombreMayuscula(nombre: string) {
  return nombre.trim().toUpperCase();
}

function construirDescripcionInvestigacion(form: FormState) {
  if (form.descripcionInvestigacion.trim()) {
    return form.descripcionInvestigacion.trim();
  }

  const tipo = form.tipoProceso.trim() || "Investigación seguida";
  const contraparte = form.contraparte.trim() || "__________";
  const delito = form.delitoOMateria.trim() || "__________";
  const perjudicado =
    form.perjudicado.trim() ||
    form.clienteNombre.trim() ||
    form.sociedadNombre.trim() ||
    "__________";

  return `${tipo} a ${contraparte} por la comisión de un delito contra ${delito} en perjuicio de ${perjudicado}.`;
}

function construirComparecencia(form: FormState) {
  const generoCliente = form.clienteGenero === "mujer" ? "mujer" : "varón";
  const generoAbogado = form.abogadoGenero === "mujer" ? "mujer" : "varón";
  const descripcion = construirDescripcionInvestigacion(form);

  if (form.tipoPoderdante === "persona_juridica") {
    return `Quien suscribe, ${
      form.clienteNombre || "[NOMBRE DEL REPRESENTANTE]"
    }, ${generoCliente}, ${
      form.clienteNacionalidad || "[NACIONALIDAD]"
    }, mayor de edad, con documento de identidad personal No. ${
      form.clienteCedulaPasaporte || "[CÉDULA/PASAPORTE]"
    }, con domicilio en ${
      form.clienteDomicilio || "[DOMICILIO COMPLETO]"
    }, teléfono ${
      form.clienteTelefono || "[TELÉFONO]"
    } y correo electrónico ${
      form.clienteCorreos || "[CORREO ELECTRÓNICO]"
    }, actuando en mi condición de ${
      form.representanteCargo || "[CARGO]"
    } de la sociedad ${
      form.sociedadNombre || "[NOMBRE DE LA SOCIEDAD]"
    }, ${
      form.sociedadTipo || "sociedad"
    }, inscrita a Folio Mercantil No. ${
      form.sociedadFolio || "[FOLIO]"
    }, comparezco respetuosamente ante su despacho con el propósito de conferir Poder Especial amplio y suficiente a la firma ${
      form.nombreFirma || "[NOMBRE DE LA FIRMA]"
    }, representada en este acto por la Lcda. ${
      form.abogadoNombre || "[NOMBRE DEL ABOGADO]"
    }, ${generoAbogado}, ${
      form.abogadoNacionalidad || "[NACIONALIDAD]"
    }, mayor de edad, con cédula de identidad personal No. ${
      form.abogadoCedula || "[CÉDULA]"
    }, ${
      form.abogadoCargo || "abogada en ejercicio"
    }, con oficinas en ${
      form.abogadoOficinas || "[DIRECCIÓN DE OFICINA]"
    }, con teléfonos No. ${
      form.abogadoTelefonos || "[TELÉFONOS]"
    } y correos electrónicos ${
      form.abogadoCorreos || "[CORREOS]"
    }, ${
      form.abogadoRecibeNotificaciones ||
      "lugar donde recibe notificaciones personales"
    }, con el propósito de ${form.finalidadPoder || `que asuman mi representación dentro de ${descripcion}`}.`;
  }

  return `Quien suscribe, ${
    form.clienteNombre || "[NOMBRE DEL CLIENTE]"
  }, ${generoCliente}, ${
    form.clienteNacionalidad || "[NACIONALIDAD]"
  }, mayor de edad, con documento de identidad personal No. ${
    form.clienteCedulaPasaporte || "[CÉDULA/PASAPORTE]"
  }, con domicilio en ${
    form.clienteDomicilio || "[DOMICILIO COMPLETO]"
  }, teléfono ${
    form.clienteTelefono || "[TELÉFONO]"
  } y correo electrónico ${
    form.clienteCorreos || "[CORREO ELECTRÓNICO]"
  }, comparezco respetuosamente ante su despacho con el propósito de otorgar Poder Especial amplio y suficiente a la firma ${
    form.nombreFirma || "[NOMBRE DE LA FIRMA]"
  }, representada en este acto por la Lcda. ${
    form.abogadoNombre || "[NOMBRE DEL ABOGADO]"
  }, ${generoAbogado}, ${
    form.abogadoNacionalidad || "[NACIONALIDAD]"
  }, mayor de edad, con cédula de identidad personal No. ${
    form.abogadoCedula || "[CÉDULA]"
  }, ${
    form.abogadoCargo || "abogada en ejercicio"
  }, con oficinas en ${
    form.abogadoOficinas || "[DIRECCIÓN DE OFICINA]"
  }, con teléfonos No. ${
    form.abogadoTelefonos || "[TELÉFONOS]"
  } y correos electrónicos ${
    form.abogadoCorreos || "[CORREOS]"
  }, ${
    form.abogadoRecibeNotificaciones ||
    "lugar donde recibe notificaciones personales"
  }, con el propósito de ${form.finalidadPoder || `que asuman mi representación dentro de ${descripcion}`}.`;
}

function construirFacultades(form: FormState) {
  const facultades = ["recibir"];

  if (form.incluirFacultadesTransaccion) {
    facultades.push("transigir", "ratificar", "allanarse", "desistir");
  }

  if (form.incluirFacultadesSustitucion) {
    facultades.push("sustituir", "reasumir");
  }

  if (form.incluirFacultadesRecursos) {
    facultades.push("interponer recursos", "presentar solicitudes");
  }

  const textoBase = `La firma ${
    form.nombreFirma || "[NOMBRE DE LA FIRMA]"
  } queda expresamente facultada para ${facultades.join(
    ", "
  )} y realizar todas las actuaciones necesarias para el ejercicio del presente poder.`;

  if (!form.facultadesAdicionales.trim()) {
    return textoBase;
  }

  return `${textoBase}\n\nAsimismo, queda facultada para ${form.facultadesAdicionales.trim()}.`;
}

function construirHeaderFallback(form: FormState) {
  const logo = form.logoDataUrl
    ? `<img src="${form.logoDataUrl}" class="fallback-logo" alt="Logo de la firma" />`
    : `<div class="fallback-logo-text">${escapeHtml(form.nombreFirma)}</div>`;

  return `
    <table class="fallback-header-table" role="presentation">
      <tr>
        <td class="fallback-header-center" colspan="2">
          ${logo}
        </td>
      </tr>
      <tr>
        <td class="fallback-header-left">
          <div><strong>TELÉFONOS:</strong> ${escapeHtml(form.telefonosFirma)}</div>
          <div><strong>FAX:</strong> ${escapeHtml(form.faxFirma)}</div>
          <div>${escapeHtml(form.webFirma)}</div>
          <div>${escapeHtml(form.correoFirma)}</div>
        </td>
        <td class="fallback-header-right">
          ${paragraph(form.direccionFirma)}
        </td>
      </tr>
    </table>
  `;
}

function construirDocumentoHtml(form: FormState) {
  const descripcionInvestigacion = construirDescripcionInvestigacion(form);
  const comparecencia = construirComparecencia(form);
  const facultades = construirFacultades(form);
  const fecha = form.usarFechaPresentacion
    ? `${form.ciudad || "Panamá"}, a la fecha de su presentación.`
    : `${form.ciudad || "Panamá"}, ${form.fechaTexto || "[FECHA]"}.`;

  const headerCompuesto = form.headerMembreteDataUrl
    ? `
      <table class="header-image-table" role="presentation">
        <tr>
          <td>
            <img
              src="${form.headerMembreteDataUrl}"
              class="header-image"
              alt="Membrete de la firma"
            />
          </td>
        </tr>
      </table>
    `
    : construirHeaderFallback(form);

  const otorgante =
    form.tipoPoderdante === "persona_juridica"
      ? `${escapeHtml(form.sociedadNombre || "[SOCIEDAD]")}<br />${escapeHtml(
          form.clienteNombre || "[REPRESENTANTE LEGAL]"
        )}<br />${escapeHtml(form.clienteCedulaPasaporte || "[DOCUMENTO]")}`
      : `${escapeHtml(form.clienteNombre || "[NOMBRE DEL CLIENTE]")}<br />${escapeHtml(
          form.clienteCedulaPasaporte || "[DOCUMENTO]"
        )}`;

  const firma = form.firmaManuscritaDataUrl
    ? `<img src="${form.firmaManuscritaDataUrl}" class="firma-manuscrita" alt="Firma manuscrita" />`
    : "";

  return `
    <div class="WordSection1 documento">
      ${headerCompuesto}

      <table class="meta-table" role="presentation">
        <tr>
          <td class="meta-left">
            ${
              form.numeroCarpetilla.trim()
                ? `Carpetilla #${escapeHtml(form.numeroCarpetilla)}`
                : "&nbsp;"
            }
          </td>
          <td class="meta-right">
            ${paragraph(descripcionInvestigacion)}
          </td>
        </tr>
      </table>

      <h1>Poder Especial</h1>

      <p class="autoridad">${paragraph(form.autoridadDestino)}</p>

      <p>${paragraph(comparecencia)}</p>

      <p>${paragraph(facultades)}</p>

      <p>${paragraph(fecha)}</p>

      <table class="firmas-table" role="presentation">
        <tr>
          <td class="firma-cell">
            <p>Otorga poder,</p>
            <div class="firma-espacio"></div>
            <p>${otorgante}</p>
          </td>

          <td class="firma-cell">
            <p>Acepta poder,</p>
            <p><strong>${escapeHtml(form.nombreFirma)}</strong></p>
            ${firma}
            <div class="firma-espacio"></div>
            <p>Lcda. ${escapeHtml(
              nombreMayuscula(form.abogadoNombre) || "[NOMBRE DEL ABOGADO]"
            )}</p>
          </td>
        </tr>
      </table>

      ${
        form.sloganFirma.trim()
          ? `<div class="footer-slogan">${escapeHtml(form.sloganFirma)}</div>`
          : ""
      }
    </div>
  `;
}

function estilosDocumento() {
  return `
    @page WordSection1 {
      size: 8.5in 14in;
      margin: 0.65in 0.75in 0.75in 0.75in;
      mso-page-orientation: portrait;
    }

    div.WordSection1 {
      page: WordSection1;
    }

    body {
      margin: 0;
      background: #ffffff;
      color: #000000;
      font-family: "Times New Roman", Times, serif;
      font-size: 11pt;
      line-height: 1.18;
    }

    .documento {
      width: 7in;
      min-height: 12.6in;
      margin: 0 auto;
      background: #ffffff;
      color: #000000;
      font-family: "Times New Roman", Times, serif;
      font-size: 11pt;
      line-height: 1.18;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      border-spacing: 0;
    }

    td {
      vertical-align: top;
      padding: 0;
    }

    .header-image-table {
      margin-bottom: 18pt;
    }

    .header-image-table td {
      text-align: center;
    }

    .header-image {
      width: 100%;
      max-width: 520px;
      height: auto;
      display: inline-block;
      object-fit: contain;
    }

    .fallback-header-table {
      margin-bottom: 18pt;
      font-size: 9pt;
      line-height: 1.08;
    }

    .fallback-header-center {
      text-align: center;
      padding-bottom: 8pt;
    }

    .fallback-header-left {
      width: 48%;
      text-align: left;
    }

    .fallback-header-right {
      width: 52%;
      text-align: right;
    }

    .fallback-logo {
      width: 220px;
      max-width: 220px;
      height: auto;
      max-height: 80px;
      object-fit: contain;
    }

    .fallback-logo-text {
      font-size: 18pt;
      font-weight: bold;
      letter-spacing: 6px;
      text-align: center;
      text-transform: uppercase;
    }

    .meta-table {
      margin-bottom: 8pt;
      font-size: 10.5pt;
      line-height: 1.12;
    }

    .meta-left {
      width: 35%;
      text-align: left;
      font-weight: normal;
      padding-right: 10pt;
    }

    .meta-right {
      width: 65%;
      text-align: right;
      font-weight: bold;
    }

    h1 {
      margin: 0 0 12pt 0;
      text-align: center;
      font-size: 13pt;
      font-style: italic;
      font-weight: bold;
      text-decoration: none;
    }

    p {
      margin: 0 0 9pt 0;
      text-align: justify;
    }

    .autoridad {
      margin-top: 0;
      margin-bottom: 10pt;
      font-weight: bold;
      text-transform: uppercase;
    }

    .firmas-table {
      margin-top: 28pt;
      page-break-inside: avoid;
    }

    .firma-cell {
      width: 50%;
      text-align: center;
      padding: 0 16pt;
      vertical-align: top;
    }

    .firma-cell p {
      text-align: center;
      margin: 0 0 6pt 0;
    }

    .firma-espacio {
      height: 42pt;
    }

    .firma-manuscrita {
      display: block;
      width: 145px;
      max-width: 145px;
      height: auto;
      max-height: 55px;
      margin: 0 auto 2pt auto;
      object-fit: contain;
    }

    .footer-slogan {
      margin-top: 28pt;
      text-align: center;
      font-size: 9.5pt;
      font-style: italic;
      font-weight: bold;
    }
  `;
}

function construirDocumentoCompleto(form: FormState) {
  const body = construirDocumentoHtml(form);

  return `
    <!DOCTYPE html>
    <html lang="es" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
      <head>
        <meta charset="utf-8" />
        <title>Poder Especial</title>
        <!--[if gte mso 9]>
        <xml>
          <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>100</w:Zoom>
            <w:DoNotOptimizeForBrowser/>
          </w:WordDocument>
        </xml>
        <![endif]-->
        <style>
          ${estilosDocumento()}
        </style>
      </head>
      <body>
        ${body}
      </body>
    </html>
  `;
}

export default function EscritosPage() {
  const [form, setForm] = useState<FormState>(initialForm);

  const documentoHtml = useMemo(() => construirDocumentoHtml(form), [form]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const cargarImagen = (
    file: File | undefined,
    key: "headerMembreteDataUrl" | "logoDataUrl" | "firmaManuscritaDataUrl"
  ) => {
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      update(key, String(reader.result || "") as FormState[typeof key]);
    };

    reader.readAsDataURL(file);
  };

  const copiarTextoPlano = async () => {
    const temp = document.createElement("div");
    temp.innerHTML = documentoHtml;
    const texto = temp.innerText;
    await navigator.clipboard.writeText(texto);
    alert("Texto copiado al portapapeles.");
  };

  const descargarWord = () => {
    const html = construirDocumentoCompleto(form);
    const blob = new Blob([html], {
      type: "application/msword;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const enlace = document.createElement("a");

    enlace.href = url;
    enlace.download = "poder-especial.doc";
    enlace.click();

    URL.revokeObjectURL(url);
  };

  const imprimir = () => {
    const ventana = window.open("", "_blank");

    if (!ventana) return;

    ventana.document.write(construirDocumentoCompleto(form));
    ventana.document.close();
    ventana.focus();
    ventana.print();
  };

  const limpiar = () => {
    const confirmar = window.confirm(
      "¿Desea limpiar el formulario y volver a los valores iniciales?"
    );

    if (confirmar) {
      setForm(initialForm);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <style>{estilosDocumento()}</style>

      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link
            href="/"
            className="rounded-xl px-3 py-2 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            ← Inicio
          </Link>

          <div className="text-center">
            <h1 className="text-lg font-semibold">Generador de Escritos</h1>
            <p className="text-xs text-slate-400">
              Módulo inicial: Poder Especial
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={copiarTextoPlano}
              className="rounded-xl border border-white/10 px-3 py-2 text-sm text-slate-200 hover:bg-white/10"
            >
              Copiar
            </button>

            <button
              onClick={descargarWord}
              className="rounded-xl bg-yellow-400 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-yellow-300"
            >
              Descargar Word
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[430px_1fr]">
        <div className="space-y-6">
          <Card
            title="1. Tipo de escrito"
            description="Por ahora se conserva únicamente la opción de Poder Especial."
          >
            <div>
              <FieldLabel>Escrito disponible</FieldLabel>
              <SelectInput value="poder_especial" onChange={() => {}}>
                <option value="poder_especial">Poder Especial</option>
              </SelectInput>
            </div>
          </Card>

          <Card
            title="2. Branding de la firma"
            description="Puede subir una sola imagen horizontal ya compuesta con logo + información completa centrada para usarla como header del documento."
          >
            <div>
              <FieldLabel>Imagen compuesta del header (recomendada)</FieldLabel>
              <input
                type="file"
                accept="image/*"
                onChange={(event) =>
                  cargarImagen(
                    event.target.files?.[0],
                    "headerMembreteDataUrl"
                  )
                }
                className="w-full rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-300"
              />
              <p className="mt-2 text-xs text-slate-400">
                Recomendado: una imagen horizontal que ya incluya logo,
                teléfonos, web, correo y dirección centrados.
              </p>

              {form.headerMembreteDataUrl && (
                <div className="mt-3 rounded-xl bg-white p-3">
                  <img
                    src={form.headerMembreteDataUrl}
                    alt="Header compuesto"
                    className="mx-auto max-h-32 object-contain"
                  />
                </div>
              )}
            </div>

            <div>
              <FieldLabel>Nombre de la firma</FieldLabel>
              <TextInput
                value={form.nombreFirma}
                onChange={(value) => update("nombreFirma", value)}
              />
            </div>

            <div>
              <FieldLabel>Slogan (saldrá en el footer del documento)</FieldLabel>
              <TextInput
                value={form.sloganFirma}
                onChange={(value) => update("sloganFirma", value)}
              />
            </div>

            <div>
              <FieldLabel>Teléfonos</FieldLabel>
              <TextInput
                value={form.telefonosFirma}
                onChange={(value) => update("telefonosFirma", value)}
              />
            </div>

            <div>
              <FieldLabel>Fax</FieldLabel>
              <TextInput
                value={form.faxFirma}
                onChange={(value) => update("faxFirma", value)}
              />
            </div>

            <div>
              <FieldLabel>Sitio web</FieldLabel>
              <TextInput
                value={form.webFirma}
                onChange={(value) => update("webFirma", value)}
              />
            </div>

            <div>
              <FieldLabel>Correo de la firma</FieldLabel>
              <TextInput
                value={form.correoFirma}
                onChange={(value) => update("correoFirma", value)}
              />
            </div>

            <div>
              <FieldLabel>Dirección de la firma</FieldLabel>
              <TextArea
                value={form.direccionFirma}
                onChange={(value) => update("direccionFirma", value)}
                rows={5}
              />
            </div>

            <div>
              <FieldLabel>Logo individual (fallback)</FieldLabel>
              <input
                type="file"
                accept="image/*"
                onChange={(event) =>
                  cargarImagen(event.target.files?.[0], "logoDataUrl")
                }
                className="w-full rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-300"
              />

              {form.logoDataUrl && (
                <div className="mt-3 rounded-xl bg-white p-3">
                  <img
                    src={form.logoDataUrl}
                    alt="Logo individual"
                    className="mx-auto max-h-24 object-contain"
                  />
                </div>
              )}
            </div>
          </Card>

          <Card
            title="3. Abogado que acepta poder"
            description="Datos del abogado o representante de la firma."
          >
            <div>
              <FieldLabel>Nombre del abogado</FieldLabel>
              <TextInput
                value={form.abogadoNombre}
                onChange={(value) => update("abogadoNombre", value)}
              />
            </div>

            <div>
              <FieldLabel>Género</FieldLabel>
              <SelectInput
                value={form.abogadoGenero}
                onChange={(value) =>
                  update("abogadoGenero", value as "mujer" | "varon")
                }
              >
                <option value="mujer">Mujer</option>
                <option value="varon">Varón</option>
              </SelectInput>
            </div>

            <div>
              <FieldLabel>Nacionalidad</FieldLabel>
              <TextInput
                value={form.abogadoNacionalidad}
                onChange={(value) => update("abogadoNacionalidad", value)}
              />
            </div>

            <div>
              <FieldLabel>Cédula</FieldLabel>
              <TextInput
                value={form.abogadoCedula}
                onChange={(value) => update("abogadoCedula", value)}
              />
            </div>

            <div>
              <FieldLabel>Cargo / condición</FieldLabel>
              <TextInput
                value={form.abogadoCargo}
                onChange={(value) => update("abogadoCargo", value)}
              />
            </div>

            <div>
              <FieldLabel>Oficinas</FieldLabel>
              <TextArea
                value={form.abogadoOficinas}
                onChange={(value) => update("abogadoOficinas", value)}
                rows={3}
              />
            </div>

            <div>
              <FieldLabel>Teléfonos</FieldLabel>
              <TextInput
                value={form.abogadoTelefonos}
                onChange={(value) => update("abogadoTelefonos", value)}
              />
            </div>

            <div>
              <FieldLabel>Correos electrónicos</FieldLabel>
              <TextInput
                value={form.abogadoCorreos}
                onChange={(value) => update("abogadoCorreos", value)}
              />
            </div>

            <div>
              <FieldLabel>Firma manuscrita opcional</FieldLabel>
              <input
                type="file"
                accept="image/*"
                onChange={(event) =>
                  cargarImagen(
                    event.target.files?.[0],
                    "firmaManuscritaDataUrl"
                  )
                }
                className="w-full rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-300"
              />

              {form.firmaManuscritaDataUrl && (
                <div className="mt-3 rounded-xl bg-white p-3">
                  <img
                    src={form.firmaManuscritaDataUrl}
                    alt="Firma manuscrita"
                    className="mx-auto max-h-20 object-contain"
                  />
                </div>
              )}
            </div>
          </Card>

          <Card
            title="4. Cliente / poderdante"
            description="Datos de la persona natural o representante legal."
          >
            <div>
              <FieldLabel>Tipo de poderdante</FieldLabel>
              <SelectInput
                value={form.tipoPoderdante}
                onChange={(value) =>
                  update("tipoPoderdante", value as TipoPoderdante)
                }
              >
                <option value="persona_natural">Persona natural</option>
                <option value="persona_juridica">
                  Persona jurídica / sociedad
                </option>
              </SelectInput>
            </div>

            <div>
              <FieldLabel>
                {form.tipoPoderdante === "persona_juridica"
                  ? "Nombre del representante legal"
                  : "Nombre del cliente"}
              </FieldLabel>
              <TextInput
                value={form.clienteNombre}
                onChange={(value) => update("clienteNombre", value)}
                placeholder="Ejemplo: Juan Pérez Castillo"
              />
            </div>

            <div>
              <FieldLabel>Género</FieldLabel>
              <SelectInput
                value={form.clienteGenero}
                onChange={(value) =>
                  update("clienteGenero", value as "varon" | "mujer")
                }
              >
                <option value="varon">Varón</option>
                <option value="mujer">Mujer</option>
              </SelectInput>
            </div>

            <div>
              <FieldLabel>Nacionalidad</FieldLabel>
              <TextInput
                value={form.clienteNacionalidad}
                onChange={(value) => update("clienteNacionalidad", value)}
              />
            </div>

            <div>
              <FieldLabel>Cédula / pasaporte</FieldLabel>
              <TextInput
                value={form.clienteCedulaPasaporte}
                onChange={(value) => update("clienteCedulaPasaporte", value)}
              />
            </div>

            <div>
              <FieldLabel>Domicilio completo</FieldLabel>
              <TextArea
                value={form.clienteDomicilio}
                onChange={(value) => update("clienteDomicilio", value)}
                rows={3}
              />
            </div>

            <div>
              <FieldLabel>Teléfono</FieldLabel>
              <TextInput
                value={form.clienteTelefono}
                onChange={(value) => update("clienteTelefono", value)}
              />
            </div>

            <div>
              <FieldLabel>Correos electrónicos</FieldLabel>
              <TextInput
                value={form.clienteCorreos}
                onChange={(value) => update("clienteCorreos", value)}
              />
            </div>
          </Card>

          {form.tipoPoderdante === "persona_juridica" && (
            <Card
              title="5. Datos de la sociedad"
              description="Solo aplica cuando el poder lo otorga una sociedad."
            >
              <div>
                <FieldLabel>Nombre de la sociedad</FieldLabel>
                <TextInput
                  value={form.sociedadNombre}
                  onChange={(value) => update("sociedadNombre", value)}
                />
              </div>

              <div>
                <FieldLabel>Tipo de sociedad</FieldLabel>
                <TextInput
                  value={form.sociedadTipo}
                  onChange={(value) => update("sociedadTipo", value)}
                />
              </div>

              <div>
                <FieldLabel>Folio mercantil</FieldLabel>
                <TextInput
                  value={form.sociedadFolio}
                  onChange={(value) => update("sociedadFolio", value)}
                />
              </div>

              <div>
                <FieldLabel>Cargo del representante</FieldLabel>
                <TextInput
                  value={form.representanteCargo}
                  onChange={(value) => update("representanteCargo", value)}
                />
              </div>
            </Card>
          )}

          <Card
            title="6. Carpetilla e investigación"
            description="Carpetilla a la izquierda y descripción del proceso a la derecha."
          >
            <div>
              <FieldLabel>Número de carpetilla</FieldLabel>
              <TextInput
                value={form.numeroCarpetilla}
                onChange={(value) => update("numeroCarpetilla", value)}
              />
            </div>

            <div>
              <FieldLabel>Descripción completa de la investigación</FieldLabel>
              <TextArea
                value={form.descripcionInvestigacion}
                onChange={(value) =>
                  update("descripcionInvestigacion", value)
                }
                rows={4}
              />
            </div>

            <div>
              <FieldLabel>Tipo de proceso / investigación</FieldLabel>
              <TextInput
                value={form.tipoProceso}
                onChange={(value) => update("tipoProceso", value)}
              />
            </div>

            <div>
              <FieldLabel>Persona investigada / contraparte</FieldLabel>
              <TextInput
                value={form.contraparte}
                onChange={(value) => update("contraparte", value)}
              />
            </div>

            <div>
              <FieldLabel>Delito o materia</FieldLabel>
              <TextArea
                value={form.delitoOMateria}
                onChange={(value) => update("delitoOMateria", value)}
                rows={3}
              />
            </div>

            <div>
              <FieldLabel>Persona en perjuicio de quien se investiga</FieldLabel>
              <TextInput
                value={form.perjudicado}
                onChange={(value) => update("perjudicado", value)}
              />
            </div>
          </Card>

          <Card
            title="7. Autoridad y finalidad"
            description="Despacho destinatario y finalidad concreta del poder."
          >
            <div>
              <FieldLabel>Autoridad o despacho destinatario</FieldLabel>
              <TextArea
                value={form.autoridadDestino}
                onChange={(value) => update("autoridadDestino", value)}
                rows={3}
              />
            </div>

            <div>
              <FieldLabel>Finalidad del poder</FieldLabel>
              <TextArea
                value={form.finalidadPoder}
                onChange={(value) => update("finalidadPoder", value)}
                rows={4}
              />
            </div>
          </Card>

          <Card
            title="8. Facultades y fecha"
            description="Bloque preconstituido de facultades generales."
          >
            <label className="flex items-start gap-3 rounded-xl border border-white/10 bg-slate-900/50 p-3 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={form.incluirFacultadesTransaccion}
                onChange={(event) =>
                  update("incluirFacultadesTransaccion", event.target.checked)
                }
                className="mt-1"
              />
              <span>
                Incluir facultades para transigir, ratificar, allanarse y
                desistir.
              </span>
            </label>

            <label className="flex items-start gap-3 rounded-xl border border-white/10 bg-slate-900/50 p-3 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={form.incluirFacultadesSustitucion}
                onChange={(event) =>
                  update("incluirFacultadesSustitucion", event.target.checked)
                }
                className="mt-1"
              />
              <span>Incluir facultades para sustituir y reasumir.</span>
            </label>

            <label className="flex items-start gap-3 rounded-xl border border-white/10 bg-slate-900/50 p-3 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={form.incluirFacultadesRecursos}
                onChange={(event) =>
                  update("incluirFacultadesRecursos", event.target.checked)
                }
                className="mt-1"
              />
              <span>
                Incluir facultades para interponer recursos y presentar
                solicitudes.
              </span>
            </label>

            <div>
              <FieldLabel>Facultades adicionales</FieldLabel>
              <TextArea
                value={form.facultadesAdicionales}
                onChange={(value) => update("facultadesAdicionales", value)}
                rows={3}
              />
            </div>

            <div>
              <FieldLabel>Ciudad</FieldLabel>
              <TextInput
                value={form.ciudad}
                onChange={(value) => update("ciudad", value)}
              />
            </div>

            <label className="flex items-start gap-3 rounded-xl border border-white/10 bg-slate-900/50 p-3 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={form.usarFechaPresentacion}
                onChange={(event) =>
                  update("usarFechaPresentacion", event.target.checked)
                }
                className="mt-1"
              />
              <span>Usar frase: “a la fecha de su presentación”.</span>
            </label>

            {!form.usarFechaPresentacion && (
              <div>
                <FieldLabel>Fecha en texto</FieldLabel>
                <TextInput
                  value={form.fechaTexto}
                  onChange={(value) => update("fechaTexto", value)}
                  placeholder="Ejemplo: 5 de junio de 2026"
                />
              </div>
            )}

            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <button
                onClick={imprimir}
                className="w-full rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-slate-200 hover:bg-white/10"
              >
                Imprimir / PDF
              </button>

              <button
                onClick={limpiar}
                className="w-full rounded-xl border border-red-400/30 px-4 py-3 text-sm font-semibold text-red-200 hover:bg-red-400/10"
              >
                Limpiar
              </button>
            </div>
          </Card>
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <Card
            title="Vista previa"
            description="Si subes una imagen compuesta del membrete, esa será la que se use en el header del documento."
          >
            <div className="overflow-auto rounded-xl bg-white p-4 text-slate-950">
              <div
                className="mx-auto min-h-[1344px] w-[816px] bg-white p-8 shadow-2xl"
                dangerouslySetInnerHTML={{ __html: documentoHtml }}
              />
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
