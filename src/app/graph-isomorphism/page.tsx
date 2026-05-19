import type { Metadata } from "next";
import GraphIsoClient from "./GraphIsoClient";

export const metadata: Metadata = {
  title: "Graph Isomorphism | Cool Tools by Kul",
  description:
    "Layers-based graph isomorphism research: algorithm overview, benchmark results, and interactive tools.",
};

export default function GraphIsomorphismPage() {
  return <GraphIsoClient />;
}
