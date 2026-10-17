import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { getTranslations } from "next-intl/server";
import { locales, type Locale } from "@/i18n/config";

export const runtime = "nodejs";

const MAX_REQUEST_BYTES = 1024 * 1024;
const MAX_FIELD_LENGTH = 10000;

class ContactRequestError extends Error {
  constructor(public status: number) {
    super("Invalid contact request");
  }
}

function requestLocale(request: NextRequest): Locale {
  const preferred = (request.headers.get("accept-language") || "")
    .split(",")
    .map(value => value.trim().split(";")[0].toLowerCase().split("-")[0])
    .find(value => locales.includes(value as Locale));
  const candidate = preferred || request.cookies.get("locale")?.value;
  return locales.includes(candidate as Locale) ? candidate as Locale : "ru";
}

async function readContactBody(request: NextRequest): Promise<Record<string, unknown>> {
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
    throw new ContactRequestError(415);
  }
  if (Number(request.headers.get("content-length")) > MAX_REQUEST_BYTES) throw new ContactRequestError(413);
  if (!request.body) throw new ContactRequestError(400);

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_REQUEST_BYTES) {
        await reader.cancel();
        throw new ContactRequestError(413);
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  try {
    const body: unknown = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(Buffer.concat(chunks)));
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error("Expected an object");
    return body as Record<string, unknown>;
  } catch {
    throw new ContactRequestError(400);
  }
}

function escapeHtml(value: string): string {
  const replacements: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  return value.replace(/[&<>"']/g, character => replacements[character]);
}

export async function POST(request: NextRequest) {
  const locale = requestLocale(request);
  const t = await getTranslations({ locale });

  try {
    const body = await readContactBody(request);
    const fields = [body.name, body.email, body.company, body.description];
    if (fields.some(value => typeof value !== "string" || !value.trim())) {
      return NextResponse.json({ error: t("contact.form.validation.allFieldsRequired") }, { status: 400 });
    }
    if (fields.some(value => (value as string).length > MAX_FIELD_LENGTH)) throw new ContactRequestError(400);

    const name = (body.name as string).trim();
    const email = (body.email as string).trim();
    const company = (body.company as string).trim();
    const description = (body.description as string).trim();
    if (name.length < 2) return NextResponse.json({ error: t("contact.form.validation.nameMin") }, { status: 400 });
    if (email.length > 254 || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email)) {
      return NextResponse.json({ error: t("contact.form.validation.emailInvalid") }, { status: 400 });
    }
    if (description.length < 10) return NextResponse.json({ error: t("contact.form.validation.descriptionMin") }, { status: 400 });

    const labels = {
      heading: t("contact.email.notificationHeading"),
      automatic: t("contact.email.automaticMessage"),
      date: t("contact.email.dateLabel"),
      client: t("contact.email.clientInfo"),
      name: t("contact.email.nameLabel"),
      email: t("contact.email.emailLabel"),
      company: t("contact.email.companyLabel"),
      description: t("contact.email.descriptionLabel"),
    };
    const date = new Date().toLocaleString({ ru: "ru-RU", kk: "kk-KZ", en: "en-GB" }[locale], { timeZone: "Asia/Almaty" });
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.CONTACT_RECIPIENT || "info@ipec-energy.com",
      subject: t("contact.form.messages.emailSubject", { name, company }).replace(/[\r\n]+/g, " "),
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">${escapeHtml(labels.heading)}</h2>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #495057; margin-top: 0;">${escapeHtml(labels.client)}:</h3>
            <p><strong>${escapeHtml(labels.name)}:</strong> ${escapeHtml(name)}</p>
            <p><strong>${escapeHtml(labels.email)}:</strong> ${escapeHtml(email)}</p>
            <p><strong>${escapeHtml(labels.company)}:</strong> ${escapeHtml(company)}</p>
          </div>
          <div style="background-color: #fff; padding: 20px; border-left: 4px solid #007bff; margin: 20px 0;">
            <h3 style="color: #495057; margin-top: 0;">${escapeHtml(labels.description)}:</h3>
            <p style="line-height: 1.6; color: #333; white-space: pre-wrap;">${escapeHtml(description)}</p>
          </div>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; font-size: 12px; color: #6c757d;">
            <p>${escapeHtml(labels.automatic)}</p>
            <p>${escapeHtml(labels.date)}: ${escapeHtml(date)}</p>
          </div>
        </div>
      `,
      text: [
        labels.heading, "", `${labels.client}:`, `${labels.name}: ${name}`, `${labels.email}: ${email}`,
        `${labels.company}: ${company}`, "", `${labels.description}:`, description, "", labels.automatic, `${labels.date}: ${date}`,
      ].join("\n"),
    });

    return NextResponse.json({ message: t("contact.form.messages.successResponse") });
  } catch (error) {
    if (!(error instanceof ContactRequestError)) console.error("Contact form delivery failed.");
    return NextResponse.json(
      { error: t("contact.form.messages.errorSubmitting") },
      { status: error instanceof ContactRequestError ? error.status : 500 },
    );
  }
}
