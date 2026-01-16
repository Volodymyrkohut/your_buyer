"use client"

import { Input } from "@/app/components/ui/input"
import { Textarea } from "@/app/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Search } from "lucide-react"

export const InputVariants = () => {
  return (
    <div className="space-y-8">
      {/* Text Inputs */}
      <Card>
        <CardHeader>
          <CardTitle>Text Inputs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Default Input</label>
            <Input placeholder="Enter text..." />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Disabled Input</label>
            <Input placeholder="Disabled..." disabled />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Input with Value</label>
            <Input defaultValue="Sample text" />
          </div>
        </CardContent>
      </Card>

      {/* Inputs with Icons */}
      <Card>
        <CardHeader>
          <CardTitle>Inputs with Icons</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Search Input</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-grey-400" />
              <Input className="pl-10" placeholder="Search..." />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Select Dropdowns */}
      <Card>
        <CardHeader>
          <CardTitle>Select Dropdowns</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Default Select</label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select an option..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="option1">Option 1</SelectItem>
                <SelectItem value="option2">Option 2</SelectItem>
                <SelectItem value="option3">Option 3</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Select with Value</label>
            <Select defaultValue="option2">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="option1">Option 1</SelectItem>
                <SelectItem value="option2">Option 2</SelectItem>
                <SelectItem value="option3">Option 3</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Disabled Select</label>
            <Select disabled>
              <SelectTrigger>
                <SelectValue placeholder="Disabled..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="option1">Option 1</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Textarea */}
      <Card>
        <CardHeader>
          <CardTitle>Textarea</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Default Textarea</label>
            <Textarea placeholder="Enter your message..." />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Textarea with Value</label>
            <Textarea defaultValue="Sample text content..." />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Disabled Textarea</label>
            <Textarea placeholder="Disabled..." disabled />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
