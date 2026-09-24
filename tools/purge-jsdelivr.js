const axios = require('axios');
const fs = require('fs');

async function purgeCache() {
  console.log('⏳ Attente de 10 secondes pour que GitHub synchronise ses serveurs...');
  await new Promise(resolve => setTimeout(resolve, 10000));

  console.log('🧹 Purge du cache JSDelivr...');
  const repo = 'Wayku-io/nuviowayku@main';
  
  function getFiles(dir, files = []) {
    if (!fs.existsSync(dir)) return files;
    const list = fs.readdirSync(dir);
    for (const file of list) {
      const path = dir + '/' + file;
      if (fs.statSync(path).isDirectory()) {
        getFiles(path, files);
      } else {
        if (file.endsWith('.webp') || file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.html')) {
          files.push(path);
        }
      }
    }
    return files;
  }

  const distFiles = getFiles('./dist');
  
  const purgeUrls = distFiles.map(file => {
    const normalized = file.replace(/\\/g, '/').replace(/^\.\//, '');
    return `https://purge.jsdelivr.net/gh/${repo}/${normalized}`;
  });

  if (purgeUrls.length === 0) {
    console.log('ℹ️ Aucun fichier à purger.');
    return;
  }

  console.log(`🔍 ${purgeUrls.length} fichiers trouvés. Lancement de la purge...`);

  // Purge en petits groupes de 5 pour éviter de surcharger l'API
  let successCount = 0;
  for (let i = 0; i < purgeUrls.length; i += 5) {
    const batch = purgeUrls.slice(i, i + 5);
    await Promise.all(batch.map(async (url) => {
      try {
        await axios.get(url, { timeout: 10000 });
        successCount++;
      } catch (err) {
        console.error(`❌ Échec de la purge pour : ${url}`);
      }
    }));
  }

  console.log(`🎉 Purge terminée ! ${successCount}/${purgeUrls.length} fichiers rafraîchis.`);
}

purgeCache();
