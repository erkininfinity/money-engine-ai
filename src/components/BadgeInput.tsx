"use client";

import React, { useState, KeyboardEvent } from "react";
import { X, Plus } from "lucide-react";

interface BadgeInputProps {
  value: string[];
  onChange: (newValue: string[]) => void;
  placeholder?: string;
  label?: string;
  suggestions?: string[];
}

export const BadgeInput: React.FC<BadgeInputProps> = ({
  value,
  onChange,
  placeholder = "Add item...",
  label,
  suggestions = [],
}) => {
  const [input, setInput] = useState("");

  const addTag = (tagText: string) => {
    const trimmed = tagText.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setInput("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input);
    }
  };

  const removeTag = (indexToRemove: number) => {
    onChange(value.filter((_, i) => i !== indexToRemove));
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      {label && (
        <label className="text-sm font-semibold text-slate-300">
          {label}
        </label>
      )}
      <div className="flex flex-wrap gap-2 p-2 min-h-[44px] glass-input w-full items-center">
        {value.map((tag, idx) => (
          <span
            key={idx}
            className="flex items-center gap-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs px-2.5 py-1 rounded-full font-medium"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(idx)}
              className="text-indigo-400 hover:text-white transition-colors focus:outline-none"
            >
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => addTag(input)}
          placeholder={value.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[120px] bg-transparent border-none outline-none text-sm text-white placeholder-slate-500 py-0.5"
        />
      </div>
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-1 items-center">
          <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold mr-1">
            Suggestions:
          </span>
          {suggestions
            .filter((sug) => !value.includes(sug))
            .slice(0, 5)
            .map((sug, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => addTag(sug)}
                className="flex items-center gap-0.5 text-[11px] bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/50 px-2 py-0.5 rounded-md transition-colors"
              >
                <Plus size={10} />
                {sug}
              </button>
            ))}
        </div>
      )}
    </div>
  );
};
