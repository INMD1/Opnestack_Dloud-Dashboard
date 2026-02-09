import { getMarkdownData } from '@/lib/markdown'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const year = searchParams.get('year') ?? '2025'
  const type = searchParams.get('type') ?? 'terms' // 'terms' 또는 'privacy'

  const allowedYears = ['2021', '2025']
  const safeYear = allowedYears.includes(year) ? year : '2025'

  // 타입에 따라 파일 경로 결정
  let markdownPath: string
  if (type === 'privacy') {
    markdownPath = `public/markdown/PrivacyPolicy${safeYear}.md`
  } else {
    markdownPath = `public/markdown/TermsofUse${safeYear}.md`
  }

  const contentHtml = await getMarkdownData(markdownPath)

  return new NextResponse(contentHtml)
}
