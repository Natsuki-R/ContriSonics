import Link from "next/link";

const heatmapPalette = [
  "#161b22",
  "#0e4429",
  "#006d32",
  "#26a641",
  "#39d353",
];

const ROWS = 7;
const COLUMNS = 20;
const highlightCells = [
  { row: 5, column: 4 },
  { row: 4, column: 8 },
  { row: 3, column: 12 },
  { row: 1, column: 16 },
];

const heatmapData: number[][] = Array.from({ length: ROWS }, (_, row) =>
  Array.from({ length: COLUMNS }, (_, column) => {
    const isHighlight = highlightCells.some(
      (cell) => cell.row === row && cell.column === column
    );
    if (isHighlight) return 4;

    const isNearHighlight = highlightCells.some(
      (cell) =>
        Math.abs(cell.row - row) + Math.abs(cell.column - column) === 1
    );
    if (isNearHighlight) return 2;

    return 0;
  })
);

export default function HeatmapPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <div className="max-w-5xl mx-auto p-6 flex flex-col gap-8">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">GitHub 2D Heatmap</h1>
            <p className="opacity-70 text-sm">
              A flat view inspired by GitHub&apos;s contribution calendar with familiar
              green intensity levels.
            </p>
          </div>
          <Link
            href="/"
            className="px-3 py-1 rounded bg-neutral-800 hover:bg-neutral-700"
          >
            ← Back to main experience
          </Link>
        </header>

        <section className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-6">
          <div className="flex flex-col gap-4">
            <div
              className="grid gap-2"
              style={{
                gridTemplateColumns: `repeat(${heatmapData[0].length}, minmax(0, 1fr))`,
              }}
            >
              {heatmapData.flatMap((row, rowIndex) =>
                row.map((value, columnIndex) => (
                  <div
                    key={`${rowIndex}-${columnIndex}`}
                    className="aspect-square rounded-sm border border-neutral-800"
                    style={{ backgroundColor: heatmapPalette[value] }}
                    aria-label={`Day ${columnIndex + 1}, intensity level ${value}`}
                    title={`Day ${columnIndex + 1}: level ${value}`}
                  />
                ))
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <span>Less</span>
              {heatmapPalette.map((color, index) => (
                <div
                  key={color}
                  className="h-3 w-3 rounded-sm border border-neutral-800"
                  style={{ backgroundColor: color }}
                  aria-label={`Legend intensity ${index}`}
                />
              ))}
              <span>More</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
