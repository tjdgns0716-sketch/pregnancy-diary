const fs = require('fs');
const file = 'src/app/page.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  `const exportContainer = document.getElementById('export-container');`,
  `const exportContainer = document.querySelector('.printable-diary-export');`
);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed query selector');
