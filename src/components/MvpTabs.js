import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Box, Button } from "@chakra-ui/react";
export default function MvpTabs({ tabs, defaultValue }) {
    const [active, setActive] = useState(defaultValue || tabs[0].value);
    return (_jsxs(Box, { children: [_jsx(Box, { display: "flex", gap: 2, mb: 4, children: tabs.map(tab => (_jsx(Button, { variant: active === tab.value ? "solid" : "outline", onClick: () => setActive(tab.value), children: tab.label }, tab.value))) }), _jsx(Box, { children: tabs.find(tab => tab.value === active)?.content })] }));
}
