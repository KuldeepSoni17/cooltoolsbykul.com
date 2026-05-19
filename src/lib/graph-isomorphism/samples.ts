export const EXAMPLE_10_NODES = `10
0 1 1 1 0 1 0 1 1 0
1 0 0 0 1 0 0 0 0 0
1 0 0 1 1 0 1 0 1 1
1 0 1 0 0 1 1 0 1 0
0 1 1 0 0 1 1 1 0 0
1 0 0 1 1 0 1 0 1 0
0 0 1 1 1 1 0 1 0 1
1 0 0 0 1 0 1 0 1 0
1 0 1 1 0 1 0 1 0 1
0 0 1 0 0 0 1 0 1 0
0 5 4 3 2 6 9 7 1 8
0 0
1 8
2 4
3 3
4 2
5 1
6 5
7 7
8 9
9 6
SIMILAR`;

export const BENCHMARK_STATS = [
  { range: "4–50 nodes", instances: "~4,700", folder: "benchmark-results/4-50" },
  { range: "51–100 nodes", instances: "~50", folder: "benchmark-results/51-100" },
  { range: "101–400 nodes", instances: "~300+", folder: "benchmark-results/101-400" },
  { range: "Total reported", instances: "470,000+", folder: "full batch runs + benchmarks" },
] as const;

export const GITHUB_LINKS = {
  layersApproach: "https://github.com/KuldeepSoni17/GraphSimilarity_LayersApproach",
  solverResults: "https://github.com/KuldeepSoni17/Graph_Isomorphism_Solver_Result",
} as const;
