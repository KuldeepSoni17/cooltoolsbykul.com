"use client";

import { useState } from "react";
import styles from "./songwriter.module.css";

export default function TagInput({
  tags,
  onChange,
  placeholder,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder: string;
}) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const v = draft.trim();
    if (!v || tags.includes(v)) return;
    onChange([...tags, v]);
    setDraft("");
  };
  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((t) => (
          <span key={t} className={styles.tag}>
            {t}
            <button type="button" onClick={() => onChange(tags.filter((x) => x !== t))} aria-label={`Remove ${t}`}>
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className={styles.input}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
        />
        <button type="button" className={styles.btnGhost} onClick={add}>
          Add
        </button>
      </div>
    </div>
  );
}
