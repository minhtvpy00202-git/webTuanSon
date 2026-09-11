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
      <div className="grid gap-6 sm:grid-cols-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`w-full px-4 py-3 text-sm font-normal transition-all duration-300 ease-in-out tracking-[0.4px] ${
                isActive
                  ? "mhv-btn-primary"
                  : "mhv-btn-secondary hover:opacity-70"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <div className="mhv-muted-surface p-6 sm:p-8">
        {activeTab === "about" ? (
          <div className="space-y-3">
            <p className="text-sm font-normal text-[var(--foreground)] tracking-[0.4px]">
              Giới thiệu doanh nghiệp
            </p>
            <h2 className="text-xl font-normal text-[var(--foreground)] tracking-[0.4px]">
              {companyName}
            </h2>
            <p className="whitespace-pre-line text-sm leading-7 text-[var(--muted)] sm:text-base tracking-[0.4px]">
              {aboutUs}
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            <p className="text-sm font-normal text-[var(--foreground)] tracking-[0.4px]">Nhiệm vụ & Sứ mệnh</p>
            <div className="space-y-2">
              <h3 className="text-lg font-normal text-[var(--foreground)] tracking-[0.4px]">
                Nhiệm vụ
              </h3>
              <p className="whitespace-pre-line text-sm leading-7 text-[var(--muted)] sm:text-base tracking-[0.4px]">
                {mission}
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-normal text-[var(--foreground)] tracking-[0.4px]">
                Sứ mệnh
              </h3>
              <p className="whitespace-pre-line text-sm leading-7 text-[var(--muted)] sm:text-base tracking-[0.4px]">
                {vision}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
