"use client";

import { useState, type InputHTMLAttributes } from "react";

type PasswordInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> & {
  containerClassName?: string;
  labelClassName?: string;
  label?: string;
};

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4">
      <path
        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="12"
        cy="12"
        r="3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4">
      <path
        d="M3 3l18 18"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M10.6 6.1A10.9 10.9 0 0 1 12 6c6.5 0 10 7 10 7a17.8 17.8 0 0 1-3.5 4.2M6.6 6.6A17.6 17.6 0 0 0 2 13s3.5 7 10 7a11 11 0 0 0 4.6-.9"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.1 14.1a3 3 0 0 1-4.2-4.2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PasswordInput({
  className = "",
  containerClassName = "",
  labelClassName = "",
  label,
  placeholder,
  required,
  value,
  onChange,
  onBlur,
  disabled,
  id,
  name,
  autoComplete,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const inputClasses = [
    "mhv-input",
    "text-sm",
    "tracking-[0.4px]",
    "pr-11",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const inner = (
    <div className={`relative ${containerClassName}`}>
      <input
        id={id}
        name={name}
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={inputClasses}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setShowPassword((v) => !v)}
        aria-label={showPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
        className="absolute inset-y-0 right-0 inline-flex h-full items-center justify-center px-3 text-[var(--muted)] transition-opacity duration-300 ease-in-out hover:opacity-70 disabled:opacity-50"
        disabled={disabled}
      >
        {showPassword ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  );

  if (label) {
    return (
      <label className={`space-y-2 ${labelClassName}`}>
        <span className="text-sm font-normal text-[var(--foreground)] tracking-[0.4px]">
          {label}
          {required ? <span className="ml-0.5 text-[var(--foreground)]">*</span> : null}
        </span>
        {inner}
      </label>
    );
  }

  return inner;
}
