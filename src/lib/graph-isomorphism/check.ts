/** Brute-force isomorphism check for small graphs (demo / verification). */
export function areIsomorphic(a: number[][], b: number[][]): boolean {
  const n = a.length;
  if (b.length !== n) return false;

  const perm = Array.from({ length: n }, (_, i) => i);
  const used = new Array(n).fill(false);

  function applyPerm(p: number[]): number[][] {
    const out: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        out[p[i]][p[j]] = b[i][j];
      }
    }
    return out;
  }

  function equal(m1: number[][], m2: number[][]): boolean {
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (m1[i][j] !== m2[i][j]) return false;
      }
    }
    return true;
  }

  function dfs(depth: number): boolean {
    if (depth === n) {
      return equal(a, applyPerm(perm));
    }
    for (let v = 0; v < n; v++) {
      if (used[v]) continue;
      used[v] = true;
      perm[depth] = v;
      if (dfs(depth + 1)) return true;
      used[v] = false;
    }
    return false;
  }

  return dfs(0);
}

export function degreeSequence(graph: number[][]): number[] {
  const counts = new Array(graph.length).fill(0);
  for (let i = 0; i < graph.length; i++) {
    for (let j = 0; j < graph.length; j++) {
      counts[i] += graph[i][j];
    }
  }
  return counts.sort((x, y) => x - y);
}

export function quickInvariantsMatch(a: number[][], b: number[][]): boolean {
  if (a.length !== b.length) return false;
  const degA = degreeSequence(a).join(",");
  const degB = degreeSequence(b).join(",");
  if (degA !== degB) return false;

  let edgesA = 0;
  let edgesB = 0;
  for (let i = 0; i < a.length; i++) {
    for (let j = i + 1; j < a.length; j++) {
      edgesA += a[i][j];
      edgesB += b[i][j];
    }
  }
  return edgesA === edgesB;
}
