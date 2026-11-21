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
import { Upload, X, ImageIcon, Search } from 'lucide-react'

export default function ReportLostPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClient()
  const fileRef = useRef(null)

  const [form, setForm] = useState({
    title: '', category: '', description: '', location: '', event_date: '', additional_details: '',
    urgency: 'normal', reward: '',
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
    if (file.size > MAX_IMAGE_SIZE) {
      toast({ type: 'warning', title: 'Large image', message: 'Compressing image...' })
    }
    const compressed = await compressImage(file)
    setImage(compressed)
    setImagePreview(URL.createObjectURL(compressed))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      let image_url = null
      if (image) {
        const ext = image.name.split('.').pop()
        const path = `items/${user.id}/${Date.now()}.${ext}`
        const { error: uploadError } = await supabase.storage.from('item-images').upload(path, image, { contentType: image.type })
        if (uploadError) throw uploadError
        const { data: urlData } = supabase.storage.from('item-images').getPublicUrl(path)
        image_url = urlData.publicUrl
      }
      const { error } = await supabase.from('items').insert({
        reporter_id: user.id,
        title: form.title.trim(),
        category: form.category,
        description: form.description.trim(),
        location: form.location,
        event_date: form.event_date,
        additional_details: form.additional_details.trim() || null,
        urgency: form.urgency || 'normal',
        reward: form.reward.trim() || null,
        image_url,
        item_type: 'lost',
        status: 'active',
      })
      if (error) throw error
      toast({ type: 'success', title: 'Report submitted!', message: 'Your lost item report has been posted.' })
      router.push('/my-reports')
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
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
            <Search className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Report Lost Item</h1>
            <p className="text-gray-500 text-sm">Share details to help others identify your item</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input label="Item Name *" placeholder="e.g., Black iPhone 14, Blue Backpack" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} error={errors.title} />

          <Select label="Category *" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} error={errors.category}>
            <option value="">Select a category</option>
            {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </Select>

          <Textarea label="Description *" placeholder="Describe the item in detail — color, brand, size, marks, etc." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} error={errors.description} rows={4} />

          <Select label="Location Lost *" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} error={errors.location}>
            <option value="">Select location</option>
            {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
          </Select>

          <Input label="Date Lost *" type="date" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} error={errors.event_date} max={new Date().toISOString().split('T')[0]} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select label="Priority / Urgency Level" value={form.urgency} onChange={(e) => setForm({ ...form, urgency: e.target.value })}>
              <option value="normal">Normal (Standard Belonging)</option>
              <option value="high">High Priority (Phone, Keys, Wallet)</option>
              <option value="critical">🚨 Exam / Critical (Hall Ticket, ID Card)</option>
            </Select>

            <Input
              label="Reward / Token of Appreciation (Optional)"
              placeholder="e.g. ₹200 or Coffee at Canteen"
              value={form.reward}
              onChange={(e) => setForm({ ...form, reward: e.target.value })}
            />
          </div>

          <Textarea label="Additional Identifying Details" placeholder="Any unique marks, serial numbers, or other details that only you would know..." value={form.additional_details} onChange={(e) => setForm({ ...form, additional_details: e.target.value })} rows={3} />

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Item Photo (Optional)</label>
            {imagePreview ? (
              <div className="relative inline-block">
                <img src={imagePreview} alt="Preview" className="w-full max-h-56 object-cover rounded-xl border border-gray-200" />
                <button
                  type="button"
                  onClick={() => { setImage(null); setImagePreview(null) }}
                  className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-indigo-400 hover:bg-indigo-50 transition-colors"
              >
                <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Click to upload image</p>
                <p className="text-xs text-gray-400 mt-1">JPEG, PNG, WebP up to 5MB</p>
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
          </div>

          <div className="pt-2">
            <Button type="submit" loading={loading} className="w-full" size="lg">
              <Search className="w-4 h-4" />
              Submit Lost Item Report
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
