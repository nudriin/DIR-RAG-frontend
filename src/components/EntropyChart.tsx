interface EntropyChartProps {
    values: number[]
}

export default function EntropyChart({ values }: EntropyChartProps) {
    if (values.length === 0) return null

    const max = Math.max(...values)
    const min = Math.min(...values)
    const range = max - min || 1
    const height = 60
    const padding = 4
    const chartHeight = height - padding * 2

    const points = values
        .map((v, i) => {
            const x = values.length === 1 ? 50 : (i / (values.length - 1)) * 100
            const y = padding + chartHeight - ((v - min) / range) * chartHeight
            return `${x},${y}`
        })
        .join(" ")

    const areaPoints = `0,${height} ${points} 100,${height}`

    return (
        <div className="h-[60px] w-full overflow-hidden">
            <svg
                className="block h-[60px] w-full"
                viewBox={`0 0 100 ${height}`}
                preserveAspectRatio="none"
            >
                <defs>
                    <linearGradient
                        id="entropyGrad"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                    >
                        <stop offset="0%" stopColor="rgba(99, 102, 241, 0.3)" />
                        <stop offset="100%" stopColor="rgba(99, 102, 241, 0)" />
                    </linearGradient>
                </defs>
                <polygon points={areaPoints} fill="url(#entropyGrad)" />
                <polyline
                    points={points}
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="2"
                    vectorEffect="non-scaling-stroke"
                />
                {values.map((v, i) => {
                    const x =
                        values.length === 1
                            ? 50
                            : (i / (values.length - 1)) * 100
                    const y =
                        padding +
                        chartHeight -
                        ((v - min) / range) * chartHeight
                    return (
                        <circle
                            key={i}
                            cx={x}
                            cy={y}
                            r="2"
                            fill="#6366f1"
                            vectorEffect="non-scaling-stroke"
                        />
                    )
                })}
            </svg>
            <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                {values.map((v, i) => (
                    <span key={i}>{v.toFixed(4)}</span>
                ))}
            </div>
        </div>
    )
}
