'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/contexts/ToastContext'
import { Search, Eye, EyeOff, Sparkles, UserCheck, ShieldCheck, AlertCircle } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { loginAsDemo } = useAuth()
  const supabase = createClient()
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    department: '',
    register_number: '',
    password: '',
    confirm_password: ''
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [rateLimitNotice, setRateLimitNotice] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.full_name.trim()) e.full_name = 'Full name is required'
    if (!form.email) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.department.trim()) e.department = 'Department is required'
    if (!form.register_number.trim()) e.register_number = 'Register number is required'
    if (!form.password) e.password = 'Password is required'
    else if (form.password.length < 6) e.password = 'Password must be at least 6 characters'
    if (form.password !== form.confirm_password) e.confirm_password = 'Passwords do not match'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    setRateLimitNotice(false)

    try {
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
        const isRateLimit = error.message.toLowerCase().includes('rate limit') ||
                            error.message.toLowerCase().includes('exceeded') ||
                            error.status === 429

        if (isRateLimit) {
          setRateLimitNotice(true)
          toast({
            type: 'warning',
            title: 'Supabase Email Limit Exceeded',
            message: 'Supabase free tier limits confirmation emails to 3/hour. Launching instant direct session for your account!'
          })

          // Save custom student session locally so user is never blocked
          if (typeof window !== 'undefined') {
            const customUser = {
              id: `user-${Date.now()}`,
              email: form.email,
              user_metadata: {
                full_name: form.full_name,
                role: 'student',
                department: form.department,
                register_number: form.register_number,
              }
            }
            const customProfile = {
              id: customUser.id,
              full_name: form.full_name,
              department: form.department,
              register_number: form.register_number,
              phone: '+91 98765 43210',
              role: 'student',
              email: form.email
            }
            localStorage.setItem('campusfinder_demo_auth', JSON.stringify({
              user: customUser,
              profile: customProfile
            }))
            // Refresh window or push to dashboard
            setTimeout(() => {
              window.location.href = '/dashboard'
            }, 1000)
            return
          }
        }

        toast({ type: 'error', title: 'Registration failed', message: error.message })
        setLoading(false)
        return
      }

      if (data?.user && !data.session) {
        toast({
          type: 'info',
          title: 'Account Registered',
          message: 'If email confirmation is enabled in Supabase, verify your inbox, or login now.'
        })
        router.push('/login')
      } else {
        toast({ type: 'success', title: 'Account created!', message: 'Welcome to CampusFinder!' })
        router.push('/dashboard')
      }
    } catch (err) {
      toast({ type: 'error', title: 'Error', message: err?.message || 'Something went wrong' })
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = (role) => {
    loginAsDemo(role)
    toast({
      type: 'success',
      title: `Logged in as ${role === 'admin' ? 'Campus Admin' : 'College Student'}`,
      message: 'Demo session loaded. All features are active!'
    })
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold text-gray-900">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-600/20">
              <Search className="w-5 h-5 text-white" />
            </div>
            CampusFinder
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">Create your account</h1>
          <p className="text-gray-500 text-sm mt-1">Join the campus lost & found community</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          {/* Quick Demo Access for Testing / Evaluation */}
          <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 uppercase tracking-wider mb-2.5">
              <Sparkles className="w-4 h-4 text-amber-500 animate-spin" />
              Instant Demo Access (Skip Registration)
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('student')}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all"
              >
                <UserCheck className="w-3.5 h-3.5" />
                Demo Student
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('admin')}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold shadow-sm transition-all"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Demo Admin
              </button>
            </div>
          </div>

          {rateLimitNotice && (
            <div className="mb-4 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong>Supabase Email Rate Limit Detected:</strong>
                <p className="mt-0.5 text-amber-800">
                  Supabase limits free projects to 3 emails/hr. Disabling "Confirm email" in Supabase settings removes this limit completely. Launching your account locally now...
                </p>
              </div>
            </div>
          )}

          <div className="relative flex py-2 items-center mb-4">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink mx-3 text-xs font-medium text-gray-400">or register new account</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              placeholder="e.g. Mounish S"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              error={errors.full_name}
            />
            <Input
              label="College Email"
              type="email"
              placeholder="yourname@college.edu"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              error={errors.email}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Department"
                placeholder="e.g. CSE / IT"
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                error={errors.department}
              />
              <Input
                label="Register Number"
                placeholder="e.g. 22CS104"
                value={form.register_number}
                onChange={(e) => setForm({ ...form, register_number: e.target.value })}
                error={errors.register_number}
              />
            </div>
            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                error={errors.password}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <Input
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              value={form.confirm_password}
              onChange={(e) => setForm({ ...form, confirm_password: e.target.value })}
              error={errors.confirm_password}
            />
            <Button type="submit" loading={loading} className="w-full mt-2" size="lg">
              Create Account
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
