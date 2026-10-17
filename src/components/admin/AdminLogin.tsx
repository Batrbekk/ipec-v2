"use client";

import { ArrowRight, ArrowUpRight, Eye, EyeOff, LoaderCircle, LockKeyhole, ShieldCheck } from "lucide-react";
import { useState, type FormEvent } from "react";
import Link from "next/link";

export default function AdminLogin({ configured }: { configured: boolean }) {
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || !configured) return;
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
      if (!response.ok) {
        setError(response.status === 429 ? "Слишком много попыток. Подождите несколько минут и попробуйте снова." : response.status === 401 ? "Неверный пароль. Проверьте его и попробуйте ещё раз." : "Не удалось войти. Попробуйте ещё раз позже.");
        return;
      }
      window.location.assign("/admin");
    } catch { setError("Нет связи с сервером. Проверьте подключение и попробуйте ещё раз."); }
    finally { setPending(false); }
  }

  return <main className="ipec-admin admin-login-page">
    <div className="admin-login-top"><div className="admin-brand"><span className="admin-brand-mark">ipec<span>.</span></span><span className="admin-brand-caption">ENERGY KAZAKHSTAN</span></div><Link href="/" className="admin-button admin-button-quiet">На сайт <ArrowUpRight size={16} aria-hidden="true" /></Link></div>
    <div className="admin-login-layout"><section className="admin-login-intro"><p className="admin-eyebrow">УПРАВЛЕНИЕ САЙТОМ</p><h1>Всё начинается<br />с хорошего контента<span>.</span></h1><p>Обновляйте тексты на трёх языках, фотографии и видео. Изменения появятся на сайте после публикации.</p><div className="admin-login-languages"><span>RU</span><span>KZ</span><span>EN</span><span>Один сайт. Три языка.</span></div></section>
      <section className="admin-login-card" aria-labelledby="login-title"><div className="admin-login-lock"><LockKeyhole size={26} aria-hidden="true" /></div><h2 id="login-title">Вход в админку</h2><p>Введите пароль администратора,<br />чтобы управлять содержимым сайта.</p>
        {!configured && <div className="admin-login-notice" role="status">Вход пока не настроен. Администратору сайта нужно завершить настройку доступа.</div>}
        <form onSubmit={login}><label htmlFor="admin-password">Пароль</label><div className="admin-password-input"><input id="admin-password" type={visible ? "text" : "password"} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required disabled={pending || !configured} placeholder="Введите пароль" autoFocus aria-describedby={error ? "admin-login-error" : undefined} /><button type="button" aria-label={visible ? "Скрыть пароль" : "Показать пароль"} aria-pressed={visible} onClick={() => setVisible((current) => !current)} disabled={pending || !configured}>{visible ? <EyeOff size={19} /> : <Eye size={19} />}</button></div>
          {error && <p className="admin-login-error" id="admin-login-error" role="alert">{error}</p>}
          <button type="submit" className="admin-button admin-button-primary" disabled={pending || !configured || !password}>{pending ? <LoaderCircle size={18} className="admin-spin" aria-hidden="true" /> : null}{pending ? "Входим…" : "Войти"}{!pending && <ArrowRight size={18} aria-hidden="true" />}</button>
        </form><div className="admin-login-secure"><ShieldCheck size={15} aria-hidden="true" />Только для администраторов сайта</div>
      </section></div><footer className="admin-login-footer">IPEC Energy Kazakhstan <span>Управление контентом</span></footer>
  </main>;
}
