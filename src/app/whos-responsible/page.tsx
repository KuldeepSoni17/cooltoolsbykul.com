"use client";

import { useState } from "react";
import Link from "next/link";
import SearchForm from "@/components/SearchForm";
import DepartmentCard from "@/components/DepartmentCard";
import RepresentativeCard from "@/components/RepresentativeCard";
import EscalationPath from "@/components/EscalationPath";
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
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <section className="flex min-h-[70vh] items-center bg-[var(--primary)] text-white">
        <div className="mx-auto max-w-2xl px-4 py-20">
          <p className="mb-4 text-xs tracking-[0.3em] text-blue-300 uppercase">
            Civic Accountability - India
          </p>
          <h1 className="mb-4 text-5xl font-bold text-white">
            Who&apos;s Responsible?
          </h1>
          <p className="mb-10 text-lg text-blue-200">
            Find the exact department and officer responsible for your civic
            issue. Then hold them to it.
          </p>
          <SearchForm onSearch={handleSearch} loading={loading} />
          {error && (
            <p className="mt-4 rounded border border-red-200 bg-red-100 px-3 py-2 text-sm text-red-800">
              {error}
            </p>
          )}
        </div>
      </section>

      {result && (
        <section id="results" className="mx-auto max-w-4xl space-y-8 px-4 py-12">
          <div className="rounded-2xl border border-[var(--border)] bg-white p-5">
            <h2 className="text-lg font-semibold">
              Responsibility for{" "}
              <span className="text-[var(--primary-light)]">{result.issueLabel}</span>{" "}
              in{" "}
              <span className="text-[var(--primary-light)]">
                {result.location.formattedAddress}
              </span>
            </h2>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              {result.location.city} - {result.location.state} - {result.location.pinCode}
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold tracking-wide text-[var(--text-muted)] uppercase">
              Responsible Department{result.departments.length > 1 ? "s" : ""}
            </h3>
            {result.departments.map((dept) => (
              <DepartmentCard key={dept.id} department={dept} />
            ))}
          </div>

          {result.representatives.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold tracking-wide text-[var(--text-muted)] uppercase">
                Your Elected Representatives
              </h3>
              {result.representatives.map((rep, i) => (
                <RepresentativeCard key={`${rep.type}-${i}`} rep={rep} />
              ))}
            </div>
          )}

          <EscalationPath />
        </section>
      )}

      <section className="mx-auto max-w-4xl px-4 py-16">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold">What citizens are reporting</h2>
          <Link
            href="/whos-responsible"
            className="text-sm font-semibold text-[var(--primary-light)] hover:underline"
          >
            Raise and track reports coming next →
          </Link>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-white p-6 text-sm text-[var(--text-muted)]">
          Reports feed and 6-step raise flow are being wired into this main
          site branch next. This page now uses the new v3 dashboard look and
          live department/representative resolution.
        </div>
      </section>
    </main>
  );
}
