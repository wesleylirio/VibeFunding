"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

/* brand.md §13 chart sequence */
const COLORS = [
  "#55f6a9",
  "#20d9c2",
  "#8268ff",
  "#3bc7ff",
  "#ff5a3d",
  "#f4b942",
];

export function CategoryDonut({
  data,
}: {
  data: { name: string; value: number }[];
}) {
  if (!data.length) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
        Invest to see category exposure
      </div>
    );
  }
  return (
    <div className="h-52">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={3}
            stroke="transparent"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "var(--chart-tooltip-bg)",
              border: "1px solid var(--chart-tooltip-border)",
              borderRadius: 12,
              fontSize: 12,
              color: "var(--foreground)",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-1 flex flex-wrap justify-center gap-2">
        {data.map((d, i) => (
          <div key={d.name} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: COLORS[i % COLORS.length] }}
            />
            {d.name}
          </div>
        ))}
      </div>
    </div>
  );
}

export function AssetBar({
  data,
}: {
  data: { name: string; value: number }[];
}) {
  return (
    <div className="h-52">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 8 }}>
          <CartesianGrid stroke="var(--chart-grid)" horizontal={false} />
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="name"
            width={88}
            tick={{ fill: "var(--chart-label)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: "var(--chart-tooltip-bg)",
              border: "1px solid var(--chart-tooltip-border)",
              borderRadius: 12,
              fontSize: 12,
              color: "var(--foreground)",
            }}
          />
          <Bar dataKey="value" radius={[0, 8, 8, 0]} fill="var(--accent)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
