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
  sloganFirma: "CALIDAD Y SEGUIMIENTO",
  telefonosFirma: "(507) 201-5532/33",
  faxFirma: "(507) 201-5534",
  webFirma: "www.rachlaw.com",
  correoFirma: "info@rachlaw.com",
  direccionFirma:
    "APARTADO 0831-00674, ZONA PAITILLA\nPANAMÁ, REP. DE PANAMÁ\nCALLE 54 OBARRIO (diagonal a Generali)\nEDIFICIO TWIST TOWER 54 (Global Hotel)\nPISO 30, OFICINAS 30-D",

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

  const contraparte = form.contraparte.trim() || "__________";
  const delito = form.delitoOMateria.trim() || "__________";
  const perjudicado =
    form.perjudicado.trim() ||
    form.clienteNombre.trim() ||
    form.sociedadNombre.trim() ||
    "__________";

  return `${form.tipoProceso || "Investigación seguida"} a ${contraparte} por la comisión de un delito contra ${delito} en perjuicio de ${perjudicado}.`;
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
    }, comparezco respetuosamente ante su despacho con el propósito de conferir Poder Especial, amplio y suficiente, a la firma ${
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
    }, con el fin de que asuman mi representación dentro de ${descripcion}`;
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
    facultades.push(
      "interponer recursos",
      "presentar solicitudes",
      "promover acciones legales"
    );
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

function construirDocumentoHtml(form: FormState) {
  const descripcionInvestigacion = construirDescripcionInvestigacion(form);
  const comparecencia = construirComparecencia(form);
  const facultades = construirFacultades(form);
  const fecha = form.usarFechaPresentacion
    ? `${form.ciudad || "Panamá"}, a la fecha de su presentación.`
    : `${form.ciudad || "Panamá"}, ${form.fechaTexto || "[FECHA]"}.`;

  const otorgante =
    form.tipoPoderdante === "persona_juridica"
      ? `${form.sociedadNombre || "[SOCIEDAD]"}<br />${
          form.clienteNombre || "[REPRESENTANTE LEGAL]"
        }<br />${form.clienteCedulaPasaporte || "[DOCUMENTO]"}`
      : `${form.clienteNombre || "[NOMBRE DEL CLIENTE]"}<br />${
          form.clienteCedulaPasaporte || "[DOCUMENTO]"
        }`;

  const logo = form.logoDataUrl
    ? `<img src="${form.logoDataUrl}" class="logo-firma" alt="Logo de la firma" />`
    : `<div class="logo-texto">${escapeHtml(form.nombreFirma)}</div>`;

  const firma = form.firmaManuscritaDataUrl
    ? `<img src="${form.firmaManuscritaDataUrl}" class="firma-manuscrita" alt="Firma manuscrita" />`
    : "";

  return `
    <div class="documento">
      <header class="letterhead">
        <div class="logo-center">
          ${logo}
        </div>

        <div class="membrete-grid">
          <div class="membrete-left">
            <div><strong>TELÉFONOS:</strong> ${escapeHtml(
              form.telefonosFirma
            )}</div>
            <div><strong>FAX:</strong> ${escapeHtml(form.faxFirma)}</div>
            <div>${escapeHtml(form.webFirma)}</div>
            <div>${escapeHtml(form.correoFirma)}</div>
          </div>

          <div class="membrete-right">
            ${paragraph(form.direccionFirma)}
          </div>
        </div>
      </header>

      <section class="datos-superiores">
        <div class="carpetilla">
          ${
            form.numeroCarpetilla.trim()
              ? `Carpetilla #${escapeHtml(form.numeroCarpetilla)}`
              : "&nbsp;"
          }
        </div>

        <div class="descripcion-investigacion">
          ${paragraph(descripcionInvestigacion)}
        </div>
      </section>

      <main>
        <h1>Poder Especial</h1>

        <p class="autoridad">${paragraph(form.autoridadDestino)}</p>

        <p>${paragraph(comparecencia)}</p>

        <p>${paragraph(facultades)}</p>

        <p>${paragraph(fecha)}</p>

        <div class="firmas">
          <div class="firma-bloque">
            <p>Otorga poder,</p>
            <div class="linea"></div>
            <p>${otorgante}</p>
          </div>

          <div class="firma-bloque">
            <p>Acepta poder,</p>
            <p><strong>${escapeHtml(form.nombreFirma)}</strong></p>
            ${firma}
            <div class="linea"></div>
            <p>Lcda. ${escapeHtml(
              nombreMayuscula(form.abogadoNombre) || "[NOMBRE DEL ABOGADO]"
            )}</p>
          </div>
        </div>
      </main>

      ${
        form.sloganFirma
          ? `<footer>“${escapeHtml(form.sloganFirma)}”</footer>`
          : ""
      }
    </div>
  `;
}

function construirDocumentoCompleto(form: FormState) {
  const body = construirDocumentoHtml(form);

  return `
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="utf-8" />
        <title>Poder Especial</title>
        <style>
          @page {
            size: legal;
            margin: 0.85in 0.85in 0.85in 0.85in;
          }

          body {
            margin: 0;
            background: #ffffff;
            color: #111827;
            font-family: "Times New Roman", Times, serif;
            font-size: 12pt;
            line-height: 1.42;
          }

          .documento {
            width: 8.5in;
            min-height: 14in;
            margin: 0 auto;
            background: #ffffff;
          }

          .letterhead {
            margin-bottom: 26px;
            font-size: 9pt;
            line-height: 1.25;
          }

          .logo-center {
            text-align: center;
            margin-bottom: 10px;
          }

          .logo-firma {
            display: inline-block;
            max-width: 390px;
            max-height: 110px;
            object-fit: contain;
          }

          .logo-texto {
            display: inline-block;
            font-size: 20pt;
            font-weight: bold;
            letter-spacing: 7px;
            color: #111827;
            text-transform: uppercase;
          }

          .membrete-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 26px;
            width: 100%;
          }

          .membrete-left {
            text-align: left;
          }

          .membrete-right {
            text-align: right;
          }

          .datos-superiores {
            display: grid;
            grid-template-columns: 0.85fr 1.15fr;
            gap: 28px;
            align-items: start;
            margin-bottom: 24px;
            font-size: 11pt;
          }

          .carpetilla {
            text-align: left;
            font-weight: normal;
          }

          .descripcion-investigacion {
            text-align: right;
            font-weight: bold;
            line-height: 1.35;
          }

          h1 {
            text-align: center;
            font-size: 16pt;
            font-style: italic;
            font-weight: normal;
            margin: 0 0 24px 0;
            text-decoration: none;
          }

          p {
            margin: 0 0 14px 0;
            text-align: justify;
          }

          .autoridad {
            font-weight: bold;
            text-transform: uppercase;
            margin-top: 8px;
            margin-bottom: 16px;
          }

          .firmas {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 52px;
            margin-top: 48px;
          }

          .firma-bloque {
            text-align: center;
          }

          .firma-bloque p {
            text-align: center;
            margin-bottom: 8px;
          }

          .firma-manuscrita {
            display: block;
            max-width: 180px;
            max-height: 75px;
            object-fit: contain;
            margin: 4px auto 0 auto;
          }

          .linea {
            border-top: 1px solid #111827;
            height: 1px;
            margin: 42px auto 8px auto;
            width: 85%;
          }

          footer {
            text-align: center;
            font-size: 10pt;
            font-weight: bold;
            margin-top: 64px;
          }
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
    key: "logoDataUrl" | "firmaManuscritaDataUrl"
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
            description="Datos que aparecerán en el membrete y en la aceptación del poder."
          >
            <div>
              <FieldLabel>Nombre de la firma</FieldLabel>
              <TextInput
                value={form.nombreFirma}
                onChange={(value) => update("nombreFirma", value)}
              />
            </div>

            <div>
              <FieldLabel>Slogan</FieldLabel>
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
              <FieldLabel>Logo de la firma</FieldLabel>
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
                    alt="Logo de la firma"
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
                placeholder="Urbanización, calle, edificio, apartamento/oficina, corregimiento, distrito y provincia"
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
            description="Esta información aparece debajo del membrete: carpetilla a la izquierda y descripción del proceso a la derecha."
          >
            <div>
              <FieldLabel>Número de carpetilla</FieldLabel>
              <TextInput
                value={form.numeroCarpetilla}
                onChange={(value) => update("numeroCarpetilla", value)}
                placeholder="Ejemplo: 201900065074"
              />
            </div>

            <div>
              <FieldLabel>Descripción completa de la investigación</FieldLabel>
              <TextArea
                value={form.descripcionInvestigacion}
                onChange={(value) =>
                  update("descripcionInvestigacion", value)
                }
                rows={5}
                placeholder="Ejemplo: Investigación seguida a ______ por la comisión de un delito contra ______ en perjuicio de ______."
              />
            </div>

            <div>
              <FieldLabel>Tipo de proceso / investigación</FieldLabel>
              <TextInput
                value={form.tipoProceso}
                onChange={(value) => update("tipoProceso", value)}
                placeholder="Investigación seguida"
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
                placeholder="Ejemplo: la fe pública, el patrimonio económico, el honor de la persona natural..."
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
                Incluir facultades para interponer recursos, presentar
                solicitudes y promover acciones legales.
              </span>
            </label>

            <div>
              <FieldLabel>Facultades adicionales</FieldLabel>
              <TextArea
                value={form.facultadesAdicionales}
                onChange={(value) => update("facultadesAdicionales", value)}
                rows={3}
                placeholder="Ejemplo: retirar copias, solicitar autenticaciones, gestionar notificaciones..."
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
            description="Vista previa en tamaño LEGAL / oficio. Puede copiar, imprimir o descargar en Word."
          >
            <div className="overflow-auto rounded-xl bg-white p-4 text-slate-950">
              <div
                className="mx-auto min-h-[1344px] max-w-[816px] bg-white p-8 text-[12pt] leading-relaxed shadow-2xl"
                style={{ fontFamily: "Times New Roman, Times, serif" }}
                dangerouslySetInnerHTML={{ __html: documentoHtml }}
              />
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
