export const CATEGORIES = [
  { value: 'electronics', label: 'Electronics', color: 'from-blue-500 to-indigo-600' },
  { value: 'id_cards', label: 'ID Cards & Hall Tickets', color: 'from-amber-500 to-orange-600' },
  { value: 'wallets', label: 'Wallets & Purses', color: 'from-emerald-500 to-teal-600' },
  { value: 'bags', label: 'Bags & Backpacks', color: 'from-purple-500 to-pink-600' },
  { value: 'books', label: 'Textbooks & Records', color: 'from-cyan-500 to-blue-600' },
  { value: 'stationery', label: 'Calculators & Drafters', color: 'from-yellow-500 to-amber-600' },
  { value: 'accessories', label: 'Smartwatches & Earbuds', color: 'from-rose-500 to-red-600' },
  { value: 'clothing', label: 'Lab Coats & Jackets', color: 'from-indigo-500 to-sky-600' },
  { value: 'keys', label: 'Vehicle & Locker Keys', color: 'from-slate-600 to-gray-800' },
  { value: 'others', label: 'Others', color: 'from-gray-500 to-slate-700' },
]

export const URGENCY_LEVELS = [
  { value: 'normal', label: 'Normal', badge: 'bg-gray-100 text-gray-700' },
  { value: 'high', label: 'High Priority', badge: 'bg-amber-100 text-amber-800 border-amber-300' },
  { value: 'critical', label: 'Exam / Critical', badge: 'bg-red-100 text-red-800 border-red-300 animate-pulse' },
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
  'Main Library - 1st Floor',
  'Main Library - Digital Section',
  'Block A - CSE / IT Labs',
  'Block B - ECE / EEE Classrooms',
  'Block C - Mechanical Workshop',
  'Central Computer Center',
  'College Cafeteria & Food Court',
  'Main Sports Ground & Pavilion',
  'Two-Wheeler Parking Bay',
  'Administrative Block / Office',
  'Central Auditorium',
  'Indoor Gymnasium',
  'Boys Hostel Block A & B',
  'Girls Hostel Block C & D',
  'College Bus Bay (Buses 1-20)',
  'Other Campus Location',
]

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

// Demo preset items for presentation & project viva evaluations
export const DEMO_PRESET_ITEMS = [
  {
    id: 'demo-1',
    title: 'Casio fx-991EX Scientific Calculator',
    description: 'Black calculator with name sticker partially visible on the back cover. Left on desk 14.',
    category: 'stationery',
    item_type: 'found',
    location: 'Block A - CSE / IT Labs',
    event_date: '2026-11-20',
    status: 'active',
    urgency: 'high',
    reward: 'Gratitude & Coffee',
    image_url: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'demo-2',
    title: 'College ID Card & Semester Exam Hall Ticket',
    description: 'B.Tech Computer Science 3rd Year ID card in a blue lanyard. Urgent because exams start Monday!',
    category: 'id_cards',
    item_type: 'lost',
    location: 'Main Library - 1st Floor',
    event_date: '2026-11-21',
    status: 'active',
    urgency: 'critical',
    reward: '₹200 Reward',
    image_url: 'https://images.unsplash.com/photo-1589330694653-dad6ef49ca60?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'demo-3',
    title: 'boAt Airdopes 141 True Wireless Case',
    description: 'Matte black charging case found near the counter during lunch break.',
    category: 'accessories',
    item_type: 'found',
    location: 'College Cafeteria & Food Court',
    event_date: '2026-11-19',
    status: 'claimed',
    urgency: 'normal',
    reward: null,
    image_url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'demo-4',
    title: 'Royal Enfield Key with Marvel Keychain',
    description: 'Bike key with a miniature Thor hammer keychain dropped near the gate.',
    category: 'keys',
    item_type: 'lost',
    location: 'Two-Wheeler Parking Bay',
    event_date: '2026-11-21',
    status: 'active',
    urgency: 'high',
    reward: '₹500 Reward',
    image_url: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'demo-5',
    title: 'Engineering Graphics Mini-Drafter in Blue Bag',
    description: 'Omega brand mini drafter in black zippered cover. Essential for 1st-year drawing practicals.',
    category: 'stationery',
    item_type: 'found',
    location: 'Block C - Mechanical Workshop',
    event_date: '2026-11-18',
    status: 'returned',
    urgency: 'normal',
    reward: null,
    image_url: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'demo-6',
    title: 'Data Structures & Algorithms in Java (Core Textbook)',
    description: 'Hardcover book with colored sticky notes on chapter 5 (Trees & Graphs).',
    category: 'books',
    item_type: 'lost',
    location: 'Main Library - Digital Section',
    event_date: '2026-11-21',
    status: 'active',
    urgency: 'normal',
    reward: 'Treat at Canteen',
    image_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
  },
]
