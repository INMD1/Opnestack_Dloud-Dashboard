import { Suspense } from 'react'
import TermsofUseClient from './TermsofUseClient'

export default function TermsofUsePage() {
  const Getyears = [
    { value: "2025", label: "2025.07.26" },
  ]

  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <TermsofUseClient Getyears={Getyears} />
    </Suspense>
  )
}