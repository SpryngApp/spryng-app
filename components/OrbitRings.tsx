"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import { CATEGORY_COLORS } from "@/lib/constants";

type Slice = { name: string; value: number };

export default function OrbitRings({
  data,
  score = 78,
}: {
  data: Slice[];
  score?: number;
}) {
  // Build concentric rings by stacking multiple Pies with different radii
  const total = data.reduce((a, b) => a + (b.value || 0), 0) || 1;
  const norm = data.map((d) => ({ ...d, value: Math.max(0.001, d.value) }));

  return (
    <div className="relative w-full h-72">
      <ResponsiveContainer>
        <PieChart>
          {norm.map((slice, i) => (
            <Pie
              key={slice.name}
              data={[slice]}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
              innerRadius={60 + i * 12}
              outerRadius={70 + i * 12}
              paddingAngle={2}
              isAnimationActive
              animationDuration={900 + i * 100}
            >
              <Cell fill={CATEGORY_COLORS[slice.name] || "#E5E7EB"} />
            </Pie>
          ))}
        </PieChart>
      </ResponsiveContainer>

      {/* Center score */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <div className="text-center">
          <div className="text-4xl font-semibold">{score}</div>
          <div className="text-xs text-slate-500">Clarity Score</div>
          <div className="mt-1 text-[11px] text-slate-500">
            {Math.round((data.find(d=>d.name==="Revenue")?.value || 0) / total * 100)}% revenue •{" "}
            {Math.round((total - (data.find(d=>d.name==="Revenue")?.value || 0)) / total * 100)}% spend
          </div>
        </div>
      </motion.div>
    </div>
  );
}
