import { LayoutDashboard, BookOpen, BarChart2, Users } from 'lucide-react'

export const navigationItems = [
  {
    name: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard'
  },
  {
    name: 'Journal',
    icon: BookOpen,
    href: '/journal'
  },
  {
    name: 'Analytics',
    icon: BarChart2,
    href: '/analytics'
  },
  {
    name: 'Community',
    icon: Users,
    href: '/community'
  }
]
