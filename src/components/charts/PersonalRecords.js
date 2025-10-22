import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Text, VStack, HStack, Badge, Icon, SimpleGrid } from '@chakra-ui/react';
import { Trophy, TrendingUp, Target, Award, Calendar } from 'lucide-react';
const PersonalRecords = ({ records, title = "Personal Records", maxRecords = 6 }) => {
    const displayRecords = records.slice(0, maxRecords);
    if (displayRecords.length === 0) {
        return (_jsxs(Box, { p: 6, textAlign: "center", bg: "surface.50", borderRadius: "md", border: "1px solid", borderColor: "muted.200", children: [_jsx(Icon, { as: Trophy, boxSize: 48, color: "muted.400", mb: 3 }), _jsx(Text, { color: "text.secondary", fontSize: "lg", children: "No records yet" }), _jsx(Text, { color: "text.muted", fontSize: "sm", children: "Keep tracking to set new personal records!" })] }));
    }
    const getRecordIcon = (type) => {
        switch (type) {
            case 'weight':
                return Target;
            case 'workout':
                return TrendingUp;
            case 'task':
                return Award;
            default:
                return Trophy;
        }
    };
    const getRecordColor = (type) => {
        switch (type) {
            case 'weight':
                return 'blue';
            case 'workout':
                return 'green';
            case 'task':
                return 'purple';
            default:
                return 'yellow';
        }
    };
    const formatValue = (value, unit) => {
        if (typeof value === 'number' && unit === 'minutes') {
            return `${value} min`;
        }
        if (typeof value === 'number' && unit === 'count') {
            return value.toLocaleString();
        }
        return `${value} ${unit}`;
    };
    return (_jsxs(Box, { children: [_jsxs(HStack, { mb: 4, align: "center", children: [_jsx(Icon, { as: Trophy, color: "primary.500" }), _jsx(Text, { fontSize: "lg", fontWeight: "semibold", color: "text.primary", children: title })] }), _jsx(SimpleGrid, { columns: { base: 1, sm: 2, lg: 3 }, gap: 4, children: displayRecords.map((record) => (_jsxs(Box, { p: 4, bg: "surface.50", borderRadius: "md", border: "1px solid", borderColor: "muted.200", position: "relative", transition: "all 0.2s", _hover: { transform: 'translateY(-2px)', shadow: 'md' }, children: [record.isNew && (_jsx(Badge, { position: "absolute", top: 2, right: 2, colorScheme: "green", size: "sm", fontSize: "xs", children: "NEW!" })), _jsxs(VStack, { gap: 2, align: "stretch", children: [_jsxs(HStack, { gap: 2, children: [_jsx(Icon, { as: getRecordIcon(record.type), color: `${getRecordColor(record.type)}.500`, boxSize: 20 }), _jsxs(VStack, { gap: 0, align: "flex-start", flex: 1, children: [_jsx(Text, { fontSize: "sm", fontWeight: "medium", color: "text.primary", children: record.title }), _jsx(Text, { fontSize: "lg", fontWeight: "bold", color: "text.primary", children: formatValue(record.value, record.unit) })] })] }), _jsxs(HStack, { gap: 2, align: "center", children: [_jsx(Icon, { as: Calendar, boxSize: 14, color: "muted.400" }), _jsx(Text, { fontSize: "xs", color: "text.muted", children: new Date(record.date).toLocaleDateString() })] }), record.description && (_jsx(Text, { fontSize: "xs", color: "text.secondary", lineHeight: "1.4", children: record.description }))] })] }, record.id))) }), records.length > maxRecords && (_jsxs(Text, { fontSize: "sm", color: "text.muted", textAlign: "center", mt: 4, children: ["And ", records.length - maxRecords, " more records..."] }))] }));
};
export default PersonalRecords;
