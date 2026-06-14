const fs = require('fs');
const file = 'src/app/page.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  `// Give DOM time to render all diaries
    setTimeout(async () => {
      if (window.ReactNativeWebView) {
        // App Export Logic (Using a third party service or we can just send html)
        // But the simplest is to just tell them to use window.print in webview, but WebView on Android doesn't print to PDF easily.
        // For now, let's just use window.print() but alert them it's generating.
        // A better approach for React Native is generating the PDF using an API, but since we are purely client side,
        // we'll trigger window.print() and let iOS handle it, and for Android we might need a custom print handler.
        // Actually, let's just trigger window.print() first. We can refine the Base64 bridge later if needed.
      }
      window.print();
      setIsExporting(false);
      setAllDiariesToExport([]);
    }, 1500);`,
  `// Give DOM time to render all diaries
    setTimeout(() => {
      if (window.ReactNativeWebView) {
        const exportContainer = document.getElementById('export-container');
        if (exportContainer) {
          const htmlContent = \`
            <html>
              <head>
                <meta charset="utf-8">
                <style>
                  body { font-family: sans-serif; padding: 20px; line-height: 1.6; color: #333; }
                  .diary-entry { border-bottom: 1px solid #eee; padding-bottom: 20px; margin-bottom: 20px; page-break-inside: avoid; }
                  img { max-width: 100%; height: auto; border-radius: 8px; margin-top: 10px; }
                  .date { font-size: 1.2rem; font-weight: bold; color: #d48f87; margin-bottom: 10px; }
                  .content { font-size: 1rem; margin-bottom: 10px; }
                  .post-it { background: #fffde7; padding: 10px; border-radius: 5px; font-size: 0.9rem; margin-top: 10px; }
                </style>
              </head>
              <body>
                <h1 style="text-align: center; color: #d48f87; margin-bottom: 30px;">우리의 열달 다이어리</h1>
                \${exportContainer.innerHTML}
              </body>
            </html>
          \`;
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'DOWNLOAD_PDF_HTML',
            htmlContent
          }));
        }
      } else {
        window.print();
      }
      setIsExporting(false);
      setAllDiariesToExport([]);
    }, 1500);`
);

fs.writeFileSync(file, content, 'utf8');
console.log('PDF logic updated');
