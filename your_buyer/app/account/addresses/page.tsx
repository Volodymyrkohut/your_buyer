"use client"

import { AccountLayout } from "@/app/components/account/AccountLayout"

export default function AddressesPage() {
  return (
    <AccountLayout>
      <div className="rounded-lg border border-[#A4A1AA] bg-white p-6">
        <h2 className="mb-4 text-2xl font-bold text-primary-100">
          Manage Addresses
        </h2>
        <p className="text-grey-600">Addresses content will be here</p>
      </div>
    </AccountLayout>
  )
}
