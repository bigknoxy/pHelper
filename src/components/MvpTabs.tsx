import React, { useState } from "react";
import { Box, Button } from "@chakra-ui/react";

interface TabDef {
  label: string;
  value: string;
  content: React.ReactNode;
}

interface MvpTabsProps {
  tabs: TabDef[];
  defaultValue?: string;
}

export default function MvpTabs({ tabs, defaultValue }: MvpTabsProps) {
  const [active, setActive] = useState(defaultValue || tabs[0].value);
  return (
    <Box>
      <Box display="flex" gap={2} mb={4}>
        {tabs.map(tab => (
          <Button
            key={tab.value}
            variant={active === tab.value ? "solid" : "outline"}
            onClick={() => setActive(tab.value)}
          >
            {tab.label}
          </Button>
        ))}
      </Box>
      <Box>
        {tabs.find(tab => tab.value === active)?.content}
      </Box>
    </Box>
  );
}
