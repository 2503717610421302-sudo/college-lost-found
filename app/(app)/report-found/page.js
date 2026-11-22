'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { Button } from '@/components/ui/Button'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { CATEGORIES, LOCATIONS, MAX_IMAGE_SIZE, ALLOWED_IMAGE_TYPES } from '@/lib/constants'
import { compressImage } from '@/lib/utils'
import { addNewItem } from '@/lib/itemStore'
import { X, ImageIcon, Package, Shield, Sparkles } from 'lucide-react'

export default function ReportFoundPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClient()
  const fileRef = useRef(null)

  const [form, setForm] = useState({
    title: '',
    category: '',
    description: '',
    location: '',
    event_date: '',
    additional_details: '',
  })
  const [errors, setErrors] = useState({})
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.title.trim()) e.title = 'Item name is required'
    if (!form.category) e.category = 'Category is required'
    if (!form.description.trim()) e.description = 'Description is required'
    if (!form.location) e.location = 'Location is required'
    if (!form.event_date) e.event_date = 'Date is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleImageChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast({ type: 'error', title: 'Invalid file', message: 'Please upload a JPEG, PNG, WebP or GIF image.' })
      return
    }
    const compressed = await compressImage(file)
    setImage(compressed)
    setImagePreview(URL.createObjectURL(compressed))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)

    const defaultImages = {
      electronics: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80',
      id_cards: 'https://images.unsplash.com/photo-1589330694653-dad6ef49ca60?w=800&auto=format&fit=crop&q=80',
      wallets: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop&q=80',
      bags: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
      books: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80',
      stationery: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=800&auto=format&fit=crop&q=80',
      accessories: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80',
      clothing: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80',
      keys: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800&auto=format&fit=crop&q=80',
      others: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80',
    }

    const itemImageUrl = imagePreview || defaultImages[form.category] || defaultImages.others

    try {
      // 1. Save locally for 100% instant reliability
      addNewItem({
        title: form.title.trim(),
        category: form.category,
        description: form.description.trim(),
        location: form.location,
        event_date: form.event_date,
        additional_details: form.additional_details.trim() || null,
        urgency: 'normal',
        reward: null,
        image_url: itemImageUrl,
        item_type: 'found',
        status: 'active',
        reporter_name: user?.user_metadata?.full_name || 'Campus Member',
        reporter_dept: user?.user_metadata?.department || 'College Dept',
      })

      // 2. Also save to Supabase if authenticated
      if (user) {
        try {
          let uploadedUrl = null
          if (image) {
            const ext = image.name.split('.').pop()
            const path = `items/${user.id}/${Date.now()}.${ext}`
            const { error: uploadError } = await supabase.storage.from('item-images').upload(path, image, { contentType: image.type })
            if (!uploadError) {
              const { data: urlData } = supabase.storage.from('item-images').getPublicUrl(path)
              uploadedUrl = urlData.publicUrl
            }
          }
          await supabase.from('items').insert({
            reporter_id: user.id,
            title: form.title.trim(),
            category: form.category,
            description: form.description.trim(),
            location: form.location,
            event_date: form.event_date,
            additional_details: form.additional_details.trim() || null,
            image_url: uploadedUrl || itemImageUrl,
            item_type: 'found',
            status: 'active',
          })
        } catch (subErr) {}
      }

      toast({ type: 'success', title: 'Found Report Published! 🎉', message: 'Thank you! The item is now listed for its owner to claim.' })
      router.push('/browse-found')
    } catch (err) {
      toast({ type: 'error', title: 'Submission failed', message: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
            <Package className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Report Found Item</h1>
            <p className="text-gray-500 text-sm">Help reunite an item with its owner</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input label="Item Name *" placeholder="e.g., Student ID Card, Red Water Bottle" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} error={errors.title} />

          <Select label="Category *" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} error={errors.category}>
            <option value="">Select a category</option>
            {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </Select>

          <Textarea label="Description *" placeholder="Describe the item — what it looks like, any distinctive features" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} error={errors.description} rows={4} />

          <Select label="Location Found *" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} error={errors.location}>
            <option value="">Select location</option>
            {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
          </Select>

          <Input label="Date Found *" type="date" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} error={errors.event_date} max={new Date().toISOString().split('T')[0]} />

          <Textarea label="Additional Notes" placeholder="Where exactly is the item being kept? Any other details..." value={form.additional_details} onChange={(e) => setForm({ ...form, additional_details: e.target.value })} rows={3} />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Item Photo (Recommended)</label>
            {imagePreview ? (
              <div className="relative inline-block w-full">
                <img src={imagePreview} alt="Preview" className="w-full max-h-56 object-cover rounded-xl border border-gray-200" />
                <button
                  type="button"
                  onClick={() => { setImage(null); setImagePreview(null) }}
                  className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow-md"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-emerald-400 hover:bg-emerald-50 transition-colors"
              >
                <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500 font-medium">Click to upload photo</p>
                <p className="text-xs text-gray-400 mt-1">JPEG, PNG, WebP up to 5MB</p>
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
          </div>

          <div className="pt-2">
            <Button type="submit" loading={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500" size="lg">
              <Package className="w-4 h-4" />
              Submit Found Item Report
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
