'use client'

import { useState } from 'react'
import { BarChart3, PackageCheck, Radio, ToggleRight } from 'lucide-react'

export function MerchantOrchestrator() {
  const [campaignLift, setCampaignLift] = useState(true)
  const [liquidation, setLiquidation] = useState(false)

  return (
    <section className="merchant-view" aria-labelledby="merchant-title">
      <div className="merchant-kicker"><Radio size={14} /> MERCHANT CONTROL PLANE</div>
      <div className="merchant-heading"><div><h1 id="merchant-title">Orchestrate demand.<br /><em>Protect margin.</em></h1><p>Coordinate catalog visibility, campaign lift, and inventory decisions from one calm workspace.</p></div><div className="merchant-status"><PackageCheck size={18} /><span>Catalog synced</span></div></div>
      <div className="merchant-grid">
        <article className="merchant-card"><div className="merchant-card-icon"><BarChart3 size={18} /></div><div><span className="eyebrow">CAMPAIGN LIFT</span><h2>Promote high-intent products</h2><p>Let Mira surface products with healthy stock when shopper intent rises.</p></div><button className={`merchant-toggle ${campaignLift ? 'is-on' : ''}`} aria-pressed={campaignLift} onClick={() => setCampaignLift(!campaignLift)}><ToggleRight size={22} /><span>{campaignLift ? 'Active' : 'Paused'}</span></button></article>
        <article className="merchant-card"><div className="merchant-card-icon"><PackageCheck size={18} /></div><div><span className="eyebrow">LIQUIDATION DISCOUNTS</span><h2>Move aging inventory</h2><p>Apply a bounded discount signal before stock approaches its lower threshold.</p></div><button className={`merchant-toggle ${liquidation ? 'is-on' : ''}`} aria-pressed={liquidation} onClick={() => setLiquidation(!liquidation)}><ToggleRight size={22} /><span>{liquidation ? 'Active' : 'Paused'}</span></button></article>
      </div>
    </section>
  )
}
