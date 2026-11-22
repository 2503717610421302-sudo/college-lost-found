'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Search, Package, Shield, ArrowRight, CheckCircle,
  MapPin, Calendar, Tag, Users, TrendingUp, Star, Award,
  Sparkles, Filter, AlertTriangle, HeartHandshake, School,
  Layers, Gift, RefreshCw
} from 'lucide-react'
import { formatTimeAgo, getCategoryLabel } from '@/lib/utils'
import { CATEGORIES } from '@/lib/constants'
import { getStoredItems, updateItemStatus, resetToDemoItems } from '@/lib/itemStore'
import ItemCard from '@/components/items/ItemCard'
import ImageLightbox from '@/components/ui/ImageLightbox'
import ClaimModal from '@/components/ui/ClaimModal'
import { cn } from '@/lib/utils'

function HowItWorksStep({ step, icon: Icon, title, desc, gradient }) {
  return (
    <div className="relative group p-6 rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${gradient} flex items-center justify-center text-white mb-4 shadow-md`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="text-[11px] font-black text-indigo-600 tracking-wider uppercase mb-1">
        Step 0{step}
      </div>
      <h3 className="font-extrabold text-gray-900 text-lg mb-2">{title}</h3>
      <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
    </div>
  )
}

export default function HomePage() {
  const supabase = createClient()
  const [allItems, setAllItems] = useState([])
  const [stats, setStats] = useState({ lost: 8, found: 16, returned: 12 })
  const [selectedZone, setSelectedZone] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [lightboxItem, setLightboxItem] = useState(null)
  const [claimItem, setClaimItem] = useState(null)

  const reloadData = () => {
    const stored = getStoredItems()
    setAllItems(stored)
    const lostCount = stored.filter((i) => i.item_type === 'lost').length
    const foundCount = stored.filter((i) => i.item_type === 'found').length
    const retCount = stored.filter((i) => i.status === 'returned').length
    setStats({ lost: lostCount, found: foundCount, returned: retCount })
  }

  useEffect(() => {
    reloadData()

    // Try fetching from Supabase if configured
    async function fetchFromSupabase() {
      try {
        const { data } = await supabase
          .from('items')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(20)
        if (data && data.length > 0) {
          setAllItems(data)
        }
      } catch (e) {}
    }
    fetchFromSupabase()
  }, [])

  const campusZones = [
    { id: 'all', label: 'All Campus Zones' },
    { id: 'Library', label: 'Central Library' },
    { id: 'Labs', label: 'CSE & Science Labs' },
    { id: 'Cafeteria', label: 'Cafeteria & Food Court' },
    { id: 'Parking', label: 'Parking Bay' },
    { id: 'Workshop', label: 'Mech Workshop' },
    { id: 'Hostel', label: 'Hostel Blocks' },
  ]

  const filteredItems = allItems.filter((item) => {
    const matchZone =
      selectedZone === 'all' ||
      item.location?.toLowerCase().includes(selectedZone.toLowerCase())
    const matchCat =
      selectedCategory === 'all' || item.category === selectedCategory
    return matchZone && matchCat
  })

  const handleClaimSuccess = (updatedItem) => {
    updateItemStatus(updatedItem.id, 'claimed')
    reloadData()
  }

  return (
    <div className="min-h-screen bg-slate-50/70">
      {/* College Project Top Status Ribbon */}
      <div className="bg-slate-900 text-slate-300 py-2.5 px-4 text-xs border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-extrabold text-white">Campus Digital Network</span>
            <span>· Centralized College Lost & Found Portal</span>
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            <span className="text-amber-400 font-semibold flex items-center gap-1">
              <School className="w-3.5 h-3.5" /> Campus Project Edition
            </span>
            <span>•</span>
            <span className="text-emerald-400 font-medium">Interactive Demo Mode Active</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-950 via-slate-950 to-indigo-950 text-white pt-20 pb-28">
        <div className="absolute inset-0 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:24px_24px] opacity-20" />
        <div className="absolute top-10 right-1/4 w-96 h-96 bg-indigo-500/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-1/4 w-96 h-96 bg-purple-500/25 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-indigo-200 text-xs font-bold mb-6 shadow-inner">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Campus Lost & Found Protocol — Fast, Verified & Private</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-4xl mx-auto leading-[1.12]">
            Lost Something on Campus? <br />
            <span className="bg-gradient-to-r from-indigo-300 via-sky-300 to-emerald-300 bg-clip-text text-transparent">
              Reunite in Minutes.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            The official centralized digital lost-and-found repository. Post missing items, report found belongings, verify ownership with encrypted claims, and coordinate safe handovers.
          </p>

          {/* Call to Actions */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/report-lost"
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-sm shadow-xl shadow-rose-950/50 hover:-translate-y-0.5 transition-all"
            >
              <Search className="w-4 h-4" />
              Report Lost Belonging
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/report-found"
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-sm shadow-xl shadow-emerald-950/50 hover:-translate-y-0.5 transition-all"
            >
              <Package className="w-4 h-4" />
              Report Found Item
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/browse-lost"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm backdrop-blur-md border border-white/20 transition-all"
            >
              Browse Catalog
            </Link>
          </div>
        </div>
      </section>

      {/* Campus Live Statistics Bar */}
      <section className="-mt-12 relative z-10 max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-200/90 p-6 grid grid-cols-2 md:grid-cols-4 gap-6 divide-y md:divide-y-0 md:divide-x divide-gray-100">
          <div className="flex items-center gap-4 pt-4 md:pt-0">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 flex-shrink-0 shadow-sm">
              <Search className="w-7 h-7" />
            </div>
            <div>
              <div className="text-3xl font-black text-gray-900">{stats.lost}</div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Lost Reported</div>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-4 md:pt-0 md:pl-6">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0 shadow-sm">
              <Package className="w-7 h-7" />
            </div>
            <div>
              <div className="text-3xl font-black text-gray-900">{stats.found}</div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Found Items</div>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-4 md:pt-0 md:pl-6">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0 shadow-sm">
              <CheckCircle className="w-7 h-7" />
            </div>
            <div>
              <div className="text-3xl font-black text-gray-900">{stats.returned}</div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Returned Safely</div>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-4 md:pt-0 md:pl-6">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 flex-shrink-0 shadow-sm">
              <Award className="w-7 h-7" />
            </div>
            <div>
              <div className="text-3xl font-black text-indigo-600">98.4%</div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Recovery Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Interactive Showcase */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-indigo-600 mb-2">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                Live Campus Board · Click Any Photo to Enlarge & Claim
              </div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">Recent Campus Belongings</h2>
              <p className="text-sm text-gray-500 mt-1">
                Explore items currently lost or waiting to be claimed across campus
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  resetToDemoItems()
                  reloadData()
                }}
                className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-indigo-600 bg-white border border-gray-200 px-3 py-1.5 rounded-full shadow-sm hover:border-indigo-300 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset Sample Items
              </button>
            </div>
          </div>

          {/* Quick Zone Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {campusZones.map((zone) => (
              <button
                key={zone.id}
                onClick={() => setSelectedZone(zone.id)}
                className={cn(
                  'px-4 py-2 rounded-full text-xs font-extrabold whitespace-nowrap transition-all shadow-sm',
                  selectedZone === zone.id
                    ? 'bg-indigo-600 text-white shadow-indigo-600/30'
                    : 'bg-white border border-gray-200 text-gray-700 hover:border-indigo-300'
                )}
              >
                {zone.label}
              </button>
            ))}
          </div>

          {/* Quick Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={cn(
                'px-3 py-1.5 rounded-xl text-xs font-bold transition-all',
                selectedCategory === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
              )}
            >
              All Categories
            </button>
            {CATEGORIES.slice(0, 6).map((c) => (
              <button
                key={c.value}
                onClick={() => setSelectedCategory(c.value)}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all',
                  selectedCategory === c.value
                    ? 'bg-slate-900 text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                )}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Item Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.slice(0, 9).map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onImageClick={(clicked) => setLightboxItem(clicked)}
              onClaimClick={(clicked) => setClaimItem(clicked)}
            />
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/browse-lost"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-white border border-gray-300 hover:border-indigo-500 text-gray-900 hover:text-indigo-600 font-extrabold text-sm shadow-sm transition-all"
          >
            Explore Complete Campus Catalog ({allItems.length} Items)
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* How It Works Protocol */}
      <section className="py-20 bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-black uppercase tracking-wider text-indigo-600">Secure Protocol</span>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight mt-1">
              How the Handover Workflow Works
            </h2>
            <p className="text-xs text-gray-500 mt-2">
              Designed to eliminate false claims while protecting student privacy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <HowItWorksStep
              step={1}
              icon={Search}
              title="Report with Details"
              desc="Student logs item with location, date, and identifying photo. Sensitive details can be marked private."
              gradient="from-rose-500 to-red-600"
            />
            <HowItWorksStep
              step={2}
              icon={Filter}
              title="Campus Search & Match"
              desc="Browse category, date, and building filters with debounced Supabase database queries."
              gradient="from-indigo-500 to-purple-600"
            />
            <HowItWorksStep
              step={3}
              icon={Shield}
              title="Encrypted Ownership Claim"
              desc="The owner submits unique identifying evidence (wallpaper, marks, receipt) visible ONLY to finder."
              gradient="from-amber-500 to-orange-600"
            />
            <HowItWorksStep
              step={4}
              icon={HeartHandshake}
              title="Verified Handover"
              desc="Finder approves claim, coordinates meet in campus admin/canteen, and marks item returned."
              gradient="from-emerald-500 to-teal-600"
            />
          </div>
        </div>
      </section>

      {/* 'Good Samaritan' Campus Honor Roll */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 rounded-3xl p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-black mb-4">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Campus Good Samaritan Recognition</span>
            </div>
            <h2 className="text-3xl font-black tracking-tight text-white">
              Fostering Honesty & Trust in Our College Community
            </h2>
            <p className="text-slate-300 text-sm mt-3 leading-relaxed">
              Every found item returned earns recognition on the campus leaderboard. Over 85% of items lost on campus are returned within 48 hours thanks to conscientious classmates.
            </p>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10">
                <div className="text-2xl font-black text-amber-400">#1 CSE Dept</div>
                <div className="text-xs text-slate-300 mt-1">Most Items Handed Over</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10">
                <div className="text-2xl font-black text-emerald-400">&lt; 24 Hours</div>
                <div className="text-xs text-slate-300 mt-1">Average Claim Resolution</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10">
                <div className="text-2xl font-black text-sky-400">100% Free</div>
                <div className="text-xs text-slate-300 mt-1">Community Built Platform</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Image Lightbox Modal */}
      <ImageLightbox
        item={lightboxItem}
        isOpen={!!lightboxItem}
        onClose={() => setLightboxItem(null)}
        onClaimClick={(clicked) => {
          setLightboxItem(null)
          setClaimItem(clicked)
        }}
      />

      {/* Claim Questionnaire Modal */}
      <ClaimModal
        item={claimItem}
        isOpen={!!claimItem}
        onClose={() => setClaimItem(null)}
        onSuccess={handleClaimSuccess}
      />
    </div>
  )
}
