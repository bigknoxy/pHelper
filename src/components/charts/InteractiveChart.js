import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useCallback, useMemo } from 'react';
import { ResponsiveContainer, LineChart, Line, AreaChart, Area, BarChart, Bar, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Brush, ReferenceLine } from 'recharts';
import { Box, IconButton } from '@chakra-ui/react';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
const InteractiveChart = ({ data, chartType, height = 300, showBrush = true, showMovingAverage = false, showTrendLine = false, movingAverageData = {}, colors = ['#3182CE', '#E53E3E', '#38A169', '#D69E2E'], title, xAxisKey = 'date', yAxisKeys = [], formatXAxis, formatYAxis, formatTooltip }) => {
    // Note: zoomLevel and panOffset are prepared for future zoom/pan functionality
    const [, setZoomLevel] = useState(1);
    const [, setPanOffset] = useState({ x: 0, y: 0 });
    // Theme-aware colors
    const bgColor = 'surface.50';
    const gridColor = 'muted.200';
    const textColor = 'text.primary';
    // Auto-detect y-axis keys if not provided
    const detectedYAxisKeys = useMemo(() => {
        if (yAxisKeys.length > 0)
            return yAxisKeys;
        if (data.length === 0)
            return [];
        const keys = Object.keys(data[0]).filter(key => key !== xAxisKey && typeof data[0][key] === 'number');
        return keys;
    }, [data, xAxisKey, yAxisKeys]);
    const chartKeys = detectedYAxisKeys.length > 0 ? detectedYAxisKeys : yAxisKeys;
    const handleZoomIn = useCallback(() => {
        setZoomLevel(prev => Math.min(prev * 1.5, 5));
    }, []);
    const handleZoomOut = useCallback(() => {
        setZoomLevel(prev => Math.max(prev / 1.5, 0.5));
    }, []);
    const handleReset = useCallback(() => {
        setZoomLevel(1);
        setPanOffset({ x: 0, y: 0 });
    }, []);
    const renderChart = () => {
        const commonProps = {
            data,
            margin: { top: 5, right: 30, left: 20, bottom: 5 }
        };
        switch (chartType) {
            case 'area':
                return (_jsxs(AreaChart, { ...commonProps, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: gridColor }), _jsx(XAxis, { dataKey: xAxisKey, stroke: textColor, tickFormatter: formatXAxis }), _jsx(YAxis, { stroke: textColor, tickFormatter: formatYAxis }), _jsx(Tooltip, { contentStyle: {
                                backgroundColor: bgColor,
                                border: `1px solid ${gridColor}`,
                                borderRadius: '6px'
                            }, formatter: formatTooltip }), _jsx(Legend, {}), chartKeys.map((key, index) => (_jsx(Area, { type: "monotone", dataKey: key, stackId: "1", stroke: colors[index % colors.length], fill: colors[index % colors.length], fillOpacity: 0.6 }, key))), showMovingAverage && Object.entries(movingAverageData).map(([key]) => (_jsx(Line, { type: "monotone", dataKey: `ma${key}`, stroke: "#FF6B6B", strokeWidth: 2, strokeDasharray: "5 5", dot: false }, `ma-${key}`))), showTrendLine && (_jsx(ReferenceLine, { stroke: "#9CA3AF", strokeDasharray: "2 2", strokeWidth: 1 }))] }));
            case 'bar':
                return (_jsxs(BarChart, { ...commonProps, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: gridColor }), _jsx(XAxis, { dataKey: xAxisKey, stroke: textColor, tickFormatter: formatXAxis }), _jsx(YAxis, { stroke: textColor, tickFormatter: formatYAxis }), _jsx(Tooltip, { contentStyle: {
                                backgroundColor: bgColor,
                                border: `1px solid ${gridColor}`,
                                borderRadius: '6px'
                            }, formatter: formatTooltip }), _jsx(Legend, {}), chartKeys.map((key, index) => (_jsx(Bar, { dataKey: key, fill: colors[index % colors.length] }, key)))] }));
            case 'scatter':
                return (_jsxs(ScatterChart, { ...commonProps, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: gridColor }), _jsx(XAxis, { dataKey: xAxisKey, stroke: textColor, tickFormatter: formatXAxis }), _jsx(YAxis, { stroke: textColor, tickFormatter: formatYAxis }), _jsx(Tooltip, { contentStyle: {
                                backgroundColor: bgColor,
                                border: `1px solid ${gridColor}`,
                                borderRadius: '6px'
                            }, formatter: formatTooltip }), _jsx(Legend, {}), chartKeys.map((key, index) => (_jsx(Scatter, { dataKey: key, fill: colors[index % colors.length] }, key)))] }));
            default: // line
                return (_jsxs(LineChart, { ...commonProps, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: gridColor }), _jsx(XAxis, { dataKey: xAxisKey, stroke: textColor, tickFormatter: formatXAxis }), _jsx(YAxis, { stroke: textColor, tickFormatter: formatYAxis }), _jsx(Tooltip, { contentStyle: {
                                backgroundColor: bgColor,
                                border: `1px solid ${gridColor}`,
                                borderRadius: '6px'
                            }, formatter: formatTooltip }), _jsx(Legend, {}), chartKeys.map((key, index) => (_jsx(Line, { type: "monotone", dataKey: key, stroke: colors[index % colors.length], strokeWidth: 2, dot: { fill: colors[index % colors.length], strokeWidth: 2, r: 4 }, activeDot: { r: 6 } }, key))), showMovingAverage && Object.entries(movingAverageData).map(([key]) => (_jsx(Line, { type: "monotone", dataKey: `ma${key}`, stroke: "#FF6B6B", strokeWidth: 2, strokeDasharray: "5 5", dot: false }, `ma-${key}`))), showTrendLine && (_jsx(ReferenceLine, { stroke: "#9CA3AF", strokeDasharray: "2 2", strokeWidth: 1 }))] }));
        }
    };
    if (data.length === 0) {
        return (_jsx(Box, { height: height, display: "flex", alignItems: "center", justifyContent: "center", bg: bgColor, borderRadius: "md", border: `1px solid ${gridColor}`, children: "No data available" }));
    }
    return (_jsxs(Box, { position: "relative", children: [title && (_jsx(Box, { mb: 2, children: _jsx("strong", { style: { color: textColor }, children: title }) })), _jsxs(Box, { position: "relative", children: [_jsx(ResponsiveContainer, { width: "100%", height: height, children: renderChart() }), showBrush && data.length > 10 && (_jsx(Box, { mt: 2, children: _jsx(ResponsiveContainer, { width: "100%", height: 60, children: _jsx(LineChart, { data: data, children: _jsx(Brush, { dataKey: xAxisKey, height: 30, stroke: colors[0] }) }) }) }))] }), _jsxs(Box, { position: "absolute", top: 2, right: 2, display: "flex", gap: 1, children: [_jsx(IconButton, { "aria-label": "Zoom In", size: "xs", onClick: handleZoomIn, bg: bgColor, color: textColor, _hover: { bg: 'gray.100' }, children: _jsx(ZoomIn, { size: 16 }) }), _jsx(IconButton, { "aria-label": "Zoom Out", size: "xs", onClick: handleZoomOut, bg: bgColor, color: textColor, _hover: { bg: 'gray.100' }, children: _jsx(ZoomOut, { size: 16 }) }), _jsx(IconButton, { "aria-label": "Reset View", size: "xs", onClick: handleReset, bg: bgColor, color: textColor, _hover: { bg: 'gray.100' }, children: _jsx(RotateCcw, { size: 16 }) })] })] }));
};
export default InteractiveChart;
