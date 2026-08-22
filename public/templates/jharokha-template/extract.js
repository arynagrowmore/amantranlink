const fs = require('fs');
const path = require('path');
const https = require('https');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        let redirectUrl = res.headers.location;
        if (redirectUrl.startsWith('/')) {
          const u = new URL(url);
          redirectUrl = u.origin + redirectUrl;
        }
        return resolve(fetchUrl(redirectUrl));
      }
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve({ buffer: Buffer.concat(chunks), text: Buffer.concat(chunks).toString('utf8'), headers: res.headers }));
    }).on('error', reject);
  });
}

async function main() {
  const targetUrl = 'https://www.jointhejashn.com/demo/jharokha';
  console.log('Fetching:', targetUrl);
  const { text: html } = await fetchUrl(targetUrl);
  
  fs.writeFileSync(path.join(__dirname, 'page.html'), html);
  console.log('Saved page.html, size:', html.length);

  // Find all stylesheet URLs
  const cssRegex = /href=["']([^"']+\.css[^"']*)["']/g;
  let match;
  const cssFiles = [];
  while ((match = cssRegex.exec(html)) !== null) {
    let u = match[1];
    if (u.startsWith('/')) u = 'https://www.jointhejashn.com' + u;
    cssFiles.push(u);
  }
  console.log('Found CSS files:', cssFiles);

  const cssDir = path.join(__dirname, 'css');
  if (!fs.existsSync(cssDir)) fs.mkdirSync(cssDir, { recursive: true });

  for (let i = 0; i < cssFiles.length; i++) {
    const cssUrl = cssFiles[i];
    console.log('Downloading CSS:', cssUrl);
    const { text: cssContent } = await fetchUrl(cssUrl);
    fs.writeFileSync(path.join(cssDir, `style_${i}.css`), cssContent);
  }

  // Find all image / asset URLs
  const assetRegex = /(?:src|href)=["']([^"']+\.(?:webp|png|jpg|jpeg|svg|gif|woff2|woff|ttf|mp3|mp4|webm|ico)[^"']*)["']/gi;
  const assets = new Set();
  while ((match = assetRegex.exec(html)) !== null) {
    let u = match[1];
    if (u.startsWith('data:')) continue;
    if (u.startsWith('/')) u = 'https://www.jointhejashn.com' + u;
    assets.add(u);
  }

  // Also check css for url(...)
  for (let i = 0; i < cssFiles.length; i++) {
    const css = fs.readFileSync(path.join(cssDir, `style_${i}.css`), 'utf8');
    const urlRegex = /url\(["']?([^"')]+)["']?\)/g;
    while ((match = urlRegex.exec(css)) !== null) {
      let u = match[1];
      if (u.startsWith('data:')) continue;
      if (u.startsWith('/')) u = 'https://www.jointhejashn.com' + u;
      else if (!u.startsWith('http')) continue;
      assets.add(u);
    }
  }

  console.log('Total unique assets found:', assets.size);
  console.log([...assets]);

  const assetsDir = path.join(__dirname, 'public');
  for (const assetUrl of assets) {
    try {
      const u = new URL(assetUrl);
      const relativePath = u.pathname.startsWith('/') ? u.pathname.slice(1) : u.pathname;
      const destPath = path.join(assetsDir, relativePath);
      const dir = path.dirname(destPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      console.log(`Downloading ${assetUrl} -> ${destPath}`);
      const { buffer } = await fetchUrl(assetUrl);
      fs.writeFileSync(destPath, buffer);
    } catch (e) {
      console.error(`Failed to download ${assetUrl}:`, e.message);
    }
  }

  // Also download JS chunks to analyze animations
  const scriptRegex = /src=["']([^"']+\.js[^"']*)["']/g;
  const jsDir = path.join(__dirname, 'scripts_extracted');
  if (!fs.existsSync(jsDir)) fs.mkdirSync(jsDir, { recursive: true });
  
  while ((match = scriptRegex.exec(html)) !== null) {
    let u = match[1];
    if (u.startsWith('/')) u = 'https://www.jointhejashn.com' + u;
    try {
      const { text: jsCode } = await fetchUrl(u);
      const filename = path.basename(new URL(u).pathname);
      fs.writeFileSync(path.join(jsDir, filename), jsCode);
      if (jsCode.includes('jhr-') || jsCode.includes('jharokha')) {
        console.log('Found Jharokha animation code in script:', filename);
        fs.writeFileSync(path.join(__dirname, 'jharokha_app_chunk.js'), jsCode);
      }
    } catch (e) {}
  }

  console.log('Jharokha theme extraction complete!');
}

main().catch(console.error);
