type WeightedCapsule = {
  label: string;
  sourceIndex: number;
  width: number;
};

const NARROW_GLYPHS = /[\s.,:;!|ilI1\-]/u;
const WIDE_GLYPHS = /[MWЖШЩЮФ@%]/u;
const CAPSULE_GAP = 7;

export function estimateServiceCapsuleWidth(label: string) {
  const glyphUnits = Array.from(label).reduce((total, glyph) => {
    if (NARROW_GLYPHS.test(glyph)) return total + 0.46;
    if (WIDE_GLYPHS.test(glyph)) return total + 1.18;
    return total + 0.82;
  }, 0);

  // 26px mirrors the horizontal padding of a capsule. The multiplier tracks
  // the average JetBrains Mono glyph at the current chip token.
  return Math.round(26 + glyphUnits * 7.1);
}

export function balanceServiceCapsuleRows(labels: readonly string[]) {
  if (labels.length === 0) return [];
  if (labels.length < 3) return [[...labels]];

  const weighted = labels.map<WeightedCapsule>((label, sourceIndex) => ({
    label,
    sourceIndex,
    width: estimateServiceCapsuleWidth(label),
  }));

  if (weighted.length === 4) {
    const pairings = [
      [[0, 1], [2, 3]],
      [[0, 2], [1, 3]],
      [[0, 3], [1, 2]],
    ] as const;
    const widthOf = (indices: readonly number[]) => (
      indices.reduce((total, index) => total + weighted[index].width, 0)
      + CAPSULE_GAP * Math.max(0, indices.length - 1)
    );
    const bestPairing = pairings.reduce((best, candidate) => {
      const candidateWidths = candidate.map(widthOf);
      const bestWidths = best.map(widthOf);
      const candidateScore = Math.max(...candidateWidths) * 1000
        + Math.abs(candidateWidths[0] - candidateWidths[1]);
      const bestScore = Math.max(...bestWidths) * 1000
        + Math.abs(bestWidths[0] - bestWidths[1]);
      return candidateScore < bestScore ? candidate : best;
    });

    return bestPairing.map((row) => row
      .map((index) => weighted[index])
      .sort((left, right) => right.width - left.width || left.sourceIndex - right.sourceIndex)
      .map(({ label }) => label));
  }

  const sorted = [...weighted]
    .sort((left, right) => right.width - left.width || left.sourceIndex - right.sourceIndex);
  const rows: [WeightedCapsule[], WeightedCapsule[]] = [[], []];
  const rowWidths: [number, number] = [0, 0];

  sorted.forEach((capsule) => {
    const rowIndex = rowWidths[0] <= rowWidths[1] ? 0 : 1;
    rows[rowIndex].push(capsule);
    rowWidths[rowIndex] += capsule.width + (rows[rowIndex].length > 1 ? CAPSULE_GAP : 0);
  });

  rows.forEach((row) => row.sort((left, right) => left.sourceIndex - right.sourceIndex));
  return rows.map((row) => row.map(({ label }) => label));
}

export function balanceServiceCapsules(labels: readonly string[]) {
  return balanceServiceCapsuleRows(labels).flat();
}
