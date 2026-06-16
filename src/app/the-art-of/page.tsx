import type { Metadata } from "next";
import TheArtOfApp from "./TheArtOfApp";

export const metadata: Metadata = {
  title: "The Art Of - A library of A+++ craft knowledge",
  description:
    "A curated library of the best books, channels, essays, masters and resources for serious crafts: filmmaking, acting, writing, photography, music, drawing, crochet, cooking, woodworking, programming and more.",
  openGraph: {
    title: "The Art Of - A library of A+++ craft knowledge",
    description:
      "Curated A+++ resources for serious crafts. The books, channels, and masters that working practitioners actually swear by.",
    type: "website",
  },
};

export default function Page() {
  return <TheArtOfApp />;
}
