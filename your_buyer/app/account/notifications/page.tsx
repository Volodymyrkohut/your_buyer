"use client"

import { AccountLayout } from "@/app/components/account/AccountLayout"

export default function NotificationsPage() {
  return (
    <AccountLayout>
      <div className="rounded-lg border border-[#A4A1AA] bg-white p-6">
        <h2 className="mb-4 text-2xl font-bold text-primary-100">
          Notifications
        </h2>
        <p className="text-grey-600">Notifications content will be here</p>
      </div>
    </AccountLayout>
  )
}
