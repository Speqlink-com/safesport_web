"use client";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Empty } from "./ui";

function colorFor(name: string) {
  const value = name.toLowerCase();
  if (
    /not cleared|overdue|blocked|failed|suspended|declined|withdrawn/.test(
      value,
    )
  )
    return "#ef4444";
  if (/^cleared$|^reviewed$|complete|^active$|obtained/.test(value))
    return "#10b981";
  if (/monitoring|restriction|review|paused/.test(value)) return "#f59e0b";
  if (/progress|processing|assigned|invited/.test(value)) return "#38bdf8";
  return "#94a3b8";
}

/** Snapshot counts only: never imply a historical trend from the demo fixtures. */
export function Distribution({
  data,
  label,
}: {
  data: { name: string; value: number }[];
  label: string;
}) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  if (!total)
    return (
      <Empty
        title="No data to summarize"
        description="This chart will update as records are added."
      />
    );
  return (
    <div className="grid min-w-0 items-center gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="relative h-52 min-w-0" aria-label={label}>
        <ResponsiveContainer
          initialDimension={{ width: 320, height: 208 }}
          width="100%"
          height="100%"
          minWidth={0}
        >
          <PieChart accessibilityLayer>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius="68%"
              outerRadius="88%"
              paddingAngle={3}
              stroke="none"
              isAnimationActive={false}
            >
              {data.map((item) => (
                <Cell key={item.name} fill={colorFor(item.name)} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) =>
                active && payload?.length ? (
                  <div className="rounded-lg border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-sm">
                    {payload[0].name}: {payload[0].value}
                  </div>
                ) : null
              }
            />
          </PieChart>
        </ResponsiveContainer>
        <div
          className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"
          aria-hidden="true"
        >
          <span className="text-3xl font-bold tabular-nums">{total}</span>
          <span className="text-xs text-muted-foreground">Total records</span>
        </div>
      </div>
      <dl className="space-y-3">
        {data.map((item) => (
          <div
            key={item.name}
            className="flex items-center justify-between gap-3 border-b border-border/40 pb-3 text-xs"
          >
            <dt className="flex items-center gap-2">
              <svg className="size-2 shrink-0" aria-hidden="true">
                <circle cx="4" cy="4" r="4" fill={colorFor(item.name)} />
              </svg>
              {item.name}
            </dt>
            <dd className="font-semibold tabular-nums">{item.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
