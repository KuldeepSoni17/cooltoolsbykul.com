"use client";

import { DM_Sans, Lora } from "next/font/google";
import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./worth-it.module.css";

const lora = Lora({ subsets: ["latin"], variable: "--wi-font-display" });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--wi-font-body" });

const MAX_CHARS = 600;
const HISTORY_KEY = "worthit_history";

type Verdict = "not_worth_it" | "reflect" | "worth_it";

type WorryResult = {
  worryScore: number;
  controllability: number;
  likelihood: number;
  impact: number;
  verdict: Verdict;
  verdictLabel: string;
  controllabilityNote: string;
  likelihoodNote: string;
  impactNote: string;
  nudge: string;
};

type HistoryItem = {
  id: string;
  timestamp: string;
  worryText: string;
  worryScore: number;
  verdict: Verdict;
  verdictLabel: string;
  result: WorryResult;
};

function formatRelativeTime(value: string) {
  const date = new Date(value);
  const deltaMs = Date.now() - date.getTime();
  const mins = Math.round(deltaMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (hours < 48) return "Yesterday";
  const days = Math.round(hours / 24);
  return `${days} days ago`;
}

function scoreClass(score: number) {
  if (score <= 3) return styles.scoreLow;
  if (score <= 6) return styles.scoreMid;
  return styles.scoreHigh;
}

function truncate(text: string, limit: number) {
  return text.length > limit ? `${text.slice(0, limit)}...` : text;
}

function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || process.env.VITE_APP_URL || "https://cooltoolsbykul.com";
}

function parseResult(raw: string): WorryResult {
  const parsed = JSON.parse(raw) as WorryResult;
  return parsed;
}

async function fetchWorryResult(worryText: string): Promise<WorryResult> {
  const run = async () => {
    const res = await fetch("/api/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ worryText }),
    });
    if (!res.ok) throw new Error("NETWORK");
    const data = (await res.json()) as { output?: string };
    if (!data.output) throw new Error("INVALID_JSON");
    return parseResult(data.output);
  };

  try {
    return await run();
  } catch (error) {
    if (error instanceof SyntaxError || (error instanceof Error && error.message === "INVALID_JSON")) {
      return run();
    }
    throw error;
  }
}

export default function WorthItClient() {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const resultRef = useRef<HTMLElement | null>(null);

  const [worryText, setWorryText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<WorryResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [clearConfirm, setClearConfirm] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(HISTORY_KEY);
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as HistoryItem[];
      setHistory(parsed);
    } catch {
      localStorage.removeItem(HISTORY_KEY);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 20)));
  }, [history]);

  useEffect(() => {
    const node = textareaRef.current;
    if (!node) return;
    node.style.height = "auto";
    node.style.height = `${Math.min(node.scrollHeight, 140)}px`;
  }, [worryText]);

  const counterClass = useMemo(() => {
    if (worryText.length >= 580) return styles.counterDanger;
    if (worryText.length >= 500) return styles.counterWarn;
    return "";
  }, [worryText.length]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!worryText.trim() || loading) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetchWorryResult(worryText.trim());
      setResult(response);

      const nextEntry: HistoryItem = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        worryText: worryText.trim(),
        worryScore: response.worryScore,
        verdict: response.verdict,
        verdictLabel: response.verdictLabel,
        result: response,
      };

      setHistory((prev) => [nextEntry, ...prev].slice(0, 20));
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
    } catch (err) {
      if (err instanceof Error && err.message === "NETWORK") {
        setError("Couldn't reach the server. Please try again.");
      } else {
        setError("Couldn't parse the response. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  const currentVerdictClass =
    result?.verdict === "not_worth_it"
      ? styles.badgeLow
      : result?.verdict === "reflect"
        ? styles.badgeMid
        : styles.badgeHigh;

  return (
    <main className={`${styles.page} ${lora.variable} ${dmSans.variable}`}>
      <div className={styles.shell}>
        <header className={`${styles.header} ${styles.stagger1}`}>
          <h1>WorthIt?</h1>
          <p>Is your worry actually worth your energy?</p>
        </header>

        <section className={`${styles.inputCard} ${styles.stagger2}`}>
          <form onSubmit={onSubmit}>
            <label className={styles.inputLabel} htmlFor="worry-input">
              What&apos;s on your mind?
            </label>
            <div className={styles.textareaWrap}>
              <textarea
                id="worry-input"
                ref={textareaRef}
                value={worryText}
                disabled={loading}
                maxLength={MAX_CHARS}
                placeholder="e.g. I'm scared I'll embarrass myself at tomorrow's presentation..."
                onChange={(event) => setWorryText(event.target.value)}
              />
              <span className={`${styles.counter} ${counterClass}`}>
                {worryText.length} / {MAX_CHARS}
              </span>
            </div>
            <button type="submit" disabled={loading || !worryText.trim()} className={styles.submitBtn}>
              {loading ? <span className={styles.spinner} aria-hidden="true" /> : null}
              {loading ? "Thinking..." : "Worth Worrying?"}
            </button>
          </form>
          {error ? <p className={styles.errorText}>{error}</p> : null}
        </section>

        {result ? (
          <section aria-live="polite" className={styles.resultWrap} ref={resultRef}>
            <article className={styles.resultCard}>
              <p className={styles.resultTitle}>Worry Score</p>
              <p className={`${styles.scoreText} ${scoreClass(result.worryScore)}`}>
                {result.worryScore.toFixed(1)} / 10
              </p>
              <p className={`${styles.verdictBadge} ${currentVerdictClass}`}>{result.verdictLabel}</p>

              <div className={styles.sectionLabel}>Breakdown</div>
              {[
                ["Controllability", result.controllability, result.controllabilityNote],
                ["Likelihood", result.likelihood, result.likelihoodNote],
                ["Impact", result.impact, result.impactNote],
              ].map(([label, value, note], index) => (
                <div className={styles.dimensionRow} key={String(label)}>
                  <div className={styles.dimensionTop}>
                    <span>{label}</span>
                    <span>{value}/10</span>
                  </div>
                  <div className={styles.barTrack}>
                    <span
                      className={`${styles.barFill} ${currentVerdictClass}`}
                      style={{
                        width: `${Number(value) * 10}%`,
                        transitionDelay: `${index * 100}ms`,
                      }}
                    />
                  </div>
                  <p className={styles.dimensionNote}>{note}</p>
                </div>
              ))}

              <div className={styles.sectionLabel}>Our Take</div>
              <p className={styles.nudgeText}>{result.nudge}</p>

              <a
                href={`https://wa.me/?text=${encodeURIComponent(`I just checked my worry on WorthIt? 🌿

My worry scored *${result.worryScore.toFixed(1)}/10* - ${result.verdictLabel}!

"${truncate(worryText.trim(), 100)}"

Check yours 👉 ${getAppUrl()}`)}`}
                target="_blank"
                rel="noreferrer"
                className={styles.shareBtn}
              >
                Share on WhatsApp
              </a>
            </article>
          </section>
        ) : null}

        <section className={`${styles.historySection} ${styles.stagger3}`}>
          <button
            className={styles.historyToggle}
            type="button"
            aria-label="Toggle Past Checks"
            onClick={() => setHistoryOpen((prev) => !prev)}
          >
            <span>Past Checks</span>
            <span className={`${styles.chevron} ${historyOpen ? styles.chevronOpen : ""}`}>⌄</span>
          </button>

          <div className={`${styles.historyPanel} ${historyOpen ? styles.historyPanelOpen : ""}`}>
            {history.length === 0 ? (
              <p className={styles.emptyHistory}>No checks yet.</p>
            ) : (
              <ul className={styles.historyList}>
                {history.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      className={styles.historyItem}
                      onClick={() => {
                        setWorryText(item.worryText);
                        setResult(item.result);
                        setTimeout(
                          () => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
                          80
                        );
                      }}
                    >
                      <span className={styles.historyText}>{truncate(item.worryText, 120)}</span>
                      <span className={`${styles.historyScore} ${scoreClass(item.worryScore)}`}>
                        {item.worryScore.toFixed(1)}
                      </span>
                      <span className={`${styles.historyVerdict} ${item.verdict === "not_worth_it" ? styles.badgeLow : item.verdict === "reflect" ? styles.badgeMid : styles.badgeHigh}`}>
                        {item.verdictLabel}
                      </span>
                      <span className={styles.historyTime}>{formatRelativeTime(item.timestamp)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {history.length > 0 ? (
              <button
                type="button"
                className={styles.clearHistory}
                onClick={() => {
                  if (!clearConfirm) {
                    setClearConfirm(true);
                    return;
                  }
                  setHistory([]);
                  setClearConfirm(false);
                }}
              >
                {clearConfirm ? "Are you sure? Tap to confirm" : "Clear History"}
              </button>
            ) : null}
          </div>
        </section>

        <footer className={styles.footer}>Built to help you worry less. 🌿</footer>
      </div>
    </main>
  );
}
