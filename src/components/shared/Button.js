import { jsx as _jsx } from "react/jsx-runtime";
import { Button as ChakraButton } from '@chakra-ui/react';
export default function Button(props) {
    const { children, ...rest } = props;
    return (_jsx(ChakraButton, { ...rest, "aria-label": props['aria-label'], transition: "transform 0.15s ease, box-shadow 0.15s ease", _hover: { transform: 'translateY(-1px)', boxShadow: 'md' }, _active: { transform: 'translateY(0)' }, _focus: { boxShadow: 'outline' }, children: children }));
}
