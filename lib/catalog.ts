export interface Product {
  id: string
  name: string
  detail: string
  description: string
  specs: string[]
  reviews: string[]
  rating: number
  price: number
  originalPrice?: number
  category: string
  tags: string[]
  stock: { min: number; max: number }
  color: string
  initials: string
  image?: string
}

export const CATALOG: Product[] = [
  {
  id: 'coaster-set',
  name: 'Striped Wooden Coaster Set',
  detail: 'Solid Wood · Set of 4 with Stand',
  description: 'Handcrafted two-tone wooden coasters complete with matching vertical peg holder.',
  specs: ['Solid Hardwood', 'Set of 4 + Stand', 'Natural Oil Finish'],
  reviews: ['Zero water rings and the wooden stand looks great.'],
  rating: 4.8,
  price: 499,
  originalPrice: 699,
  category: 'home kitchen desk',
  tags: ['coaster', 'wood', 'decor'],
  stock: { min: 5, max: 25 },
  color: '#D4A373',
  initials: 'WC',
  image: 'https://tse1.mm.bing.net/th/id/OIP.Eo0c5EAdjO9k-IkG2cqfkAHaHa?pid=ImgDet&rs=1',
},
  {
    id: 'soy-candle',
    name: 'Scented Soy Candle',
    detail: 'Soy wax · Soft amber',
    description: 'Amber, cedar, and clean smoke notes hand-poured in small batches.',
    specs: ['100% Soy Wax', '45h burn time', '220g'],
    reviews: ['Calming scent, burns clean for weeks.'],
    rating: 4.7,
    price: 799,
    originalPrice: 999,
    category: 'home decor aromatherapy',
    tags: ['candle', 'amber', 'soy'],
    stock: { min: 3, max: 15 },
    color: '#FEF3C7',
    initials: 'SC',
    image: 'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'prod_toy',
    name: 'Artisanal Wooden Balancing Blocks',
    detail: 'Beechwood · Kids desk set',
    description: 'Hand-carved developmental blocks for tactile play or workstation decor.',
    specs: ['Solid Beechwood', 'Non-toxic finish', 'Set of 8'],
    reviews: ['Smooth finish and looks great on my desk.'],
    rating: 4.9,
    price: 449,
    originalPrice: 599,
    category: 'toys kids decor',
    tags: ['toy', 'blocks', 'wooden'],
    stock: { min: 2, max: 10 },
    color: '#E0E7FF',
    initials: 'AB',
    image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=600&q=80',
  },
    {
    id: 'desk-lamp',
    name: 'Halo Desk Lamp',
    detail: 'Warm LED · USB-C',
    description: 'A compact desk companion with warm-to-cool dimmer touch control.',
    specs: ['Anodized Aluminum', 'Touch dimmer', 'USB-C Powered'],
    reviews: ['Solid base, no wobble, genuinely warm light.'],
    rating: 4.6,
    price: 3499,
    originalPrice: 4299,
    category: 'desk lighting office',
    tags: ['lamp', 'lighting'],
    stock: { min: 1, max: 8 },
    color: '#FCE7F3',
    initials: 'DL',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80',
  },
]

export const getProduct = (id: string) => CATALOG.find((product) => product.id === id)

export const formatINR = (value: number) =>
  `₹${(Number(value) || 0).toLocaleString('en-IN')}`

export const catalogPayload = () => ({
  protocol: 'UAP/1.0',
  type: 'agent-readable-catalog',
  currency: 'INR',
  updatedAt: '2026-09-04',
  schema: {
    price: 'integer, INR',
    stock: '{ min: integer, max: integer }',
    tags: 'string[]',
    specs: 'string[]',
  },
  products: CATALOG,
})

export const PRODUCTS = CATALOG