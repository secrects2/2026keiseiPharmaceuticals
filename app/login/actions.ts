'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()
  
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  // 取得用戶角色
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('email', email)
    .single()

  revalidatePath('/', 'layout')
  
  // 根據角色導向不同頁面
  if (userData?.role === 'admin') {
    redirect('/admin')
  } else if (userData?.role === 'teacher') {
    redirect('/teacher')
  } else if (userData?.role === 'store') {
    redirect('/store')
  } else {
    redirect('/member')
  }
}
