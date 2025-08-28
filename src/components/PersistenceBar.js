import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef } from 'react';
import { storageKey } from '../utils/storage';
export default function PersistenceBar({ state, onImport }) {
    const fileRef = useRef(null);
    const handleImport = (f) => { const r = new FileReader(); r.onload = () => { try {
        onImport(JSON.parse(r.result));
    }
    catch {
        alert('Invalid JSON');
    } }; r.readAsText(f); };
    return (_jsx("div", { className: "fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3", children: _jsxs("div", { className: "max-w-md mx-auto grid grid-cols-3 gap-2", children: [_jsx("button", { className: "py-2 rounded-xl bg-white border", onClick: () => { localStorage.removeItem(storageKey); window.location.reload(); }, children: "Clear Save" }), _jsx("button", { className: "py-2 rounded-xl bg-gray-100", onClick: () => { const raw = JSON.stringify(state, null, 2); const blob = new Blob([raw], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `gaa-stats-save-${Date.now()}.json`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url); }, children: "Save Snapshot" }), _jsx("button", { className: "py-2 rounded-xl bg-gray-900 text-white", onClick: () => fileRef.current?.click(), children: "Import Snapshot" }), _jsx("input", { type: "file", accept: "application/json", className: "hidden", ref: fileRef, onChange: e => e.target.files && e.target.files[0] && handleImport(e.target.files[0]) })] }) }));
}
