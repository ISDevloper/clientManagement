'use client'

import { Suspense } from 'react'
import Loading from '@/components/Loading'
import Profiles from './Profiles'

export default function ProfilesPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Suspense fallback={<Loading />}>
        <Profiles />
      </Suspense>
    </div>
  )
} 