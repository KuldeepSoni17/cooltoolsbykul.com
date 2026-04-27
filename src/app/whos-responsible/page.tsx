"use client";

import { useState } from "react";
import SearchForm from "@/components/SearchForm";
import ResultsSection from "@/components/ResultsSection";
import { geocodeAddress, LocationData } from "@/lib/geocode";
import { fetchRepresentatives, Representative } from "@/lib/wikidata";
import { getDepartmentsForIssue } from "@/data/issue-mapping";
import { Department } from "@/data/departments";
import { fetchLiveOfficers } from "@/lib/officers";

interface SearchState {
  issueLabel: string;
  location: LocationData;
  departments: Department[];
  representatives: Representative[];
}

export default function WhosResponsiblePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SearchState | null>(null);

  async function handleSearch(
    issueSlug: string,
    issueLabel: string,
    address: string
  ) {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const location = await geocodeAddress(address);
      if (!location) {
        setError("Could not find that location. Try adding the city name.");
        return;
      }

      const departments = getDepartmentsForIssue(issueSlug);
      const liveOfficers = await fetchLiveOfficers(
        departments.map((department) => department.id)
      );
      const mergedDepartments = departments.map((department) => {
        const live = liveOfficers[department.id];
        if (live && live.length > 0) {
          return { ...department, officers: live };
        }
        return department;
      });
      const representatives = await fetchRepresentatives(
        location.city,
        location.state
      );

      setResult({
        issueLabel,
        location,
        departments: mergedDepartments,
        representatives,
      });

      setTimeout(() => {
        document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err) {
      setError("Something went wrong. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="border-b bg-white">
        <div className="mx-auto max-w-2xl px-4 py-12 sm:py-16">
          <p className="mb-2 text-xs font-semibold tracking-widest text-blue-600 uppercase">
            Civic Accountability - India
          </p>
          <h1 className="mb-3 text-3xl font-bold text-gray-900 sm:text-4xl">
            Who&apos;s Responsible?
          </h1>
          <p className="mb-8 text-base text-gray-500">
            Type your civic problem and location. Instantly see who&apos;s
            accountable - and how to reach them.
          </p>
          <SearchForm onSearch={handleSearch} loading={loading} />
          {error && (
            <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
              {error}
            </p>
          )}
        </div>
      </section>

      {result && <ResultsSection result={result} />}
    </main>
  );
}
