import type { Metadata } from "next";
import PolicyMakersClient from "./PolicyMakersClient";

export const metadata: Metadata = {
  title: "PolicyMakers | Cool Tools by Kul",
  description:
    "A public square for citizen policy. Propose new laws, suggest changes to existing ones, and vote on what should change.",
};

export default function PolicyMakersPage() {
  return <PolicyMakersClient />;
}
