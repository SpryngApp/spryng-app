"use client";
import OrbitRings from "./OrbitRings";

export default function HeroOrbit() {
  const demo = [
    { name: "Revenue", value: 3200 },
    { name: "Marketing & Ads", value: 640 },
    { name: "Software", value: 210 },
    { name: "Contractor Labor", value: 980 },
    { name: "COGS", value: 450 },
  ];
  return (
    <div className="relative w-full max-w-xl">
      <div className="absolute -inset-10 rounded-full bg-emerald-200/20 blur-3xl" />
      <div className="relative rounded-3xl border bg-white/60 backdrop-blur p-4">
        <OrbitRings data={demo} score={82} />
      </div>
    </div>
  );
}
