import { LayoutDashboard, BookOpen, BarChart2, Users, Settings } from 'lucide-react'

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
    name: 'Rule Builder',
    icon: Settings,
    href: '/rule-builder'
  },
  {
    name: 'Community',
    icon: Users,
    href: '/community'
  }
]
