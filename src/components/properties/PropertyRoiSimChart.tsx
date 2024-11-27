import { useMemo, useState } from 'react'
import { Clock, DollarSign } from 'lucide-react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'

const ROISimulationChart = ({ expectedROI = 12 }) => {
  const [investmentAmount, setInvestmentAmount] = useState(5000)
  const [timeFrameYears, setTimeFrameYears] = useState(1)

  // Generate data points based on selected time frame
  const simulationData = useMemo(() => {
    const monthlyROI = expectedROI / 12 // Monthly ROI rate
    const totalMonths = timeFrameYears * 12
    const data = []
    const today = new Date()

    for (let i = totalMonths; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1)
      const monthsElapsed = totalMonths - i
      const compoundedValue =
        investmentAmount * Math.pow(1 + monthlyROI / 100, monthsElapsed)

      data.push({
        month: date.toLocaleDateString('en-US', {
          month: monthsElapsed % 12 === 0 ? 'short' : 'numeric',
          year: '2-digit',
        }),
        value: compoundedValue,
        profit: compoundedValue - investmentAmount,
        isYearMark: monthsElapsed % 12 === 0,
      })
    }
    return data
  }, [investmentAmount, expectedROI, timeFrameYears])

  // Calculate current value and profit
  const currentValue = simulationData[simulationData.length - 1].value
  const totalProfit = currentValue - investmentAmount
  const profitPercentage = (totalProfit / investmentAmount) * 100

  const handleAmountSliderChange = (values: number[]) => {
    setInvestmentAmount(values[0])
  }

  const handleTimeFrameSliderChange = (values: number[]) => {
    setTimeFrameYears(values[0])
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value.replace(/[^0-9.]/g, ''))
    if (!isNaN(value)) {
      setInvestmentAmount(value)
    }
  }

  // Custom X-Axis tick formatter to show only year marks
  const formatXAxis = (tickItem: string, index: number) => {
    const dataPoint = simulationData[index]
    return dataPoint?.isYearMark ? tickItem : ''
  }

  const annualizedReturn =
    Math.pow(1 + totalProfit / investmentAmount, 1 / timeFrameYears) - 1

  return (
    <Card>
      <CardHeader>
        <CardTitle>ROI Simulation</CardTitle>
        <CardDescription>
          Simulate your investment performance over time
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-secondary/10 p-4">
            <div className="mb-1 text-sm text-muted-foreground">
              Initial Investment
            </div>
            <div className="text-2xl font-bold">
              ${investmentAmount.toLocaleString()}
            </div>
          </div>
          <div className="rounded-lg bg-secondary/10 p-4">
            <div className="mb-1 text-sm text-muted-foreground">
              Projected Value
            </div>
            <div className="text-2xl font-bold">
              ${Math.round(currentValue).toLocaleString()}
            </div>
          </div>
          <div className="rounded-lg bg-secondary/10 p-4">
            <div className="mb-1 text-sm text-muted-foreground">
              Total Return
            </div>
            <div
              className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}
            >
              {totalProfit >= 0 ? '+' : '-'}$
              {Math.abs(Math.round(totalProfit)).toLocaleString()}
              <span className="ml-1 text-sm">
                ({profitPercentage.toFixed(1)}%)
              </span>
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              {(annualizedReturn * 100).toFixed(1)}% annualized
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Investment Amount Control */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Investment Amount</label>
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  value={investmentAmount.toLocaleString()}
                  onChange={handleInputChange}
                  className="pl-8"
                />
              </div>
              <div className="flex-[2]">
                <Slider
                  value={[investmentAmount]}
                  onValueChange={handleAmountSliderChange}
                  min={1000}
                  max={100000}
                  step={1000}
                  className="mt-2"
                />
              </div>
            </div>
          </div>

          {/* Time Frame Control */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Time Frame</label>
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  value={`${timeFrameYears} ${timeFrameYears === 1 ? 'year' : 'years'}`}
                  readOnly
                  className="pl-8"
                />
              </div>
              <div className="flex-[2]">
                <Slider
                  value={[timeFrameYears]}
                  onValueChange={handleTimeFrameSliderChange}
                  min={1}
                  max={10}
                  step={1}
                  className="mt-2"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={simulationData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12 }}
                tickFormatter={formatXAxis}
                interval={0}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(value: number) => [
                  `$${Math.round(value).toLocaleString()}`,
                  'Value',
                ]}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#2D3142"
                strokeWidth={2}
                dot={false}
                className='dark:hidden'
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="white"
                strokeWidth={2}
                dot={false}
                className='hidden dark:block'
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          *Past performance does not guarantee future results. This simulation
          assumes a constant {expectedROI}% annual ROI.
        </div>
      </CardContent>
    </Card>
  )
}

export default ROISimulationChart
