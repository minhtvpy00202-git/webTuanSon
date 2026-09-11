"use client";

import { useMemo, useState } from "react";

type FloatingContactButtonProps = {
  phone?: string | null;
  email?: string | null;
  zaloLink?: string | null;
};

type ContactItem = {
  key: "zalo" | "phone" | "email";
  label: string;
  href: string;
};

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M6.6 10.8a15.5 15.5 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.24 11.1 11.1 0 0 0 3.48.56 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.3 21 3 13.7 3 4.75a1 1 0 0 1 1-1H7.2a1 1 0 0 1 1 1c0 1.2.2 2.37.56 3.48a1 1 0 0 1-.24 1.01l-1.92 1.56Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M4 7.5 11 12l7-4.5M5.2 19h13.6A1.2 1.2 0 0 0 20 17.8V6.2A1.2 1.2 0 0 0 18.8 5H5.2A1.2 1.2 0 0 0 4 6.2v11.6A1.2 1.2 0 0 0 5.2 19Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M12 4c4.97 0 9 3.36 9 7.5S16.97 19 12 19a10.6 10.6 0 0 1-3.9-.72L4 20l1.1-3.3A6.97 6.97 0 0 1 3 11.5C3 7.36 7.03 4 12 4Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M6 6l12 12M18 6 6 18"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SupportIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
      <path
        d="M12 3a8 8 0 0 0-8 8v2a2 2 0 0 0 2 2h1.5v-4H6a6 6 0 1 1 12 0h-1.5v4H18a2 2 0 0 0 2-2v-2a8 8 0 0 0-8-8Zm-1 15h2a2 2 0 0 1-2 2h-1"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function FloatingContactButton({
  phone,
  email,
  zaloLink,
}: FloatingContactButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const items = useMemo<ContactItem[]>(() => {
    const normalizedPhone = phone?.replace(/\s+/g, "") ?? "";

    return [
      {
        key: "zalo",
        label: "Zalo",
        href: zaloLink || "#",
      },
      {
        key: "phone",
        label: "Phone",
        href: normalizedPhone ? `tel:${normalizedPhone}` : "#",
      },
      {
        key: "email",
        label: "Email",
        href: email ? `mailto:${email}` : "#",
      },
    ];
  }, [email, phone, zaloLink]);

  const iconMap = {
    zalo: <ChatIcon />,
    phone: <PhoneIcon />,
    email: <MailIcon />,
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {isOpen ? (
        <div className="flex flex-col items-end gap-3">
          <div className="mhv-card p-3">
            <div className="flex flex-col gap-2">
              {items.map((item) => (
                <a
                  key={item.key}
                  href={item.href}
                  target={item.key === "zalo" ? "_blank" : undefined}
                  rel={item.key === "zalo" ? "noreferrer" : undefined}
                  className="mhv-btn-secondary flex min-w-40 items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ease-in-out hover:-translate-y-1 hover:shadow-md"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--primary)_12%,var(--card))] text-[var(--primary)]">
                    {iconMap[item.key]}
                  </span>
                  <span>{item.label}</span>
                </a>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm transition-all duration-200 ease-in-out hover:-translate-y-1 hover:bg-slate-800 hover:shadow-md dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white"
            aria-label="Đóng menu liên hệ"
          >
            <CloseIcon />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="mhv-btn-primary flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold shadow-sm transition-all duration-200 ease-in-out hover:-translate-y-1 hover:shadow-md"
          aria-label="Mở menu liên hệ"
        >
          <SupportIcon />
          <span>Liên hệ</span>
        </button>
      )}
    </div>
  );
}
