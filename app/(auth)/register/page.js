'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/contexts/ToastContext'
import { Search, Eye, EyeOff } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()
  const [form, setForm] = useState({ full_name: '', email: '', department: '', register_number: '', password: '', confirm_password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.full_name.trim()) e.full_name = 'Full name is required'
    if (!form.email) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.department.trim()) e.department = 'Department is required'
    if (!form.register_number.trim()) e.register_number = 'Register number is required'
    if (!form.password) e.password = 'Password is required'
    else if (form.password.length < 8) e.password = 'Password must be at least 8 characters'
    if (form.password !== form.confirm_password) e.confirm_password = 'Passwords do not match'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.full_name,
          department: form.department,
          register_number: form.register_number,
        },
      },
    })
    if (error) {
      toast({ type: 'error', title: 'Registration failed', message: error.message })
      setLoading(false)
      return
    }
    if (data.user && !data.session) {
      toast({ type: 'info', title: 'Verify your email', message: 'Check your inbox for a verification link.' })
      router.push('/login')
    } else {
      toast({ type: 'success', title: 'Account created!', message: 'Welcome to CampusFinder!' })
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold text-gray-900">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Search className="w-5 h-5 text-white" />
            </div>
            CampusFinder
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-6">Create your account</h1>
          <p className="text-gray-500 mt-1">Join the campus lost & found community</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Full Name" placeholder="John Doe" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} error={errors.full_name} />
            <Input label="College Email" type="email" placeholder="yourname@college.edu" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} error={errors.email} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Department" placeholder="CSE" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} error={errors.department} />
              <Input label="Register Number" placeholder="22CS001" value={form.register_number} onChange={(e) => setForm({ ...form, register_number: e.target.value })} error={errors.register_number} />
            </div>
            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Min. 8 characters"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                error={errors.password}
                className="pr-10"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-9 text-gray-400">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <Input label="Confirm Password" type="password" placeholder="••••••••" value={form.confirm_password} onChange={(e) => setForm({ ...form, confirm_password: e.target.value })} error={errors.confirm_password} />
            <Button type="submit" loading={loading} className="w-full mt-2" size="lg">Create Account</Button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
