"use client";

import { useState } from "react";
import Link from "next/link";
import SearchForm from "@/components/whos/SearchForm";
import DepartmentCard from "@/components/whos/DepartmentCard";
import RepresentativeCard from "@/components/whos/RepresentativeCard";
import EscalationPath from "@/components/whos/EscalationPath";
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

      const departments = getDepartmentsForIssue(issueSlug, location.city);
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
    <>
      <section className="wr-hero flex min-h-[70vh] items-center">
        <div className="mx-auto w-full max-w-2xl px-4 py-16 sm:py-20">
          <p className="mb-4 text-xs font-semibold tracking-[0.25em] text-sky-200 uppercase">
            Civic accountability · India
          </p>
          <h1 className="mb-4 font-[family-name:var(--font-wr-display)] text-4xl font-bold text-white sm:text-5xl">
            Who&apos;s Responsible?
          </h1>
          <p className="mb-10 text-lg text-sky-100">
            Find the exact department and officer responsible for your civic
            issue — then hold them to it.
          </p>
          <SearchForm onSearch={handleSearch} loading={loading} variant="hero" />
          {error && (
            <p
              className="mt-4 rounded-lg border px-3 py-2 text-sm"
              style={{
                borderColor: "var(--wr-danger)",
                backgroundColor: "var(--wr-danger-bg)",
                color: "var(--wr-danger)",
              }}
            >
              {error}
            </p>
          )}
        </div>
      </section>

      {result && (
        <section
          id="results"
          className="mx-auto max-w-4xl space-y-8 px-4 py-12"
        >
          <div className="wr-card p-5">
            <h2 className="text-lg font-semibold text-stone-900">
              Responsibility for{" "}
              <span className="text-sky-700">{result.issueLabel}</span> in{" "}
              <span className="text-sky-700">
                {result.location.formattedAddress}
              </span>
            </h2>
            <p className="mt-1 text-sm text-stone-600">
              {result.location.city} · {result.location.state} ·{" "}
              {result.location.pinCode}
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold tracking-wide text-stone-500 uppercase">
              Responsible department
              {result.departments.length > 1 ? "s" : ""}
            </h3>
            {result.departments.map((dept) => (
              <DepartmentCard key={dept.id} department={dept} />
            ))}
          </div>

          {result.representatives.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold tracking-wide text-stone-500 uppercase">
                Your elected representatives
              </h3>
              {result.representatives.map((rep, i) => (
                <RepresentativeCard key={`${rep.type}-${i}`} rep={rep} />
              ))}
            </div>
          )}

          <EscalationPath />
        </section>
      )}

      <footer className="border-t border-[var(--wr-border)] px-4 py-10">
        <div className="mx-auto flex max-w-4xl flex-col gap-2 text-sm text-stone-600 sm:flex-row sm:items-center sm:justify-between">
          <p>
            Part of{" "}
            <Link href="/" className="font-medium text-sky-700 hover:text-sky-800">
              Cool Tools by Kul
            </Link>
            . Data from public sources; verify helplines before filing.
          </p>
        </div>
      </footer>
    </>
  );
}
