"use client";

import { useState } from "react";

type AboutTabsProps = {
  companyName: string;
  aboutUs: string;
  mission: string;
  vision: string;
};

const tabs = [
  {
    id: "about",
    label: "Giới thiệu doanh nghiệp",
  },
  {
    id: "mission",
    label: "Nhiệm vụ & Sứ mệnh",
  },
] as const;

export function AboutTabs({ companyName, aboutUs, mission, vision }: AboutTabsProps) {
  const [activeTab, setActiveTab] =
    useState<(typeof tabs)[number]["id"]>("about");

  return (
    <div className="mhv-card space-y-6 p-6 sm:p-8">
      <div className="grid gap-3 sm:grid-cols-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`w-full rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ease-in-out ${
                isActive
                  ? "mhv-btn-primary shadow-sm"
                  : "mhv-btn-secondary hover:-translate-y-0.5 hover:shadow-sm"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <div className="mhv-muted-surface p-5 sm:p-6">
        {activeTab === "about" ? (
          <div className="space-y-3">
            <p className="text-sm font-medium text-[var(--primary)]">
              Giới thiệu doanh nghiệp
            </p>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              {companyName}
            </h2>
            <p className="whitespace-pre-line text-sm leading-7 text-slate-700 dark:text-slate-300 sm:text-base">
              {aboutUs}
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            <p className="text-sm font-medium text-[var(--primary)]">Nhiệm vụ & Sứ mệnh</p>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Nhiệm vụ
              </h3>
              <p className="whitespace-pre-line text-sm leading-7 text-slate-700 dark:text-slate-300 sm:text-base">
                {mission}
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Sứ mệnh
              </h3>
              <p className="whitespace-pre-line text-sm leading-7 text-slate-700 dark:text-slate-300 sm:text-base">
                {vision}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
