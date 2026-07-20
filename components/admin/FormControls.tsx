"use client";

import {
  useId,
  useState,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

const inputClasses =
  "w-full rounded-xl border border-white/10 bg-canvas/60 px-4 py-2.5 text-sm text-ivory outline-none transition-colors placeholder:text-ivory/30 focus:border-gold/50";

export function FieldLabel({
  htmlFor,
  children,
  required,
}: {
  htmlFor?: string;
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-2 block text-xs font-medium uppercase tracking-[0.15em] text-ivory/60"
    >
      {children}
      {required ? <span className="text-gold"> *</span> : null}
    </label>
  );
}

export function TextField({
  label,
  required,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const id = useId();
  return (
    <div className={className}>
      <FieldLabel htmlFor={id} required={required}>
        {label}
      </FieldLabel>
      <input id={id} required={required} className={inputClasses} {...props} />
    </div>
  );
}

export function TextAreaField({
  label,
  required,
  className,
  rows = 4,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  const id = useId();
  return (
    <div className={className}>
      <FieldLabel htmlFor={id} required={required}>
        {label}
      </FieldLabel>
      <textarea id={id} rows={rows} required={required} className={inputClasses} {...props} />
    </div>
  );
}

export function SelectField({
  label,
  required,
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { label: string }) {
  const id = useId();
  return (
    <div className={className}>
      <FieldLabel htmlFor={id} required={required}>
        {label}
      </FieldLabel>
      <select id={id} required={required} className={cn(inputClasses, "appearance-none")} {...props}>
        {children}
      </select>
    </div>
  );
}

export function Toggle({
  label,
  checked,
  onChange,
  description,
}: {
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  description?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 rounded-xl border border-white/10 bg-canvas/40 px-4 py-3 text-start transition-colors hover:border-white/20"
    >
      <span>
        <span className="block text-sm font-medium text-ivory">{label}</span>
        {description ? (
          <span className="mt-0.5 block text-xs text-ivory/50">{description}</span>
        ) : null}
      </span>
      <span
        className={cn(
          "relative h-6 w-11 flex-none rounded-full transition-colors",
          checked ? "bg-gold" : "bg-white/15",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-canvas transition-all",
            checked ? "start-[22px]" : "start-0.5",
          )}
        />
      </span>
    </button>
  );
}

/** Free-form tag editor (Enter or comma adds, click × removes). */
export function TagInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}) {
  const id = useId();
  const [draft, setDraft] = useState("");

  const commit = () => {
    const tag = draft.trim().replace(/,+$/, "");
    if (tag && !value.includes(tag)) onChange([...value, tag]);
    setDraft("");
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      commit();
    } else if (event.key === "Backspace" && draft === "" && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-canvas/60 px-3 py-2 focus-within:border-gold/50">
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1.5 rounded-full bg-gold/12 px-3 py-1 text-xs font-medium text-gold"
          >
            {tag}
            <button
              type="button"
              aria-label={`Remove ${tag}`}
              onClick={() => onChange(value.filter((item) => item !== tag))}
              className="hover:text-ivory"
            >
              <X size={12} aria-hidden />
            </button>
          </span>
        ))}
        <input
          id={id}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={commit}
          placeholder={value.length === 0 ? placeholder : undefined}
          className="min-w-28 flex-1 bg-transparent py-1 text-sm text-ivory outline-none placeholder:text-ivory/30"
        />
      </div>
    </div>
  );
}
