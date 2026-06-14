const fs = require('fs');
const file = 'src/app/page.js';
let content = fs.readFileSync(file, 'utf8');

// Regex to replace handleExportAll entirely
const newExportLogic = `  const handleExportAll = async (includePrivate) => {
    setIsExportModalOpen(false);
    setExportIncludesPrivate(includePrivate);
    setIsExporting(true);
    const { data: allDiaries } = await supabase.from('diaries').select('*, post_its(*)').eq('pregnancy_id', pregnancyId).order('date', { ascending: true });
    setAllDiariesToExport(allDiaries || []);
    
    // Give DOM time to render all diaries
    setTimeout(() => {
      if (window.ReactNativeWebView) {
        const exportContainer = document.querySelector('.printable-diary-export');
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
        } else {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'DOWNLOAD_PDF_HTML',
            htmlContent: '<html><body><h1>Error: Could not find container</h1></body></html>'
          }));
        }
      } else {
        window.print();
      }
      setIsExporting(false);
      setAllDiariesToExport([]);
    }, 1500);
  };`;

// Find handleExportAll block and replace it
content = content.replace(/const handleExportAll = async \([\s\S]*?}, 1500\);\n  };/, newExportLogic);

if (!content.includes('DOWNLOAD_PDF_HTML')) {
  console.log('REPLACEMENT FAILED!');
} else {
  fs.writeFileSync(file, content, 'utf8');
  console.log('PDF Bridge Successfully Injected!');
}
