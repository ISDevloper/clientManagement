import { Suspense } from 'react'
import SignaturePV from './SignaturePV'
import Loading from '@/components/Loading'

export default function SignaturePVPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Suspense fallback={<Loading />}>
        <SignaturePV />
      </Suspense>
    </div>
  )
} 