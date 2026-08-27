type LexicalNode = { type: string; text?: string; children?: LexicalNode[] }
type LexicalRoot = { root: { children: LexicalNode[] } }

function collectText(node: LexicalNode, parts: string[]): void {
  if (typeof node.text === 'string') parts.push(node.text)
  for (const child of node.children || []) collectText(child, parts)
}

export function richTextToPlainText(data: LexicalRoot | null | undefined, maxLength = 160): string {
  if (!data?.root?.children) return ''

  const parts: string[] = []
  for (const node of data.root.children) collectText(node, parts)

  const text = parts.join(' ').replace(/\s+/g, ' ').trim()
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 1).trimEnd() + '…'
}
