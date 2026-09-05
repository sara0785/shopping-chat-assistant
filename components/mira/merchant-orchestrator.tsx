'use client'

import { useState } from 'react'
import {
  ShieldCheck,
  TrendingUp,
  Package,
  CheckCircle2,
  Lock
} from 'lucide-react'
import { CATALOG, formatINR } from '@/lib/catalog'

export function MerchantOrchestrator() {
  const [promoteIntent, setPromoteIntent] = useState(true)
  const [moveAging, setMoveAging] = useState(false)
  const [arbitrageShield, setArbitrageShield] = useState(true)

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header & Policy Sync Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#e3e1d8]">
        <div>
          <span className="text-[10px] font-bold tracking-widest text-[#184738] uppercase flex items-center gap-1.5">
            <ShieldCheck className="size-3.5 text-[#184738]" /> Merchant Autonomous Policy Orchestrator
          </span>
          <h1 className="text-3xl font-light tracking-tight mt-1 text-[#1c2420]">
            Protect margin. <em className="font-serif italic text-[#184738]">Govern agents.</em>
          </h1>
          <p className="text-xs text-stone-500 mt-1 max-w-xl">
            Configure bounded margin rules, algorithmic liquidation thresholds, and machine-to-machine validation rules for external AI buyers.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-2xl bg-white border border-[#e3e1d8] px-3.5 py-2 shadow-2xs shrink-0">
          <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          <div className="text-left font-mono text-[11px]">
            <span className="text-stone-400 block text-[9px] uppercase font-sans">UAP Policy Engine</span>
            <span className="font-semibold text-[#184738]">Sandbox ID: rzp_test_mira</span>
          </div>
        </div>
      </div>

      {/* 3 Core Policy Guardrails with Ultra-Light Subtle Hover */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Policy 1 */}
        <div className="group relative overflow-hidden rounded-3xl border border-white/80 bg-gradient-to-br from-white/95 via-white/85 to-emerald-50/20 p-5 shadow-[0_15px_35px_-10px_rgba(0,0,0,0.04)] backdrop-blur-xl transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-[#f8fcfb] hover:border-emerald-200 hover:shadow-[0_20px_40px_-12px_rgba(24,71,56,0.08)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="size-9 rounded-xl bg-emerald-50/80 text-[#184738] flex items-center justify-center">
                <TrendingUp className="size-4.5" />
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 font-semibold">
                RULE #01
              </span>
            </div>
            <h3 className="text-sm font-bold text-[#1c2420] mt-3 transition-colors group-hover:text-stone-900">High-Intent Promotion</h3>
            <p className="text-xs text-stone-500 mt-1 leading-relaxed">
              Surfaces high-stock items to Mira when user intent score {'>'} 0.75.
            </p>

            <div className="mt-4 rounded-xl bg-white/60 p-2.5 space-y-1 font-mono text-[11px] text-stone-700 border border-stone-200/50 transition-colors group-hover:bg-white/90">
              <div className="flex justify-between">
                <span className="text-stone-400">Target Margin:</span>
                <span className="font-semibold text-emerald-800">Min 28% Floor</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Stock Buffer:</span>
                <span className="font-semibold">Healthy (&gt; 15 units)</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setPromoteIntent(!promoteIntent)}
            className={`mt-4 w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
              promoteIntent
                ? 'bg-[#184738] text-white shadow-xs hover:bg-[#12362b]'
                : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
            }`}
          >
            {promoteIntent ? <CheckCircle2 className="size-3.5" /> : null}
            {promoteIntent ? 'Active (Bounded)' : 'Rule Paused'}
          </button>
        </div>

        {/* Policy 2 */}
        <div className="group relative overflow-hidden rounded-3xl border border-white/80 bg-gradient-to-br from-white/95 via-white/85 to-emerald-50/20 p-5 shadow-[0_15px_35px_-10px_rgba(0,0,0,0.04)] backdrop-blur-xl transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-[#f8fcfb] hover:border-emerald-200 hover:shadow-[0_20px_40px_-12px_rgba(24,71,56,0.08)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="size-9 rounded-xl bg-amber-50/80 text-amber-800 flex items-center justify-center">
                <Package className="size-4.5" />
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 font-semibold">
                RULE #02
              </span>
            </div>
            <h3 className="text-sm font-bold text-[#1c2420] mt-3 transition-colors group-hover:text-stone-900">Liquidation Discount Bounds</h3>
            <p className="text-xs text-stone-500 mt-1 leading-relaxed">
              Permits Mira to offer dynamic bundle pricing before shelf expiry.
            </p>

            <div className="mt-4 rounded-xl bg-white/60 p-2.5 space-y-1 font-mono text-[11px] text-stone-700 border border-stone-200/50 transition-colors group-hover:bg-white/90">
              <div className="flex justify-between">
                <span className="text-stone-400">Trigger Age:</span>
                <span className="font-semibold text-amber-900">&gt; 45 Days on Shelf</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Max Discount:</span>
                <span className="font-semibold text-rose-700">Hard Cap 18%</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMoveAging(!moveAging)}
            className={`mt-4 w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
              moveAging
                ? 'bg-[#184738] text-white shadow-xs hover:bg-[#12362b]'
                : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
            }`}
          >
            {moveAging ? <CheckCircle2 className="size-3.5" /> : null}
            {moveAging ? 'Active (Liquidation Signal)' : 'Paused (Standard Price)'}
          </button>
        </div>

        {/* Policy 3 */}
        <div className="group relative overflow-hidden rounded-3xl border border-white/80 bg-gradient-to-br from-white/95 via-white/85 to-emerald-50/20 p-5 shadow-[0_15px_35px_-10px_rgba(0,0,0,0.04)] backdrop-blur-xl transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-[#f8fcfb] hover:border-emerald-200 hover:shadow-[0_20px_40px_-12px_rgba(24,71,56,0.08)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="size-9 rounded-xl bg-teal-50/80 text-teal-800 flex items-center justify-center">
                <Lock className="size-4.5" />
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 font-semibold">
                RULE #03
              </span>
            </div>
            <h3 className="text-sm font-bold text-[#1c2420] mt-3 transition-colors group-hover:text-stone-900">M2M Arbitrage Shield</h3>
            <p className="text-xs text-stone-500 mt-1 leading-relaxed">
              Guards against automated high-frequency bot requests undercutting floor price.
            </p>

            <div className="mt-4 rounded-xl bg-white/60 p-2.5 space-y-1 font-mono text-[11px] text-stone-700 border border-stone-200/50 transition-colors group-hover:bg-white/90">
              <div className="flex justify-between">
                <span className="text-stone-400">Rate Limiter:</span>
                <span className="font-semibold">10 req / min / token</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Auto-Debit:</span>
                <span className="font-semibold text-rose-700">Strictly Gated</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setArbitrageShield(!arbitrageShield)}
            className={`mt-4 w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
              arbitrageShield
                ? 'bg-[#184738] text-white shadow-xs hover:bg-[#12362b]'
                : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
            }`}
          >
            {arbitrageShield ? <CheckCircle2 className="size-3.5" /> : null}
            {arbitrageShield ? 'Shield Active (Protected)' : 'Shield Disabled'}
          </button>
        </div>
      </div>

      {/* Live Inventory & Margin Inspection Table */}
      <div className="rounded-3xl border border-white/80 bg-white/90 p-5 shadow-[0_15px_35px_-10px_rgba(0,0,0,0.04)] backdrop-blur-xl">
        <div className="flex items-center justify-between pb-3 border-b border-[#f0ede6]">
          <div>
            <h3 className="text-sm font-semibold text-[#1c2420]">Active SKU Margin Governance</h3>
            <p className="text-xs text-stone-500">Live feed synced with Universal Agent Protocol endpoint.</p>
          </div>
          <span className="text-xs font-mono text-stone-400">Total SKUs: {CATALOG.length}</span>
        </div>

        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-100 text-stone-400 font-medium">
                <th className="py-2.5 font-normal">PRODUCT SKU</th>
                <th className="py-2.5 font-normal">MRP</th>
                <th className="py-2.5 font-normal">ACTIVE PRICE</th>
                <th className="py-2.5 font-normal">MARGIN STATUS</th>
                <th className="py-2.5 font-normal text-right">UAP SETTLEMENT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-mono">
              {CATALOG.map((item) => {
                const discount = item.originalPrice ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100) : 0
                return (
                  <tr key={item.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-2.5 font-sans font-medium text-stone-800">{item.name}</td>
                    <td className="py-2.5 text-stone-400 line-through">{formatINR(item.originalPrice || item.price)}</td>
                    <td className="py-2.5 font-semibold text-[#184738]">{formatINR(item.price)}</td>
                    <td className="py-2.5">
                      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 border border-emerald-200/60 font-sans">
                        <CheckCircle2 className="size-2.5 text-emerald-600" /> Bounded ({discount > 0 ? `${discount}% disc.` : 'Full Margin'})
                      </span>
                    </td>
                    <td className="py-2.5 text-right font-sans text-[11px] text-stone-500">
                      Razorpay Sandbox Ready
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}