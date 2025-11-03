'use server';

import { cookies } from 'next/headers';

const PROTOTYPE_PASSWORD = process.env.PROTOTYPE_PASSWORD || 'greenheart2024';

export async function authenticate(password: string): Promise<{ success: boolean; error?: string }> {
  if (password === PROTOTYPE_PASSWORD) {
    const cookieStore = await cookies();
    cookieStore.set('prototype-auth', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    return { success: true };
  }
  return { success: false, error: 'Invalid password' };
}

export async function checkAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get('prototype-auth')?.value === 'authenticated';
}

