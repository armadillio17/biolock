"use client"

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartData = [
  { month: "January", absences: 186, presence: 80 },
  { month: "February", absences: 305, presence: 200 },
  { month: "March", absences: 237, presence: 120 },
  { month: "April", absences: 73, presence: 190 },
  { month: "May", absences: 209, presence: 130 },
  { month: "June", absences: 214, presence: 140 },
]

// Use color property instead of gradient in chartConfig
const chartConfig = {
  absences: {
    label: "Absences",
    color: "#8061DB", // Use a color instead of gradient reference
  },
  presence: {
    label: "Presence",
    color: "#8061DB", // Use a color instead of gradient reference
  },
} satisfies ChartConfig

export default function Chart() {
  // Store gradient IDs to use them in the Bar components
  const gradientIds = {
    absences: "gradientAbsences",
    presence: "gradientPresence",
  }

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <BarChart accessibilityLayer data={chartData}>
        {/* Define Gradients */}
        <defs>
          <linearGradient id={gradientIds.absences} x1="0" y1="0" x2="0" y2="1">
            <stop offset="38%" stopColor="#8061DB" stopOpacity={1} />
            <stop offset="94%" stopColor="#8061DB" stopOpacity={0.3} />
          </linearGradient>
          <linearGradient id={gradientIds.presence} x1="0" y1="0" x2="0" y2="1">
            <stop offset="38%" stopColor="#8061DB" stopOpacity={1} />
            <stop offset="94%" stopColor="#8061DB" stopOpacity={0.3} />
          </linearGradient>
        </defs>

        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />

        {/* Apply Gradients directly in the fill property */}
        <Bar dataKey="absences" fill={`url(#${gradientIds.absences})`} radius={4} />
        <Bar dataKey="presence" fill={`url(#${gradientIds.presence})`} radius={4} />
      </BarChart>
    </ChartContainer>
  )
}