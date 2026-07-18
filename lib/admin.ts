// lib/admin.ts
import { createClient } from '@/lib/supabase/server'

export async function isAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return false

  // Check in admin_users table
  const { data: admin } = await supabase
    .from('admin_users')
    .select('id')
    .eq('user_id', user.id)
    .single()

  return !!admin
}

export async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}