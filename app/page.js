'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Search, Package, Shield, ArrowRight, CheckCircle,
  MapPin, Calendar, Tag, Users, TrendingUp, Star
} from 'lucide-react'
import { formatTimeAgo, getCategoryLabel } from '@/lib/utils'
import { cn } from '@/lib/utils'

function HowItWorksStep({ step, icon: Icon, title, desc, color }) {
  return (
    <div className="text-center">
      <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
        <Icon className="w-7 h-7 text-white" />
      </div>
      <div className="text-xs font-bold text-gray-400 tracking-widest mb-1">STEP {step}</div>
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
    </div>
  )
}

export default function HomePage() {
  const supabase = createClient()
  const [recentItems, setRecentItems] = useState([])
  const [stats, setStats] = useState({ lost: 0, found: 0, returned: 0 })

  useEffect(() => {
    async function fetch() {
      const [lostRes, foundRes, returnedRes, recentRes] = await Promise.all([
        supabase.from('items').select('id', { count: 'exact', head: true }).eq('item_type', 'lost'),
        supabase.from('items').select('id', { count: 'exact', head: true }).eq('item_type', 'found'),
        supabase.from('items').select('id', { count: 'exact', head: true }).eq('status', 'returned'),
        supabase.from('items').select('id, title, item_type, category, location, created_at, image_url, status').order('created_at', { ascending: false }).limit(6),
      ])
      setStats({ lost: lostRes.count || 0, found: foundRes.count || 0, returned: returnedRes.count || 0 })
      setRecentItems(recentRes.data || [])
    }
    fetch()
  }, [])

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-300 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-4 py-1.5 text-sm font-medium mb-8">
            <Star className="w-4 h-4 text-yellow-300" />
            Trusted by students across campus
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Lost Something on Campus?<br />
            <span className="text-indigo-200">We'll Help You Find It.</span>
          </h1>
          <p className="text-indigo-200 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            CampusFinder is the centralized lost & found platform for our college community. 
            Report, discover, and recover your belongings — effortlessly.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/report-lost" className="flex items-center gap-2 bg-white text-indigo-700 font-semibold px-6 py-3.5 rounded-xl hover:bg-indigo-50 transition-all shadow-lg shadow-indigo-900/30 group">
              <Search className="w-5 h-5" />
              Report Lost Item
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/report-found" className="flex items-center gap-2 bg-indigo-500/50 backdrop-blur-sm border border-white/30 text-white font-semibold px-6 py-3.5 rounded-xl hover:bg-indigo-500/70 transition-all group">
              <Package className="w-5 h-5" />
              Report Found Item
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-3 gap-6 text-center">
            {[
              { label: 'Items Reported Lost', value: stats.lost, color: 'text-red-600' },
              { label: 'Items Found', value: stats.found, color: 'text-emerald-600' },
              { label: 'Successfully Returned', value: stats.returned, color: 'text-blue-600' },
            ].map(({ label, value, color }) => (
              <div key={label}>
                <div className={`text-3xl md:text-4xl font-bold ${color} mb-1`}>{value}</div>
                <div className="text-sm text-gray-500">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">How CampusFinder Works</h2>
            <p className="text-gray-500 max-w-xl mx-auto">A simple, transparent process to get your belongings back.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <HowItWorksStep step={1} icon={Search} title="Report It" desc="Submit a detailed report for your lost item or the item you found on campus." color="bg-red-500" />
            <HowItWorksStep step={2} icon={TrendingUp} title="Discover" desc="Browse reports and search by category, location, or description to find matches." color="bg-indigo-500" />
            <HowItWorksStep step={3} icon={Shield} title="Verify Claim" desc="Submit a recovery claim with proof. The finder reviews and verifies your identity." color="bg-purple-500" />
            <HowItWorksStep step={4} icon={CheckCircle} title="Reunite" desc="Coordinate the handover and mark the item as successfully returned." color="bg-emerald-500" />
          </div>
        </div>
      </section>

      {/* Recent Items */}
      {recentItems.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-1">Recently Reported</h2>
                <p className="text-gray-500">Latest items added to the platform</p>
              </div>
              <Link href="/browse-lost" className="text-indigo-600 hover:text-indigo-700 font-medium text-sm flex items-center gap-1">
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {recentItems.map((item) => (
                <Link key={item.id} href={`/items/${item.id}`} className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md hover:border-indigo-200 transition-all">
                  <div className="relative h-40 bg-gray-100">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-10 h-10 text-gray-300" />
                      </div>
                    )}
                    <span className={cn('absolute top-2 left-2 text-xs font-semibold px-2 py-0.5 rounded-full', item.item_type === 'lost' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700')}>
                      {item.item_type === 'lost' ? 'Lost' : 'Found'}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors mb-2">{item.title}</h3>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Tag className="w-3 h-3" />{getCategoryLabel(item.category)}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{item.location}</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatTimeAgo(item.created_at)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-indigo-600 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to get started?</h2>
          <p className="text-indigo-200 mb-8">Join your campus community and help reunite students with their belongings.</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/register" className="bg-white text-indigo-700 font-semibold px-8 py-3.5 rounded-xl hover:bg-indigo-50 transition-colors">
              Create Account
            </Link>
            <Link href="/browse-lost" className="border border-white/40 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-white/10 transition-colors">
              Browse Items
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
