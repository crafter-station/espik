"use client";

import { useState } from "react";
import { ChevronDown, Check, X } from "lucide-react";
import { languages } from "@/lib/languages";
import { cn } from "@/lib/cn";

interface LanguageSelectorProps {
  value: string;
  onChange: (code: string) => void;
  label: string;
  disabled?: boolean;
}

export function LanguageSelector({
  value,
  onChange,
  label,
  disabled,
}: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedLang = languages.find((l) => l.code === value);

  return (
    <>
      <button
        onClick={() => !disabled && setIsOpen(true)}
        disabled={disabled}
        className={cn(
          "flex w-[150px] items-center gap-2 rounded-full bg-[#2a2a2a] px-4 py-2.5 transition-all active:scale-95",
          disabled && "opacity-50"
        )}
      >
        <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#E8651A]">
          {label}
        </span>
        <span className="flex-1 truncate text-left text-sm font-semibold text-white">
          {selectedLang?.name ?? value}
        </span>
        <ChevronDown className="h-3 w-3 text-white/40" />
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="animate-backdrop fixed inset-0 z-50 flex items-end justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          <div className="animate-slide-up relative w-full max-w-[430px] rounded-t-2xl bg-[#1a1a1a] px-2 pb-[env(safe-area-inset-bottom)] shadow-2xl">
            {/* Handle */}
            <div className="flex justify-center py-3">
              <div className="h-1 w-10 rounded-full bg-[#3a3a3a]" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-white">
                Select Language
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-2 text-white/40 hover:bg-[#2a2a2a]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* List */}
            <div className="max-h-[50vh] overflow-y-auto px-2 pb-4">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    onChange(lang.code);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl px-4 py-3 text-left transition-colors",
                    lang.code === value
                      ? "bg-[#E8651A]/15 text-[#E8651A]"
                      : "text-white/70 hover:bg-[#2a2a2a]"
                  )}
                >
                  <div>
                    <p className="font-semibold">{lang.name}</p>
                    <p className="text-xs text-white/30">{lang.englishName}</p>
                  </div>
                  {lang.code === value && (
                    <Check className="h-4 w-4 text-[#E8651A]" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
