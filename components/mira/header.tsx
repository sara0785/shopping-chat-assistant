'use client'

import { Sparkles } from 'lucide-react'

export type MiraMode = 'human' | 'agent' | 'merchant'

export function MiraHeader({ mode, onModeChange, onActivity }: { mode: MiraMode; onModeChange: (mode: MiraMode) => void; onActivity: () => void }) {
  return <header className="topbar"><div className="brand"><span className="brand-mark"><Sparkles size={15} /></span><span>Mira</span><span className="brand-sub">shopping assistant</span></div><nav className="mode-toggle" aria-label="Mira mode"><button className={mode === 'human' ? 'mode-active' : ''} onClick={() => onModeChange('human')}>Human Shopper</button><button className={mode === 'agent' ? 'mode-active' : ''} onClick={() => onModeChange('agent')}>Autonomous AI Buyer <small>(UAP / Protocol Mode)</small></button><button className={mode === 'merchant' ? 'mode-active' : ''} onClick={() => onModeChange('merchant')}>Merchant Orchestrator</button></nav><button className="ghost-button" onClick={onActivity}>Activity</button></header>
}
