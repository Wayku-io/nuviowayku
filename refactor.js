const fs = require('fs');

let content = fs.readFileSync('c:/Users/Kenyd/Documents/Nuvio/test-nuvio/ImageGen.js', 'utf8');

// 1. Update buildDashboardHtml
const dashboardOld = `function buildDashboardHtml(collections) {
  const cardsHtml = collections.map(col => {
    let links = '';
    const baseUrl = 'https://cdn.jsdelivr.net/gh/Wayku-io/nuviowayku@main/dist';
    
    if (col.backdropOutput) {
      links += \`<button onclick="copyLink('\${baseUrl}/\${col.backdropOutput}', this)">🖼️ Backdrop</button>\`;
    }
    if (col.coverOutput) {
      links += \`<button onclick="copyLink('\${baseUrl}/\${col.coverOutput}', this)">📱 Cover</button>\`;
    }
    if (col.focusOutput) {
      links += \`<button onclick="copyLink('\${baseUrl}/\${col.focusOutput}', this)">🎯 Focus</button>\`;
    }
    if (col.titleOutput) {
      links += \`<button onclick="copyLink('\${baseUrl}/\${col.titleOutput}', this)">🔤 Title</button>\`;
    }

    return \`
      <div class="card">
        <h2>\${col.name}</h2>
        <div class="buttons">
          \${links}
        </div>
      </div>
    \`;
  }).join('');`;

const dashboardNew = `function buildDashboardHtml(collections) {
  const categories = [
    { title: 'Collections Principales', prefix: 'principales', items: [] },
    { title: 'Genres', prefix: 'genres', items: [] },
    { title: 'Décennies', prefix: 'decennies', items: [] },
    { title: 'Plateformes', prefix: 'plateformes', items: [] }
  ];

  collections.forEach(col => {
    if (col.folder.startsWith('principales')) categories[0].items.push(col);
    else if (col.folder.startsWith('genres')) categories[1].items.push(col);
    else if (col.folder.startsWith('decennies')) categories[2].items.push(col);
    else if (col.folder.startsWith('plateformes')) categories[3].items.push(col);
  });

  const cardsHtml = categories.map(cat => {
    if (cat.items.length === 0) return '';
    const itemsHtml = cat.items.map(col => {
      let links = '';
      const baseUrl = 'https://cdn.jsdelivr.net/gh/Wayku-io/nuviowayku@main/dist';
      
      links += \`<button onclick="copyLink('\${baseUrl}/\${col.folder}/backdrop.webp', this)">🖼️ Backdrop</button>\`;
      if (col.title) {
        links += \`<button onclick="copyLink('\${baseUrl}/\${col.folder}/cover.webp', this)">📱 Cover</button>\`;
        links += \`<button onclick="copyLink('\${baseUrl}/\${col.folder}/focus.webp', this)">🎯 Focus</button>\`;
        links += \`<button onclick="copyLink('\${baseUrl}/\${col.folder}/title.webp', this)">🔤 Title</button>\`;
      }

      return \`
        <div class="card">
          <h2>\${col.name}</h2>
          <div class="buttons">
            \${links}
          </div>
        </div>
      \`;
    }).join('');

    return \`
      <div style="width: 100%; margin-top: 40px; grid-column: 1 / -1;">
        <h2 style="font-size: 2rem; border-bottom: 2px solid rgba(255,255,255,0.1); padding-bottom: 10px; margin-bottom: 20px;">\${cat.title}</h2>
        <div class="grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px;">
          \${itemsHtml}
        </div>
      </div>
    \`;
  }).join('');`;

content = content.replace(dashboardOld, dashboardNew);

// Since we have nested grid now, we should remove the root .grid from the HTML string below
content = content.replace(/<div class="grid">\$\{cardsHtml\}<\/div>/, '${cardsHtml}');

// 2. Update run()
content = content.replace("const distDir = path.resolve(__dirname, 'dist');", "const distDir = path.resolve(__dirname, '../../dist');");

// The screenshot outputs:
content = content.replace(
  "fs.writeFileSync(path.join(distDir, col.backdropOutput), backdropBuf);\n      console.log(`✅ Backdrop : dist/${col.backdropOutput}`);",
  "fs.writeFileSync(path.join(distDir, col.folder, 'backdrop.webp'), backdropBuf);\n      console.log(`✅ Backdrop : dist/${col.folder}/backdrop.webp`);"
);

content = content.replace("if (col.coverOutput || col.focusOutput) {", "if (col.title) {");
content = content.replace("if (col.coverOutput) {", "if (col.title) {");
content = content.replace("if (col.focusOutput) {", "if (col.title) {");
content = content.replace("if (col.titleOutput) {", "if (col.title) {");

content = content.replace(
  "fs.writeFileSync(path.join(distDir, col.coverOutput), coverBuf);\n          console.log(`✅ Cover    : dist/${col.coverOutput}`);",
  "fs.writeFileSync(path.join(distDir, col.folder, 'cover.webp'), coverBuf);\n          console.log(`✅ Cover    : dist/${col.folder}/cover.webp`);"
);

content = content.replace(
  "fs.writeFileSync(path.join(distDir, col.focusOutput), focusBuf);\n          console.log(`✅ Focus    : dist/${col.focusOutput}`);",
  "fs.writeFileSync(path.join(distDir, col.folder, 'focus.webp'), focusBuf);\n          console.log(`✅ Focus    : dist/${col.folder}/focus.webp`);"
);

content = content.replace(
  "fs.writeFileSync(path.join(distDir, col.titleOutput), titleBuf);\n        console.log(`✅ Title    : dist/${col.titleOutput}`);",
  "fs.writeFileSync(path.join(distDir, col.folder, 'title.webp'), titleBuf);\n        console.log(`✅ Title    : dist/${col.folder}/title.webp`);"
);

content = content.replace(
  "const mixedPosters = [];",
  `const colDir = path.join(distDir, col.folder);\n      if (!fs.existsSync(colDir)) {\n        fs.mkdirSync(colDir, { recursive: true });\n      }\n      const mixedPosters = [];`
);

fs.writeFileSync('c:/Users/Kenyd/Documents/Nuvio/test-nuvio/ImageGen.new.js', content);
