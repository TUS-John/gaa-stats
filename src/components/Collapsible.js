import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
export default function Collapsible({ title, defaultOpen = false, children }) {
    const [open, setOpen] = useState(defaultOpen);
    return (_jsxs("div", { children: [_jsxs("button", { className: "w-full flex items-center justify-between px-2 py-2 rounded-xl bg-gray-50", onClick: () => setOpen(!open), children: [_jsx("span", { className: "font-semibold", children: title }), _jsx("span", { className: "text-xl leading-none", children: open ? '▾' : '▸' })] }), open && _jsx("div", { className: "mt-2", children: children })] }));
}
