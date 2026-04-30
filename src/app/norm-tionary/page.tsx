import type { Metadata } from "next";
import NormTionaryClient from "./NormTionaryClient";

export const metadata: Metadata = {
  title: "norm-tionary | Cool Tools by Kul",
  description: "A swipeable index of normalized dysfunctions.",
};

export default function NormTionaryPage() {
  return <NormTionaryClient />;
}
