// app/admin/users/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AdminNav } from '@/components/admin/AdminNav'
import { User, Shield, Mail, Trash2, Plus, Search } from 'lucide-react'
import Link from 'next/link'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchEmail, setSearchEmail] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAddAdmin = async (email: string) => {
    setIsAdding(true)
    setError('')

    try {
      // First, find the user in auth.users
      const { data: userData, error: searchError } = await supabase
        .from('auth.users')
        .select('id, email')
        .eq('email', email)
        .single()

      if (searchError || !userData) {
        setError('User not found. Make sure they have signed up first.')
        setIsAdding(false)
        return
      }

      // Add to admin_users
      const { error } = await supabase
        .from('admin_users')
        .upsert({
          user_id: userData.id,
          email: userData.email,
          role: 'admin',
        })

      if (error) throw error

      await fetchUsers()
      setSearchEmail('')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsAdding(false)
    }
  }

  const handleRemoveAdmin = async (id: number) => {
    if (!confirm('Remove this admin user?')) return

    try {
      const { error } = await supabase
        .from('admin_users')
        .delete()
        .eq('id', id)

      if (error) throw error
      await fetchUsers()
    } catch (err: any) {
      setError(err.message)
    }
  }

  if (loading) {
    return (
      <>
        <AdminNav />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <AdminNav />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Admin Users</h1>
          <Link
            href="/admin"
            className="text-sm text-gray-600 hover:text-gray-900 transition"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Add Admin Form */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 mb-6">
          <h2 className="text-sm font-medium text-gray-700 mb-3">Add New Admin</h2>
          <div className="flex gap-3">
            <input
              type="email"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              placeholder="Enter admin email..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyDown={(e) => e.key === 'Enter' && handleAddAdmin(searchEmail)}
            />
            <button
              onClick={() => handleAddAdmin(searchEmail)}
              disabled={isAdding || !searchEmail}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {isAdding ? 'Adding...' : 'Add Admin'}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Note: User must have already signed up before adding as admin.
          </p>
        </div>

        {/* Admin List */}
        {users.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Shield className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No admin users found</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Added</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{user.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                        <Shield className="w-3 h-3" />
                        {user.role || 'admin'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleRemoveAdmin(user.id)}
                        className="text-red-600 hover:text-red-800 transition p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}