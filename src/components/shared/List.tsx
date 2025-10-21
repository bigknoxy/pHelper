import React from 'react';
import { Box, Stack, Text } from '@chakra-ui/react';

interface ListItem {
  id: string;
  content: React.ReactNode;
  actions?: React.ReactNode;
}

interface ListProps {
  items: ListItem[];
  title?: string;
  emptyMessage?: string;
  variant?: 'default' | 'card';
  ariaLabel?: string;
}

export default function List({
  items,
  title,
  emptyMessage = 'No items to display',
  variant = 'default',
  ariaLabel
}: ListProps) {
  if (items.length === 0) {
    return (
      <Box role="region" aria-labelledby={title ? "list-title" : undefined}>
        {title && (
          <Text id="list-title" fontSize="lg" fontWeight="bold" mb={4}>
            {title}
          </Text>
        )}
        <Text color="gray.500" textAlign="center" py={8}>
          {emptyMessage}
        </Text>
      </Box>
    );
  }

  return (
    <Box role="region" aria-labelledby={title ? "list-title" : undefined} aria-label={ariaLabel}>
      {title && (
        <Text id="list-title" fontSize="lg" fontWeight="bold" mb={4}>
          {title}
        </Text>
      )}
      <Stack gap={2} as="ul" listStyleType="none">
        {items.map((item) => (
          <Box
            key={item.id}
            as="li"
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            p={variant === 'card' ? 3 : 2}
            borderWidth={variant === 'card' ? "1px" : "0"}
            borderRadius={variant === 'card' ? "md" : "none"}
            borderColor={variant === 'card' ? "gray.600" : "transparent"}
            bg={variant === 'card' ? "surface.800" : "transparent"}
            _hover={variant === 'card' ? { bg: "surface.700" } : undefined}
          >
            <Box flex={1}>
              {item.content}
            </Box>
            {item.actions && (
              <Box ml={4}>
                {item.actions}
              </Box>
            )}
          </Box>
        ))}
      </Stack>
    </Box>
  );
}