export type ParsedBenchmarkResult = {
  nodeCount: number;
  adjacency: number[][];
  permutation: number[];
  mapping: Array<{ from: number; to: number }>;
  verdict: "SIMILAR" | "DISSIMILAR";
};

export function parseBenchmarkResult(raw: string): ParsedBenchmarkResult {
  const lines = raw
    .trim()
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length < 3) {
    throw new Error("File too short — need at least node count, matrix, and verdict.");
  }

  const nodeCount = Number(lines[0]);
  if (!Number.isInteger(nodeCount) || nodeCount < 1) {
    throw new Error("First line must be a positive integer (node count).");
  }

  const matrixStart = 1;
  const matrixEnd = matrixStart + nodeCount;
  if (lines.length < matrixEnd + 2) {
    throw new Error(`Expected ${nodeCount} adjacency rows after node count.`);
  }

  const adjacency: number[][] = [];
  for (let i = matrixStart; i < matrixEnd; i++) {
    const row = lines[i].split(/\s+/).map(Number);
    if (row.length !== nodeCount || row.some((v) => v !== 0 && v !== 1)) {
      throw new Error(`Row ${i - matrixStart} must have ${nodeCount} values 0 or 1.`);
    }
    adjacency.push(row);
  }

  const permLine = lines[matrixEnd];
  const permutation = permLine.split(/\s+/).map(Number);
  if (permutation.length !== nodeCount) {
    throw new Error(`Permutation line must have ${nodeCount} integers.`);
  }

  const mapStart = matrixEnd + 1;
  const mapEnd = mapStart + nodeCount;
  const mapping: Array<{ from: number; to: number }> = [];
  for (let i = mapStart; i < mapEnd; i++) {
    const [from, to] = lines[i].split(/\s+/).map(Number);
    mapping.push({ from, to });
  }

  const verdictRaw = lines[mapEnd]?.toUpperCase();
  if (verdictRaw !== "SIMILAR" && verdictRaw !== "DISSIMILAR") {
    throw new Error('Verdict must be "SIMILAR" or "DISSIMILAR".');
  }

  return {
    nodeCount,
    adjacency,
    permutation,
    mapping,
    verdict: verdictRaw,
  };
}

export function parseAdjacencyMatrix(text: string): number[][] {
  const lines = text
    .trim()
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) throw new Error("Enter at least one row.");

  const n = lines[0].split(/\s+/).length;
  const matrix: number[][] = [];

  for (const line of lines) {
    const row = line.split(/\s+/).map(Number);
    if (row.length !== n) throw new Error("All rows must have the same length.");
    if (row.some((v) => v !== 0 && v !== 1)) {
      throw new Error("Adjacency values must be 0 or 1.");
    }
    matrix.push(row);
  }

  if (matrix.length !== n) {
    throw new Error(`Matrix must be ${n}×${n} (got ${matrix.length} rows).`);
  }

  for (let i = 0; i < n; i++) {
    if (matrix[i][i] !== 0) throw new Error("Diagonal must be 0 (no self-loops).");
    for (let j = i + 1; j < n; j++) {
      if (matrix[i][j] !== matrix[j][i]) {
        throw new Error("Matrix must be symmetric (undirected graph).");
      }
    }
  }

  return matrix;
}
