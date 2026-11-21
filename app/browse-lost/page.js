import ItemGrid from '@/components/items/ItemGrid'
import { Search } from 'lucide-react'

export const metadata = {
  title: 'Browse Lost Items | CampusFinder',
  description: 'Find lost items reported across campus',
}

export default function BrowseLostPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
          <Search className="w-5 h-5 text-red-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lost Items</h1>
          <p className="text-gray-500 text-sm">Browse all items reported as lost on campus</p>
        </div>
      </div>
      <ItemGrid itemType="lost" />
    </div>
  )
}
