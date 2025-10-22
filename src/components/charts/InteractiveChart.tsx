import React, { useState, useCallback, useMemo } from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Brush,
  ReferenceLine
} from 'recharts'
import { Box, IconButton } from '@chakra-ui/react'
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'
import { ChartType } from '../../stores/dashboardStore'

interface DataPoint {
  date: string
  [key: string]: any
}

interface InteractiveChartProps {
  data: DataPoint[]
  chartType: ChartType
  height?: number
  showBrush?: boolean
  showMovingAverage?: boolean
  showTrendLine?: boolean
  movingAverageData?: Record<string, number[]>
  colors?: string[]
  title?: string
  xAxisKey?: string
  yAxisKeys?: string[]
  formatXAxis?: (value: any) => string
  formatYAxis?: (value: any) => string
  formatTooltip?: (value: any, name: string) => [string, string]
}

const InteractiveChart: React.FC<InteractiveChartProps> = ({
  data,
  chartType,
  height = 300,
  showBrush = true,
  showMovingAverage = false,
  showTrendLine = false,
  movingAverageData = {},
  colors = ['#3182CE', '#E53E3E', '#38A169', '#D69E2E'],
  title,
  xAxisKey = 'date',
  yAxisKeys = [],
  formatXAxis,
  formatYAxis,
  formatTooltip
}) => {
  // Note: zoomLevel and panOffset are prepared for future zoom/pan functionality
  const [, setZoomLevel] = useState(1)
  const [, setPanOffset] = useState({ x: 0, y: 0 })

  // Theme-aware colors
  const bgColor = 'surface.50'
  const gridColor = 'muted.200'
  const textColor = 'text.primary'

  // Auto-detect y-axis keys if not provided
  const detectedYAxisKeys = useMemo(() => {
    if (yAxisKeys.length > 0) return yAxisKeys
    if (data.length === 0) return []

    const keys = Object.keys(data[0]).filter(key =>
      key !== xAxisKey && typeof data[0][key] === 'number'
    )
    return keys
  }, [data, xAxisKey, yAxisKeys])

  const chartKeys = detectedYAxisKeys.length > 0 ? detectedYAxisKeys : yAxisKeys

  const handleZoomIn = useCallback(() => {
    setZoomLevel(prev => Math.min(prev * 1.5, 5))
  }, [])

  const handleZoomOut = useCallback(() => {
    setZoomLevel(prev => Math.max(prev / 1.5, 0.5))
  }, [])

  const handleReset = useCallback(() => {
    setZoomLevel(1)
    setPanOffset({ x: 0, y: 0 })
  }, [])

  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    }

    switch (chartType) {
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis
              dataKey={xAxisKey}
              stroke={textColor}
              tickFormatter={formatXAxis}
            />
            <YAxis
              stroke={textColor}
              tickFormatter={formatYAxis}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: bgColor,
                border: `1px solid ${gridColor}`,
                borderRadius: '6px'
              }}
              formatter={formatTooltip}
            />
            <Legend />
            {chartKeys.map((key, index) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stackId="1"
                stroke={colors[index % colors.length]}
                fill={colors[index % colors.length]}
                 fillOpacity={0.6}
               />
             ))}
             {showMovingAverage && Object.entries(movingAverageData).map(([key]) => (
               <Line
                 key={`ma-${key}`}
                 type="monotone"
                 dataKey={`ma${key}`}
                 stroke="#FF6B6B"
                 strokeWidth={2}
                 strokeDasharray="5 5"
                 dot={false}
               />
             ))}
             {showTrendLine && (
               <ReferenceLine
                 stroke="#9CA3AF"
                 strokeDasharray="2 2"
                 strokeWidth={1}
               />
             )}
           </AreaChart>
        )

      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis
              dataKey={xAxisKey}
              stroke={textColor}
              tickFormatter={formatXAxis}
            />
            <YAxis
              stroke={textColor}
              tickFormatter={formatYAxis}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: bgColor,
                border: `1px solid ${gridColor}`,
                borderRadius: '6px'
              }}
              formatter={formatTooltip}
            />
            <Legend />
            {chartKeys.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                fill={colors[index % colors.length]}
              />
            ))}
          </BarChart>
        )

      case 'scatter':
        return (
          <ScatterChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis
              dataKey={xAxisKey}
              stroke={textColor}
              tickFormatter={formatXAxis}
            />
            <YAxis
              stroke={textColor}
              tickFormatter={formatYAxis}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: bgColor,
                border: `1px solid ${gridColor}`,
                borderRadius: '6px'
              }}
              formatter={formatTooltip}
            />
            <Legend />
            {chartKeys.map((key, index) => (
              <Scatter
                key={key}
                dataKey={key}
                fill={colors[index % colors.length]}
              />
            ))}
          </ScatterChart>
        )

      default: // line
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis
              dataKey={xAxisKey}
              stroke={textColor}
              tickFormatter={formatXAxis}
            />
            <YAxis
              stroke={textColor}
              tickFormatter={formatYAxis}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: bgColor,
                border: `1px solid ${gridColor}`,
                borderRadius: '6px'
              }}
              formatter={formatTooltip}
            />
            <Legend />
            {chartKeys.map((key, index) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={colors[index % colors.length]}
                strokeWidth={2}
                dot={{ fill: colors[index % colors.length], strokeWidth: 2, r: 4 }}
                 activeDot={{ r: 6 }}
               />
             ))}
             {showMovingAverage && Object.entries(movingAverageData).map(([key]) => (
               <Line
                 key={`ma-${key}`}
                 type="monotone"
                 dataKey={`ma${key}`}
                 stroke="#FF6B6B"
                 strokeWidth={2}
                 strokeDasharray="5 5"
                 dot={false}
               />
             ))}
            {showTrendLine && (
              <ReferenceLine
                stroke="#9CA3AF"
                strokeDasharray="2 2"
                strokeWidth={1}
              />
            )}
          </LineChart>
        )
    }
  }

  if (data.length === 0) {
    return (
      <Box
        height={height}
        display="flex"
        alignItems="center"
        justifyContent="center"
        bg={bgColor}
        borderRadius="md"
        border={`1px solid ${gridColor}`}
      >
        No data available
      </Box>
    )
  }

  return (
    <Box position="relative">
      {title && (
        <Box mb={2}>
          <strong style={{ color: textColor }}>{title}</strong>
        </Box>
      )}

      <Box position="relative">
        <ResponsiveContainer width="100%" height={height}>
          {renderChart()}
        </ResponsiveContainer>

        {showBrush && data.length > 10 && (
          <Box mt={2}>
            <ResponsiveContainer width="100%" height={60}>
              <LineChart data={data}>
                <Brush
                  dataKey={xAxisKey}
                  height={30}
                  stroke={colors[0]}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        )}
      </Box>

      {/* Chart Controls */}
      <Box position="absolute" top={2} right={2} display="flex" gap={1}>
        <IconButton
          aria-label="Zoom In"
          size="xs"
          onClick={handleZoomIn}
          bg={bgColor}
          color={textColor}
          _hover={{ bg: 'gray.100' }}
        >
          <ZoomIn size={16} />
        </IconButton>

        <IconButton
          aria-label="Zoom Out"
          size="xs"
          onClick={handleZoomOut}
          bg={bgColor}
          color={textColor}
          _hover={{ bg: 'gray.100' }}
        >
          <ZoomOut size={16} />
        </IconButton>

        <IconButton
          aria-label="Reset View"
          size="xs"
          onClick={handleReset}
          bg={bgColor}
          color={textColor}
          _hover={{ bg: 'gray.100' }}
        >
          <RotateCcw size={16} />
        </IconButton>
      </Box>
    </Box>
  )
}

export default InteractiveChart