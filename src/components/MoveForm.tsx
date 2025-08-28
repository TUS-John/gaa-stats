import React, { useEffect, useState } from 'react';
import { POSITIONS } from '../state/constants';

export default function MoveForm({team,selectedNumber,onMove}:{team:any,selectedNumber?:number,onMove:(src:number,tp:number)=>void}){
  const [source,setSource]=useState<number>(selectedNumber||team.onField.find((n:number|null)=>!!n)||1);
  const [targetPos,setTargetPos]=useState<number>(14);
  useEffect(()=>{if(selectedNumber) setSource(selectedNumber);},[selectedNumber]);
  return (
    <div className="grid grid-cols-1 gap-2">
      <div className="grid grid-cols-2 gap-2">
        <label className="text-sm">Player (on field)
          <select className="mt-1 w-full border rounded-xl p-2" value={source} onChange={e=>setSource(Number(e.target.value))}>
            {(team.onField as (number|null)[]).filter(Boolean).map((n:any)=>(<option key={n} value={n}>#{n} {team.squad[n-1]?.name||''}</option>))}
          </select>
        </label>
        <label className="text-sm">To position
          <select className="mt-1 w-full border rounded-xl p-2" value={targetPos} onChange={e=>setTargetPos(Number(e.target.value))}>
            {POSITIONS.map((p,i)=>(<option key={i} value={i}>{p} (#{i+1})</option>))}
          </select>
        </label>
      </div>
      <button className="py-2 rounded-xl bg-blue-600 text-white" onClick={()=>onMove(source,targetPos)}>Move / Rotate (front 3 auto-rotate)</button>
    </div>
  );
}
