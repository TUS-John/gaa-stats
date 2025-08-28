import React, { useRef } from 'react';
import { storageKey } from '../utils/storage';

export default function PersistenceBar({state,onImport}:{state:any,onImport:(s:any)=>void}){
  const fileRef=useRef<HTMLInputElement>(null);
  const handleImport=(f:File)=>{const r=new FileReader();r.onload=()=>{try{onImport(JSON.parse(r.result as string));}catch{alert('Invalid JSON');}};r.readAsText(f);};
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3">
      <div className="max-w-md mx-auto grid grid-cols-3 gap-2">
        <button className="py-2 rounded-xl bg-white border" onClick={()=>{localStorage.removeItem(storageKey);window.location.reload();}}>Clear Save</button>
        <button className="py-2 rounded-xl bg-gray-100" onClick={()=>{const raw=JSON.stringify(state,null,2);const blob=new Blob([raw],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`gaa-stats-save-${Date.now()}.json`;document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);}}>Save Snapshot</button>
        <button className="py-2 rounded-xl bg-gray-900 text-white" onClick={()=>fileRef.current?.click()}>Import Snapshot</button>
        <input type="file" accept="application/json" className="hidden" ref={fileRef} onChange={e=>e.target.files&&e.target.files[0]&&handleImport(e.target.files[0])}/>
      </div>
    </div>
  );
}
