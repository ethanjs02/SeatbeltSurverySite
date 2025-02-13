// src/app/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push('/login'); // Redirect to the login page
  }, [router]);

  return null; // No content since it's redirecting
}
