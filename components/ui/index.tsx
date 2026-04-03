"use client";
import { useEffect } from "react";
import clsx from "clsx";

export function Btn({ label, onClick, color, variant = "solid", className = "", style = {}, ...rest }: {
  label: string; onClick?: () => void; color?: string;
  variant?: "solid" | "ghost"; className?: string; style?: React.CSSProperties;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "color">) {
  if (variant === "ghost") {
    return (
      <button onClick={onClick} {...rest}
        className={clsx("px-4 py-2 rounded-full border border-border text-muted font-semibold text-sm cursor-pointer bg-white font-sans", className)}>
        {label}
      </button>
    );
  }
  return (
    <button onClick={onClick} {...rest}
      style={{ background: color, boxShadow: color ? `0 2px 8px ${color}55` : undefined, border: "none", ...style }}
      className={clsx("px-4 py-2 rounded-full text-white font-bold text-sm cursor-pointer font-sans", className)}>
      {label}
    </button>
  );
}

export function Card({ icon, title, bg, children, className = "" }: {
  icon?: string; title?: string; bg?: string;
  children: React.ReactNode; className?: string;
}) {
  return (
    <div className={clsx("bg-white rounded-2xl p-4 shadow-sm", className)}>
      {title && (
        <div className="flex items-center gap-1.5 mb-2.5 px-2.5 py-1 rounded-xl w-fit text-xs font-bold" style={{ background: bg }}>
          {icon && <span className="text-sm">{icon}</span>}
          {title}
        </div>
      )}
      {children}
    </div>
  );
}

export function Empty({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="text-center py-8 px-4 text-muted">
      <div className="text-4xl mb-2">{icon}</div>
      <div className="text-sm whitespace-pre-line leading-relaxed">{text}</div>
    </div>
  );
}

export function Toast({ msg, icon, onDone }: { msg: string; icon: string; onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 2800); return () => clearTimeout(t); }, [onDone]);
  return (
    <div className="fixed top-[72px] left-1/2 -translate-x-1/2 z-[999] flex items-center gap-2.5 bg-black/85 text-white rounded-2xl px-5 py-3 shadow-2xl backdrop-blur-sm animate-slide-down whitespace-nowrap max-w-[90vw]">
      <span className="text-2xl animate-pop">{icon}</span>
      <span className="text-sm font-bold">{msg}</span>
    </div>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input {...props}
      className={clsx("w-full px-3 py-2.5 rounded-xl border border-border text-sm outline-none bg-[#FAFAFA] font-sans", props.className)} />
  );
}

export function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs text-muted font-semibold mb-1">{children}</label>;
}
