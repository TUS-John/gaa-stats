import React from 'react';
import { fmtClock } from '../utils/format';

export default function ClockBar({half,elapsed,left,running,overTime,onStart,onPause,onNextHalf,onResetTime,onResetAll}:{half:number,elapsed:number,left:number,running:boolean,overTime:boolean,onStart:()=>void,onPause:()=>void,onNextHalf:()=>void,onResetTime:()=>void,onResetAll:()=>void}){
  return (
    <div className="bg-white rounded-2xl shadow p-4 mb-3">
      <div className="flex items-center justify-between">
        <div className="text-base"><span className="font-semibold">Half:</span> {half}/2</div>
        <div className={`text-3xl font-extrabold tracking-tight tabular-nums ${overTime? 'text-red-600' : ''}`}>{fmtClock(elapsed)}<span className="text-xs text-gray-500 ml-1">elapsed</span></div>
        <div className="text-base"><span className="font-semibold">Left:</span> <span className="text-3xl font-extrabold tabular-nums">{fmtClock(left)}</span></div>
      </div>
      <div className="mt-3 grid grid-cols-5 gap-2">
        {!running ? (
          <button className="py-2 rounded-xl bg-emerald-600 text-white" onClick={onStart}>Start</button>
        ) : (
          <button className="py-2 rounded-xl bg-amber-500 text-white" onClick={onPause}>Pause</button>
        )}
        <button className="py-2 rounded-xl bg-blue-600 text-white" onClick={onNextHalf}>Next Half</button>
        <button className="py-2 rounded-xl bg-gray-200" onClick={onResetTime}>Reset</button>
        <button className="py-2 rounded-xl bg-gray-900 text-white" onClick={onResetAll}>Reset All</button>
        <div />
      </div>
    </div>
  );
}
