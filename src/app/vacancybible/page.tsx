import type { Metadata } from "next";
import VacancyBibleClient from "./VacancyBibleClient";

export const metadata: Metadata = {
  title: "VacancyBible | Cool Tools by Kul",
  description:
    "Search-first PM job intelligence from company career pages with transparent confidence labels.",
};

export default function VacancyBiblePage() {
  return <VacancyBibleClient />;
}
