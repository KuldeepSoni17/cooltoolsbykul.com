import type { Metadata } from "next";
import SongWriterClient from "./SongWriterClient";

export const metadata: Metadata = {
  title: "AI Songwriting Studio | Cool Tools by Kul",
  description:
    "Turn raw lyrics and humming ideas into structured songs, chord progressions, and production-ready packages.",
};

export default function SongWriterPage() {
  return <SongWriterClient />;
}
