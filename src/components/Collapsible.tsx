import React, { useState } from 'react';

export default function Collapsible({ title, defaultOpen=false, children }:{title:string,defaultOpen?:boolean,children:any}){
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button className="w-full flex items-center justify-between px-2 py-2 rounded-xl bg-gray-50" onClick={()=>setOpen(!open)}>
        <span className="font-semibold">{title}</span>
        <span className="text-xl leading-none">{open ? '▾' : '▸'}</span>
      </button>
      {open && <div className="mt-2">{children}</div>}
    </div>
  );
}
