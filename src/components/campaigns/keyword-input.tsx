"use client";

import * as React from "react";
import { Hash, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { KEYWORD_MAX } from "@/lib/constants";

/**
 * Dynamic tag input for campaign keywords.
 * - Add with Enter or comma.
 * - Remove with the chip's ✕ or Backspace on an empty field.
 * - De-duplicates case-insensitively and caps at {@link KEYWORD_MAX}.
 */
export function KeywordInput({
  value,
  onChange,
  invalid,
  id,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  invalid?: boolean;
  id?: string;
}) {
  const [draft, setDraft] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  const addKeyword = (raw: string) => {
    const trimmed = raw.trim().replace(/\s+/g, " ");
    if (!trimmed) return;
    const exists = value.some((k) => k.toLowerCase() === trimmed.toLowerCase());
    if (exists || value.length >= KEYWORD_MAX) {
      setDraft("");
      return;
    }
    onChange([...value, trimmed]);
    setDraft("");
  };

  const removeAt = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addKeyword(draft);
    } else if (e.key === "Backspace" && !draft && value.length > 0) {
      removeAt(value.length - 1);
    }
  };

  return (
    <div>
      <div
        onClick={() => inputRef.current?.focus()}
        className={cn(
          "flex min-h-[3rem] w-full flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-3 py-2 shadow-inner transition-colors focus-within:border-aurora/50 focus-within:ring-2 focus-within:ring-aurora/30",
          invalid && "border-destructive/60 focus-within:border-destructive/60 focus-within:ring-destructive/30"
        )}
      >
        {value.map((keyword, index) => (
          <span
            key={`${keyword}-${index}`}
            className="inline-flex items-center gap-1 rounded-lg border border-aurora/20 bg-aurora/10 py-1 pl-2 pr-1 text-xs font-medium text-aurora animate-fade-in"
          >
            <Hash className="size-3 opacity-70" />
            {keyword}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeAt(index);
              }}
              className="rounded p-0.5 transition-colors hover:bg-aurora/20"
              aria-label={`Remove ${keyword}`}
            >
              <X className="size-3" />
            </button>
          </span>
        ))}
        <input
          id={id}
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => addKeyword(draft)}
          placeholder={value.length === 0 ? "bitcoin wallet, lightning payments…" : "Add another…"}
          className="min-w-[8rem] flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/70"
        />
      </div>
      <div className="mt-1.5 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Press <kbd className="rounded bg-white/10 px-1 font-mono text-[10px]">Enter</kbd> or comma to add. Matching uses OR logic.
        </p>
        <span
          className={cn(
            "text-xs tabular",
            value.length >= KEYWORD_MAX ? "text-lightning" : "text-muted-foreground"
          )}
        >
          {value.length}/{KEYWORD_MAX}
        </span>
      </div>
    </div>
  );
}
