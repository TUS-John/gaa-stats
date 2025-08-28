import React, { useEffect, useState } from 'react';

export default function SubForm({team,onSub,benchNumbers}:{team:any,onSub:(inN:number,outN:number)=>void,benchNumbers:number[]}){
  const [outN,setOutN]=useState<number>(team.onField.find((n:number|null)=>!!n)||1);
  const [inN,setInN]=useState<number>(benchNumbers[0]||16);
  const onFieldNumbers=(team.onField as (number|null)[]).filter(Boolean) as number[];
  useEffect(()=>{setInN(benchNumbers[0]||16);},[benchNumbers]);
  return (
    <div className="grid grid-cols-1 gap-2">
      <div className="grid grid-cols-2 gap-2">
        <label className="text-sm">Out (on field)
          <select className="mt-1 w-full border rounded-xl p-2" value={outN} onChange={e=>setOutN(Number(e.target.value))}>
            {onFieldNumbers.map(n=>(<option key={n} value={n}>#{n} {team.squad[n-1]?.name||''}</option>))}
          </select>
        </label>
        <label className="text-sm">In (bench)
          <select className="mt-1 w-full border rounded-xl p-2" value={inN} onChange={e=>setInN(Number(e.target.value))}>
            {benchNumbers.map(n=>(<option key={n} value={n}>#{n} {team.squad[n-1]?.name||''}</option>))}
          </select>
        </label>
      </div>
      <button className="py-2 rounded-xl bg-gray-900 text-white" onClick={()=>onSub(inN,outN)}>Make Sub</button>
    </div>
  );
}
