"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { deleteProject, loadProjects, upsertProject } from "@/lib/songwriter/storage";
import type { RefineAction, SongAnalysis, SongProject } from "@/lib/songwriter/types";
import { emptyProject } from "@/lib/songwriter/types";
import DashboardStep from "./steps/DashboardStep";
import ExportStep from "./steps/ExportStep";
import LyricsStep from "./steps/LyricsStep";
import MelodyStep from "./steps/MelodyStep";
import ProjectStep from "./steps/ProjectStep";
import styles from "./songwriter.module.css";

type Step = "home" | "project" | "lyrics" | "melody" | "dashboard" | "export";

const STEPS: { id: Step; label: string }[] = [
  { id: "project", label: "Project" },
  { id: "lyrics", label: "Lyrics" },
  { id: "melody", label: "Melody" },
  { id: "dashboard", label: "Studio" },
  { id: "export", label: "Export" },
];

const API_KEY_STORAGE = "songwriter_api_key";

export default function SongWriterClient() {
  const [projects, setProjects] = useState<SongProject[]>([]);
  const [project, setProject] = useState<SongProject | null>(null);
  const [step, setStep] = useState<Step>("home");
  const [loading, setLoading] = useState(false);
  const [refining, setRefining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const audioRef = useRef<File | null>(null);

  useEffect(() => {
    setProjects(loadProjects());
    const savedKey = window.localStorage.getItem(API_KEY_STORAGE);
    if (savedKey) setApiKey(savedKey);
  }, []);

  const persist = useCallback(
    (p: SongProject) => {
      setProject(p);
      setProjects((prev) => upsertProject(p, prev));
    },
    [],
  );

  const startNew = () => {
    const p = emptyProject();
    setProject(p);
    setStep("project");
    setError(null);
  };

  const openProject = (p: SongProject) => {
    setProject(p);
    setStep(p.analysis ? "dashboard" : "project");
    setError(null);
  };

  const removeProject = (id: string) => {
    setProjects((prev) => deleteProject(id, prev));
    if (project?.id === id) {
      setProject(null);
      setStep("home");
    }
  };

  const stepIndex = STEPS.findIndex((s) => s.id === step);

  const canNext = () => {
    if (!project) return false;
    if (step === "project") return project.meta.projectName.trim().length > 0;
    if (step === "lyrics") return project.lyrics.rawLyrics.trim().length > 0;
    if (step === "melody") return true;
    return false;
  };

  const goNext = async () => {
    if (!project) return;
    if (step === "project") setStep("lyrics");
    else if (step === "lyrics") setStep("melody");
    else if (step === "melody") await runAnalysis();
    else if (step === "dashboard") setStep("export");
  };

  const goBack = () => {
    if (step === "lyrics") setStep("project");
    else if (step === "melody") setStep("lyrics");
    else if (step === "dashboard") setStep("melody");
    else if (step === "export") setStep("dashboard");
  };

  const runAnalysis = async () => {
    if (!project) return;
    setLoading(true);
    setError(null);
    setStep("dashboard");
    try {
      const res = await fetch("/api/songwriter/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meta: project.meta,
          lyrics: project.lyrics,
          melody: project.melody,
          hasAudio: Boolean(audioRef.current),
          apiKey: apiKey || undefined,
        }),
      });
      const data = (await res.json()) as { analysis?: SongAnalysis; error?: string };
      if (!res.ok) throw new Error(data.error || "Analysis failed");

      const history = [
        ...project.history,
        {
          version: project.history.length + 1,
          summary: "AI draft generated",
          at: new Date().toISOString(),
        },
      ];
      persist({ ...project, analysis: data.analysis!, history, updatedAt: new Date().toISOString() });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
      setStep("melody");
    } finally {
      setLoading(false);
    }
  };

  const handleRefine = async (
    sectionType: string,
    content: string,
    action: RefineAction,
    feedback?: string,
  ) => {
    if (!project) return "";
    setRefining(true);
    setError(null);
    try {
      const res = await fetch("/api/songwriter/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meta: project.meta,
          sectionType,
          content,
          action,
          feedback,
          apiKey: apiKey || undefined,
        }),
      });
      const data = (await res.json()) as { content?: string; error?: string };
      if (!res.ok) throw new Error(data.error || "Refine failed");

      const history = [
        ...project.history,
        {
          version: project.history.length + 1,
          summary: `Refined ${sectionType} (${action})`,
          at: new Date().toISOString(),
        },
      ];
      persist({ ...project, history, updatedAt: new Date().toISOString() });
      return data.content ?? "";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Refine failed");
      return "";
    } finally {
      setRefining(false);
    }
  };

  const saveApiKey = () => {
    window.localStorage.setItem(API_KEY_STORAGE, apiKey);
    setShowSettings(false);
  };

  return (
    <div className={styles.shell}>
      <header className={`${styles.header} sticky top-0 z-20`}>
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
          <div>
            <Link href="/" className="text-xs text-zinc-500 hover:text-zinc-300">
              ← cooltoolsbykul
            </Link>
            <h1 className="text-xl font-semibold mt-1">AI Songwriting Studio</h1>
            <span className={styles.badge}>Creator-first partner</span>
          </div>
          <button type="button" className={styles.btnGhost} onClick={() => setShowSettings((s) => !s)}>
            API key
          </button>
        </div>
        {showSettings && (
          <div className="mx-auto max-w-5xl px-6 pb-4">
            <div className={styles.card}>
              <p className="text-sm text-zinc-400 mb-2">
                Optional: use your Anthropic key. Server key is used if set.
              </p>
              <div className="flex gap-2">
                <input
                  type="password"
                  className={styles.input}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-ant-..."
                />
                <button type="button" className={styles.btnPrimary} onClick={saveApiKey}>
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        {error && <div className={`${styles.error} mb-6`}>{error}</div>}

        {step === "home" && (
          <div>
            <p className="text-zinc-400 mb-6 max-w-2xl">
              Turn raw lyrics and humming ideas into structured songs, chord progressions, and
              production-ready packages — while keeping your voice.
            </p>
            <button type="button" className={styles.btnPrimary} onClick={startNew}>
              New song project
            </button>
            {projects.length > 0 && (
              <div className="mt-8 grid gap-3">
                <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-wide">
                  Your projects
                </h2>
                {projects.map((p) => (
                  <div key={p.id} className={`${styles.card} flex items-center justify-between gap-4`}>
                    <button type="button" className="text-left flex-1" onClick={() => openProject(p)}>
                      <p className="font-medium">{p.meta.projectName || "Untitled"}</p>
                      <p className="text-sm text-zinc-500">
                        {p.meta.genre} · {p.meta.primaryLanguage} ·{" "}
                        {new Date(p.updatedAt).toLocaleDateString()}
                      </p>
                    </button>
                    <button
                      type="button"
                      className={`${styles.btnGhost} text-red-400`}
                      onClick={() => removeProject(p.id)}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {project && step !== "home" && (
          <>
            <nav className={`${styles.stepNav} mb-8`}>
              {STEPS.map((s, i) => {
                const done = stepIndex > i || (s.id === "dashboard" && project.analysis);
                const active = step === s.id || (step === "export" && s.id === "export");
                return (
                  <span
                    key={s.id}
                    className={`${styles.stepPill} ${active ? styles.stepPillActive : ""} ${done ? styles.stepPillDone : ""}`}
                  >
                    {s.label}
                  </span>
                );
              })}
            </nav>

            {step === "project" && <ProjectStep project={project} onChange={persist} />}
            {step === "lyrics" && <LyricsStep project={project} onChange={persist} />}
            {step === "melody" && (
              <MelodyStep
                project={project}
                onChange={persist}
                onAudioSelect={(f) => {
                  audioRef.current = f;
                }}
              />
            )}
            {step === "dashboard" && (
              <>
                {loading && (
                  <p className="text-fuchsia-300 animate-pulse mb-4">
                    Analyzing your song — structure, chords, hooks...
                  </p>
                )}
                {project.analysis && !loading && (
                  <DashboardStep
                    project={project}
                    analysis={project.analysis}
                    onChange={(analysis) => persist({ ...project, analysis })}
                    onRefine={handleRefine}
                    refining={refining}
                  />
                )}
              </>
            )}
            {step === "export" && <ExportStep project={project} />}

            <div className="mt-8 flex flex-wrap gap-3">
              {step !== "project" && (
                <button type="button" className={styles.btnGhost} onClick={goBack}>
                  Back
                </button>
              )}
              {step !== "export" && step !== "dashboard" && (
                <button
                  type="button"
                  className={styles.btnPrimary}
                  disabled={!canNext() || loading}
                  onClick={goNext}
                >
                  {step === "melody" ? (loading ? "Analyzing..." : "Generate song draft") : "Continue"}
                </button>
              )}
              {step === "dashboard" && project.analysis && (
                <button type="button" className={styles.btnPrimary} onClick={() => setStep("export")}>
                  Final package →
                </button>
              )}
              <button
                type="button"
                className={styles.btnGhost}
                onClick={() => {
                  if (project) persist(project);
                  setStep("home");
                }}
              >
                Save & exit
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
