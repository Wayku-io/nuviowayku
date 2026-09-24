const { execSync } = require('child_process');
const axios = require('axios');
const fs = require('fs');

async function deploy() {
  console.log('🚀 Envoi vers GitHub en cours...');
  try {
    execSync('git add .');
    execSync('git commit -m "chore: maj des visuels (ImageGen)"');
    execSync('git push');
    console.log('✅ Fichiers poussés sur GitHub avec succès !');
  } catch (err) {
    console.log('ℹ️ Aucun changement à pousser ou erreur lors du git push.');
  }

  console.log('⏳ Attente de 5 secondes pour que GitHub synchronise ses serveurs...');
  await new Promise(resolve => setTimeout(resolve, 5000));

  console.log('🧹 Lancement du script de purge JSDelivr...');
  try {
    execSync('node tools/purge-jsdelivr.js', { stdio: 'inherit' });
  } catch (err) {
    console.error('❌ Erreur lors de la purge JSDelivr.');
  }
}

deploy();
