"use client"

import {
  Home,
  Settings,
  Search,
  User,
  ShoppingCart,
  Heart,
  Star,
  ArrowRight,
  ArrowLeft,
  Plus,
  Minus,
  Check,
  Info,
  AlertCircle,
  Mail,
  Phone,
  MessageCircle,
  Play,
  Pause,
  Square,
  File,
  Laptop,
  Smartphone,
  MapPin,
  Calendar,
  Clock,
  Lock,
  Share2,
  Link,
  Tag,
  Truck,
  CreditCard,
  Menu,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"

interface IconGroupProps {
  title: string
  icons: { name: string; icon: React.ComponentType<{ className?: string }> }[]
}

const IconGroup = ({ title, icons }: IconGroupProps) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-6 gap-4 md:grid-cols-8 lg:grid-cols-10">
        {icons.map(({ name, icon: Icon }) => (
          <div
            key={name}
            className="flex flex-col items-center gap-2 rounded-md p-2 hover:bg-grey-100"
          >
            <Icon className="h-6 w-6 text-primary-100" />
            <span className="text-xs text-grey-600">{name}</span>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
)

export const IconShowcase = () => {
  const navigationIcons = [
    { name: "Home", icon: Home },
    { name: "Menu", icon: Menu },
    { name: "X", icon: X },
    { name: "ChevronDown", icon: ChevronDown },
    { name: "ChevronUp", icon: ChevronUp },
  ]

  const actionIcons = [
    { name: "Search", icon: Search },
    { name: "Settings", icon: Settings },
    { name: "User", icon: User },
    { name: "ShoppingCart", icon: ShoppingCart },
    { name: "Heart", icon: Heart },
    { name: "Star", icon: Star },
    { name: "ArrowRight", icon: ArrowRight },
    { name: "ArrowLeft", icon: ArrowLeft },
    { name: "Plus", icon: Plus },
    { name: "Minus", icon: Minus },
    { name: "Check", icon: Check },
  ]

  const communicationIcons = [
    { name: "Mail", icon: Mail },
    { name: "Phone", icon: Phone },
    { name: "MessageCircle", icon: MessageCircle },
  ]

  const mediaIcons = [
    { name: "Play", icon: Play },
    { name: "Pause", icon: Pause },
    { name: "Square", icon: Square },
  ]

  const ecommerceIcons = [
    { name: "Tag", icon: Tag },
    { name: "Truck", icon: Truck },
    { name: "CreditCard", icon: CreditCard },
  ]

  const utilityIcons = [
    { name: "File", icon: File },
    { name: "Laptop", icon: Laptop },
    { name: "Smartphone", icon: Smartphone },
    { name: "MapPin", icon: MapPin },
    { name: "Calendar", icon: Calendar },
    { name: "Clock", icon: Clock },
    { name: "Lock", icon: Lock },
    { name: "Share2", icon: Share2 },
    { name: "Link", icon: Link },
    { name: "Info", icon: Info },
    { name: "AlertCircle", icon: AlertCircle },
  ]

  return (
    <div className="space-y-8">
      <IconGroup title="Navigation Icons" icons={navigationIcons} />
      <IconGroup title="Action Icons" icons={actionIcons} />
      <IconGroup title="Communication Icons" icons={communicationIcons} />
      <IconGroup title="Media Icons" icons={mediaIcons} />
      <IconGroup title="E-commerce Icons" icons={ecommerceIcons} />
      <IconGroup title="Utility Icons" icons={utilityIcons} />
    </div>
  )
}
