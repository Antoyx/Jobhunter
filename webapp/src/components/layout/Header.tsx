'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Briefcase, Globe } from 'lucide-react'

export function Header() {
  const pathname = usePathname()

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800">
      <div className="flex items-center h-14 px-4 gap-6">
        <div className="flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-blue-400" />
          <span className="font-semibold text-sm">Anto's Job Tracker</span>
        </div>
        <nav className="flex gap-1">
          <NavLink href="/jobs" active={pathname.startsWith('/jobs')} icon={<Briefcase className="w-4 h-4" />}>
            Jobs
          </NavLink>
          <NavLink href="/platforms" active={pathname.startsWith('/platforms')} icon={<Globe className="w-4 h-4" />}>
            Platforms
          </NavLink>
        </nav>
      </div>
    </header>
  )
}

function NavLink({
  href,
  active,
  icon,
  children,
}: {
  href: string
  active: boolean
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-1.5 px-3 py-1.5 rounded text-sm transition-colors',
        active
          ? 'bg-slate-700 text-white'
          : 'text-slate-400 hover:text-white hover:bg-slate-800'
      )}
    >
      {icon}
      {children}
    </Link>
  )
}
