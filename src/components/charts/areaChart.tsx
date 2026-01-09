import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
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
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export const description = "Job orders over time by status"

type JobOrder = Database['public']['Tables']['job_orders']['Row']

interface ChartData {
  date: string
  completed: number
  inProgress: number
  pending: number
}

const chartConfig = {
  jobs: {
    label: "Jobs",
  },
  completed: {
    label: "Completed",
    color: "hsl(142, 76%, 36%)",
  },
  inProgress: {
    label: "In Progress",
    color: "hsl(221, 83%, 53%)",
  },
  pending: {
    label: "Pending",
    color: "hsl(48, 96%, 53%)",
  },
} satisfies ChartConfig

export function ChartAreaInteractive() {
  const [timeRange, setTimeRange] = React.useState("90d")
  const [chartData, setChartData] = React.useState<ChartData[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    loadJobOrdersData()
  }, [])

  const loadJobOrdersData = async () => {
    try {
      setLoading(true)
      const jobOrders = await jobOrdersApi.getAll()

      // Group job orders by date and status
      const dataMap = new Map<string, ChartData>()

      jobOrders.forEach((job: JobOrder) => {
        const date = new Date(job.created_at).toISOString().split('T')[0]

        if (!dataMap.has(date)) {
          dataMap.set(date, { date, completed: 0, inProgress: 0, pending: 0 })
        }

        const entry = dataMap.get(date)!
        if (job.status === 'Completed') {
          entry.completed++
        } else if (job.status === 'In Progress') {
          entry.inProgress++
        } else if (job.status === 'Pending') {
          entry.pending++
        }
      })

      // Convert map to array and sort by date
      const data = Array.from(dataMap.values()).sort((a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
      )

      setChartData(data)
    } catch (error) {
      console.error('Error loading job orders data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredData = React.useMemo(() => {
    if (chartData.length === 0) return []

    const now = new Date()
    let daysToSubtract = 90
    if (timeRange === "30d") {
      daysToSubtract = 30
    } else if (timeRange === "7d") {
      daysToSubtract = 7
    }
    const startDate = new Date(now)
    startDate.setDate(startDate.getDate() - daysToSubtract)

    return chartData.filter((item) => {
      const date = new Date(item.date)
      return date >= startDate
    })
  }, [chartData, timeRange])

  if (loading) {
    return (
      <Card className="pt-0">
        <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5">
          <div className="grid flex-1 gap-1">
            <CardTitle>Job Orders Over Time</CardTitle>
            <CardDescription>Loading...</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <div className="h-[250px] flex items-center justify-center">
            <p className="text-muted-foreground">Loading data...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="pt-0">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Job Orders Over Time</CardTitle>
          <CardDescription>
            Showing job orders by status for the selected period
          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="hidden w-[160px] rounded-lg sm:ml-auto sm:flex"
            aria-label="Select a value"
          >
            <SelectValue placeholder="Last 3 months" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="90d" className="rounded-lg">
              Last 3 months
            </SelectItem>
            <SelectItem value="30d" className="rounded-lg">
              Last 30 days
            </SelectItem>
            <SelectItem value="7d" className="rounded-lg">
              Last 7 days
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {filteredData.length === 0 ? (
          <div className="h-[250px] flex items-center justify-center">
            <p className="text-muted-foreground">No job orders found for this period</p>
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <AreaChart data={filteredData}>
              <defs>
                <linearGradient id="fillCompleted" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-completed)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-completed)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
                <linearGradient id="fillInProgress" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-inProgress)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-inProgress)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
                <linearGradient id="fillPending" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-pending)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-pending)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                }}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => {
                      return new Date(value).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    }}
                    indicator="dot"
                  />
                }
              />
              <Area
                dataKey="pending"
                type="natural"
                fill="url(#fillPending)"
                stroke="var(--color-pending)"
                stackId="a"
              />
              <Area
                dataKey="inProgress"
                type="natural"
                fill="url(#fillInProgress)"
                stroke="var(--color-inProgress)"
                stackId="a"
              />
              <Area
                dataKey="completed"
                type="natural"
                fill="url(#fillCompleted)"
                stroke="var(--color-completed)"
                stackId="a"
              />
              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
