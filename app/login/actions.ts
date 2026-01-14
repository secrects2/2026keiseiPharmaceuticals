'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(prevState: any, formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  console.log('Attempting login for:', email)

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error('Supabase auth error:', error)
    return { error: error.message }
  }

  if (!data.user) {
    console.error('No user returned from Supabase')
    return { error: '登入失敗：無法取得用戶資訊' }
  }

  console.log('Login successful for user:', data.user.email)

  revalidatePath('/', 'layout')
  redirect('/admin')
}
