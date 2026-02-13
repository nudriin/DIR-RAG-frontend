/**
 * Lightweight Markdown renderer for LLM responses.
 * Handles: **bold**, *italic*, headings, bullet/numbered lists, code blocks, inline code.
 * No external dependencies.
 */

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function renderInline(text: string): string {
  let result = escapeHtml(text);
  // Bold: **text**
  result = result.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  // Italic: *text* (only single *, not preceded/followed by space to avoid list markers)
  result = result.replace(/(?<!\*)\*(?!\s)(.+?)(?<!\s)\*(?!\*)/g, '<em>$1</em>');
  // Inline code: `text`
  result = result.replace(/`([^`]+)`/g, '<code>$1</code>');
  return result;
}

function parseMarkdown(text: string): string {
  const lines = text.split('\n');
  const htmlParts: string[] = [];
  let inCodeBlock = false;
  let codeContent: string[] = [];
  let inList = false;
  let listType: 'ul' | 'ol' = 'ul';

  const closeList = () => {
    if (inList) {
      htmlParts.push(`</${listType}>`);
      inList = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code block toggle
    if (line.trimStart().startsWith('```')) {
      if (inCodeBlock) {
        htmlParts.push(`<pre><code>${escapeHtml(codeContent.join('\n'))}</code></pre>`);
        codeContent = [];
        inCodeBlock = false;
      } else {
        closeList();
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeContent.push(line);
      continue;
    }

    const trimmed = line.trimStart();

    // Headings
    const headingMatch = trimmed.match(/^(#{1,4})\s+(.+)$/);
    if (headingMatch) {
      closeList();
      const level = headingMatch[1].length;
      htmlParts.push(`<h${level + 1}>${renderInline(headingMatch[2])}</h${level + 1}>`);
      continue;
    }

    // Bullet list: * item or - item
    const bulletMatch = trimmed.match(/^[-*]\s+(.+)$/);
    if (bulletMatch) {
      if (!inList || listType !== 'ul') {
        closeList();
        htmlParts.push('<ul>');
        inList = true;
        listType = 'ul';
      }
      htmlParts.push(`<li>${renderInline(bulletMatch[1])}</li>`);
      continue;
    }

    // Numbered list: 1. item
    const numberedMatch = trimmed.match(/^\d+[.)]\s+(.+)$/);
    if (numberedMatch) {
      if (!inList || listType !== 'ol') {
        closeList();
        htmlParts.push('<ol>');
        inList = true;
        listType = 'ol';
      }
      htmlParts.push(`<li>${renderInline(numberedMatch[1])}</li>`);
      continue;
    }

    // Empty line
    if (trimmed === '') {
      closeList();
      htmlParts.push('<br/>');
      continue;
    }

    // Normal paragraph
    closeList();
    htmlParts.push(`<p>${renderInline(line)}</p>`);
  }

  closeList();
  return htmlParts.join('');
}

interface MarkdownTextProps {
  content: string;
}

export default function MarkdownText({ content }: MarkdownTextProps) {
  const html = parseMarkdown(content);
  return <div className="markdown-body" dangerouslySetInnerHTML={{ __html: html }} />;
}
