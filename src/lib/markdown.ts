import fs from 'fs'
import path from 'path'
import { remark } from 'remark'
import html from 'remark-html'

export async function getMarkdownData(filePath: string): Promise<string> {
  const fullPath = path.join(process.cwd(), filePath)
  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const processedContent = await remark().use(html).process(fileContents)
  return processedContent.toString()
}