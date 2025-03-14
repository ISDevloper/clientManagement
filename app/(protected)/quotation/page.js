import { Suspense } from 'react'
import Loading from '@/components/Loading'
import { QuotationPage } from './Quotation'

export default function SignaturePVPage() {
    return (
        <div className="container mx-auto py-8 px-4">
            <Suspense fallback={<Loading />}>
                <QuotationPage />
            </Suspense>
        </div>
    )
} 