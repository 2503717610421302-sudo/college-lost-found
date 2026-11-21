import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString) {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatTimeAgo(dateString) {
  if (!dateString) return ''
  const now = new Date()
  const date = new Date(dateString)
  const diffMs = now - date
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSecs < 60) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return formatDate(dateString)
}

export function truncate(str, length = 100) {
  if (!str) return ''
  return str.length > length ? str.slice(0, length) + '...' : str
}

export function getCategoryLabel(value) {
  const map = {
    electronics: 'Electronics',
    id_cards: 'ID Cards',
    wallets: 'Wallets',
    bags: 'Bags',
    books: 'Books',
    stationery: 'Stationery',
    accessories: 'Accessories',
    clothing: 'Clothing',
    keys: 'Keys',
    others: 'Others',
  }
  return map[value] || value
}

export function getStatusColor(status) {
  const map = {
    active: 'bg-emerald-100 text-emerald-700',
    claimed: 'bg-amber-100 text-amber-700',
    returned: 'bg-blue-100 text-blue-700',
    closed: 'bg-gray-100 text-gray-600',
    pending: 'bg-amber-100 text-amber-700',
    approved: 'bg-emerald-100 text-emerald-700',
    rejected: 'bg-red-100 text-red-700',
    verification_needed: 'bg-purple-100 text-purple-700',
  }
  return map[status] || 'bg-gray-100 text-gray-600'
}

export function getStatusLabel(status) {
  const map = {
    active: 'Active',
    claimed: 'Claimed',
    returned: 'Returned',
    closed: 'Closed',
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    verification_needed: 'Verification Needed',
  }
  return map[status] || status
}

export async function compressImage(file, maxSizeMB = 1) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (e) => {
      const img = new Image()
      img.src = e.target.result
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let { width, height } = img
        const maxDim = 1200
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = (height / width) * maxDim
            width = maxDim
          } else {
            width = (width / height) * maxDim
            height = maxDim
          }
        }
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)
        canvas.toBlob(
          (blob) => {
            resolve(new File([blob], file.name, { type: 'image/jpeg' }))
          },
          'image/jpeg',
          0.85
        )
      }
    }
  })
}
