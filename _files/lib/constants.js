export const CATEGORIES = [
  { value: 'electronics', label: 'Electronics' },
  { value: 'id_cards', label: 'ID Cards' },
  { value: 'wallets', label: 'Wallets' },
  { value: 'bags', label: 'Bags' },
  { value: 'books', label: 'Books' },
  { value: 'stationery', label: 'Stationery' },
  { value: 'accessories', label: 'Accessories' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'keys', label: 'Keys' },
  { value: 'others', label: 'Others' },
]

export const ITEM_STATUS = {
  ACTIVE: 'active',
  CLAIMED: 'claimed',
  RETURNED: 'returned',
  CLOSED: 'closed',
}

export const CLAIM_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  VERIFICATION: 'verification_needed',
}

export const LOCATIONS = [
  'Main Library',
  'Block A - Classrooms',
  'Block B - Classrooms',
  'Block C - Classrooms',
  'Computer Lab',
  'Science Lab',
  'Canteen',
  'Sports Ground',
  'Parking Area',
  'Admin Block',
  'Auditorium',
  'Common Room',
  'Boys Hostel',
  'Girls Hostel',
  'College Bus',
  'Other',
]

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
