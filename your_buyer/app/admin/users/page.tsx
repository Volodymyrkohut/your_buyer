"use client"

import { useState, useEffect } from "react"
import { Input } from "@/app/components/ui/input"
import { Search } from "lucide-react"
import { getAllUsers, type UserResponse } from "@/lib/api"

export default function UsersPage() {
  const [users, setUsers] = useState<UserResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true)
        setError(null)
        const usersData = await getAllUsers()
        setUsers(usersData)
      } catch (err: any) {
        console.error("Failed to load users:", err)
        setError(err?.message || "Failed to load users")
      } finally {
        setLoading(false)
      }
    }
    loadUsers()
  }, [])

  const filteredUsers = users.filter((user) => {
    const searchLower = searchQuery.toLowerCase()
    return (
      user.name.toLowerCase().includes(searchLower) ||
      user.surname?.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.phone?.toLowerCase().includes(searchLower) ||
      String(user.id).includes(searchLower)
    )
  })

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A"
    try {
      return new Date(dateString).toLocaleDateString("uk-UA", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch {
      return dateString
    }
  }

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-primary-100">Users</h2>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-grey-400" />
          <Input
            type="text"
            placeholder="Search users by name, email, phone, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="rounded-lg border border-[#F0F0F0] bg-white p-8 text-center">
          <p className="text-grey-600">Loading users...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Users List */}
      {!loading && !error && (
        <div className="space-y-0">
          {filteredUsers.length === 0 ? (
            <div className="rounded-lg border border-[#F0F0F0] bg-white p-8 text-center">
              <p className="text-grey-600">
                {searchQuery ? "No users found matching your search" : "No users found"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-[#F0F0F0] bg-grey-50">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-primary-100">
                      ID
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-primary-100">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-primary-100">
                      Surname
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-primary-100">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-primary-100">
                      Phone
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-primary-100">
                      Registered
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user, index) => (
                    <tr
                      key={user.id}
                      className={`border-b border-[#F0F0F0] ${
                        index % 2 === 0 ? "bg-white" : "bg-grey-50"
                      } hover:bg-grey-100`}
                    >
                      <td className="px-4 py-3 text-sm text-grey-700">
                        {user.id}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-primary-100">
                        {user.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-grey-700">
                        {user.surname || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-grey-700">
                        {user.email}
                      </td>
                      <td className="px-4 py-3 text-sm text-grey-700">
                        {user.phone || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-grey-700">
                        {formatDate(user.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Users Count */}
      {!loading && !error && (
        <div className="mt-4 text-sm text-grey-600">
          Showing {filteredUsers.length} of {users.length} users
        </div>
      )}
    </div>
  )
}
