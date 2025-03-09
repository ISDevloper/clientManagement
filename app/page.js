import { Suspense } from 'react'
import HomeContent from './HomeContent'
import Loading from '@/components/Loading'

export default function Home() {
  return (
    <Suspense fallback={<Loading />}>
      <HomeContent />
    </Suspense>
  )
} 