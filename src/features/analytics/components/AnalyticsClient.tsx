"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  Cell,
} from "recharts";
import {
  TrendingUp, AlertTriangle, Tag, Sparkles, CheckCircle2,
  Target, Shirt, BarChart3, ArrowRight, Info,
} from "lucide-react";
import { capitalise, formatDate } from "@/utils/formatters";
import { cn } from "@/utils/cn";
import type { WardrobeAnalytics, WardrobeItem } from "@/types";

const ACCENT        = "#C8A46B";
const CAT_COLORS    = ["#C8A46B","#7C9CBF","#B07AB5","#6BAF92","#BF7C7C","#8E8E8E","#C4A882"];
const RADAR_STROKE  = "hsl(228 4% 18%)";

const container = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.07 } },
};
const sectionAnim = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
};

// ── Custom Tooltip ────────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; name?: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-xl px-3 py-2 text-xs border border-border shadow-xl">
      {label && <p className="text-foreground-muted mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="text-foreground font-medium">
          {p.name ? `${p.name}: ` : ""}{p.value}
        </p>
      ))}
    </div>
  );
}

// ── Section heading ───────────────────────────────────────────────────────────
function SectionHeading({ icon: Icon, title, action }: { icon: React.FC<{ className?: string }>; title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-accent" />
        <h2 className="text-sm font-medium text-foreground-muted tracking-wide uppercase">{title}</h2>
      </div>
      {action}
    </div>
  );
}

// ── Grade ring ────────────────────────────────────────────────────────────────
function GradeRing({ score, label, size = 80 }: { score: number; label: string; size?: number }) {
  const r    = (size - 16) / 2;
  const circ = 2 * Math.PI * r;
  const off  = circ - (score / 100) * circ;
  const color = score >= 75 ? ACCENT : score >= 50 ? "#7C9CBF" : score >= 25 ? "#E8A87C" : "#E07070";
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
          <circle cx={size/2} cy={size/2} r={r} stroke="hsl(228 4% 14%)" strokeWidth="8" fill="none" />
          <motion.circle
            cx={size/2} cy={size/2} r={r}
            stroke={color} strokeWidth="8" fill="none"
            strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: off }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-bold text-foreground" style={{ fontSize: size / 4 }}>{score}</span>
        </div>
      </div>
      <span className="text-xs text-foreground-muted text-center leading-snug">{label}</span>
    </div>
  );
}

export function AnalyticsClient(props: WardrobeAnalytics) {
  const {
    totalItems, byCategory, byColor, unusedItems, mostWornItems,
    healthScore, outfitPotential, variety, utilisation,
    totalOutfits, wornOutfits, averageWornCount, styleAlignment,
    gapAnalysis, wornByDay, healthHistory,
  } = props;

  const grade =
    healthScore >= 85 ? "A" : healthScore >= 70 ? "B" :
    healthScore >= 55 ? "C" : healthScore >= 35 ? "D" : "F";
  const gradeLabel = { A:"Excellent", B:"Good", C:"Fair", D:"Needs Work", F:"Just Starting" }[grade];

  const categoryData = Object.entries(byCategory)
    .map(([name, value]) => ({ name: capitalise(name), value }))
    .sort((a, b) => b.value - a.value);

  const topColors = Object.entries(byColor)
    .sort(([,a],[,b]) => b - a)
    .slice(0, 10);

  const radarData = [
    { subject: "Variety",   A: variety },
    { subject: "Usage",     A: utilisation },
    { subject: "Outfits",   A: outfitPotential },
    { subject: "Style",     A: styleAlignment },
    { subject: "Coverage",  A: Math.min(100,(Object.keys(byCategory).length/6)*100) },
  ];

  const recentActivity = wornByDay.slice(-14); // last 2 weeks for clarity

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-[1200px]">

      {/* ── Page title ─────────────────────────────────────────────────────── */}
      <motion.div variants={sectionAnim}>
        <h1 className="font-display text-display-md text-foreground leading-none">Analytics</h1>
        <p className="text-foreground-muted mt-2 text-sm">
          Deep insights into your wardrobe health and wearing habits.
        </p>
      </motion.div>

      {/* ── Health Score Hero ─────────────────────────────────────────────── */}
      <motion.div variants={sectionAnim}>
        <div className="glass rounded-2xl p-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-8">
            {/* Big score */}
            <div className="flex-shrink-0">
              <p className="text-xs text-foreground-muted tracking-widest uppercase mb-3">
                Closet Health Score
              </p>
              <div className="flex items-baseline gap-4">
                <span className="font-display text-[5rem] leading-none text-gradient-gold">
                  {healthScore}
                </span>
                <div>
                  <p className="text-3xl font-bold text-foreground">/100</p>
                  <p className="text-sm text-foreground-muted mt-1">
                    Grade <span className="text-foreground font-semibold">{grade}</span> — {gradeLabel}
                  </p>
                </div>
              </div>
            </div>

            {/* Sub-scores */}
            <div className="flex gap-6 lg:gap-10 flex-wrap">
              <GradeRing score={utilisation}     label="Utilisation" />
              <GradeRing score={variety}         label="Variety" />
              <GradeRing score={outfitPotential} label="Outfit Potential" />
              <GradeRing score={styleAlignment}  label="Style Alignment" />
            </div>

            {/* Radar */}
            <div className="flex-1 min-w-0 h-52">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} margin={{ top: 8, right: 24, bottom: 8, left: 24 }}>
                  <PolarGrid stroke={RADAR_STROKE} />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: "hsl(0 0% 50%)", fontSize: 11 }} />
                  <Radar dataKey="A" stroke={ACCENT} fill={ACCENT} fillOpacity={0.15} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick stats strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border">
            {[
              { label: "Total items",    value: totalItems },
              { label: "Saved outfits",  value: totalOutfits },
              { label: "Outfits worn",   value: wornOutfits },
              { label: "Avg worn / item",value: averageWornCount.toFixed(1) },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <p className="text-2xl font-bold text-foreground">{value}</p>
                <p className="text-xs text-foreground-muted mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {totalItems === 0 && (
            <div className="text-center mt-6 pt-6 border-t border-border">
              <p className="text-sm text-foreground-faint">
                Add items to your closet to unlock your health score.{" "}
                <Link href="/closet" className="text-accent hover:underline">Start now →</Link>
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* ── Health Score History ──────────────────────────────────────────── */}
      {healthHistory.length > 1 && (
        <motion.div variants={sectionAnim}>
          <div className="glass rounded-2xl p-6">
            <SectionHeading icon={TrendingUp} title="Score History" />
            <div className="h-36">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={healthHistory} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={ACCENT} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={ACCENT} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(228 4% 14%)" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "hsl(0 0% 40%)", fontSize: 10 }}
                    tickFormatter={(d: string) => d.slice(5)} // MM-DD
                    axisLine={false} tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fill: "hsl(0 0% 40%)", fontSize: 10 }}
                    axisLine={false} tickLine={false} width={28}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Area
                    type="monotone" dataKey="healthScore" name="Health"
                    stroke={ACCENT} strokeWidth={2}
                    fill="url(#scoreGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Wear Activity ─────────────────────────────────────────────────── */}
      <motion.div variants={sectionAnim}>
        <div className="glass rounded-2xl p-6">
          <SectionHeading icon={BarChart3} title="Wear Activity (last 14 days)" />
          {recentActivity.some((d) => d.outfits > 0) ? (
            <div className="h-36">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={recentActivity} margin={{ top: 4, right: 8, left: -20, bottom: 0 }} barSize={14}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(228 4% 14%)" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "hsl(0 0% 40%)", fontSize: 10 }}
                    tickFormatter={(d: string) => d.slice(8)} // DD
                    axisLine={false} tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: "hsl(0 0% 40%)", fontSize: 10 }}
                    axisLine={false} tickLine={false} width={24}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="outfits" name="Outfits worn" fill={ACCENT} radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-36 flex items-center justify-center">
              <p className="text-sm text-foreground-faint text-center">
                No wear activity in the last 14 days.<br />
                <Link href="/outfits" className="text-accent hover:underline text-xs">
                  Open an outfit and tap &quot;Wear today&quot;
                </Link>
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* ── Gap Analysis ──────────────────────────────────────────────────── */}
      <motion.div variants={sectionAnim}>
        <div className="glass rounded-2xl p-6">
          <SectionHeading icon={Target} title="Gap Analysis" />

          <div className="space-y-4">
            {/* Recommendations */}
            {gapAnalysis.recommendations.map((rec, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
                className="flex items-start gap-3 p-3 rounded-xl bg-surface-2"
              >
                <Info className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                <p className="text-sm text-foreground-muted">{rec}</p>
              </motion.div>
            ))}

            {/* Missing categories */}
            {gapAnalysis.missingCategories.length > 0 && (
              <div className="pt-2">
                <p className="text-xs text-foreground-faint uppercase tracking-wide mb-2">Missing categories</p>
                <div className="flex flex-wrap gap-2">
                  {gapAnalysis.missingCategories.map((cat) => (
                    <Link
                      key={cat}
                      href="/closet"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-dashed border-border text-xs text-foreground-faint hover:border-accent/50 hover:text-accent transition-all"
                    >
                      <span>+</span>
                      <span className="capitalize">{cat}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* ── Category + Colour ─────────────────────────────────────────────── */}
      <motion.div variants={sectionAnim} className="grid md:grid-cols-2 gap-5">
        {/* Category breakdown */}
        <div className="glass rounded-2xl p-6">
          <SectionHeading icon={Shirt} title="By Category" />
          {categoryData.length === 0 ? (
            <p className="text-foreground-faint text-sm text-center py-8">No items yet</p>
          ) : (
            <div className="space-y-3">
              {categoryData.map(({ name, value }, i) => (
                <div key={name} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground">{name}</span>
                    <span className="text-foreground-muted">{value}</span>
                  </div>
                  <div className="h-2 rounded-full bg-surface-2 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: CAT_COLORS[i % CAT_COLORS.length] }}
                      initial={{ width: 0 }}
                      animate={{ width: `${(value / totalItems) * 100}%` }}
                      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: i * 0.08 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Colour palette */}
        <div className="glass rounded-2xl p-6">
          <SectionHeading icon={Tag} title="Colour Palette" />
          {topColors.length === 0 ? (
            <p className="text-foreground-faint text-sm text-center py-8">No colours tagged yet</p>
          ) : (
            <div className="space-y-2.5">
              {topColors.map(([color, count]) => (
                <div key={color} className="flex items-center gap-3">
                  <div
                    className="w-5 h-5 rounded-full border border-border/60 flex-shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-foreground capitalize">{color}</span>
                      <span className="text-foreground-muted">{count}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-surface-2 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-accent/60"
                        initial={{ width: 0 }}
                        animate={{ width: `${(count / totalItems) * 100}%` }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* ── Style Alignment ───────────────────────────────────────────────── */}
      <motion.div variants={sectionAnim}>
        <div className="glass rounded-2xl p-6">
          <SectionHeading
            icon={Sparkles}
            title="Style Alignment"
            action={
              <Link href="/profile" className="text-xs text-accent hover:underline flex items-center gap-1">
                Edit Style DNA <ArrowRight className="h-3 w-3" />
              </Link>
            }
          />
          <div className="flex items-center gap-8">
            <GradeRing score={styleAlignment} label="Alignment" size={96} />
            <div className="flex-1 space-y-2">
              <p className="text-sm text-foreground">
                {styleAlignment >= 70
                  ? "Your wardrobe matches your stated style preferences closely."
                  : styleAlignment >= 40
                  ? "Some of your worn items differ from your style preferences."
                  : "You tend to wear items outside your stated colour palette — consider updating your Style DNA."}
              </p>
              <p className="text-xs text-foreground-faint">
                Calculated from worn item colours vs your favourite colour palette.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Most Worn + Unworn ────────────────────────────────────────────── */}
      <motion.div variants={sectionAnim} className="grid md:grid-cols-2 gap-5">
        {/* Most worn */}
        <div className="glass rounded-2xl p-6">
          <SectionHeading icon={TrendingUp} title="Most Worn" />
          {mostWornItems.length === 0 || mostWornItems.every((i) => i.wornCount === 0) ? (
            <p className="text-foreground-faint text-sm text-center py-8">
              Mark items as worn to see your favourites.
            </p>
          ) : (
            <div className="space-y-2">
              {mostWornItems.filter((i) => i.wornCount > 0).map((item, i) => (
                <Link
                  key={item.id}
                  href={`/closet/${item.id}`}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-surface-2 transition-colors group"
                >
                  <span className="text-xs text-foreground-faint w-5 text-right flex-shrink-0">#{i + 1}</span>
                  <div className="relative w-10 h-12 rounded-lg overflow-hidden bg-surface-2 flex-shrink-0">
                    {item.imageUrl ? (
                      <Image src={item.imageUrl} alt="" fill className="object-cover" sizes="40px" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Shirt className="h-4 w-4 text-foreground-faint" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {item.name ?? capitalise(item.category ?? "Item")}
                    </p>
                    <p className="text-xs text-foreground-muted capitalize">{item.category}</p>
                  </div>
                  <span className="text-xs text-accent font-semibold flex-shrink-0">
                    {item.wornCount}×
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Unworn */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <h2 className="text-sm font-medium text-foreground-muted tracking-wide uppercase">Unworn Items</h2>
            </div>
            {unusedItems.length > 0 && (
              <span className="text-xs text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                {unusedItems.length}
              </span>
            )}
          </div>
          {unusedItems.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle2 className="h-10 w-10 text-green-400 mx-auto mb-2" />
              <p className="text-sm text-foreground-muted">
                {totalItems === 0 ? "Add items to track utilisation." : "Everything's been worn — excellent!"}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {unusedItems.slice(0, 5).map((item) => (
                <Link
                  key={item.id}
                  href={`/closet/${item.id}`}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-surface-2 transition-colors group"
                >
                  <div className="relative w-10 h-12 rounded-lg overflow-hidden bg-surface-2 flex-shrink-0">
                    {item.imageUrl ? (
                      <Image src={item.imageUrl} alt="" fill className="object-cover" sizes="40px" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Tag className="h-4 w-4 text-foreground-faint" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {item.name ?? capitalise(item.category ?? "Item")}
                    </p>
                    <p className="text-xs text-foreground-muted capitalize">{item.category}</p>
                  </div>
                  <span className="text-xs text-foreground-faint flex-shrink-0">Never worn</span>
                </Link>
              ))}
              {unusedItems.length > 5 && (
                <p className="text-xs text-foreground-faint text-center pt-1">
                  +{unusedItems.length - 5} more
                </p>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* ── Category bar chart ────────────────────────────────────────────── */}
      {categoryData.length > 0 && (
        <motion.div variants={sectionAnim}>
          <div className="glass rounded-2xl p-6">
            <SectionHeading icon={BarChart3} title="Distribution" />
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} barSize={32} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(228 4% 14%)" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "hsl(0 0% 50%)", fontSize: 12 }}
                    axisLine={false} tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: "hsl(0 0% 40%)", fontSize: 11 }}
                    axisLine={false} tickLine={false} width={24}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="value" name="Items" radius={[6,6,0,0]}>
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
