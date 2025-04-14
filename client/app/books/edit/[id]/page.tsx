'use client'

import EditBookPage from '@/components/EditBookPage'
import { use } from 'react'

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap the params object using React.use()
  const resolvedParams = use(params)
  
  return <EditBookPage bookId={resolvedParams.id} />
}