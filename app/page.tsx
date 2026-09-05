'use client'

import { useState, useRef, useEffect } from 'react'
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
  Cpu,
  Sparkles,
  Play,
  Layers,
  Box,
  MapPin,
  Edit3,
  ZoomIn,
  ZoomOut,
  Maximize2
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

const getClockTime = () => {
  const now = new Date()
  return now.toTimeString().split(' ')[0]
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

  // Default Address State
  const [address, setAddress] = useState('Sara • NSUT Campus, Sector 3, Dwarka, New Delhi - 110078')
  const [isEditingAddress, setIsEditingAddress] = useState(false)
  const [tempAddress, setTempAddress] = useState(address)

  // Voice Input State & Ref
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<any>(null)

  // Agent Thought / Deliberation State
  const [isThinking, setIsThinking] = useState(false)
  const [thoughtMessage, setThoughtMessage] = useState('')

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
    { role: 'assistant', text: "Hi Sara! I'm Mira, your autonomous commerce assistant. Tell me what you're looking for (or tap the mic) and I'll curate the best options within your policy corridor." },
  ])

  // Hydration-Safe Logs State
  const [logs, setLogs] = useState<Log[]>([
    { label: 'System Ready', detail: 'Agent bounded policies loaded', time: '12:00:00', status: 'active' },
  ])

  useEffect(() => {
    setLogs([
      { label: 'System Ready', detail: 'Agent bounded policies loaded', time: getClockTime(), status: 'active' }
    ])
  }, [])

  // Autonomous Agent Protocol Stream Simulation State
  const [agentRunning, setAgentRunning] = useState(false)
  const [agentLogs, setAgentLogs] = useState<string[]>([
    'UAP Socket initialized on protocol v1.0.4',
    'Waiting for machine-to-machine checkout instruction...'
  ])

  const log = (label: string, detail: string) => {
    setLogs((items) => [
      ...items.map((item) => ({ ...item, status: 'done' as const })),
      { label, detail, time: getClockTime(), status: 'active' },
    ])
  }

  const inspect = (p: Product) => {
    setInspected(p)
    log('Product inspected', `${p.name} specs examined in 3D modal`)
  }

  const select = (p: Product, isAgent = false) => {
    setSelected(p)
    setLink(`https://rzp.io/l/mira-${p.id}-1`)
    log('Product selected', `${p.name} locked into 3D Checkout Desk (${isAgent ? 'Autonomous Agent' : 'Human User'})`)
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

  const handleCardNumberChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 16)
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ')
    setCardNumber(formatted)
    setInvalidFields((prev) => ({ ...prev, card: false }))
    if (cardError) setCardError(null)
  }

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

    if (paymentMethod === 'card') {
      const cleanCard = cardNumber.replace(/\s+/g, '')
      const cleanCvv = cvv.trim()
      const cleanExpiry = cardExpiry.trim()

      const errors: string[] = []
      const invalid: { card?: boolean; expiry?: boolean; cvv?: boolean } = {}

      if (cardNumber !== '' || cardExpiry !== '' || cvv !== '') {
        if (cleanCard.length < 16) {
          errors.push('Card number (16 digits required)')
          invalid.card = true
        }

        if (cleanExpiry.length < 5) {
          errors.push('Expiry format (MM/YY)')
          invalid.expiry = true
        } else {
          const [mm, yy] = cleanExpiry.split('/').map(Number)
          const currentYearShort = new Date().getFullYear() % 100
          const currentMonth = new Date().getMonth() + 1

          if (!mm || mm < 1 || mm > 12) {
            errors.push('Expiry month (01-12)')
            invalid.expiry = true
          } else if (yy < currentYearShort || (yy === currentYearShort && mm < currentMonth)) {
            errors.push('Card is expired')
            invalid.expiry = true
          }
        }

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
            text: `Payment confirmed for ${selected.name}! Your order has been dispatched to ${address.split('•')[1]?.trim() || 'your default address'}. Transaction token logged.`,
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

    setMessages((m) => [...m, { role: 'user', text: clean }])
    setQuery('')
    setIsThinking(true)
    setThoughtMessage('Analyzing constraints across 3D vector embeddings...')

    setTimeout(() => {
      const candidates = CATALOG.filter((p) => {
        const nameMatch = p.name.toLowerCase().includes(lower)
        const categoryMatch = p.category.toLowerCase().includes(lower)
        const tagMatch = p.tags.some((t) => lower.includes(t.toLowerCase()) || t.toLowerCase().includes(lower))
        
        const isLampQuery = lower.includes('lamp') && (p.name.toLowerCase().includes('lamp') || p.tags.includes('lamp') || p.category.toLowerCase().includes('lamp'))
        const isCoasterQuery = lower.includes('coaster') && (p.name.toLowerCase().includes('coaster') || p.tags.includes('coaster'))
        const isCandleQuery = (lower.includes('candle') || lower.includes('soy')) && (p.name.toLowerCase().includes('candle') || p.tags.includes('candle'))

        const matchesQuery = nameMatch || categoryMatch || tagMatch || isLampQuery || isCoasterQuery || isCandleQuery
        const matchesBudget = budget === null ? true : p.price <= budget

        return matchesQuery && matchesBudget
      })

      const found = candidates

      setIsThinking(false)
      setResults(found)
      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          text: found.length > 0
            ? `Found ${found.length} verified item${found.length > 1 ? 's' : ''} matching "${clean}" within your budget. Ready to lock into your Checkout Desk.`
            : `No exact items found matching "${clean}" within your budget. Try searching for "lamp", "coaster", or "candle".`,
        },
      ])
      log('Query Parsing', `Matched ${found.length} products for "${clean}"`)
    }, 700)
  }

  const toggleVoiceSearch = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.')
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
        log('Voice Search Activated', 'Listening... Please speak clearly into the mic')
      }

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setIsListening(false)
        setQuery(transcript)
        log('Voice Audio Transcribed', `Recognized input: "${transcript}"`)
        performSearch(transcript)
      }

      recognition.onerror = (event: any) => {
        setIsListening(false)
        if (event.error === 'not-allowed') {
          alert('Microphone permission blocked! Please allow microphone access in site settings.')
        } else if (event.error === 'no-speech') {
          log('Voice Search', 'No speech detected. Tap mic again.')
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

  const runAutonomousSimulation = () => {
    setAgentRunning(true)
    setAgentLogs(['[00.1s] Handshake initialized with external autonomous buyer node...'])

    setTimeout(() => {
      setAgentLogs((prev) => [
        ...prev,
        `[00.6s] Resolving SKU target: "${CATALOG[0].name}" [Floor: INR ${CATALOG[0].price}]`,
      ])
    }, 600)

    setTimeout(() => {
      setAgentLogs((prev) => [
        ...prev,
        `[01.1s] Checking Merchant Orchestrator policy bounds: Minimum Margin > 25%... PASS`,
      ])
    }, 1200)

    setTimeout(() => {
      setAgentLogs((prev) => [
        ...prev,
        `[01.8s] Generating dynamic tokenized payload: tk_${Math.random().toString(36).substring(2, 9)}`,
      ])
    }, 1800)

    setTimeout(() => {
      setAgentLogs((prev) => [
        ...prev,
        `[02.4s] Razorpay Sandbox Order Created: order_agent_${Math.floor(100000 + Math.random() * 900000)}`,
        `[02.9s] Machine-to-Machine settlement executed. 200 OK.`,
      ])
      setAgentRunning(false)
      select(CATALOG[0], true)
      log('Autonomous Buy Completed', `SKU ${CATALOG[0].name} purchased autonomously via UAP payload`)
    }, 2800)
  }

  const selectedSavings =
    selected?.originalPrice && selected.originalPrice > selected.price
      ? selected.originalPrice - selected.price
      : 0

  return (
    <main className="relative min-h-screen bg-[#FAF9F5] text-[#1c2420] overflow-x-hidden selection:bg-[#184738]/20 selection:text-[#184738]">
      {/* Dynamic 3D Ambient Orbs */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-32 -left-20 h-96 w-96 rounded-full bg-emerald-200/35 blur-3xl" />
        <div className="absolute top-1/3 -right-24 h-[450px] w-[450px] rounded-full bg-amber-200/25 blur-3xl" />
        <div className="absolute -bottom-24 left-1/4 h-80 w-80 rounded-full bg-teal-200/25 blur-3xl" />
      </div>

      <div className="relative z-10">
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
          <div className="p-6 max-w-4xl mx-auto space-y-6">
            <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.08)] backdrop-blur-xl transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#f0ede6]">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-emerald-100/70 text-[#184738] shadow-inner">
                      <Cpu className="size-5" />
                    </div>
                    <h2 className="text-lg font-semibold text-[#184738]">Autonomous AI Buyer (UAP / Protocol Engine)</h2>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Machine-readable JSON schema conforming to Universal Agent Protocol standards.
                  </p>
                </div>

                <button
                  type="button"
                  disabled={agentRunning}
                  onClick={runAutonomousSimulation}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#184738] px-4 py-2.5 text-xs font-semibold text-white shadow-[0_4px_14px_0_rgba(24,71,56,0.39)] hover:bg-[#12362b] active:translate-y-0.5 transition-all disabled:opacity-60 shrink-0"
                >
                  {agentRunning ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      Executing Protocol...
                    </>
                  ) : (
                    <>
                      <Play className="size-3.5 fill-current" />
                      Simulate External AI Purchase
                    </>
                  )}
                </button>
              </div>

              {/* Protocol Terminal */}
              <div className="mt-5 rounded-2xl bg-[#141916] p-4 font-mono text-xs text-emerald-400 space-y-1.5 shadow-[inset_0_2px_8px_rgba(0,0,0,0.6)] border border-emerald-950/40">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-800/80 text-[11px] text-stone-400">
                  <span className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-emerald-400 animate-ping" />
                    UAP AGENT EVENT BUS · PORT 8080
                  </span>
                  <span className="text-stone-500">M2M TLS 1.3</span>
                </div>
                {agentLogs.map((item, idx) => (
                  <div key={idx} className="leading-relaxed font-mono">
                    <span className="text-emerald-600 mr-2 font-bold">›</span>
                    {item}
                  </div>
                ))}
              </div>

              <div className="mt-5">
                <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase flex items-center gap-1.5">
                  <Box className="size-3.5 text-[#184738]" /> Raw Machine Endpoint: <code className="text-stone-800 font-mono bg-stone-100 px-1.5 py-0.5 rounded">GET /api/uap/v1</code>
                </span>
                <pre className="mt-2 p-4 rounded-2xl bg-stone-900 text-stone-300 text-xs overflow-x-auto font-mono max-h-60 border border-stone-800 shadow-inner">
                  {JSON.stringify(catalogPayload(), null, 2)}
                </pre>
              </div>
            </div>
          </div>
        ) : (
          <div className="main-grid max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Chat & 3D Interactive Catalog */}
            <section className="chat-pane lg:col-span-2 space-y-6">
              {/* Intro Banner (Find Something - Pop-up ON) */}
              <div className="group relative overflow-hidden rounded-3xl border border-white/80 bg-gradient-to-br from-white/95 via-white/80 to-emerald-50/40 p-7 shadow-[0_15px_35px_-10px_rgba(24,71,56,0.06)] backdrop-blur-xl transition-all duration-300 ease-out hover:-translate-y-1 hover:bg-[#f4f9f6] hover:border-emerald-300 hover:shadow-[0_22px_45px_-12px_rgba(24,71,56,0.12)] cursor-default">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100/80 px-2.5 py-1 text-[10px] font-bold tracking-widest text-[#184738] uppercase shadow-xs transition-colors group-hover:bg-emerald-200/80">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Conversational Session
                </div>
                <h1 className="text-4xl sm:text-5xl font-light tracking-tight mt-3 text-[#1c2420] leading-tight transition-colors group-hover:text-stone-900">
                  Find something <br />
                  <em className="font-serif italic font-normal text-[#184738] drop-shadow-xs">worth keeping.</em>
                </h1>
                <p className="text-sm text-stone-500 mt-2 max-w-md leading-relaxed">
                  Natural language shopping agent with live inventory verification, voice inputs, and gated checkout.
                </p>
              </div>

              {/* Chat Thread with Light Gradient Assistant Messages */}
              <div className="chat-thread space-y-3">
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`flex gap-3 text-sm ${
                      m.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`rounded-2xl px-4 py-3 max-w-md leading-relaxed transition-all ${
                        m.role === 'user'
                          ? 'bg-gradient-to-r from-[#184738] to-[#12362b] text-white shadow-[0_10px_20px_-5px_rgba(24,71,56,0.35)]'
                          : 'bg-gradient-to-br from-white/95 via-emerald-50/40 to-teal-50/30 border border-emerald-100/80 text-[#1c2420] shadow-[0_4px_16px_rgba(24,71,56,0.04)] backdrop-blur-md'
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                ))}

                {isThinking && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/80 px-4 py-2.5 text-xs text-[#184738] shadow-[0_4px_12px_rgba(24,71,56,0.08)] flex items-center gap-2 backdrop-blur-sm">
                      <Sparkles className="size-3.5 animate-spin text-[#184738]" />
                      <span className="font-medium animate-pulse">{thoughtMessage}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Items Shown / Product Grid (Pop-up ON) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 perspective-1000">
                {results.map((p) => (
                  <ProductCard3D
                    key={p.id}
                    product={p}
                    selected={selected?.id === p.id}
                    onInspect={inspect}
                    onSelect={(item) => select(item, false)}
                  />
                ))}
              </div>

              {/* Search Control Bar (Try Asking Pills have pop-up ON) */}
              <div className="space-y-2.5">
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Try asking:</span>
                  {['Candle under 1000', 'Coaster set', 'Minimalist desk items', 'Desk lamp'].map((hint, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => performSearch(hint)}
                      className="rounded-full border border-stone-200/90 bg-white/90 px-3 py-1 text-[11px] font-medium text-stone-600 shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-[#f4f9f6] hover:text-[#184738] hover:shadow-[0_4px_12px_rgba(24,71,56,0.12)] active:scale-95 cursor-pointer"
                    >
                      "{hint}"
                    </button>
                  ))}
                </div>

                <div
                  className={`relative flex items-center gap-2 rounded-2xl border transition-all p-2 backdrop-blur-xl ${
                    isListening
                      ? 'border-red-400 bg-red-50/30 ring-4 ring-red-100 shadow-[0_8px_24px_rgba(239,68,68,0.2)]'
                      : 'border-white/80 bg-white/90 shadow-[0_12px_30px_-10px_rgba(0,0,0,0.08)]'
                  }`}
                >
                  <button
                    type="button"
                    onClick={toggleVoiceSearch}
                    title={isListening ? 'Stop listening' : 'Voice search'}
                    className={`size-10 rounded-xl flex items-center justify-center transition-all ${
                      isListening
                        ? 'bg-red-500 text-white animate-pulse shadow-md'
                        : 'bg-stone-100/80 text-[#184738] hover:bg-[#f4f9f6] hover:text-emerald-800 active:scale-90 shadow-2xs'
                    }`}
                  >
                    {isListening ? <MicOff className="size-4" /> : <Mic className="size-4" />}
                  </button>

                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && performSearch(query)}
                    placeholder={isListening ? 'Listening... Speak clearly now' : "Ask Mira anything (e.g. 'coasters under 500')..."}
                    className="flex-1 bg-transparent px-2 text-sm outline-none text-[#1c2420] placeholder:text-stone-400 placeholder:italic"
                  />

                  <button
                    type="button"
                    onClick={() => performSearch(query)}
                    className="size-10 rounded-xl bg-[#184738] flex items-center justify-center text-white shadow-[0_4px_12px_rgba(24,71,56,0.35)] hover:bg-[#12362b] active:scale-90 transition"
                  >
                    <ArrowUp className="size-4" />
                  </button>
                </div>
              </div>
            </section>

            {/* Right Column: Static Checkout Desk & Reasoning Log (Pop-up OFF) */}
            <aside className="desk-pane space-y-6">
              
              {/* Checkout Desk (Static) */}
              <div className="rounded-3xl border border-white/80 bg-white/90 p-6 shadow-[0_15px_35px_-10px_rgba(0,0,0,0.06)] backdrop-blur-xl">
                <div className="flex items-center justify-between pb-3.5 border-b border-[#f0ede6]">
                  <div>
                    <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                      YOUR DESK
                    </span>
                    <h2 className="text-base font-semibold text-[#1c2420] flex items-center gap-1.5">
                      <Layers className="size-4 text-[#184738]" /> Checkout desk
                    </h2>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-full bg-stone-100 px-2.5 py-1 text-xs text-stone-600 font-medium shadow-inner">
                    <span>{selected ? 1 : 0} item</span>
                    <ShoppingBag className="size-3.5" />
                  </div>
                </div>

                {selected ? (
                  <div className="pt-4 space-y-4">
                    {/* Item Card */}
                    <div className="flex items-center gap-3.5 rounded-2xl bg-stone-50/80 p-2.5 border border-stone-200/60 shadow-inner">
                      <div className="size-14 rounded-xl overflow-hidden bg-stone-200 shrink-0 border border-white shadow-xs">
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
                        <div className="flex items-center gap-1.5 text-xs mt-0.5">
                          <span className="font-mono text-[#184738] font-bold">{formatINR(selected.price)}</span>
                          {selected.originalPrice && selected.originalPrice > selected.price && (
                            <span className="font-mono text-stone-400 line-through text-[11px]">
                              {formatINR(selected.originalPrice)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Pre-filled Default Delivery Address Pill */}
                    <div className="rounded-2xl border border-stone-200/70 bg-stone-50/80 p-3 text-xs shadow-inner">
                      <div className="flex items-center justify-between pb-1 text-[11px] font-medium text-stone-500">
                        <span className="flex items-center gap-1 text-[#184738] font-semibold">
                          <MapPin className="size-3.5" /> Delivery Destination
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setTempAddress(address)
                            setIsEditingAddress(true)
                          }}
                          className="text-[#184738] hover:underline flex items-center gap-0.5 font-semibold transition-colors cursor-pointer"
                        >
                          <Edit3 className="size-3" /> Change
                        </button>
                      </div>
                      <p className="text-stone-700 text-xs mt-0.5 leading-snug truncate">
                        {address}
                      </p>
                    </div>

                    {/* Price Breakdown */}
                    <div className="border-t border-[#f0ede6] pt-3 space-y-2 text-xs">
                      {selectedSavings > 0 && (
                        <>
                          <div className="flex justify-between text-muted-foreground">
                            <span>Original Price (MRP)</span>
                            <span className="font-mono line-through">{formatINR(selected.originalPrice!)}</span>
                          </div>
                          <div className="flex justify-between text-emerald-700 font-semibold">
                            <span className="flex items-center gap-1">
                              <Tag className="size-3" /> Special Promo Discount
                            </span>
                            <span className="font-mono">-{formatINR(selectedSavings)}</span>
                          </div>
                        </>
                      )}

                      <div className="flex justify-between items-center pt-2.5 border-t border-[#f4f2eb] text-sm font-bold">
                        <span>Total Payable</span>
                        <span className="font-mono text-lg text-[#184738]">{formatINR(selected.price)}</span>
                      </div>

                      {selectedSavings > 0 && (
                        <div className="rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 px-3 py-2 text-center text-xs font-medium text-emerald-800 border border-emerald-200/70 shadow-2xs">
                          🎉 You are saving {formatINR(selectedSavings)} on this order!
                        </div>
                      )}
                    </div>

                    {/* Tactile 3D Action Button */}
                    <button
                      type="button"
                      onClick={confirmPayment}
                      className="w-full rounded-2xl bg-[#184738] py-3.5 text-sm font-semibold text-white transition-all shadow-[0_8px_20px_-4px_rgba(24,71,56,0.45)] hover:bg-[#12362b] hover:shadow-[0_12px_24px_-4px_rgba(24,71,56,0.55)] active:translate-y-0.5 active:shadow-[0_4px_12px_-2px_rgba(24,71,56,0.4)] flex items-center justify-center gap-2 cursor-pointer"
                    >
                      Confirm & open Razorpay
                    </button>

                    <div className="flex items-center justify-between rounded-xl bg-stone-100/80 px-3 py-2 text-xs text-muted-foreground border border-stone-200/50 shadow-inner">
                      <span className="truncate font-mono">{link}</span>
                      <button
                        type="button"
                        onClick={() => navigator.clipboard.writeText(link)}
                        className="ml-2 hover:text-[#184738] cursor-pointer"
                      >
                        <Copy className="size-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="py-10 text-center text-xs text-muted-foreground">
                    Select any product from the catalog to populate desk.
                  </div>
                )}
              </div>

              {/* Reasoning Log (Static) */}
              <div className="logs rounded-3xl border border-white/80 bg-white/90 p-6 shadow-[0_15px_35px_-10px_rgba(0,0,0,0.06)] backdrop-blur-xl">
                <div className="flex items-center justify-between pb-3.5 border-b border-[#f0ede6]">
                  <div>
                    <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                      TRANSPARENCY
                    </span>
                    <h3 className="text-base font-semibold text-[#1c2420]">Reasoning Log</h3>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    STREAMING
                  </div>
                </div>

                <div className="max-h-[220px] overflow-y-auto space-y-2 text-xs pr-1 pt-3">
                  {logs.map((l, i) => (
                    <div key={i} className="flex items-start justify-between border-b border-[#f4f2eb] p-2 rounded-xl last:border-none">
                      <div className="flex items-start gap-2">
                        <span className={`mt-1 size-1.5 rounded-full shrink-0 ${l.status === 'active' ? 'bg-emerald-500 animate-ping' : 'bg-[#184738]'}`} />
                        <div>
                          <div className="font-medium text-[#1c2420]">{l.label}</div>
                          <div className="text-[11px] text-muted-foreground">{l.detail}</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-stone-400 shrink-0 ml-2">{l.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>

      {/* Edit Address Modal */}
      {isEditingAddress && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-white/95 p-6 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] border border-white/80 backdrop-blur-xl">
            <div className="flex justify-between items-center pb-3 border-b border-[#f0ede6]">
              <span className="text-sm font-semibold text-[#1c2420] flex items-center gap-1.5">
                <MapPin className="size-4 text-[#184738]" /> Update Delivery Address
              </span>
              <button type="button" onClick={() => setIsEditingAddress(false)} className="text-stone-400 hover:text-stone-700 cursor-pointer">
                <X className="size-4" />
              </button>
            </div>
            <div className="mt-4 space-y-3">
              <label className="text-xs text-stone-600 font-medium">Default Shipping Destination:</label>
              <textarea
                rows={3}
                value={tempAddress}
                onChange={(e) => setTempAddress(e.target.value)}
                className="w-full rounded-2xl border border-stone-300 p-3 text-xs outline-none focus:border-[#184738] shadow-inner"
              />
            </div>
            <div className="mt-4 flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setIsEditingAddress(false)}
                className="rounded-xl border border-stone-300 px-3.5 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setAddress(tempAddress)
                  setIsEditingAddress(false)
                  log('Address Updated', `Shipping location set to ${tempAddress.split('•')[0].trim()}`)
                }}
                className="rounded-xl bg-[#184738] px-4 py-2 text-xs font-semibold text-white hover:bg-[#12362b] shadow-xs cursor-pointer"
              >
                Save Address
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3D Glass Razorpay Modal Overlay */}
      {isPayModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-white/95 p-6 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] border border-white/80 backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-[#f0ede6] pb-3">
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-[#184738]">Razorpay</span>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 shadow-2xs">
                  TEST MODE
                </span>
              </div>
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => setIsPayModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            {isPaid ? (
              <div className="py-10 text-center animate-in zoom-in-95 duration-200">
                <div className="size-14 rounded-full bg-emerald-100 text-[#184738] flex items-center justify-center mx-auto mb-3 shadow-[0_8px_20px_rgba(24,71,56,0.2)]">
                  <Check className="size-7" />
                </div>
                <h4 className="text-lg font-bold text-[#1c2420]">Payment Settled</h4>
                <p className="text-xs text-muted-foreground mt-1">Transaction approved via Razorpay sandbox.</p>
              </div>
            ) : (
              <div className="pt-4 space-y-4">
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className="text-muted-foreground">Amount:</span>
                  <div className="text-right">
                    <span className="text-xl font-bold text-[#184738] font-mono">
                      {formatINR(selected?.price || 799)}
                    </span>
                    {selectedSavings > 0 && (
                      <span className="block text-[10px] text-emerald-700 font-semibold">
                        MRP {formatINR(selected!.originalPrice!)} (Saved {formatINR(selectedSavings)})
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex rounded-2xl bg-stone-100 p-1 text-xs shadow-inner">
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => {
                      setPaymentMethod('card')
                      setCardError(null)
                      setInvalidFields({})
                    }}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl font-semibold transition-all cursor-pointer ${
                      paymentMethod === 'card'
                        ? 'bg-white text-[#184738] shadow-[0_2px_8px_rgba(0,0,0,0.08)]'
                        : 'text-muted-foreground hover:text-foreground'
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
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl font-semibold transition-all cursor-pointer ${
                      paymentMethod === 'upi'
                        ? 'bg-white text-[#184738] shadow-[0_2px_8px_rgba(0,0,0,0.08)]'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <QrCode className="size-3.5" />
                    UPI QR Code
                  </button>
                </div>

                {paymentMethod === 'card' ? (
                  <div className="space-y-3 pt-1">
                    {cardError && (
                      <div className="flex items-start gap-2 rounded-xl bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-700 shadow-2xs leading-snug">
                        <AlertCircle className="size-4 shrink-0 text-rose-600 mt-0.5" />
                        <span>{cardError}</span>
                      </div>
                    )}

                    <div>
                      <label className="text-[11px] font-semibold text-muted-foreground">Card Number</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => handleCardNumberChange(e.target.value)}
                        placeholder="4111 •••• •••• 4444 (Test Card)"
                        className={`mt-1 w-full rounded-xl border bg-stone-50/70 px-3 py-2 text-xs font-mono outline-none transition placeholder:text-stone-400 placeholder:italic shadow-inner ${
                          invalidFields.card
                            ? 'border-rose-400 focus:border-rose-500 ring-2 ring-rose-100'
                            : 'border-stone-200 focus:border-[#184738]'
                        }`}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground">Expiry</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => handleExpiryChange(e.target.value)}
                          placeholder="MM / YY (e.g. 12/28)"
                          maxLength={5}
                          className={`mt-1 w-full rounded-xl border bg-stone-50/70 px-3 py-2 text-xs font-mono outline-none transition placeholder:text-stone-400 placeholder:italic shadow-inner ${
                            invalidFields.expiry
                              ? 'border-rose-400 focus:border-rose-500 ring-2 ring-rose-100'
                              : 'border-stone-200 focus:border-[#184738]'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground">CVV</label>
                        <input
                          type="password"
                          value={cvv}
                          onChange={(e) => handleCvvChange(e.target.value)}
                          maxLength={3}
                          placeholder="••• (e.g. 123)"
                          className={`mt-1 w-full rounded-xl border bg-stone-50/70 px-3 py-2 text-xs font-mono outline-none transition placeholder:text-stone-400 placeholder:italic shadow-inner ${
                            invalidFields.cvv
                              ? 'border-rose-400 focus:border-rose-500 ring-2 ring-rose-100'
                              : 'border-stone-200 focus:border-[#184738]'
                          }`}
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => executePayment('Razorpay Card')}
                      className="w-full mt-2 rounded-2xl bg-[#184738] py-3 text-xs font-bold text-white shadow-[0_6px_18px_rgba(24,71,56,0.35)] hover:bg-[#12362b] active:translate-y-0.5 transition flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="size-3.5 animate-spin" />
                          Processing with Bank...
                        </>
                      ) : (
                        `Pay ${formatINR(selected?.price || 799)}`
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-2 text-center space-y-3">
                    <div className="p-3 bg-white border border-stone-200 rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
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
                      className="w-full rounded-2xl bg-[#184738] py-3 text-xs font-bold text-white shadow-[0_6px_18px_rgba(24,71,56,0.35)] hover:bg-[#12362b] active:translate-y-0.5 transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="size-3.5 animate-spin" />
                          Verifying Settlement...
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

      {/* 3D Specs Inspection Modal */}
      {inspected && (
        <Details product={inspected} onClose={() => setInspected(null)} onSelect={(p) => select(p, false)} />
      )}
    </main>
  )
}

// 3D Product Card Component with Hover Elevation (Items Shown - Pop-up ON)
function ProductCard3D({
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
      className={`group relative cursor-pointer rounded-3xl border bg-white/90 p-4 transition-all duration-300 transform-style-3d hover:-translate-y-1.5 hover:bg-[#f4f9f6] hover:border-emerald-300 hover:shadow-[0_20px_35px_-10px_rgba(24,71,56,0.14)] backdrop-blur-md ${
        selected
          ? 'border-[#184738] ring-2 ring-[#184738]/20 shadow-[0_12px_28px_-6px_rgba(24,71,56,0.18)]'
          : 'border-white/80 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)]'
      }`}
    >
      <div className="relative h-36 w-full overflow-hidden rounded-2xl bg-stone-100 flex items-center justify-center shadow-inner">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div
            className="h-full w-full flex items-center justify-center text-sm font-semibold"
            style={{ background: product.color }}
          >
            {product.initials}
          </div>
        )}
      </div>

      <div className="mt-3.5 flex items-start justify-between">
        <div>
          <h3 className="text-sm font-bold text-[#1c2420] group-hover:text-[#184738] transition-colors">{product.name}</h3>
          <p className="text-xs text-stone-500 line-clamp-1">{product.detail}</p>
        </div>
        <div className="text-right">
          <span className="font-mono text-sm font-bold text-[#184738]">
            {formatINR(product.price)}
          </span>
          {hasDiscount && (
            <div className="flex items-center gap-1 justify-end mt-0.5">
              <span className="font-mono text-[10px] text-stone-400 line-through">
                {formatINR(product.originalPrice!)}
              </span>
              <span className="rounded-md bg-emerald-100 px-1.5 py-0.2 text-[9px] font-bold text-emerald-800">
                {discountPercent}% off
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-3.5 flex items-center justify-between border-t border-stone-100 pt-2.5 text-xs">
        <span className="text-stone-500 font-medium">★ {product.rating}</span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onSelect(product)
          }}
          className={`rounded-xl px-3 py-1.5 font-semibold transition-all text-[11px] active:scale-95 cursor-pointer ${
            selected
              ? 'bg-emerald-100 text-[#184738]'
              : 'bg-[#184738] text-white hover:bg-[#12362b] shadow-2xs'
          }`}
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
  const [isZoomOpen, setIsZoomOpen] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation()
    setZoomLevel((prev) => Math.min(prev + 0.35, 2.6))
  }

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation()
    setZoomLevel((prev) => Math.max(prev - 0.35, 1))
  }

  return (
    <>
      {/* Product Details Architecture Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4 animate-in fade-in duration-200">
        <div className="w-full max-w-lg rounded-3xl bg-white/95 p-6 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] border border-white/80 backdrop-blur-xl">
          <div className="flex justify-between items-center pb-3 border-b border-[#f0ede6]">
            <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase flex items-center gap-1">
              <Box className="size-3.5 text-[#184738]" /> PRODUCT ARCHITECTURE
            </span>
            <button type="button" onClick={onClose} className="text-stone-400 hover:text-stone-700 cursor-pointer">
              <X className="size-4" />
            </button>
          </div>

          <div className="mt-4 flex gap-4">
            {/* Clickable Image Container to trigger HD Full-Screen Lightbox */}
            <div
              onClick={() => {
                if (product.image) {
                  setZoomLevel(1)
                  setIsZoomOpen(true)
                }
              }}
              title={product.image ? "Click to open full view & zoom" : ""}
              className="group/pic relative size-24 rounded-2xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200 shadow-inner cursor-pointer"
            >
              {product.image ? (
                <>
                  <img src={product.image} alt={product.name} className="h-full w-full object-cover transition duration-300 group-hover/pic:scale-105" />
                  <div className="absolute inset-0 bg-black/25 opacity-0 group-hover/pic:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <Maximize2 className="size-5 drop-shadow-md" />
                  </div>
                </>
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
              <h3 className="text-lg font-bold text-[#1c2420]">{product.name}</h3>
              <p className="text-xs text-stone-500 mt-1">{product.description}</p>
              <div className="mt-2 text-base font-bold font-mono text-[#184738]">{formatINR(product.price)}</div>
            </div>
          </div>

          <div className="mt-4 border-t border-[#f0ede6] pt-3">
            <div className="text-[11px] font-semibold text-muted-foreground uppercase">Specifications</div>
            <ul className="mt-2 space-y-1 text-xs text-stone-600">
              {product.specs?.map((s, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-[#184738]" />
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
              className="w-full rounded-2xl bg-[#184738] py-3 text-xs font-bold text-white hover:bg-[#12362b] transition shadow-[0_6px_18px_rgba(24,71,56,0.3)] active:translate-y-0.5 cursor-pointer"
            >
              Add to Checkout Desk
            </button>
          </div>
        </div>
      </div>

      {/* Full-Screen Zoom In / Zoom Out Image Lightbox */}
      {isZoomOpen && product.image && (
        <div 
          onClick={() => setIsZoomOpen(false)}
          className="fixed inset-0 z-60 flex flex-col items-center justify-center bg-black/85 backdrop-blur-xl p-4 animate-in fade-in zoom-in-95 duration-150 select-none"
        >
          {/* Top Lightbox Toolbar */}
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="flex items-center gap-3 rounded-full bg-white/10 backdrop-blur-md px-4 py-2 border border-white/20 text-white mb-4 shadow-lg"
          >
            <span className="text-xs font-medium mr-2">{product.name}</span>
            <button
              type="button"
              onClick={handleZoomOut}
              disabled={zoomLevel <= 1}
              className="p-1.5 rounded-full hover:bg-white/20 disabled:opacity-40 transition cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="size-4" />
            </button>
            <span className="text-xs font-mono font-bold w-12 text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              type="button"
              onClick={handleZoomIn}
              disabled={zoomLevel >= 2.6}
              className="p-1.5 rounded-full hover:bg-white/20 disabled:opacity-40 transition cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="size-4" />
            </button>
            <div className="h-4 w-px bg-white/30 mx-1" />
            <button
              type="button"
              onClick={() => setIsZoomOpen(false)}
              className="p-1.5 rounded-full hover:bg-white/20 transition cursor-pointer"
              title="Close Fullscreen View"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Interactive Zoom Stage */}
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[75vh] overflow-hidden rounded-3xl border border-white/20 shadow-2xl flex items-center justify-center bg-black/40"
          >
            <img
              src={product.image}
              alt={product.name}
              style={{ transform: `scale(${zoomLevel})` }}
              onDoubleClick={() => setZoomLevel((prev) => (prev > 1 ? 1 : 1.75))}
              className="max-h-[70vh] max-w-[85vw] object-contain transition-transform duration-200 cursor-zoom-in"
            />
          </div>

          <p className="text-[11px] text-white/50 mt-3">
            Use Zoom controls or double-click image to toggle magnification · Click backdrop to dismiss
          </p>
        </div>
      )}
    </>
  )
}