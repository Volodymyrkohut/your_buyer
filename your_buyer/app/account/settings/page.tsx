"use client"

import { AccountLayout } from "@/app/components/account/AccountLayout"

export default function SettingsPage() {
  return (
    <AccountLayout>
      <div className="rounded-lg border border-[#A4A1AA] bg-white p-6">
        <h2 className="mb-4 text-2xl font-bold text-primary-100">
          Settings
        </h2>
        <p className="text-grey-600">Settings content will be here</p>
      </div>
    </AccountLayout>
  )
}
