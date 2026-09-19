export function downloadTextFile(filename: string, content: string, mimeType = 'text/markdown'): void {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9_\-\.]+/gi, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function exportMarkdownFile(title: string, markdownContent: string): void {
  let cleanTitle = sanitizeFilename(title) || 'prd-document';
  if (cleanTitle.toLowerCase().endsWith('.md')) {
    cleanTitle = cleanTitle.slice(0, -3);
  }
  downloadTextFile(`${cleanTitle}.md`, markdownContent, 'text/markdown');
}

export function exportJsonFile(filename: string, data: any): void {
  let cleanName = sanitizeFilename(filename) || 'export';
  if (cleanName.toLowerCase().endsWith('.json')) {
    cleanName = cleanName.slice(0, -5);
  }
  const jsonStr = JSON.stringify(data, null, 2);
  downloadTextFile(`${cleanName}.json`, jsonStr, 'application/json');
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    // Fallback
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textArea);
    return success;
  } catch (err) {
    console.error('Failed to copy to clipboard', err);
    return false;
  }
}
