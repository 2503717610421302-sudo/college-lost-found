'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { compressImage } from '@/lib/utils'
import { ALLOWED_IMAGE_TYPES } from '@/lib/constants'
import { User, Camera, Save, GraduationCap, Hash, Mail } from 'lucide-react'
import { Skeleton } from '@/components/ui/Skeleton'

export default function ProfilePage() {
  const { user, profile, refetchProfile } = useAuth()
  const { toast } = useToast()
  const supabase = createClient()
  const fileRef = useRef(null)

  const [form, setForm] = useState({ full_name: '', department: '', register_number: '' })
  const [avatar, setAvatar] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [profileLoading, setProfileLoading] = useState(true)

  useEffect(() => {
    if (profile) {
      setForm({ full_name: profile.full_name || '', department: profile.department || '', register_number: profile.register_number || '' })
      setAvatarPreview(profile.avatar_url)
      setProfileLoading(false)
    }
  }, [profile])

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast({ type: 'error', title: 'Invalid file type' })
      return
    }
    const compressed = await compressImage(file, 0.5)
    setAvatar(compressed)
    setAvatarPreview(URL.createObjectURL(compressed))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.full_name.trim()) { toast({ type: 'error', title: 'Name is required' }); return }
    setLoading(true)
    try {
      let avatar_url = profile?.avatar_url || null
      if (avatar) {
        const path = `avatars/${user.id}/avatar.jpg`
        await supabase.storage.from('item-images').upload(path, avatar, { upsert: true, contentType: 'image/jpeg' })
        const { data } = supabase.storage.from('item-images').getPublicUrl(path)
        avatar_url = data.publicUrl + `?t=${Date.now()}`
      }
      const { error } = await supabase.from('profiles').update({
        full_name: form.full_name.trim(),
        department: form.department.trim(),
        register_number: form.register_number.trim(),
        avatar_url,
      }).eq('id', user.id)
      if (error) throw error
      await refetchProfile()
      toast({ type: 'success', title: 'Profile updated!', message: 'Your changes have been saved.' })
    } catch (err) {
      toast({ type: 'error', title: 'Error', message: err.message })
    } finally {
      setLoading(false)
    }
  }

  if (profileLoading) return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
      <Skeleton className="h-32 rounded-2xl" />
      <Skeleton className="h-64 rounded-2xl" />
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-500 text-sm">Manage your account information</p>
      </div>

      {/* Avatar card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-5 flex items-center gap-5">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-indigo-100 overflow-hidden border-2 border-indigo-200">
            {avatarPreview ? (
              <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="w-8 h-8 text-indigo-500" />
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="absolute -bottom-1 -right-1 w-7 h-7 bg-indigo-600 text-white rounded-full flex items-center justify-center hover:bg-indigo-700 shadow"
          >
            <Camera className="w-3.5 h-3.5" />
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
        </div>
        <div>
          <p className="font-semibold text-gray-900 text-lg">{profile?.full_name}</p>
          <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5"><Mail className="w-3.5 h-3.5" />{user?.email}</p>
          <p className="text-xs text-gray-400 mt-1 capitalize">{profile?.role || 'student'}</p>
        </div>
      </div>

      {/* Edit form */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-5">Edit Information</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="Your full name"
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          />
          <Input
            label="Department"
            placeholder="e.g., Computer Science"
            value={form.department}
            onChange={(e) => setForm({ ...form, department: e.target.value })}
          />
          <Input
            label="Register Number"
            placeholder="e.g., 22CS001"
            value={form.register_number}
            onChange={(e) => setForm({ ...form, register_number: e.target.value })}
          />
          <div className="pt-2">
            <Button type="submit" loading={loading} size="lg">
              <Save className="w-4 h-4" /> Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
