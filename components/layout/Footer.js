import Link from 'next/link'
import { Search, Github, Mail } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 font-bold text-lg text-white mb-3">
              <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                <Search className="w-4 h-4 text-white" />
              </div>
              CampusFinder
            </div>
            <p className="text-sm leading-relaxed text-gray-400 max-w-sm">
              The centralized digital lost & found platform for our college campus. 
              Helping students recover their belongings since day one.
            </p>
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">Platform</h3>
            <ul className="space-y-2 text-sm">
              {[
                ['Browse Lost Items', '/browse-lost'],
                ['Browse Found Items', '/browse-found'],
                ['Report Lost Item', '/report-lost'],
                ['Report Found Item', '/report-found'],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="hover:text-white transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">Account</h3>
            <ul className="space-y-2 text-sm">
              {[
                ['Dashboard', '/dashboard'],
                ['My Reports', '/my-reports'],
                ['My Claims', '/my-claims'],
                ['Profile', '/profile'],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="hover:text-white transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs">© {new Date().getFullYear()} CampusFinder. Built for our college community.</p>
          <div className="flex items-center gap-4">
            <a href="mailto:support@campusfinder.edu" className="text-xs hover:text-white transition-colors flex items-center gap-1">
              <Mail className="w-3 h-3" /> Support
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
