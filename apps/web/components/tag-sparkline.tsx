"use client"

import { useEffect, useState } from "react"

interface TagSparklineProps {
  tag: string
  dataPoints?: number[]
}

export function TagSparkline({ tag, dataPoints = [] }: TagSparklineProps) {
  const [points, setPoints] = useState<number[]>(dataPoints)

  useEffect(() => {
    // Generate fake sparkline data if not provided
    if (dataPoints.length === 0) {
      const generated = Array.from({ length: 7 }, () => Math.floor(Math.random() * 20) + 5)
      setPoints(generated)
    }
  }, [dataPoints])

  if (points.length === 0) return null

  const max = Math.max(...points)
  const min = Math.min(...points)
  const range = max - min || 1

  // SVG dimensions
  const width = 60
  const height = 24
  const padding = 2
  const chartWidth = width - padding * 2
  const chartHeight = height - padding * 2
  const pointSpacing = chartWidth / (points.length - 1)

  // Generate path
  const pathData = points
    .map((point, i) => {
      const x = padding + i * pointSpacing
      const y = padding + chartHeight - ((point - min) / range) * chartHeight
      return `${x},${y}`
    })
    .join(" L ")

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="inline-block"
      aria-label={`Activity sparkline for ${tag}`}
    >
      <polyline
        points={pathData}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
        className="text-primary opacity-70"
      />
    </svg>
  )
}
