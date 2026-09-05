'use client'

import { useState, useRef, useEffect } from 'react'
import {
  Sparkles,
  MapPin,
  ShieldCheck,
  Activity,
  X
} from 'lucide-react'

export type MiraMode = 'human' | 'agent' | 'merchant'

interface MiraHeaderProps {
  mode: MiraMode
  onModeChange: (mode: MiraMode) => void
  onActivity: () => void
}

export function MiraHeader({ mode, onModeChange, onActivity }: MiraHeaderProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="sticky top-0 z-40 border-b border-[#e6e4dc] bg-white/85 backdrop-blur-md px-6 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Enlarged Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-2xl bg-[#184738] flex items-center justify-center text-white shadow-xs">
            <Sparkles className="size-5.5" />
          </div>
          <div>
            <div className="flex items-center gap-2 leading-none">
              <span className="font-bold text-xl tracking-tight text-[#1c2420]">Mira</span>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-md">
                v1.0.4
              </span>
            </div>
            <p className="text-xs text-stone-400 hidden sm:block mt-1">Conversational Commerce & Protocol Desk</p>
          </div>
        </div>

        {/* Mode Switcher Tabs - Exactly Same Font Size Across All Three */}
        <div className="flex items-center rounded-full bg-[#f0ede6]/80 p-1.5 border border-[#e3e1d8] shadow-inner">
          <button
            type="button"
            onClick={() => onModeChange('human')}
            className={`px-4.5 py-2 rounded-full text-[13px] font-semibold transition-all cursor-pointer ${
              mode === 'human'
                ? 'bg-white text-[#184738] shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Human Shopper
          </button>

          <button
            type="button"
            onClick={() => onModeChange('agent')}
            className={`px-4.5 py-2 rounded-full text-[13px] font-semibold transition-all cursor-pointer ${
              mode === 'agent'
                ? 'bg-white text-[#184738] shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Autonomous AI Buyer <span className="text-[13px] font-semibold opacity-75 hidden sm:inline">(UAP / Protocol Mode)</span>
          </button>

          <button
            type="button"
            onClick={() => onModeChange('merchant')}
            className={`px-4.5 py-2 rounded-full text-[13px] font-semibold transition-all cursor-pointer ${
              mode === 'merchant'
                ? 'bg-white text-[#184738] shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Merchant Orchestrator
          </button>
        </div>

        {/* User Logo Avatar Badge */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="group flex items-center gap-2.5 rounded-2xl border border-stone-200/80 bg-stone-50/90 p-1.5 pr-3.5 transition-all hover:bg-[#eaf4ef] hover:border-emerald-300 active:scale-95 cursor-pointer shadow-2xs"
          >
            <div className="relative size-8.5 rounded-xl bg-[#184738] text-white flex items-center justify-center font-bold text-sm shadow-xs">
              S
              <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse" />
            </div>
            <div className="text-left hidden md:block leading-tight">
              <div className="text-xs font-semibold text-[#1c2420] group-hover:text-[#184738]">Sara</div>
              <div className="text-[10px] text-stone-400">Buyer Session</div>
            </div>
          </button>

          {/* Profile Dialog */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-3xl bg-white p-4 shadow-[0_20px_45px_-10px_rgba(0,0,0,0.15)] border border-[#e3e1d8] animate-in fade-in zoom-in-95 duration-150 z-50">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2.5">
                  <div className="size-9 rounded-2xl bg-[#184738] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                    S
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#1c2420]">Sara</h4>
                    <p className="text-[11px] text-stone-400">Verified Buyer Session</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsProfileOpen(false)}
                  className="text-stone-400 hover:text-stone-700 p-1 rounded-lg cursor-pointer"
                >
                  <X className="size-4" />
                </button>
              </div>

              <div className="mt-3 space-y-2.5 text-xs">
                <div className="rounded-xl bg-stone-50 p-2.5 border border-stone-200/60">
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-[#184738] mb-0.5">
                    <MapPin className="size-3.5" /> Default Address
                  </div>
                  <p className="text-stone-600 text-[11px] leading-snug">
                    NSUT Campus, Sector 3, Dwarka, New Delhi - 110078
                  </p>
                </div>

                <div className="rounded-xl bg-stone-50 p-2.5 border border-stone-200/60 flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1.5 text-stone-600">
                    <ShieldCheck className="size-3.5 text-emerald-700" /> Bounded Auth
                  </span>
                  <span className="font-mono text-emerald-800 font-bold bg-emerald-100 px-1.5 py-0.2 rounded">
                    ACTIVE
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(false)
                    onActivity()
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-stone-100 hover:bg-[#eaf4ef] hover:text-[#184738] transition flex items-center justify-between font-semibold text-stone-700 cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Activity className="size-3.5 text-[#184738]" /> View Audit Activity
                  </span>
                  <span className="text-[10px] text-stone-400 font-mono">Scroll ↓</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}