import { Suspense } from 'react'
import PrivacyPolicyClient from './PrivacyPolicyClient'

export default function PrivacyPolicyPage() {
    const Getyears = [
        { value: "2025", label: "2025.07.26" },
    ]

    return (
        <Suspense fallback={<div>로딩 중...</div>}>
            <PrivacyPolicyClient Getyears={Getyears} />
        </Suspense>
    )
}
