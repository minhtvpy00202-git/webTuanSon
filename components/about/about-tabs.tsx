"use client";

import { useState } from "react";

type AboutTabsProps = {
  aboutUs: string;
  mission: string;
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

export function AboutTabs({ aboutUs, mission }: AboutTabsProps) {
  const [activeTab, setActiveTab] =
    useState<(typeof tabs)[number]["id"]>("about");

  return (
    <div className="space-y-6 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
      <div className="flex flex-wrap gap-3">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ease-in-out ${
                isActive
                  ? "bg-blue-600 text-white shadow-sm"
                  : "border border-slate-200 bg-white text-slate-600 hover:-translate-y-0.5 hover:border-blue-200 hover:text-blue-600 hover:shadow-sm"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="rounded-xl bg-slate-50 p-5 sm:p-6">
        {activeTab === "about" ? (
          <div className="space-y-3">
            <p className="text-sm font-medium text-blue-600">Giới thiệu doanh nghiệp</p>
            <p className="whitespace-pre-line text-sm leading-7 text-slate-700 sm:text-base">
              {aboutUs}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm font-medium text-blue-600">Nhiệm vụ & Sứ mệnh</p>
            <p className="whitespace-pre-line text-sm leading-7 text-slate-700 sm:text-base">
              {mission}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
