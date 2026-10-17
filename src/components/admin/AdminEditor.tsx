"use client";

import { upload } from "@vercel/blob/client";
import Image from "next/image";
import {
  ArrowDownToLine, ArrowUpRight, Check, CheckCircle2, ChevronRight,
  CircleHelp, ContactRound, FileText, Globe2, ImageIcon, LayoutTemplate,
  LoaderCircle, LogOut, MapPin, Plus, RotateCcw, Search, Settings2,
  ShieldCheck, Sparkles, Trash2, Upload, Users, Video, X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  mediaFields,
  type Locale,
  type MediaKey,
  type MessageTree,
  type SiteContent,
} from "@/lib/content/model";

type Props = {
  initialContent: SiteContent;
  initialEtag: string | null;
  storageConfigured: boolean;
};
type MessageField = { path: string[]; value: string | string[] };
type Section = { id: string; label: string; icon: LucideIcon; keys: string[]; description: string };
type Notice = { kind: "success" | "error"; message: string; fields?: string[]; conflict?: boolean; expired?: boolean };
type ContentResponse = { content: SiteContent; etag: string | null; storageConfigured?: boolean };

const sections: Section[] = [
  { id: "hero", label: "Первый экран", icon: LayoutTemplate, keys: ["hero"], description: "Первое, что видит посетитель: название компании и кнопка связи." },
  { id: "about", label: "О компании", icon: FileText, keys: ["about"], description: "Расскажите о компании, её опыте и подходе к работе." },
  { id: "services", label: "Услуги", icon: Settings2, keys: ["services"], description: "Заголовки, описания и списки услуг компании." },
  { id: "advantages", label: "Преимущества", icon: Sparkles, keys: ["advantages"], description: "Сильные стороны компании и приглашение к сотрудничеству." },
  { id: "experience", label: "Проекты и опыт", icon: Globe2, keys: ["experienceSection", "experience"], description: "Описание опыта, категории работ и тексты каждого проекта." },
  { id: "team", label: "Команда (скрыта)", icon: Users, keys: ["team"], description: "Этот раздел сейчас скрыт на сайте. Здесь можно подготовить имена, должности и описания; редактирование не включает его отображение." },
  { id: "contact", label: "Форма и письма", icon: ContactRound, keys: ["contact"], description: "Поля формы, сообщения посетителю и тексты уведомлений по почте." },
  { id: "footer", label: "Контакты и подвал", icon: MapPin, keys: ["footer"], description: "Адрес, приглашение связаться с вами и подпись внизу сайта." },
  { id: "navigation", label: "Навигация", icon: LayoutTemplate, keys: ["navigation"], description: "Названия разделов в меню сайта." },
  { id: "meta", label: "Название и описание", icon: Globe2, keys: ["meta"], description: "Название вкладки, описание для поисковиков и подпись логотипа." },
];

const keyLabels: Record<string, string> = {
  title: "Заголовок", subtitle: "Подзаголовок", description: "Описание", description1: "Описание · первый абзац",
  description2: "Описание · второй абзац", description3: "Описание · третий абзац", contactButton: "Кнопка связи",
  contactDescription: "Текст рядом с кнопкой связи", name: "Имя", position: "Должность", logoAlt: "Подпись логотипа",
  services: "Список услуг", advantages: "Преимущества", experience: "Наш опыт", about: "О нас", team: "Команда",
  contacts: "Контакты", showMore: "Кнопка «Показать больше»", contactUs: "Приглашение написать", futureTitle: "Заголовок приглашения",
  address: "Подпись адреса", addressText: "Адрес компании", copyright: "Авторские права", email: "Электронная почта",
  company: "Компания", submit: "Кнопка отправки", submitting: "Кнопка во время отправки", nameMin: "Ошибка: короткое имя",
  emailInvalid: "Ошибка: неверная почта", companyRequired: "Ошибка: компания не указана", descriptionMin: "Ошибка: короткое обращение",
  allFieldsRequired: "Ошибка: не все поля заполнены", success: "Успешная отправка", errorGeneral: "Общая ошибка отправки",
  errorSending: "Ошибка отправки", errorSubmitting: "Ошибка обращения", emailSubject: "Тема письма с обращением",
  successResponse: "Подтверждение отправки", notificationHeading: "Заголовок письма", automaticMessage: "Подпись автоматического письма",
  dateLabel: "Подпись даты", clientInfo: "Заголовок данных клиента", nameLabel: "Подпись имени", emailLabel: "Подпись почты",
  companyLabel: "Подпись компании", descriptionLabel: "Подпись обращения", all: "Все работы", management: "Управление активами",
  assetManagement: "Управление активами", oilService: "Инженерные услуги", maDeals: "Сопровождение сделок (M&A)",
  dueDiligence: "Due Diligence", dueDiligenceCarousel: "Due Diligence", automation: "Автоматизация", newTechnologies: "Новые технологии",
  "bisuness-valuation": "Оценка бизнеса", "valuation-spe-prms": "Оценка запасов по SPE PRMS", expertise: "Экспертиза",
  licenses: "Лицензии", support: "Сопровождение", flexibility: "Гибкость", carousel: "Карточки услуг", details: "Подробности",
  projects: "Проекты", categories: "Категории проектов", members: "Участники команды", form: "Форма обращения",
  placeholders: "Подсказки в полях", validation: "Проверка полей", messages: "Сообщения и результат отправки",
  strategy: "Стратегия", anticrisis: "Антикризисное управление", restructuring: "Реструктуризация", audit: "Аудит",
  optimization: "Оптимизация", systems: "Системы и процессы", cost: "Стоимостная инженерия", development: "Развитие",
  evaluation: "Оценка", structuring: "Структурирование", diligence: "Комплексная проверка", negotiations: "Переговоры",
  financial: "Финансовый анализ", legal: "Правовая экспертиза", technical: "Техническая экспертиза", commercial: "Коммерческая оценка",
};

const languages: { id: Locale; short: string; name: string }[] = [
  { id: "ru", short: "RU", name: "Русский" },
  { id: "kk", short: "KZ", name: "Қазақша" },
  { id: "en", short: "EN", name: "English" },
];

function flattenMessages(tree: MessageTree, prefix: string[] = []): MessageField[] {
  return Object.entries(tree).flatMap(([key, value]) => {
    const path = [...prefix, key];
    return typeof value === "string" || Array.isArray(value)
      ? [{ path, value }]
      : flattenMessages(value, path);
  });
}

function valueAt(tree: MessageTree, path: string[]): MessageTree[string] | undefined {
  let value: MessageTree[string] = tree;
  for (const key of path) {
    if (!value || typeof value === "string" || Array.isArray(value)) return undefined;
    value = value[key];
  }
  return value;
}

function replaceValue(tree: MessageTree, path: string[], value: string | string[]): MessageTree {
  const next = structuredClone(tree);
  let current = next;
  for (const key of path.slice(0, -1)) current = current[key] as MessageTree;
  current[path[path.length - 1]] = value;
  return next;
}

function comparableContent(content: SiteContent): Record<string, string> {
  const result: Record<string, string> = {};
  for (const { id } of languages) {
    for (const field of flattenMessages(content.messages[id])) {
      if (Array.isArray(field.value)) {
        field.value.forEach((value, index) => { result[`${id}.${field.path.join(".")}.${index}`] = value; });
      } else result[`${id}.${field.path.join(".")}`] = field.value;
    }
  }
  for (const [key, value] of Object.entries(content.media)) result[`media.${key}`] = value;
  for (const [key, value] of Object.entries(content.settings)) result[`settings.${key}`] = value;
  return result;
}

function nounCount(count: number): string {
  const last = count % 10;
  const lastTwo = count % 100;
  return last === 1 && lastTwo !== 11 ? "изменение" : last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14) ? "изменения" : "изменений";
}

function groupLabel(path: string[], russian: MessageTree): string {
  if (path.length < 2) return "Основные тексты";
  return path.slice(1).map((key, index) => {
    if (key === "email") return "Уведомления по почте";
    if (keyLabels[key]) return keyLabels[key];
    const branch = valueAt(russian, path.slice(0, index + 2));
    if (branch && typeof branch !== "string" && !Array.isArray(branch)) {
      const title = branch.name || branch.title;
      if (typeof title === "string") return title;
    }
    return key;
  }).join(" / ");
}

function fieldLabel(field: MessageField, russian: MessageTree): string {
  const key = field.path[field.path.length - 1];
  if (field.path[0] === "navigation") {
    const value = valueAt(russian, field.path);
    if (typeof value === "string") return value;
  }
  if (keyLabels[key]) return keyLabels[key];
  const value = valueAt(russian, field.path);
  return typeof value === "string" ? value : key;
}

function TextArea({ id, value, onChange, disabled, describedBy }: {
  id: string; value: string; onChange: (value: string) => void; disabled: boolean; describedBy?: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    ref.current.style.height = "auto";
    ref.current.style.height = `${Math.max(48, Math.min(360, ref.current.scrollHeight + 2))}px`;
  }, [value]);
  return <textarea ref={ref} id={id} value={value} onChange={(event) => onChange(event.target.value)} disabled={disabled} rows={2} aria-describedby={describedBy} spellCheck />;
}

export default function AdminEditor({ initialContent, initialEtag, storageConfigured }: Props) {
  const [draft, setDraft] = useState(initialContent);
  const [saved, setSaved] = useState(initialContent);
  const [etag, setEtag] = useState(initialEtag);
  const [configured, setConfigured] = useState(storageConfigured);
  const [language, setLanguage] = useState<Locale>("ru");
  const [section, setSection] = useState("hero");
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [reloading, setReloading] = useState(false);
  const [uploading, setUploading] = useState<{ key: MediaKey; percentage: number } | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const mainRef = useRef<HTMLElement>(null);
  const leavingRef = useRef(false);
  const busy = saving || reloading || uploading !== null;
  const draftValues = useMemo(() => comparableContent(draft), [draft]);
  const savedValues = useMemo(() => comparableContent(saved), [saved]);
  const dirtyKeys = useMemo(() => new Set([...new Set([...Object.keys(draftValues), ...Object.keys(savedValues)])].filter((key) => draftValues[key] !== savedValues[key])), [draftValues, savedValues]);
  const dirtyCount = dirtyKeys.size;
  const allSections = useMemo(() => [
    ...sections,
    ...Object.keys(draft.messages.ru).filter((key) => !sections.some((item) => item.keys.includes(key))).map((key) => ({ id: key, label: keyLabels[key] || key, icon: FileText, keys: [key], description: "Дополнительные тексты сайта." })),
  ], [draft.messages.ru]);
  const fields = useMemo(() => flattenMessages(draft.messages[language]), [draft.messages, language]);
  const search = query.trim().toLocaleLowerCase();
  const activeSection = allSections.find((item) => item.id === section);
  const visibleFields = fields.filter((field) => {
    if (search) {
      const russian = valueAt(draft.messages.ru, field.path);
      const haystack = [fieldLabel(field, draft.messages.ru), groupLabel(field.path.slice(0, -1), draft.messages.ru), ...[field.value].flat(), ...[russian].flat()].join(" ").toLocaleLowerCase();
      return haystack.includes(search);
    }
    return activeSection?.keys.includes(field.path[0]);
  });
  const groupedFields = visibleFields.reduce<Map<string, MessageField[]>>((groups, field) => {
    const key = field.path.slice(0, -1).join(".");
    groups.set(key, [...(groups.get(key) || []), field]);
    return groups;
  }, new Map());
  const isMedia = section === "media" && !search;
  const isSettings = section === "settings" && !search;
  const sectionTitle = search ? "Результаты поиска" : isMedia ? "Фото и видео" : isSettings ? "Контактные данные" : activeSection?.label || "Тексты сайта";

  useEffect(() => {
    if (!dirtyCount && !uploading) return;
    const beforeUnload = (event: BeforeUnloadEvent) => { if (!leavingRef.current) { event.preventDefault(); event.returnValue = ""; } };
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [dirtyCount, uploading]);

  useEffect(() => {
    if (notice?.kind === "error") document.getElementById("admin-notice")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [notice]);

  function updateMessage(path: string[], value: string | string[]) {
    setDraft((current) => ({ ...current, messages: { ...current.messages, [language]: replaceValue(current.messages[language], path, value) } }));
    setNotice((current) => current?.kind === "success" ? null : current);
  }

  function selectSection(id: string) {
    setSection(id);
    setQuery("");
    mainRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function publish() {
    if (busy || !dirtyCount || !configured) return;
    setSaving(true);
    setNotice(null);
    try {
      const response = await fetch("/api/admin/content", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content: draft, etag }) });
      const result = await response.json();
      if (!response.ok) {
        setNotice({ kind: "error", message: result.fields?.length ? "Проверьте указанные поля. Тексты не должны быть пустыми и могут содержать до 10 000 символов." : result.error || "Не удалось опубликовать изменения. Попробуйте ещё раз.", fields: result.fields, conflict: response.status === 409, expired: response.status === 401 });
        return;
      }
      const data = result as ContentResponse;
      setDraft(data.content);
      setSaved(data.content);
      setEtag(data.etag);
      setNotice({ kind: "success", message: "Изменения опубликованы. Обновлённые тексты и файлы доступны на сайте." });
    } catch {
      setNotice({ kind: "error", message: "Не удалось связаться с сервером. Проверьте подключение и повторите публикацию. Ваши изменения сохранены в этой вкладке." });
    } finally { setSaving(false); }
  }

  async function reloadLatest() {
    if (busy || (dirtyCount > 0 && !window.confirm("Загрузить опубликованную версию? Неопубликованные изменения в этой вкладке будут заменены. Перед этим вы можете скачать копию черновика."))) return;
    setReloading(true);
    setNotice(null);
    try {
      const response = await fetch("/api/admin/content", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) {
        setNotice({ kind: "error", message: result.error || "Не удалось загрузить опубликованную версию.", expired: response.status === 401 });
        return;
      }
      const data = result as ContentResponse;
      setDraft(data.content); setSaved(data.content); setEtag(data.etag);
      if (typeof data.storageConfigured === "boolean") setConfigured(data.storageConfigured);
      setNotice({ kind: "success", message: "Загружена актуальная опубликованная версия сайта." });
    } catch { setNotice({ kind: "error", message: "Не удалось загрузить данные. Проверьте подключение и попробуйте ещё раз." }); }
    finally { setReloading(false); }
  }

  function downloadDraft() {
    const url = URL.createObjectURL(new Blob([JSON.stringify(draft, null, 2)], { type: "application/json" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `ipec-content-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function logout() {
    if (busy || (dirtyCount > 0 && !window.confirm("Выйти из управления сайтом? Неопубликованные изменения в этой вкладке будут потеряны."))) return;
    setSaving(true);
    try {
      const response = await fetch("/api/admin/logout", { method: "POST" });
      if (!response.ok) throw new Error("logout");
      // Navigation is intentional after the explicit draft-discard confirmation.
      leavingRef.current = true;
      window.location.assign("/admin");
    } catch { setSaving(false); setNotice({ kind: "error", message: "Не удалось выйти. Попробуйте ещё раз." }); }
  }

  function describeInvalidField(raw: string): string {
    const [path, ...suffix] = raw.split(" ");
    const parts = path.split(".");
    if (parts[0] === "media") return mediaFields.find((field) => field.key === parts[1])?.label || "Фото и видео";
    if (parts[0] !== "messages" || !languages.some((lang) => lang.id === parts[1])) return raw;
    const locale = parts[1] as Locale;
    const fieldPath = parts.slice(2).filter((part) => !/^\d+$/.test(part));
    const field = { path: fieldPath, value: "" };
    const sectionName = allSections.find((item) => item.keys.includes(fieldPath[0]))?.label || "Текст";
    const itemIndex = /^\d+$/.test(parts[parts.length - 1]) ? ` · пункт ${Number(parts[parts.length - 1]) + 1}` : "";
    const hint = suffix.join(" ").includes("подстановки") ? " · сохраните подстановки в фигурных скобках" : suffix.length ? " · проверьте скобки и формат текста" : "";
    return `${languages.find((lang) => lang.id === locale)?.short} · ${sectionName} · ${groupLabel(fieldPath.slice(0, -1), draft.messages.ru)} · ${fieldLabel(field, draft.messages.ru)}${itemIndex}${hint}`;
  }

  function goToInvalidField(raw: string) {
    const parts = raw.split(" ")[0].split(".");
    if (parts[0] === "media") { selectSection("media"); return; }
    if (parts[0] !== "messages" || !languages.some((lang) => lang.id === parts[1])) { selectSection("settings"); return; }
    const locale = parts[1] as Locale;
    const path = parts.slice(2);
    const arrayIndex = /^\d+$/.test(path[path.length - 1]) ? path.pop() : undefined;
    setLanguage(locale);
    selectSection(allSections.find((item) => item.keys.includes(path[0]))?.id || path[0]);
    setTimeout(() => {
      const target = document.getElementById(`text-${locale}-${path.join(".")}${arrayIndex === undefined ? "" : `-${arrayIndex}`}`);
      target?.scrollIntoView({ behavior: "smooth", block: "center" });
      target?.focus({ preventScroll: true });
    }, 60);
  }

  async function uploadFile(key: MediaKey, file: File) {
    if (busy || !configured) return;
    const field = mediaFields.find((item) => item.key === key)!;
    const extension = file.name.split(".").pop()?.toLowerCase() || "";
    const mimeTypes: Record<string, string[]> = { jpg: ["image/jpeg"], jpeg: ["image/jpeg"], png: ["image/png"], webp: ["image/webp"], avif: ["image/avif"], gif: ["image/gif"], ico: ["image/x-icon", "image/vnd.microsoft.icon"], mp4: ["video/mp4"], webm: ["video/webm"] };
    const allowed = field.kind === "video" ? ["mp4", "webm"] : ["jpg", "jpeg", "png", "webp", "avif", "gif", "ico"];
    if (!allowed.includes(extension) || !mimeTypes[extension]?.includes(file.type)) {
      setNotice({ kind: "error", message: field.kind === "video" ? "Выберите видео в формате MP4 или WebM." : "Выберите изображение JPG, PNG, WebP, AVIF, GIF или ICO. Для логотипа подойдёт PNG с прозрачным фоном." });
      return;
    }
    const maxSize = (field.kind === "video" ? 250 : 10) * 1024 * 1024;
    if (file.size === 0 || file.size > maxSize) {
      setNotice({ kind: "error", message: file.size === 0 ? "Этот файл пуст. Выберите другой файл." : `Файл слишком большой. Максимальный размер — ${field.kind === "video" ? "250" : "10"} МБ.` });
      return;
    }
    setNotice(null);
    setUploading({ key, percentage: 0 });
    try {
      const result = await upload(`media/${key}/${crypto.randomUUID()}.${extension}`, file, {
        access: "public", handleUploadUrl: "/api/admin/upload", clientPayload: JSON.stringify({ slot: key }), multipart: file.size > 5 * 1024 * 1024,
        onUploadProgress: (progress) => setUploading({ key, percentage: Math.round(progress.percentage) }),
      });
      setDraft((current) => ({ ...current, media: { ...current.media, [key]: result.url } }));
      setNotice({ kind: "success", message: `«${field.label}»: файл загружен в черновик. Нажмите «Опубликовать изменения», чтобы он появился на сайте.` });
    } catch {
      setNotice({ kind: "error", message: "Файл не удалось загрузить. Проверьте подключение и попробуйте снова. Если сессия закончилась, войдите в админку в новой вкладке.", expired: true });
    } finally { setUploading(null); }
  }

  const updatedAt = saved.updatedAt ? new Intl.DateTimeFormat("ru", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Almaty" }).format(new Date(saved.updatedAt)) : null;

  return (
    <div className="ipec-admin">
      <a href="#admin-main" className="admin-skip-link">Перейти к редактору</a>
      <aside className="admin-sidebar" aria-label="Разделы редактора">
        <div className="admin-brand" aria-label="IPEC Energy Kazakhstan, управление сайтом">
          <span className="admin-brand-mark">ipec<span>.</span></span>
          <span className="admin-brand-caption">ENERGY KAZAKHSTAN</span>
        </div>
        <div className="admin-sidebar-heading">СОДЕРЖИМОЕ САЙТА</div>
        <nav className="admin-nav">
          {allSections.map((item) => {
            const Icon = item.icon;
            const changed = [...dirtyKeys].some((key) => item.keys.some((prefix) => languages.some((lang) => key.startsWith(`${lang.id}.${prefix}.`))));
            return <button key={item.id} type="button" className={`admin-nav-item ${section === item.id && !search ? "is-active" : ""}`} aria-current={section === item.id && !search ? "page" : undefined} disabled={busy} onClick={() => selectSection(item.id)}><Icon size={17} aria-hidden="true" /><span>{item.label}</span>{changed && <span className="admin-dirty-dot" aria-label="Есть изменения" />}</button>;
          })}
          <div className="admin-nav-divider" />
          <button type="button" className={`admin-nav-item ${isMedia ? "is-active" : ""}`} aria-current={isMedia ? "page" : undefined} disabled={busy} onClick={() => selectSection("media")}><ImageIcon size={17} aria-hidden="true" /><span>Фото и видео</span>{[...dirtyKeys].some((key) => key.startsWith("media.")) && <span className="admin-dirty-dot" aria-label="Есть изменения" />}</button>
          <button type="button" className={`admin-nav-item ${isSettings ? "is-active" : ""}`} aria-current={isSettings ? "page" : undefined} disabled={busy} onClick={() => selectSection("settings")}><Settings2 size={17} aria-hidden="true" /><span>Контактные данные</span>{[...dirtyKeys].some((key) => key.startsWith("settings.")) && <span className="admin-dirty-dot" aria-label="Есть изменения" />}</button>
        </nav>
        <div className="admin-sidebar-bottom"><ShieldCheck size={18} aria-hidden="true" /><span>Доступ администратора</span><button type="button" onClick={logout} disabled={busy} aria-label="Выйти из админки" title="Выйти"><LogOut size={18} /></button></div>
      </aside>

      <div className="admin-workspace">
        <header className="admin-topbar">
          <div className="admin-breadcrumb">Управление сайтом <ChevronRight size={14} aria-hidden="true" /> <span>Контент</span></div>
          <a href="/" target="_blank" rel="noopener noreferrer" className="admin-button admin-button-quiet">Открыть сайт <ArrowUpRight size={16} aria-hidden="true" /></a>
        </header>
        <main ref={mainRef} id="admin-main" className="admin-main">
          <div className="admin-page-heading">
            <div><p className="admin-eyebrow">IPEC ENERGY KAZAKHSTAN</p><h1>Контент сайта</h1><p className="admin-page-intro">Все тексты, изображения и видео — в одном месте.</p></div>
            <div className={`admin-state-pill ${dirtyCount ? "has-changes" : ""}`}>{dirtyCount ? <span className="admin-state-dot" /> : <CheckCircle2 size={14} aria-hidden="true" />}{dirtyCount ? "Есть изменения" : "Всё опубликовано"}</div>
          </div>

          {!configured && <div className="admin-notice admin-notice-warning" role="status"><CircleHelp size={19} aria-hidden="true" /><div><strong>Публикация пока недоступна</strong><p>Для сохранения изменений нужно завершить подключение хранилища сайта. Сейчас можно изучить редактор, изменить тексты и скачать копию черновика.</p></div></div>}
          {notice && <div id="admin-notice" className={`admin-notice admin-notice-${notice.kind}`} role={notice.kind === "error" ? "alert" : "status"} aria-live={notice.kind === "error" ? "assertive" : "polite"}>
            {notice.kind === "success" ? <CheckCircle2 size={19} aria-hidden="true" /> : <CircleHelp size={19} aria-hidden="true" />}
            <div><p>{notice.message}</p>{notice.fields?.length ? <ul>{notice.fields.map((field) => <li key={field}><button type="button" className="admin-validation-link" onClick={() => goToInvalidField(field)}>{describeInvalidField(field)}</button></li>)}</ul> : null}
              {notice.conflict && <div className="admin-notice-actions"><button type="button" onClick={downloadDraft} className="admin-text-button"><ArrowDownToLine size={15} />Скачать черновик</button><button type="button" onClick={reloadLatest} disabled={busy} className="admin-text-button"><RotateCcw size={15} />Загрузить опубликованную версию</button></div>}
              {notice.expired && <a href="/admin" target="_blank" rel="noopener noreferrer" className="admin-text-button">Войти в новой вкладке <ArrowUpRight size={15} /></a>}
            </div><button type="button" className="admin-dismiss" onClick={() => setNotice(null)} aria-label="Закрыть уведомление"><X size={17} /></button>
          </div>}

          <div className="admin-editor-toolbar">
            <div className="admin-language-tabs" role="group" aria-label="Язык редактируемых текстов">
              {languages.map((item) => <button key={item.id} type="button" className={language === item.id ? "is-active" : ""} aria-pressed={language === item.id} disabled={busy || isMedia || isSettings} onClick={() => setLanguage(item.id)}><span>{item.short}</span><span className="admin-language-name">{item.name}</span></button>)}
            </div>
            <div className="admin-search"><Search size={17} aria-hidden="true" /><input type="search" aria-label="Найти текст на сайте" placeholder="Найти текст на сайте" value={query} onChange={(event) => setQuery(event.target.value)} disabled={busy} />{query && <button type="button" aria-label="Очистить поиск" onClick={() => setQuery("")}><X size={15} /></button>}</div>
          </div>

          <div className="admin-section-heading"><div><h2>{sectionTitle}</h2><p>{search ? `Найдено полей: ${visibleFields.length}. Поиск по всем разделам на выбранном и русском языках.` : isMedia ? "Эти файлы используются во всех трёх языковых версиях сайта." : isSettings ? "Общие контакты и ссылка на карту для всех языковых версий." : activeSection?.description}</p></div>{!isMedia && !isSettings && <span className="admin-locale-badge"><Globe2 size={14} aria-hidden="true" />{languages.find((item) => item.id === language)?.name}</span>}</div>

          {isMedia ? <div className="admin-media-grid">
            {mediaFields.map((field) => {
              const isLogo = field.key.toLowerCase().includes("logo") || field.key === "favicon";
              const changed = draft.media[field.key] !== saved.media[field.key];
              const progress = uploading?.key === field.key ? uploading.percentage : null;
              return <article key={field.key} className={`admin-media-card ${changed ? "is-changed" : ""}`}>
                <div className={`admin-media-preview ${isLogo ? "is-logo" : ""} ${field.key === "footerLogo" ? "is-dark" : ""}`}>
                  {field.kind === "video" ? <video key={draft.media[field.key]} src={draft.media[field.key]} controls muted playsInline preload="metadata" aria-label={field.label} /> : <Image src={draft.media[field.key]} alt={field.label} fill unoptimized sizes="(max-width: 420px) 100vw, (max-width: 1199px) 50vw, 33vw" />}
                  <span className="admin-media-kind">{field.kind === "video" ? <Video size={13} /> : <ImageIcon size={13} />}{field.kind === "video" ? "Видео" : "Изображение"}</span>
                  {changed && <span className="admin-media-draft">Черновик</span>}
                </div>
                <div className="admin-media-body"><h3>{field.label}</h3><p>{field.kind === "video" ? "MP4, WebM · до 250 МБ" : "JPG, PNG, WebP, AVIF, GIF, ICO · до 10 МБ"}</p>
                  {progress !== null && <div className="admin-upload-progress"><div className="admin-progress-track" role="progressbar" aria-label={`Загрузка: ${field.label}`} aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${progress}%` }} /></div><span aria-live="polite">{progress}%</span></div>}
                  <div className="admin-media-actions"><label className={`admin-button admin-button-secondary admin-upload-button ${busy || !configured ? "is-disabled" : ""}`}><input type="file" accept={field.kind === "video" ? ".mp4,.webm,video/mp4,video/webm" : ".jpg,.jpeg,.png,.webp,.avif,.gif,.ico,image/jpeg,image/png,image/webp,image/avif,image/gif,image/x-icon,image/vnd.microsoft.icon"} disabled={busy || !configured} aria-label={`Заменить файл: ${field.label}`} onChange={(event) => { const file = event.target.files?.[0]; event.target.value = ""; if (file) void uploadFile(field.key, file); }} />{progress !== null ? <LoaderCircle size={15} className="admin-spin" /> : <Upload size={15} />}<span>{progress !== null ? "Загрузка…" : "Заменить файл"}</span></label>
                    <button type="button" className="admin-icon-button" title="Вернуть исходный файл сайта" aria-label={`Вернуть исходный файл: ${field.label}`} disabled={busy || draft.media[field.key] === field.defaultSrc} onClick={() => setDraft((current) => ({ ...current, media: { ...current.media, [field.key]: field.defaultSrc } }))}><RotateCcw size={16} /></button></div>
                </div>
              </article>;
            })}
          </div> : isSettings ? <section className="admin-field-card"><div className="admin-card-heading"><div><h3>Как с вами связаться</h3><p>Отображаемый телефон можно записать с пробелами. Номер для звонка — в международном формате.</p></div></div><div className="admin-fields">
            {([
              { key: "phoneDisplay", label: "Телефон на сайте", hint: "Например: +7 700 000 00 00", type: "text" },
              { key: "phoneHref", label: "Номер для звонка", hint: "Например: +77000000000", type: "tel" },
              { key: "email", label: "Электронная почта", hint: "Адрес в контактной информации сайта", type: "email" },
              { key: "mapUrl", label: "Ссылка на карту", hint: "Полная ссылка на адрес офиса в 2ГИС или другом картографическом сервисе", type: "url" },
            ] as const).map((field) => <div className="admin-field" key={field.key}><div className="admin-field-label"><label htmlFor={`setting-${field.key}`}>{field.label}</label>{dirtyKeys.has(`settings.${field.key}`) && <span className="admin-field-changed">Изменено</span>}</div><input id={`setting-${field.key}`} type={field.type} value={field.key === "phoneHref" ? draft.settings.phoneHref.replace(/^tel:/, "") : draft.settings[field.key]} disabled={busy} aria-describedby={`setting-hint-${field.key}`} onChange={(event) => { const value = event.target.value; setDraft((current) => ({ ...current, settings: { ...current.settings, [field.key]: field.key === "phoneHref" ? `tel:${value.replace(/^tel:/, "")}` : value } })); }} /><p className="admin-field-hint" id={`setting-hint-${field.key}`}>{field.hint}</p></div>)}
          </div></section> : <div className="admin-text-cards">
            {visibleFields.length === 0 && <div className="admin-empty"><Search size={30} aria-hidden="true" /><h3>Текст не найден</h3><p>Попробуйте другое слово или переключите язык.</p><button type="button" className="admin-button admin-button-secondary" onClick={() => setQuery("")}>Очистить поиск</button></div>}
            {[...groupedFields].map(([group, items]) => <section className="admin-field-card" key={`${language}-${group}`}><div className="admin-card-heading"><div>{search && <span className="admin-result-section">{allSections.find((item) => item.keys.includes(items[0].path[0]))?.label}</span>}<h3>{groupLabel(items[0].path.slice(0, -1), draft.messages.ru)}</h3></div><span className="admin-card-count">{items.length}</span></div><div className="admin-fields">
              {items.map((field) => {
                const path = field.path.join(".");
                const id = `text-${language}-${path}`;
                const original = valueAt(saved.messages[language], field.path);
                const changed = JSON.stringify(field.value) !== JSON.stringify(original);
                const subject = path === "contact.form.messages.emailSubject";
                return <div className={`admin-field ${Array.isArray(field.value) ? "admin-array-field" : ""}`} key={path}>
                  <div className="admin-field-label">{Array.isArray(field.value) ? <span id={id}>{fieldLabel(field, draft.messages.ru)}</span> : <label htmlFor={id}>{fieldLabel(field, draft.messages.ru)}</label>}{changed && <span className="admin-field-changed">Изменено</span>}</div>
                  {Array.isArray(field.value) ? <div className="admin-array" role="group" aria-labelledby={id}>
                    {field.value.map((item, index) => <div className="admin-array-item" key={index}><span className="admin-array-number">{String(index + 1).padStart(2, "0")}</span><label className="admin-sr-only" htmlFor={`${id}-${index}`}>{fieldLabel(field, draft.messages.ru)}, пункт {index + 1}</label><TextArea id={`${id}-${index}`} value={item} disabled={busy} onChange={(value) => { const next = [...field.value as string[]]; next[index] = value; updateMessage(field.path, next); }} /><button type="button" className="admin-icon-button admin-remove" disabled={busy || (field.value as string[]).length <= 1} aria-label={`Удалить пункт ${index + 1}`} title="Удалить пункт" onClick={() => updateMessage(field.path, (field.value as string[]).filter((_, itemIndex) => itemIndex !== index))}><Trash2 size={16} /></button></div>)}
                    <div className="admin-array-footer"><button type="button" className="admin-text-button" disabled={busy || field.value.length >= 30} onClick={() => updateMessage(field.path, [...field.value as string[], ""])}><Plus size={16} aria-hidden="true" />Добавить пункт</button><span>{field.value.length} / 30</span></div>
                  </div> : <><TextArea id={id} value={field.value} disabled={busy} describedBy={subject ? `${id}-hint` : undefined} onChange={(value) => updateMessage(field.path, value)} />{subject && <p className="admin-field-hint" id={`${id}-hint`}>Сохраните <code>{"{name}"}</code> и <code>{"{company}"}</code>: они подставляют имя и компанию отправителя.</p>}</>}
                </div>;
              })}
            </div></section>)}
          </div>}

          <div className="admin-tools-row"><span>{updatedAt ? `Последняя публикация: ${updatedAt} (Алматы)` : "Загружены исходные материалы сайта"}</span><div><button type="button" className="admin-text-button" onClick={downloadDraft} disabled={busy}><ArrowDownToLine size={14} aria-hidden="true" />Скачать копию</button><button type="button" className="admin-text-button" onClick={reloadLatest} disabled={busy}><RotateCcw size={14} className={reloading ? "admin-spin" : ""} aria-hidden="true" />Обновить данные</button></div></div>
        </main>

        <footer className="admin-publish-bar">
          <div className="admin-publish-status"><span className={`admin-publish-status-icon ${dirtyCount ? "has-changes" : ""}`}>{uploading || saving ? <LoaderCircle size={20} className="admin-spin" aria-hidden="true" /> : dirtyCount ? <FileText size={20} aria-hidden="true" /> : <Check size={20} aria-hidden="true" />}</span><div><strong>{uploading ? `Загрузка файла · ${uploading.percentage}%` : saving ? "Публикация…" : dirtyCount ? `${dirtyCount} ${nounCount(dirtyCount)} в черновике` : "Все изменения опубликованы"}</strong><p>{dirtyCount ? "Публикация обновит сайт сразу на трёх языках." : "Измените тексты или загрузите новые файлы."}</p></div></div>
          <button type="button" className="admin-button admin-button-primary admin-publish-button" disabled={busy || !dirtyCount || !configured} onClick={publish}>{saving ? <LoaderCircle size={17} className="admin-spin" aria-hidden="true" /> : <Upload size={17} aria-hidden="true" />}<span>{saving ? "Публикуем…" : "Опубликовать изменения"}</span></button>
        </footer>
      </div>
    </div>
  );
}
