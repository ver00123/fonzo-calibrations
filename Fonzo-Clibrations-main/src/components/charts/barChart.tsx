import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { jobOrdersApi } from "@/services/api.service"
import type { Database } from "@/types/database.types"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

export const description = "Revenue and job count over time"

type JobOrder = Database['public']['Tables']['job_orders']['Row']

interface ChartData {
  date: string
  revenue: number
  jobCount: number
}

const chartConfig = {
  metrics: {
    label: "Metrics",
  },
  revenue: {
    label: "Revenue (₱)",
    color: "hsl(142, 76%, 36%)",
  },
  jobCount: {
    label: "Job Count",
    color: "hsl(221, 83%, 53%)",
  },
} satisfies ChartConfig

export function ChartBarInteractive() {
  const [activeChart, setActiveChart] =
    React.useState<keyof typeof chartConfig>("revenue")
  const [chartData, setChartData] = React.useState<ChartData[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    loadRevenueData()
  }, [])

  const loadRevenueData = async () => {
    try {
      setLoading(true)
      const jobOrders = await jobOrdersApi.getAll()

      // Group by month and calculate revenue and job count (excluding cancelled orders)
      const dataMap = new Map<string, ChartData>()

      jobOrders.forEach((job: JobOrder) => {
        // Skip cancelled orders
        if (job.status === 'Cancelled') return;

        const date = new Date(job.created_at)
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

        if (!dataMap.has(monthKey)) {
          dataMap.set(monthKey, { date: monthKey, revenue: 0, jobCount: 0 })
        }

        const entry = dataMap.get(monthKey)!
        entry.revenue += job.total_cost || 0
        entry.jobCount++
      })

      // Convert map to array and sort by date
      const data = Array.from(dataMap.values()).sort((a, b) =>
        a.date.localeCompare(b.date)
      )

      setChartData(data)
    } catch (error) {
      console.error('Error loading revenue data:', error)
    } finally {
      setLoading(false)
    }
  }

  const total = React.useMemo(
    () => ({
      revenue: chartData.reduce((acc, curr) => acc + curr.revenue, 0),
      jobCount: chartData.reduce((acc, curr) => acc + curr.jobCount, 0),
    }),
    [chartData]
  )

  if (loading) {
    return (
      <Card className="py-0">
        <CardHeader className="flex flex-col items-stretch border-b !p-0">
          <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3">
            <CardTitle>Revenue & Job Metrics</CardTitle>
            <CardDescription>Loading...</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-2 sm:p-6">
          <div className="h-[250px] flex items-center justify-center">
            <p className="text-muted-foreground">Loading data...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="py-0">
      <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:!py-0">
          <CardTitle>Revenue & Job Metrics</CardTitle>
          <CardDescription>
            Showing revenue and job count by months
          </CardDescription>
        </div>
        <div className="flex">
          {["revenue", "jobCount"].map((key) => {
            const chart = key as keyof typeof chartConfig
            return (
              <button
                key={chart}
                data-active={activeChart === chart}
                className="data-[active=true]:bg-muted/50 relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
                onClick={() => setActiveChart(chart)}
              >
                <span className="text-muted-foreground text-xs">
                  {chartConfig[chart].label}
                </span>
                <span className="text-lg leading-none font-bold sm:text-3xl">
                  {key === 'revenue'
                    ? `₱${total[key as keyof typeof total].toLocaleString()}`
                    : total[key as keyof typeof total].toLocaleString()
                  }
                </span>
              </button>
            )
          })}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        {chartData.length === 0 ? (
          <div className="h-[250px] flex items-center justify-center">
            <p className="text-muted-foreground">No job orders found</p>
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <BarChart
              accessibilityLayer
              data={chartData}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const [year, month] = value.split('-')
                  const date = new Date(parseInt(year), parseInt(month) - 1)
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })
                }}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    className="w-[150px]"
                    nameKey="metrics"
                    labelFormatter={(value) => {
                      const [year, month] = value.split('-')
                      const date = new Date(parseInt(year), parseInt(month) - 1)
                      return date.toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                      })
                    }}
                  />
                }
              />
              <Bar dataKey={activeChart} fill={`var(--color-${activeChart})`} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
