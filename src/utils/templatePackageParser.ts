import JSZip from 'jszip';

export interface ExtractedTemplatePackage {
  name: string;
  slug: string;
  tagline?: string;
  htmlContent: string;
  cssContent: string;
  jsContent: string;
  previewImageUrl: string;
  extractedFilesCount: number;
  fileList: string[];
  totalSize: number;
}

/**
 * 👑 Extract and bundle template from a .ZIP archive
 */
export async function extractTemplateFromZip(zipFile: File): Promise<ExtractedTemplatePackage> {
  const zip = await JSZip.loadAsync(zipFile);
  const fileEntries = Object.keys(zip.files).filter(path => !zip.files[path].dir);

  if (fileEntries.length === 0) {
    throw new Error('The uploaded ZIP archive is empty.');
  }

  // 1. Locate index.html
  const htmlPath = fileEntries.find(p => p.toLowerCase().endsWith('index.html')) || 
                 fileEntries.find(p => p.toLowerCase().endsWith('.html'));

  if (!htmlPath) {
    throw new Error('No index.html file found in the ZIP archive. Please ensure your ZIP contains an index.html file.');
  }

  let htmlContent = await zip.files[htmlPath].async('string');

  // 2. Locate CSS files
  const cssPaths = fileEntries.filter(p => p.toLowerCase().endsWith('.css'));
  let cssContent = '';
  for (const cp of cssPaths) {
    const text = await zip.files[cp].async('string');
    cssContent += `\n/* ${cp} */\n` + text;
  }

  // 3. Locate JS files
  const jsPaths = fileEntries.filter(p => p.toLowerCase().endsWith('.js'));
  let jsContent = '';
  for (const jp of jsPaths) {
    const text = await zip.files[jp].async('string');
    jsContent += `\n// ${jp}\n` + text;
  }

  // 4. Locate preview image
  let previewImageUrl = '';
  const imageExtensions = ['.webp', '.jpg', '.jpeg', '.png', '.svg'];
  const previewPath = fileEntries.find(p => {
    const lower = p.toLowerCase();
    return (lower.includes('preview') || lower.includes('thumb') || lower.includes('cover')) && 
           imageExtensions.some(ext => lower.endsWith(ext));
  }) || fileEntries.find(p => imageExtensions.some(ext => p.toLowerCase().endsWith(ext)));

  if (previewPath) {
    const ext = previewPath.split('.').pop()?.toLowerCase();
    const mime = ext === 'png' ? 'image/png' : ext === 'svg' ? 'image/svg+xml' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
    const base64 = await zip.files[previewPath].async('base64');
    previewImageUrl = `data:${mime};base64,${base64}`;
  }

  // 5. Inline small images and assets (<= 2MB)
  for (const p of fileEntries) {
    const ext = p.split('.').pop()?.toLowerCase();
    if (ext && ['png', 'jpg', 'jpeg', 'webp', 'svg', 'gif'].includes(ext)) {
      const baseName = p.split('/').pop() || p;
      const mime = ext === 'png' ? 'image/png' : ext === 'svg' ? 'image/svg+xml' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
      const b64 = await zip.files[p].async('base64');
      const dataUri = `data:${mime};base64,${b64}`;
      htmlContent = htmlContent.split(p).join(dataUri);
      if (baseName !== p) {
        htmlContent = htmlContent.split(baseName).join(dataUri);
      }
      if (cssContent) {
        cssContent = cssContent.split(p).join(dataUri);
        if (baseName !== p) {
          cssContent = cssContent.split(baseName).join(dataUri);
        }
      }
    }
  }

  // 6. Ensure CSS and JS are inlined into HTML if separate
  if (cssContent && !htmlContent.includes(cssContent.trim().slice(0, 40))) {
    if (htmlContent.includes('</head>')) {
      htmlContent = htmlContent.replace('</head>', `<style>\n${cssContent}\n</style>\n</head>`);
    } else {
      htmlContent = `<style>\n${cssContent}\n</style>\n` + htmlContent;
    }
  }

  if (jsContent && !htmlContent.includes(jsContent.trim().slice(0, 40))) {
    if (htmlContent.includes('</body>')) {
      htmlContent = htmlContent.replace('</body>', `<script>\n${jsContent}\n</script>\n</body>`);
    } else {
      htmlContent = htmlContent + `\n<script>\n${jsContent}\n</script>`;
    }
  }

  // 7. Derive name & slug
  const titleMatch = htmlContent.match(/<title>([^<]+)<\/title>/i);
  const baseFileName = zipFile.name.replace(/\.[^/.]+$/, '');
  const cleanName = titleMatch ? titleMatch[1].trim() : baseFileName.replace(/[-_]/g, ' ').toUpperCase();
  const slug = baseFileName.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

  return {
    name: cleanName || 'ROYAL LUXURY TEMPLATE',
    slug: slug || 'custom-template',
    tagline: `Exclusive luxury wedding invitation package extracted from ${zipFile.name}.`,
    htmlContent,
    cssContent,
    jsContent,
    previewImageUrl: previewImageUrl || '/templates/royal-gateway/assets/gate/peacock.webp',
    extractedFilesCount: fileEntries.length,
    fileList: fileEntries,
    totalSize: zipFile.size
  };
}

/**
 * 📁 Extract and bundle template from a list of files or an entire folder
 */
export async function extractTemplateFromFiles(files: FileList | File[]): Promise<ExtractedTemplatePackage> {
  const fileArray = Array.from(files);
  if (fileArray.length === 0) {
    throw new Error('No files selected.');
  }

  // Check if single .zip file was passed through file input
  if (fileArray.length === 1 && fileArray[0].name.toLowerCase().endsWith('.zip')) {
    return extractTemplateFromZip(fileArray[0]);
  }

  // Locate index.html
  const htmlFile = fileArray.find(f => f.name.toLowerCase() === 'index.html' || f.name.toLowerCase().endsWith('.html'));
  if (!htmlFile) {
    throw new Error('Please select an index.html file or a folder containing index.html.');
  }

  let htmlContent = await htmlFile.text();
  let cssContent = '';
  let jsContent = '';
  let previewImageUrl = '';

  const cssFiles = fileArray.filter(f => f.name.toLowerCase().endsWith('.css'));
  for (const cf of cssFiles) {
    const text = await cf.text();
    cssContent += `\n/* ${cf.name} */\n` + text;
  }

  const jsFiles = fileArray.filter(f => f.name.toLowerCase().endsWith('.js'));
  for (const jf of jsFiles) {
    const text = await jf.text();
    jsContent += `\n// ${jf.name}\n` + text;
  }

  // Find preview image
  const imageExtensions = ['.webp', '.jpg', '.jpeg', '.png', '.svg'];
  const previewFile = fileArray.find(f => {
    const lower = f.name.toLowerCase();
    return (lower.includes('preview') || lower.includes('thumb') || lower.includes('cover')) &&
           imageExtensions.some(ext => lower.endsWith(ext));
  }) || fileArray.find(f => imageExtensions.some(ext => f.name.toLowerCase().endsWith(ext)));

  if (previewFile) {
    const buffer = await previewFile.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);
    const ext = previewFile.name.split('.').pop()?.toLowerCase();
    const mime = ext === 'png' ? 'image/png' : ext === 'svg' ? 'image/svg+xml' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
    previewImageUrl = `data:${mime};base64,${base64}`;
  }

  // Inline assets
  for (const f of fileArray) {
    const ext = f.name.split('.').pop()?.toLowerCase();
    if (ext && ['png', 'jpg', 'jpeg', 'webp', 'svg', 'gif'].includes(ext)) {
      const buffer = await f.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const b64 = btoa(binary);
      const mime = ext === 'png' ? 'image/png' : ext === 'svg' ? 'image/svg+xml' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
      const dataUri = `data:${mime};base64,${b64}`;
      htmlContent = htmlContent.split(f.name).join(dataUri);
      if (cssContent) {
        cssContent = cssContent.split(f.name).join(dataUri);
      }
    }
  }

  // Inline CSS and JS
  if (cssContent && !htmlContent.includes(cssContent.trim().slice(0, 40))) {
    if (htmlContent.includes('</head>')) {
      htmlContent = htmlContent.replace('</head>', `<style>\n${cssContent}\n</style>\n</head>`);
    } else {
      htmlContent = `<style>\n${cssContent}\n</style>\n` + htmlContent;
    }
  }

  if (jsContent && !htmlContent.includes(jsContent.trim().slice(0, 40))) {
    if (htmlContent.includes('</body>')) {
      htmlContent = htmlContent.replace('</body>', `<script>\n${jsContent}\n</script>\n</body>`);
    } else {
      htmlContent = htmlContent + `\n<script>\n${jsContent}\n</script>`;
    }
  }

  const titleMatch = htmlContent.match(/<title>([^<]+)<\/title>/i);
  const baseName = htmlFile.name.replace(/\.[^/.]+$/, '');
  const cleanName = titleMatch ? titleMatch[1].trim() : (baseName === 'index' ? 'CUSTOM ROYAL TEMPLATE' : baseName.replace(/[-_]/g, ' ').toUpperCase());
  const slug = (baseName === 'index' ? 'custom-theme' : baseName).toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

  return {
    name: cleanName,
    slug: slug || 'custom-template',
    tagline: `Exclusive luxury wedding invitation package extracted from uploaded files.`,
    htmlContent,
    cssContent,
    jsContent,
    previewImageUrl: previewImageUrl || '/templates/royal-gateway/assets/gate/peacock.webp',
    extractedFilesCount: fileArray.length,
    fileList: fileArray.map(f => f.name),
    totalSize: fileArray.reduce((acc, f) => acc + f.size, 0)
  };
}
