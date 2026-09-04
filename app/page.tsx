'use client'

import { useState, useRef } from 'react'
import {
  ArrowUp,
  Check,
  Copy,
  CreditCard,
  Loader2,
  Mic,
  MicOff,
  QrCode,
  ShoppingBag,
  Tag,
  X,
  AlertCircle,
} from 'lucide-react'
import { CATALOG, Product, catalogPayload, formatINR } from '@/lib/catalog'
import { MiraHeader, MiraMode } from '@/components/mira/header'
import { MerchantOrchestrator } from '@/components/mira/merchant-orchestrator'

type Log = {
  label: string
  detail: string
  time: string
  status: 'done' | 'active'
}

const parseBudget = (q: string) => {
  const match = q.toLowerCase().match(/(?:under|below|around|mein|kam)\s*(?:rs\.?|inr|₹)?\s*([0-9,]+)/)
  return match ? Number(match[1].replace(/,/g, '')) : null
}

export default function Page() {
  const [mode, setMode] = useState<MiraMode>('human')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Product[]>(CATALOG.slice(0, 2))
  const [selected, setSelected] = useState<Product | null>(CATALOG[1])
  const [inspected, setInspected] = useState<Product | null>(null)

  // Voice Input State & Ref
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<any>(null)

  // Payment states
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi'>('card')
  const [isPayModalOpen, setIsPayModalOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isPaid, setIsPaid] = useState(false)
  const [cardError, setCardError] = useState<string | null>(null)
  const [invalidFields, setInvalidFields] = useState<{
    card?: boolean
    expiry?: boolean
    cvv?: boolean
  }>({})

  // Card Inputs
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cvv, setCvv] = useState('')

  const [link, setLink] = useState('https://rzp.io/l/mira-soy-candle-1')
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([
    { role: 'assistant', text: "Hi, I'm Mira. Tell me what you're looking for (type or tap the mic to speak) and I'll curate the best options." },
  ])

  const [logs, setLogs] = useState<Log[]>([
    { label: 'Ready', detail: 'Waiting for your request', time: 'now', status: 'active' },
  ])

  const log = (label: string, detail: string) => {
    setLogs((items) => [
      ...items.map((item) => ({ ...item, status: 'done' as const })),
      { label, detail, time: 'now', status: 'active' },
    ])
  }

  const inspect = (p: Product) => {
    setInspected(p)
    log('Product inspected', `${p.name} details and reviews opened`)
  }

  const select = (p: Product, isAgent = false) => {
    setSelected(p)
    setLink(`https://rzp.io/l/mira-${p.id}-1`)
    log('Product selected', `${p.name} moved to Checkout desk (${isAgent ? 'Autonomous Agent' : 'Human user'})`)
    setInspected(null)
  }

  const confirmPayment = () => {
    if (!selected) return
    setIsPayModalOpen(true)
    setIsPaid(false)
    setIsProcessing(false)
    setCardError(null)
    setInvalidFields({})
    log('Gated Action', `Payment modal initiated for ${selected.name}`)
  }

  // Format Card Number (adds space every 4 digits)
  const handleCardNumberChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 16)
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ')
    setCardNumber(formatted)
    setInvalidFields((prev) => ({ ...prev, card: false }))
    if (cardError) setCardError(null)
  }

  // Format Expiry (MM/YY)
  const handleExpiryChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 4)
    if (raw.length >= 2) {
      setCardExpiry(`${raw.slice(0, 2)}/${raw.slice(2)}`)
    } else {
      setCardExpiry(raw)
    }
    setInvalidFields((prev) => ({ ...prev, expiry: false }))
    if (cardError) setCardError(null)
  }

  const handleCvvChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 4)
    setCvv(raw)
    setInvalidFields((prev) => ({ ...prev, cvv: false }))
    if (cardError) setCardError(null)
  }

  const executePayment = (methodName: string) => {
    if (!selected) return

    // Comprehensive Card Validation (Card, Expiry Month/Year, CVV)
    if (paymentMethod === 'card') {
      const cleanCard = cardNumber.replace(/\s+/g, '')
      const cleanCvv = cvv.trim()
      const cleanExpiry = cardExpiry.trim()

      const errors: string[] = []
      const invalid: { card?: boolean; expiry?: boolean; cvv?: boolean } = {}

      // Agar user ne inputs mein type karna start kiya hai
      if (cardNumber !== '' || cardExpiry !== '' || cvv !== '') {
        // Card number check
        if (cleanCard.length < 16) {
          errors.push('Card number (16 digits required)')
          invalid.card = true
        }

        // Expiry format, month range (01-12) & year check
        if (cleanExpiry.length < 5) {
          errors.push('Expiry format (MM/YY)')
          invalid.expiry = true
        } else {
          const [mm, yy] = cleanExpiry.split('/').map(Number)
          const currentYearShort = new Date().getFullYear() % 100 // e.g. 26
          const currentMonth = new Date().getMonth() + 1

          if (!mm || mm < 1 || mm > 12) {
            errors.push('Expiry month (01-12)')
            invalid.expiry = true
          } else if (yy < currentYearShort || (yy === currentYearShort && mm < currentMonth)) {
            errors.push('Card is expired')
            invalid.expiry = true
          }
        }

        // CVV check
        if (cleanCvv.length < 3) {
          errors.push('CVV (3 digits)')
          invalid.cvv = true
        }

        if (errors.length > 0) {
          setInvalidFields(invalid)
          if (errors.length === 1) {
            setCardError(`Invalid ${errors[0]}.`)
          } else {
            setCardError(`Please fix invalid fields: ${errors.join(', ')}.`)
          }
          return
        }
      }
    }

    setCardError(null)
    setInvalidFields({})
    setIsProcessing(true)

    setTimeout(() => {
      setIsProcessing(false)

      const activeCard = cardNumber.trim() || '4111 2222 3333 4444'
      const activeCvv = cvv.trim() || '123'

      const isDeclined =
        paymentMethod === 'card' &&
        (activeCard.replace(/\s+/g, '').startsWith('4000') || activeCvv === '000')

      if (!isDeclined) {
        setIsPaid(true)
        log('Payment Settled', `Settled ${formatINR(selected.price)} via ${methodName}`)

        setMessages((m) => [
          ...m,
          {
            role: 'assistant',
            text: `Payment confirmed for ${selected.name}! Your order has been placed successfully. A receipt has been logged to your session.`,
          },
        ])

        setTimeout(() => {
          setIsPayModalOpen(false)
          setIsPaid(false)
        }, 1400)
      } else {
        setIsPayModalOpen(false)
        log('Payment Declined', `Transaction rejected by issuing bank on ${methodName}`)

        setMessages((m) => [
          ...m,
          {
            role: 'assistant',
            text: `Payment failed for ${selected.name}. Your payment method was declined by the bank. No charges were made. You can retry anytime from the Checkout Desk.`,
          },
        ])
      }
    }, 1500)
  }

  const performSearch = (textToSearch: string) => {
    const clean = textToSearch.trim()
    if (!clean) return
    const lower = clean.toLowerCase()
    const budget = parseBudget(clean)

    const candidates = CATALOG.filter((p) => {
      const textMatch =
        p.name.toLowerCase().includes(lower) ||
        p.category.toLowerCase().includes(lower) ||
        p.tags.some((t) => lower.includes(t.toLowerCase()))
      return budget === null ? textMatch : p.price <= budget
    })

    const found = (candidates.length ? candidates : CATALOG).filter(
      (p) => budget === null || p.price <= budget
    )

    setMessages((m) => [
      ...m,
      { role: 'user', text: clean },
      {
        role: 'assistant',
        text: found.length
          ? `Here are ${found.length} options matching "${clean}".`
          : "I couldn't find an exact match within that range, but here are some popular picks.",
      },
    ])
    setResults(found)
    log('Query Parsing', `Matched ${found.length} products for "${clean}"`)
    setQuery('')
  }

  const toggleVoiceSearch = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.')
      return
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      setIsListening(false)
      return
    }

    try {
      const recognition = new SpeechRecognition()
      recognitionRef.current = recognition

      recognition.continuous = false
      recognition.interimResults = false
      recognition.maxAlternatives = 1
      recognition.lang = 'en-IN'

      recognition.onstart = () => {
        setIsListening(true)
        log('Voice Search Activated', 'Listening... Please speak into the mic')
      }

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setIsListening(false)
        setQuery(transcript)
        log('Voice Audio Processed', `Transcribed: "${transcript}"`)
        performSearch(transcript)
      }

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
        if (event.error === 'not-allowed') {
          alert('Microphone permission blocked! Please click the lock icon in the URL bar to allow microphone access.')
        } else if (event.error === 'no-speech') {
          log('Voice Search', 'No speech detected. Tap mic again and speak clearly.')
        }
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognition.start()
    } catch (e) {
      console.error(e)
      setIsListening(false)
    }
  }

  const selectedSavings =
    selected?.originalPrice && selected.originalPrice > selected.price
      ? selected.originalPrice - selected.price
      : 0

  return (
    <main className="app-shell min-h-screen bg-[#F7F6F1] text-[#1c2420]">
      <MiraHeader
        mode={mode}
        onModeChange={setMode}
        onActivity={() => document.querySelector('.logs')?.scrollIntoView({ behavior: 'smooth' })}
      />

      {mode === 'merchant' ? (
        <div className="p-6">
          <MerchantOrchestrator />
        </div>
      ) : mode === 'agent' ? (
        <div className="p-6 max-w-4xl mx-auto space-y-4">
          <div className="rounded-2xl border border-[#e3e1d8] bg-white p-6 shadow-xs">
            <h2 className="text-lg font-semibold text-[#184738]">Autonomous AI Buyer (UAP / Protocol Mode)</h2>
            <p className="text-xs text-muted-foreground mt-1">Machine-readable JSON endpoints and autonomous checkout payloads.</p>
            <pre className="mt-4 p-4 rounded-xl bg-stone-900 text-emerald-400 text-xs overflow-x-auto font-mono">
              {JSON.stringify(catalogPayload(), null, 2)}
            </pre>
          </div>
        </div>
      ) : (
        <div className="main-grid max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Chat & Product Discovery */}
          <section className="chat-pane lg:col-span-2 space-y-6">
            <div className="intro">
              <span className="text-[11px] font-bold tracking-widest text-[#184738] uppercase">
                ● Live Shopping Session
              </span>
              <h1 className="text-4xl font-light tracking-tight mt-2 text-[#1c2420]">
                Find something <br />
                <em className="font-serif italic text-[#184738]">worth keeping.</em>
              </h1>
              <p className="text-sm text-stone-500 mt-2 max-w-md">
                Describe what you need in your own words. Use voice search or select an example prompt below.
              </p>
            </div>

            {/* Conversation Flow */}
            <div className="chat-thread space-y-3">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex gap-3 text-sm ${
                    m.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`rounded-2xl px-4 py-2.5 max-w-md leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-[#184738] text-white'
                        : 'bg-white border border-[#e3e1d8] text-[#1c2420] shadow-xs'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {results.map((p) => (
                <Card
                  key={p.id}
                  product={p}
                  selected={selected?.id === p.id}
                  onInspect={inspect}
                  onSelect={(item) => select(item, false)}
                />
              ))}
            </div>

            {/* Search Section: Hints + Clean Input Bar */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-[11px] font-medium text-stone-400">Try asking:</span>
                {['Candle under 1000', 'Coaster set', 'Minimalist desk items', 'Desk lamp'].map((hint, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => performSearch(hint)}
                    className="rounded-full border border-[#e3e1d8] bg-white px-2.5 py-1 text-[11px] text-stone-600 transition hover:border-[#184738] hover:bg-emerald-50/60 hover:text-[#184738]"
                  >
                    "{hint}"
                  </button>
                ))}
              </div>

              <div
                className={`relative flex items-center gap-2 rounded-2xl border transition-all p-2 shadow-xs ${
                  isListening ? 'border-red-400 ring-2 ring-red-100 bg-red-50/20' : 'border-[#e3e1d8] bg-white'
                }`}
              >
                <button
                  type="button"
                  onClick={toggleVoiceSearch}
                  title={isListening ? 'Stop listening' : 'Voice search'}
                  className={`size-9 rounded-xl flex items-center justify-center transition-all ${
                    isListening
                      ? 'bg-red-500 text-white animate-pulse shadow-md'
                      : 'bg-[#f4f2eb] text-[#184738] hover:bg-[#eae6db]'
                  }`}
                >
                  {isListening ? <MicOff className="size-4" /> : <Mic className="size-4" />}
                </button>

                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && performSearch(query)}
                  placeholder={isListening ? 'Listening... Speak now' : "Ask Mira anything (e.g. 'coasters under 500')..."}
                  className="flex-1 bg-transparent px-2 text-sm outline-none text-[#1c2420] placeholder:text-stone-400 placeholder:italic"
                />

                <button
                  type="button"
                  onClick={() => performSearch(query)}
                  className="size-9 rounded-xl bg-[#184738] flex items-center justify-center text-white hover:bg-[#12362b] transition"
                >
                  <ArrowUp className="size-4" />
                </button>
              </div>
            </div>
          </section>

          {/* Right Column: Checkout Desk with Full Discounts Breakdown */}
          <aside className="desk-pane space-y-6">
            <div className="rounded-2xl border border-[#e3e1d8] bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-[#f0ede6]">
                <div>
                  <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                    YOUR ORDER
                  </span>
                  <h2 className="text-base font-semibold text-[#1c2420]">Checkout desk</h2>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span>{selected ? 1 : 0} items</span>
                  <ShoppingBag className="size-4" />
                </div>
              </div>

              {selected ? (
                <div className="pt-4 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="size-12 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-[#e3e1d8]">
                      {selected.image ? (
                        <img src={selected.image} alt={selected.name} className="h-full w-full object-cover" />
                      ) : (
                        <div
                          className="h-full w-full flex items-center justify-center text-xs font-bold"
                          style={{ background: selected.color }}
                        >
                          {selected.initials}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold truncate text-[#1c2420]">{selected.name}</div>
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="font-mono text-[#184738] font-medium">{formatINR(selected.price)}</span>
                        {selected.originalPrice && selected.originalPrice > selected.price && (
                          <span className="font-mono text-stone-400 line-through text-[11px]">
                            {formatINR(selected.originalPrice)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-[#f0ede6] pt-3 space-y-2 text-xs">
                    {selectedSavings > 0 && (
                      <>
                        <div className="flex justify-between text-muted-foreground">
                          <span>Original Price (MRP)</span>
                          <span className="font-mono line-through">{formatINR(selected.originalPrice!)}</span>
                        </div>
                        <div className="flex justify-between text-emerald-700 font-medium">
                          <span className="flex items-center gap-1">
                            <Tag className="size-3" /> Special Promo Discount
                          </span>
                          <span className="font-mono">-{formatINR(selectedSavings)}</span>
                        </div>
                      </>
                    )}

                    <div className="flex justify-between items-center pt-2 border-t border-[#f4f2eb] text-sm font-semibold">
                      <span>Total Payable</span>
                      <span className="font-mono text-base text-[#184738]">{formatINR(selected.price)}</span>
                    </div>

                    {selectedSavings > 0 && (
                      <div className="rounded-xl bg-emerald-50 px-3 py-2 text-center text-xs font-medium text-emerald-800 border border-emerald-200/60">
                        🎉 You are saving {formatINR(selectedSavings)} on this order!
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={confirmPayment}
                    className="w-full rounded-xl bg-[#184738] py-3 text-sm font-medium text-white transition hover:bg-[#12362b] flex items-center justify-center gap-2 shadow-xs"
                  >
                    Confirm & open Razorpay
                  </button>

                  <div className="flex items-center justify-between rounded-lg bg-[#f4f2eb] px-3 py-2 text-xs text-muted-foreground">
                    <span className="truncate font-mono">{link}</span>
                    <button
                      type="button"
                      onClick={() => navigator.clipboard.writeText(link)}
                      className="ml-2 hover:text-foreground"
                    >
                      <Copy className="size-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  Select a product to view checkout options.
                </div>
              )}
            </div>

            {/* Reasoning & Policy Audit Log */}
            <div className="logs rounded-2xl border border-[#e3e1d8] bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3">
                <div>
                  <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                    TRANSPARENCY
                  </span>
                  <h3 className="text-base font-semibold text-[#1c2420]">Reasoning Log</h3>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-medium text-emerald-700">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  RECORDING
                </div>
              </div>

              <div className="max-h-[220px] overflow-y-auto space-y-2.5 text-xs pr-1">
                {logs.map((l, i) => (
                  <div key={i} className="flex items-start justify-between border-b border-[#f4f2eb] pb-2 last:border-none">
                    <div className="flex items-start gap-2">
                      <span className="mt-1 size-1.5 rounded-full bg-[#184738] shrink-0" />
                      <div>
                        <div className="font-medium text-[#1c2420]">{l.label}</div>
                        <div className="text-[11px] text-muted-foreground">{l.detail}</div>
                      </div>
                    </div>
                    <span className="text-[10px] text-stone-400 shrink-0 ml-2">{l.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Razorpay Modal Overlay with Multi-Field Validation */}
      {isPayModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-[#e3e1d8]">
            <div className="flex items-center justify-between border-b border-[#f0ede6] pb-3">
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-[#184738]">Razorpay</span>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                  TEST MODE
                </span>
              </div>
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => setIsPayModalOpen(false)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="size-4" />
              </button>
            </div>

            {isPaid ? (
              <div className="py-10 text-center">
                <div className="size-12 rounded-full bg-emerald-100 text-[#184738] flex items-center justify-center mx-auto mb-3">
                  <Check className="size-6" />
                </div>
                <h4 className="text-lg font-semibold text-[#1c2420]">Payment Settled</h4>
                <p className="text-xs text-muted-foreground mt-1">Transaction approved via Razorpay sandbox.</p>
              </div>
            ) : (
              <div className="pt-4 space-y-4">
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className="text-muted-foreground">Amount:</span>
                  <div className="text-right">
                    <span className="text-lg font-bold text-[#184738] font-mono">
                      {formatINR(selected?.price || 799)}
                    </span>
                    {selectedSavings > 0 && (
                      <span className="block text-[10px] text-emerald-700 font-semibold">
                        MRP {formatINR(selected!.originalPrice!)} (Saved {formatINR(selectedSavings)})
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex rounded-xl bg-[#f4f2eb] p-1 text-xs">
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => {
                      setPaymentMethod('card')
                      setCardError(null)
                      setInvalidFields({})
                    }}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg font-medium transition ${
                      paymentMethod === 'card' ? 'bg-white text-[#184738] shadow-xs' : 'text-muted-foreground'
                    }`}
                  >
                    <CreditCard className="size-3.5" />
                    Card Details
                  </button>
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => {
                      setPaymentMethod('upi')
                      setCardError(null)
                      setInvalidFields({})
                    }}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg font-medium transition ${
                      paymentMethod === 'upi' ? 'bg-white text-[#184738] shadow-xs' : 'text-muted-foreground'
                    }`}
                  >
                    <QrCode className="size-3.5" />
                    UPI QR Code
                  </button>
                </div>

                {paymentMethod === 'card' ? (
                  <div className="space-y-3 pt-1">
                    {/* Error Alert Box */}
                    {cardError && (
                      <div className="flex items-start gap-2 rounded-lg bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-700 leading-snug">
                        <AlertCircle className="size-4 shrink-0 text-rose-600 mt-0.5" />
                        <span>{cardError}</span>
                      </div>
                    )}

                    <div>
                      <label className="text-[11px] font-medium text-muted-foreground">Card Number</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => handleCardNumberChange(e.target.value)}
                        placeholder="4111 •••• •••• 4444 (Test Card)"
                        className={`mt-1 w-full rounded-lg border bg-stone-50/50 px-3 py-2 text-xs font-mono outline-none transition placeholder:text-stone-400 placeholder:italic ${
                          invalidFields.card
                            ? 'border-rose-400 focus:border-rose-500 ring-1 ring-rose-200'
                            : 'border-[#e3e1d8] focus:border-[#184738]'
                        }`}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-medium text-muted-foreground">Expiry</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => handleExpiryChange(e.target.value)}
                          placeholder="MM / YY (e.g. 12/28)"
                          maxLength={5}
                          className={`mt-1 w-full rounded-lg border bg-stone-50/50 px-3 py-2 text-xs font-mono outline-none transition placeholder:text-stone-400 placeholder:italic ${
                            invalidFields.expiry
                              ? 'border-rose-400 focus:border-rose-500 ring-1 ring-rose-200'
                              : 'border-[#e3e1d8] focus:border-[#184738]'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-medium text-muted-foreground">CVV</label>
                        <input
                          type="password"
                          value={cvv}
                          onChange={(e) => handleCvvChange(e.target.value)}
                          maxLength={3}
                          placeholder="••• (e.g. 123)"
                          className={`mt-1 w-full rounded-lg border bg-stone-50/50 px-3 py-2 text-xs font-mono outline-none transition placeholder:text-stone-400 placeholder:italic ${
                            invalidFields.cvv
                              ? 'border-rose-400 focus:border-rose-500 ring-1 ring-rose-200'
                              : 'border-[#e3e1d8] focus:border-[#184738]'
                          }`}
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => executePayment('Razorpay Card')}
                      className="w-full mt-2 rounded-xl bg-[#184738] py-2.5 text-xs font-semibold text-white hover:bg-[#12362b] transition flex items-center justify-center gap-2 shadow-xs disabled:opacity-70"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="size-3.5 animate-spin" />
                          Verifying Card with Gateway...
                        </>
                      ) : (
                        `Pay ${formatINR(selected?.price || 799)}`
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-2 text-center space-y-3">
                    <div className="p-3 bg-white border-2 border-dashed border-[#e3e1d8] rounded-xl shadow-xs">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=upi://pay?pa=mira@razorpay&am=${selected?.price || 799}&cu=INR`}
                        alt="Scan UPI QR"
                        className="size-32 object-contain"
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground">Scan with Google Pay, PhonePe, Paytm, or CRED</p>

                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => executePayment('Razorpay UPI')}
                      className="w-full rounded-xl bg-[#184738] py-2.5 text-xs font-semibold text-white hover:bg-[#12362b] transition flex items-center justify-center gap-2"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="size-3.5 animate-spin" />
                          Verifying Payment...
                        </>
                      ) : (
                        'I have completed payment on app'
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Inspect Modal */}
      {inspected && (
        <Details product={inspected} onClose={() => setInspected(null)} onSelect={(p) => select(p, false)} />
      )}
    </main>
  )
}

function Card({
  product,
  selected,
  onInspect,
  onSelect,
}: {
  product: Product
  selected: boolean
  onInspect: (p: Product) => void
  onSelect: (p: Product) => void
}) {
  const hasDiscount = product.originalPrice && product.originalPrice > product.price
  const discountPercent = hasDiscount
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0

  return (
    <article
      onClick={() => onInspect(product)}
      className={`cursor-pointer rounded-2xl border bg-white p-3 shadow-xs transition hover:shadow-sm ${
        selected ? 'border-[#184738] ring-1 ring-[#184738]' : 'border-[#e3e1d8]'
      }`}
    >
      <div className="relative h-32 w-full overflow-hidden rounded-xl bg-stone-100 flex items-center justify-center">
        {product.image ? (
          <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <div
            className="h-full w-full flex items-center justify-center text-sm font-semibold"
            style={{ background: product.color }}
          >
            {product.initials}
          </div>
        )}
      </div>

      <div className="mt-3 flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold text-[#1c2420]">{product.name}</h3>
          <p className="text-xs text-stone-500">{product.detail}</p>
        </div>
        <div className="text-right">
          <span className="font-mono text-xs font-semibold text-[#184738]">
            {formatINR(product.price)}
          </span>
          {hasDiscount && (
            <div className="flex items-center gap-1 justify-end">
              <span className="font-mono text-[10px] text-stone-400 line-through">
                {formatINR(product.originalPrice!)}
              </span>
              <span className="rounded bg-emerald-100 px-1 py-0.2 text-[9px] font-semibold text-emerald-800">
                {discountPercent}% off
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-[#f4f2eb] pt-2 text-xs">
        <span className="text-stone-400">Rating {product.rating}★</span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onSelect(product)
          }}
          className="rounded-lg bg-[#184738] px-2.5 py-1 font-medium text-white hover:bg-[#12362b] transition text-[11px]"
        >
          {selected ? 'In Desk' : 'Add to Desk'}
        </button>
      </div>
    </article>
  )
}

function Details({
  product,
  onClose,
  onSelect,
}: {
  product: Product
  onClose: () => void
  onSelect: (p: Product) => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-[#e3e1d8]">
        <div className="flex justify-between items-center pb-3 border-b border-[#f0ede6]">
          <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">PRODUCT SPECS</span>
          <button type="button" onClick={onClose} className="text-stone-400 hover:text-stone-700">
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-4 flex gap-4">
          <div className="size-24 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-[#e3e1d8]">
            {product.image ? (
              <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
            ) : (
              <div
                className="h-full w-full flex items-center justify-center text-sm font-semibold"
                style={{ background: product.color }}
              >
                {product.initials}
              </div>
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#1c2420]">{product.name}</h3>
            <p className="text-xs text-stone-500 mt-1">{product.description}</p>
            <div className="mt-2 text-base font-bold font-mono text-[#184738]">{formatINR(product.price)}</div>
          </div>
        </div>

        <div className="mt-4 border-t border-[#f0ede6] pt-3">
          <div className="text-[11px] font-semibold text-muted-foreground uppercase">Specifications</div>
          <ul className="mt-2 space-y-1 text-xs text-stone-600">
            {product.specs?.map((s, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <span className="size-1 rounded-full bg-[#184738]" />
                {s}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 pt-2">
          <button
            type="button"
            onClick={() => {
              onSelect(product)
              onClose()
            }}
            className="w-full rounded-xl bg-[#184738] py-3 text-xs font-semibold text-white hover:bg-[#12362b] transition shadow-xs"
          >
            Add to Checkout Desk
          </button>
        </div>
      </div>
    </div>
  )
}