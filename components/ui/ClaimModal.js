'use client'

import { useState } from 'react'
import {
  X, Shield, CheckCircle, AlertTriangle, Upload,
  Lock, Camera, Sparkles
} from 'lucide-react'
import { Button } from './Button'
import { Textarea } from './Input'
import { useToast } from '@/contexts/ToastContext'

export default function ClaimModal({ item, isOpen, onClose, onSuccess }) {
  const { toast } = useToast()
  const [proof, setProof] = useState('')
  const [identifyingMark, setIdentifyingMark] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  if (!isOpen || !item) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!proof.trim()) {
      toast({ type: 'error', title: 'Proof required', message: 'Please describe how you identify this item.' })
      return
    }

    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setSubmitted(true)
      toast({
        type: 'success',
        title: 'Claim Request Submitted! 🎉',
        message: 'The finder has received your proof. You can coordinate handover.',
      })

      if (onSuccess) {
        onSuccess({
          ...item,
          status: 'claimed',
          claim_proof: proof,
        })
      }
    }, 700)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="absolute inset-0 cursor-pointer" onClick={onClose} />

      <div className="relative z-10 w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900 to-indigo-800 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-1">
            <Shield className="w-4 h-4 text-emerald-400" />
            Verified Ownership Protocol
          </div>
          <h2 className="text-xl font-black text-white">Claim: {item.title}</h2>
          <p className="text-xs text-indigo-200 mt-1">Found at: {item.location}</p>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Claim Under Review!</h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">
              Your proof has been submitted securely to the finder. Keep your Student ID ready for in-person verification.
            </p>
            <Button
              className="w-full mt-4"
              onClick={() => {
                setSubmitted(false)
                onClose()
              }}
            >
              Done & Return to Catalog
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="flex items-start gap-3 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <span>
                To protect against false claims, specify private details (e.g. wallpaper, inner sticker, lock combo, marks).
              </span>
            </div>

            <Textarea
              label="Describe Private Identifying Characteristics *"
              placeholder="e.g. Color of phone case, stickers, student ID number on corner, specific marks..."
              value={proof}
              onChange={(e) => setProof(e.target.value)}
              rows={3}
              required
            />

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Optional Photo Proof or Receipt</label>
              <div className="border-2 border-dashed border-gray-200 hover:border-indigo-400 rounded-2xl p-4 text-center cursor-pointer transition-colors">
                <Camera className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                <span className="text-xs text-gray-500 font-medium">Click or drop a screenshot / photo proof</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" loading={loading} className="gap-2">
                <Shield className="w-4 h-4" />
                Submit Ownership Claim
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
