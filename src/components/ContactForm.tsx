"use client";

import { useState } from "react";
import type { Locale } from "@/i18n/config";
import { getContactText } from "@/i18n/contact";
import {
  CONTACT_CATEGORIES,
  MESSAGE_MAX,
  MESSAGE_MIN,
  NAME_MAX,
  EMAIL_MAX,
  topicDef,
  topicsOf,
  type ContactCategory,
  type ContactField,
  type ContactTopic,
} from "@/lib/contact";

const ICON: Record<ContactCategory, string> = { support: "🛟", partner: "🤝", school: "🏫" };
const input = "w-full rounded-xl border-2 bg-[var(--surface)] px-3 py-2 text-sm";

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "sent"; email: string } | { kind: "error"; text: string; field?: string };

export function ContactForm({
  locale,
  initialCategory,
  initialTopic,
  defaultName,
  defaultEmail,
}: {
  locale: Locale;
  initialCategory: ContactCategory | null;
  initialTopic: ContactTopic | null;
  defaultName: string;
  defaultEmail: string;
}) {
  const t = getContactText(locale);
  const [category, setCategory] = useState<ContactCategory | null>(initialCategory);
  const [topic, setTopic] = useState<ContactTopic | null>(initialTopic);
  const [name, setName] = useState(defaultName);
  const [email, setEmail] = useState(defaultEmail);
  const [message, setMessage] = useState("");
  const [details, setDetails] = useState<Partial<Record<ContactField, string>>>({});
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const def = topic ? topicDef(topic) : undefined;

  function pickCategory(c: ContactCategory) {
    setCategory(c);
    const list = topicsOf(c);
    setTopic(list.length === 1 ? list[0].id : null);
    setStatus({ kind: "idle" });
  }

  function errorText(code: string | undefined): { text: string; field?: string } {
    if (code?.startsWith("field:")) {
      const key = code.slice(6) as ContactField;
      return { text: t.errors.field.replace("{field}", t.fields[key] ?? key), field: key };
    }
    const known = code && code in t.errors ? (code as keyof typeof t.errors) : "unavailable";
    return { text: t.errors[known], field: code };
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!def || status.kind === "sending") return;
    setStatus({ kind: "sending" });
    try {
      const res = await fetch("/api/kontakt", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ topic: def.id, name, email, message, details, website, locale }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (res.ok && data.ok) {
        setStatus({ kind: "sent", email: email.trim() });
        return;
      }
      setStatus({ kind: "error", ...errorText(data.error) });
    } catch {
      setStatus({ kind: "error", ...errorText("unavailable") });
    }
  }

  function reset() {
    setMessage("");
    setDetails({});
    setTopic(null);
    setCategory(null);
    setStatus({ kind: "idle" });
  }

  if (status.kind === "sent") {
    return (
      <section className="card flex flex-col items-start gap-3 p-6" role="status">
        <p className="text-4xl" aria-hidden>
          ✉️
        </p>
        <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
          {t.successTitle}
        </h2>
        <p className="text-[var(--muted)]">{t.successText.replace("{email}", status.email)}</p>
        <button type="button" onClick={reset} className="btn-bouncy btn-primary px-4 py-2 text-sm font-bold">
          {t.sendAnother}
        </button>
      </section>
    );
  }

  const invalid = (key: string) => status.kind === "error" && status.field === key;
  const fieldClass = (key: string) => `${input} ${invalid(key) ? "border-[var(--danger)]" : "border-[var(--edge)]"}`;

  return (
    <div className="flex flex-col gap-8">
      <section aria-labelledby="contact-step-1" className="flex flex-col gap-3">
        <h2 id="contact-step-1" className="text-lg font-bold">
          {t.step.category}
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {CONTACT_CATEGORIES.map((c) => {
            const active = category === c;
            return (
              <button
                key={c}
                type="button"
                aria-pressed={active}
                onClick={() => pickCategory(c)}
                className={`card card-hover flex flex-col items-start gap-1.5 p-4 text-left ${active ? "!border-[var(--brand-500)] ring-2 ring-[var(--brand-500)]" : ""}`}
              >
                <span className="text-3xl" aria-hidden>
                  {ICON[c]}
                </span>
                <span className="font-bold">{t.categories[c].title}</span>
                <span className="text-xs text-[var(--muted)]">{t.categories[c].hint}</span>
              </button>
            );
          })}
        </div>
      </section>

      {category && topicsOf(category).length > 1 && (
        <section aria-labelledby="contact-step-2" className="flex flex-col gap-3">
          <h2 id="contact-step-2" className="text-lg font-bold">
            {t.step.topic}
          </h2>
          <div className="grid gap-2 sm:grid-cols-3">
            {topicsOf(category).map((x) => {
              const active = topic === x.id;
              return (
                <button
                  key={x.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    setTopic(x.id);
                    setStatus({ kind: "idle" });
                  }}
                  className={`flex flex-col items-start gap-1 rounded-xl border-2 bg-[var(--surface)] p-3 text-left transition-colors ${active ? "border-[var(--brand-500)] bg-[var(--surface-muted)]" : "border-[var(--border-soft)] hover:border-[var(--edge)]"}`}
                >
                  <span className="text-sm font-bold">{t.topics[x.id].title}</span>
                  <span className="text-xs text-[var(--muted)]">{t.topics[x.id].hint}</span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {def && (
        <form onSubmit={submit} className="card flex flex-col gap-4 p-6" aria-labelledby="contact-step-3" noValidate>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="contact-step-3" className="text-lg font-bold">
              {t.step.details}
            </h2>
            <span className="pill bg-[var(--surface-muted)] px-2.5 py-1 text-xs">
              {ICON[def.category]} {t.categories[def.category].title}
              {topicsOf(def.category).length > 1 ? ` · ${t.topics[def.id].title}` : ""}
            </span>
          </div>
          {topicsOf(def.category).length === 1 && <p className="-mt-2 text-sm text-[var(--muted)]">{t.topics[def.id].hint}</p>}

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm font-medium">
              {t.name}
              <input className={fieldClass("name")} value={name} onChange={(e) => setName(e.target.value)} maxLength={NAME_MAX} autoComplete="name" required aria-invalid={invalid("name")} />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium">
              {t.email}
              <input className={fieldClass("email")} type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={EMAIL_MAX} autoComplete="email" required aria-invalid={invalid("email")} />
            </label>
            {def.fields.map((f) => (
              <label key={f.key} className="flex flex-col gap-1 text-sm font-medium">
                <span>
                  {t.fields[f.key]}
                  {!f.required && <span className="font-normal text-[var(--faint)]"> ({t.optional})</span>}
                </span>
                <input
                  className={fieldClass(f.key)}
                  type={f.type === "url" ? "url" : f.type === "email" ? "email" : "text"}
                  inputMode={f.key === "izo" || f.key === "audience" ? "numeric" : undefined}
                  value={details[f.key] ?? ""}
                  onChange={(e) => setDetails((d) => ({ ...d, [f.key]: e.target.value }))}
                  maxLength={f.max}
                  required={f.required}
                  aria-invalid={invalid(f.key)}
                  placeholder={f.type === "url" ? "https://" : undefined}
                />
              </label>
            ))}
          </div>

          <label className="flex flex-col gap-1 text-sm font-medium">
            {t.message}
            <textarea
              className={`${fieldClass("message-short")} min-h-36 resize-y`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={MESSAGE_MAX}
              minLength={MESSAGE_MIN}
              required
              placeholder={t.topics[def.id].placeholder}
              aria-invalid={invalid("message-short")}
            />
            <span className="self-end font-mono text-xs text-[var(--faint)]">
              {message.length} / {MESSAGE_MAX}
            </span>
          </label>

          {/* Past na roboty: lidé pole nevidí. */}
          <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
            <label>
              Website
              <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
            </label>
          </div>

          {status.kind === "error" && (
            <p role="alert" className="text-sm font-semibold text-[var(--danger)]">
              {status.text}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-[var(--faint)]">{t.privacy}</p>
            <button type="submit" disabled={status.kind === "sending"} className="btn-bouncy btn-primary px-5 py-2.5 text-sm font-bold disabled:opacity-50">
              {status.kind === "sending" ? t.sending : t.send}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
