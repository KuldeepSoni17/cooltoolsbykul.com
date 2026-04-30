import type { Metadata } from "next";
import WorthItClient from "./WorthItClient";

export const metadata: Metadata = {
  title: "WorthIt? | Cool Tools by Kul",
  description: "A calm check-in tool to evaluate if a worry deserves your energy.",
};

export default function WorthItPage() {
  return <WorthItClient />;
}
