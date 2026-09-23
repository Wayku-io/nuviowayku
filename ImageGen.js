const puppeteer = require('puppeteer');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://aiometadatafortheweebs.midnightignite.me/stremio/1609e9ee-c194-445e-b25c-410e88954386';

const COLLECTIONS = [
  // --- Collections Initiales (Backdrop + Cover) ---
  {
    id: 'nouveautes',
    name: 'Nouveautés',
    title: 'Nouveautés',
    caption: 'Films & Séries • Dernières sorties',
    backdropOutput: 'nouveautes.backdrop.webp',
    coverOutput: 'nouveautes.cover.webp',
    titleOutput: 'nouveautes.title.webp',
    sortByPopularity: true,
    movieSource: `${BASE_URL}/catalog/movie/tmdb.discover.movie.sorties_digitales_copy.mpzretj9.json`,
    serieSource: `${BASE_URL}/catalog/series/tmdb.discover.movie.nouveaut_s_copy.mpa0h2yk.json`
  },
  {
    id: 'populaires',
    name: 'Populaires',
    title: 'Populaires',
    caption: 'Films & Séries • Tendances du moment',
    backdropOutput: 'populaires.backdrop.webp',
    coverOutput: 'populaires.cover.webp',
    titleOutput: 'populaires.title.webp',
    sortByPopularity: false,
    movieSource: `${BASE_URL}/catalog/movie/trakt.trending.movies.json`,
    serieSource: `${BASE_URL}/catalog/series/trakt.trending.shows.json`
  },
  {
    id: 'prochainement',
    name: 'Prochainement',
    title: 'Prochainement',
    caption: 'Films & Séries • Les plus attendus',
    backdropOutput: 'prochainement.backdrop.webp',
    coverOutput: 'prochainement.cover.webp',
    titleOutput: 'prochainement.title.webp',
    sortByPopularity: false,
    movieSource: `${BASE_URL}/catalog/movie/trakt.anticipated.movies.json`,
    serieSource: `${BASE_URL}/catalog/series/trakt.anticipated.shows.json`
  },
  {
    id: 'mieux_notes',
    name: 'Mieux notés',
    title: 'Mieux notés',
    caption: 'Films & Séries • La crème de la crème',
    backdropOutput: 'mieux_notes.backdrop.webp',
    coverOutput: 'mieux_notes.cover.webp',
    titleOutput: 'mieux_notes.title.webp',
    sortByPopularity: false,
    movieSource: `${BASE_URL}/catalog/movie/mdblist.101881.json`,
    serieSource: `${BASE_URL}/catalog/series/mdblist.101882.json`
  },
  {
    id: 'recommandations',
    name: 'Recommandations',
    title: 'Recommandations',
    caption: 'Films & Séries • Sélection sur mesure',
    backdropOutput: 'recommandations.backdrop.webp',
    coverOutput: 'recommandations.cover.webp',
    titleOutput: 'recommandations.title.webp',
    sortByPopularity: true,
    movieSource: `${BASE_URL}/catalog/movie/trakt.recommendations.movies.json`,
    serieSource: `${BASE_URL}/catalog/series/trakt.recommendations.shows.json`
  },

  // --- Plateformes de Streaming (Uniquement Backdrop) ---
  {
    id: 'top10_netflix',
    name: 'Top 10 Netflix',
    backdropOutput: 'netflix_top10.backdrop.webp',
    sortByPopularity: false,
    movieSource: `${BASE_URL}/catalog/movie/flixpatrol.netflix.fr.movie.json`,
    serieSource: `${BASE_URL}/catalog/series/flixpatrol.netflix.fr.series.json`,
    backupMovieSource: `${BASE_URL}/catalog/movie/tmdb.discover.movie.a_vient_de_sortir_sur_netflix_copy.mpbcuxcq.json`,
    backupSerieSource: `${BASE_URL}/catalog/series/tmdb.discover.series.a_vient_de_sortir_sur_netflix_copy.mpbcuy2s.json`
  },
  {
    id: 'top10_prime_video',
    name: 'Top 10 Prime Video',
    backdropOutput: 'prime_video_top10.backdrop.webp',
    sortByPopularity: false,
    movieSource: `${BASE_URL}/catalog/movie/flixpatrol.amazon-prime.fr.movie.json`,
    serieSource: `${BASE_URL}/catalog/series/flixpatrol.amazon-prime.fr.series.json`,
    backupMovieSource: `${BASE_URL}/catalog/movie/tmdb.discover.movie.les_mieux_not_s_sur_netflix_copy.mpbhw6jo.json`,
    backupSerieSource: `${BASE_URL}/catalog/series/tmdb.discover.series.les_mieux_not_es_sur_netflix_copy.mpbhw8cp.json`
  },
  {
    id: 'top10_apple_tv',
    name: 'Top 10 Apple TV+',
    backdropOutput: 'apple_tv_top10.backdrop.webp',
    sortByPopularity: false,
    movieSource: `${BASE_URL}/catalog/movie/flixpatrol.apple-tv.fr.movie.json`,
    serieSource: `${BASE_URL}/catalog/series/flixpatrol.apple-tv.fr.series.json`,
    backupMovieSource: `${BASE_URL}/catalog/movie/tmdb.discover.movie.les_mieux_not_s_sur_netflix_copy.mpbhw6tp.json`,
    backupSerieSource: `${BASE_URL}/catalog/series/tmdb.discover.series.les_mieux_not_es_sur_netflix_copy.mpbhw8mt.json`
  },
  {
    id: 'top10_disney',
    name: 'Top 10 Disney+',
    backdropOutput: 'disney_top10.backdrop.webp',
    sortByPopularity: false,
    movieSource: `${BASE_URL}/catalog/movie/flixpatrol.disney.fr.movie.json`,
    serieSource: `${BASE_URL}/catalog/series/flixpatrol.disney.fr.series.json`,
    backupMovieSource: `${BASE_URL}/catalog/movie/tmdb.discover.movie.les_mieux_not_s_sur_netflix_copy.mpbhw73y.json`,
    backupSerieSource: `${BASE_URL}/catalog/series/tmdb.discover.series.les_mieux_not_es_sur_netflix_copy.mpbhw8wy.json`
  },
  {
    id: 'top10_hbo_max',
    name: 'Top 10 HBO Max',
    backdropOutput: 'hbo_max_top10.backdrop.webp',
    sortByPopularity: false,
    movieSource: `${BASE_URL}/catalog/movie/flixpatrol.hbo-max.fr.movie.json`,
    serieSource: `${BASE_URL}/catalog/series/flixpatrol.hbo-max.fr.series.json`,
    backupMovieSource: `${BASE_URL}/catalog/movie/tmdb.discover.movie.les_mieux_not_s_sur_netflix_copy.mpbhw7dw.json`,
    backupSerieSource: `${BASE_URL}/catalog/series/tmdb.discover.series.les_mieux_not_es_sur_netflix_copy.mpbhw97l.json`
  },
  {
    id: 'top10_paramount',
    name: 'Top 10 Paramount+',
    backdropOutput: 'paramount_top10.backdrop.webp',
    sortByPopularity: false,
    movieSource: `${BASE_URL}/catalog/movie/flixpatrol.paramount.fr.movie.json`,
    serieSource: `${BASE_URL}/catalog/series/flixpatrol.paramount.fr.series.json`,
    backupMovieSource: `${BASE_URL}/catalog/movie/tmdb.discover.movie.les_mieux_not_s_sur_netflix_copy.mpbhw7os.json`,
    backupSerieSource: `${BASE_URL}/catalog/series/tmdb.discover.series.les_mieux_not_es_sur_netflix_copy.mpbhw9k1.json`
  }
];

function isValidImage(url) {
  if (!url || typeof url !== 'string') return false;
  const lower = url.toLowerCase();
  return !(
    lower.includes('placeholder') || 
    lower.includes('default') || 
    lower.includes('no_poster') || 
    lower.includes('noposter') ||
    lower.includes('metahub.space') ||
    lower.includes('images.metahub.space') ||
    lower.includes('strem.io') ||
    lower.includes('stremio') ||
    lower.includes('fallback') ||
    lower.includes('coming-soon') ||
    lower.includes('unknown') ||
    lower.endsWith('.svg') ||
    lower.endsWith('.png')
  );
}

function sortItems(items) {
  return items.sort((a, b) => {
    const popA = parseFloat(a.imdbRating || a.vote_average || a.popularity || 0);
    const popB = parseFloat(b.imdbRating || b.vote_average || b.popularity || 0);
    return popB - popA;
  });
}

function pickCoverItem(items, preferFirst = false) {
  const valid = items.filter(m => isValidImage(m.background || m.backdrop));
  if (valid.length === 0) return items[0] || {};
  if (preferFirst) return valid[0];

  valid.sort((a, b) => {
    const scoreA = (parseFloat(a.vote_count) || 0) * 2 + (parseFloat(a.popularity) || 0);
    const scoreB = (parseFloat(b.vote_count) || 0) * 2 + (parseFloat(b.popularity) || 0);
    return scoreB - scoreA;
  });
  return valid[0];
}

function placePostersFromCenter(posters, totalRows = 5, totalCols = 9) {
  const centerR = Math.floor(totalRows / 2);
  const centerC = Math.floor(totalCols / 2);

  const positions = [];
  for (let r = 0; r < totalRows; r++) {
    for (let c = 0; c < totalCols; c++) {
      const dist = Math.pow((r - centerR) * 1.3, 2) + Math.pow(c - centerC, 2);
      positions.push({ dist, r, c });
    }
  }

  positions.sort((a, b) => a.dist - b.dist);
  const grid = Array.from({ length: totalRows }, () => Array(totalCols).fill(null));

  positions.forEach((pos, rank) => {
    grid[pos.r][pos.c] = posters[rank % posters.length];
  });

  return grid;
}

function buildBackdropHtml(rows) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body {
        width: 1920px;
        height: 1080px;
        background: #090a0d;
        overflow: hidden;
        position: relative;
        perspective: 1600px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .wall {
        position: absolute;
        width: 140%;
        display: flex;
        flex-direction: column;
        gap: 22px;
        transform: rotateX(15deg) rotateY(12deg) rotateZ(-7deg) scale(1.08);
        transform-origin: center center;
      }
      .row {
        display: flex;
        gap: 22px;
        justify-content: center;
      }
      .card {
        width: 215px;
        height: 322px;
        border-radius: 14px;
        overflow: hidden;
        background: #151821;
        box-shadow: 0 14px 28px rgba(0, 0, 0, 0.85);
        border: 1px solid rgba(255, 255, 255, 0.08);
        flex-shrink: 0;
      }
      .card img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
      .overlay {
        position: absolute;
        inset: 0;
        pointer-events: none;
        background: 
          radial-gradient(circle at 55% 50%, rgba(9, 10, 13, 0.02) 0%, rgba(9, 10, 13, 0.65) 68%, #090a0d 100%),
          linear-gradient(to top, rgba(9, 10, 13, 0.85) 0%, transparent 35%);
      }
    </style>
  </head>
  <body>
    <div class="wall">
      ${rows.map(row => `
        <div class="row">
          ${row.map(url => `
            <div class="card"><img src="${url}" /></div>
          `).join('')}
        </div>
      `).join('')}
    </div>
    <div class="overlay"></div>
  </body>
  </html>
  `;
}

function buildCoverHtml(movieBg, serieBg, title, caption) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700;900&display=swap" rel="stylesheet">
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body {
        width: 1920px;
        height: 1080px;
        background: #090a0d;
        overflow: hidden;
        position: relative;
        font-family: 'Montserrat', sans-serif;
      }

      .pane-movie {
        position: absolute;
        top: 0;
        left: 0;
        width: 960px;
        height: 1080px;
        clip-path: polygon(0 0, calc(100% + 115px) 0, calc(100% - 115px) 100%, 0 100%);
        overflow: hidden;
      }
      .pane-movie img {
        position: absolute;
        top: 0;
        left: 50%;
        transform: translateX(-50%);
        width: auto;
        height: 70%;
        min-width: 100%;
        object-fit: cover;
        object-position: top center;
      }

      .pane-serie {
        position: absolute;
        top: 0;
        left: 960px;
        width: 960px;
        height: 1080px;
        clip-path: polygon(115px 0, 100% 0, 100% 100%, -115px 100%);
        overflow: hidden;
      }
      .pane-serie img {
        position: absolute;
        top: 0;
        left: 50%;
        transform: translateX(-50%);
        width: auto;
        height: 70%;
        min-width: 100%;
        object-fit: cover;
        object-position: top center;
      }

      .seam-line {
        position: absolute;
        inset: 0;
        pointer-events: none;
        z-index: 5;
      }
      .seam-line svg {
        width: 100%;
        height: 100%;
      }

      .overlay {
        position: absolute;
        inset: 0;
        pointer-events: none;
        z-index: 6;
        background: linear-gradient(to top, #090a0d 0%, #090a0d 30.5%, rgba(9, 10, 13, 0.85) 36%, rgba(9, 10, 13, 0.4) 42%, transparent 48%);
      }

      .text-container {
        position: absolute;
        bottom: 80px;
        left: 0;
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        padding: 0 100px;
        z-index: 10;
      }

      .main-title {
        font-size: 95px;
        font-weight: 900;
        text-transform: uppercase;
        letter-spacing: 12px;
        margin-bottom: 25px;
        white-space: nowrap;
        background: linear-gradient(180deg, #ffffff 30%, #b5b7c0 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        filter: drop-shadow(0 15px 25px rgba(0, 0, 0, 0.95));
      }

      .divider {
        width: 250px;
        height: 6px;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.9), transparent);
        border-radius: 3px;
        box-shadow: 0 0 12px rgba(255, 255, 255, 0.6);
      }
    </style>
  </head>
  <body>
    <div class="pane-movie"><img src="${movieBg}" /></div>
    <div class="pane-serie"><img src="${serieBg}" /></div>

    <div class="seam-line">
      <svg viewBox="0 0 1920 1080" preserveAspectRatio="none">
        <defs>
          <linearGradient id="lineGlow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="rgba(255,255,255,0.2)" />
            <stop offset="30%" stop-color="rgba(255,255,255,0.9)" />
            <stop offset="50%" stop-color="#ffffff" />
            <stop offset="70%" stop-color="rgba(255,255,255,0.9)" />
            <stop offset="100%" stop-color="rgba(255,255,255,0.2)" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur1"/>
            <feGaussianBlur stdDeviation="15" result="blur2"/>
            <feMerge>
              <feMergeNode in="blur2"/>
              <feMergeNode in="blur1"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <line x1="1075" y1="0" x2="845" y2="1080" stroke="#000000" stroke-width="18" opacity="0.9" />
        <line x1="1075" y1="0" x2="845" y2="1080" stroke="url(#lineGlow)" stroke-width="6" filter="url(#glow)" />
      </svg>
    </div>

    <div class="overlay"></div>

    <div class="text-container">
      <h1 class="main-title">${title}</h1>
      <div class="divider"></div>
    </div>
  </body>
  </html>
  `;
}

function buildDashboardHtml(collections) {
  const cardsHtml = collections.map(col => {
    let links = '';
    const baseUrl = 'https://cdn.jsdelivr.net/gh/Wayku-io/nuviowayku@main/dist';
    
    if (col.backdropOutput) {
      links += `<button onclick="copyLink('${baseUrl}/${col.backdropOutput}', this)">🖼️ Backdrop</button>`;
    }
    if (col.coverOutput) {
      links += `<button onclick="copyLink('${baseUrl}/${col.coverOutput}', this)">📱 Cover</button>`;
    }
    if (col.titleOutput) {
      links += `<button onclick="copyLink('${baseUrl}/${col.titleOutput}', this)">🔤 Title</button>`;
    }

    return `
      <div class="card">
        <h2>${col.name}</h2>
        <div class="buttons">
          ${links}
        </div>
      </div>
    `;
  }).join('');

  return `
  <!DOCTYPE html>
  <html lang="fr">
  <head>
    <meta charset="utf-8">
    <title>Nuvio - Liens JSDelivr</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
    <style>
      :root {
        --bg: #090a0d;
        --card-bg: rgba(255, 255, 255, 0.03);
        --card-border: rgba(255, 255, 255, 0.08);
        --text: #ffffff;
      }
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body {
        font-family: 'Inter', sans-serif;
        background: var(--bg);
        color: var(--text);
        padding: 40px 20px;
        min-height: 100vh;
        background-image: radial-gradient(circle at top right, rgba(79, 70, 229, 0.15), transparent 40%),
                          radial-gradient(circle at bottom left, rgba(236, 72, 153, 0.1), transparent 40%);
      }
      .header { text-align: center; margin-bottom: 50px; }
      .header h1 {
        font-size: 3rem;
        font-weight: 800;
        margin-bottom: 10px;
        background: linear-gradient(to right, #a855f7, #ec4899);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      .header p { color: rgba(255, 255, 255, 0.6); font-size: 1.1rem; }
      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 24px;
        max-width: 1400px;
        margin: 0 auto;
      }
      .card {
        background: var(--card-bg);
        border: 1px solid var(--card-border);
        border-radius: 16px;
        padding: 24px;
        backdrop-filter: blur(10px);
        transition: transform 0.2s, box-shadow 0.2s;
      }
      .card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        border-color: rgba(255, 255, 255, 0.15);
      }
      .card h2 { font-size: 1.25rem; font-weight: 600; margin-bottom: 20px; color: #e2e8f0; }
      .buttons { display: flex; flex-direction: column; gap: 10px; }
      button {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: #fff;
        padding: 12px 16px;
        border-radius: 8px;
        font-size: 0.95rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: flex-start;
        gap: 10px;
        transition: all 0.2s;
        font-family: inherit;
      }
      button:hover { background: rgba(255, 255, 255, 0.1); border-color: rgba(255, 255, 255, 0.2); }
      button:active { transform: scale(0.98); }
      .toast {
        position: fixed;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%) translateY(100px);
        background: #10b981;
        color: white;
        padding: 12px 24px;
        border-radius: 30px;
        font-weight: 600;
        box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
        transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        opacity: 0;
        pointer-events: none;
      }
      .toast.show { transform: translateX(-50%) translateY(0); opacity: 1; }
    </style>
  </head>
  <body>
    <div class="header">
      <h1>Nuvio Images</h1>
      <p>Cliquez sur un bouton pour copier le lien CDN (JSDelivr)</p>
    </div>
    <div class="grid">${cardsHtml}</div>
    <div id="toast" class="toast">✅ Lien copié dans le presse-papier !</div>
    <script>
      function copyLink(url, btn) {
        navigator.clipboard.writeText(url).then(() => {
          const originalText = btn.innerHTML;
          btn.innerHTML = '✅ Copié !';
          btn.style.background = 'rgba(16, 185, 129, 0.2)';
          btn.style.borderColor = '#10b981';
          setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = '';
            btn.style.borderColor = '';
          }, 1500);
          const toast = document.getElementById('toast');
          toast.classList.add('show');
          setTimeout(() => toast.classList.remove('show'), 2500);
        });
      }
    </script>
  </body>
  </html>
  `;
}

function buildTitleHtml(title) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700;900&display=swap" rel="stylesheet">
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body {
        background: transparent;
        font-family: 'Montserrat', sans-serif;
        display: inline-block;
        padding: 50px;
      }
      .main-title {
        font-size: 95px;
        font-weight: 900;
        text-transform: uppercase;
        letter-spacing: 12px;
        white-space: nowrap;
        background: linear-gradient(180deg, #ffffff 30%, #b5b7c0 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        filter: drop-shadow(0 15px 25px rgba(0, 0, 0, 0.95));
      }
    </style>
  </head>
  <body>
    <div class="main-title" id="title-node">${title}</div>
  </body>
  </html>
  `;
}

async function run() {
  const distDir = path.resolve(__dirname, 'dist');
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  const browser = await puppeteer.launch({ 
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  for (const col of COLLECTIONS) {
    console.log(`\n========================================`);
    console.log(`Collection : ${col.name}`);
    console.log(`========================================`);

    try {
      const fetchList = [
        axios.get(col.movieSource, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 15000 }),
        axios.get(col.serieSource, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 15000 })
      ];

      if (col.backupMovieSource && col.backupSerieSource) {
        fetchList.push(
          axios.get(col.backupMovieSource, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 15000 }),
          axios.get(col.backupSerieSource, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 15000 })
        );
      }

      const results = await Promise.all(fetchList);
      let movies = results[0].data.metas || [];
      let series = results[1].data.metas || [];
      let backupMovies = results[2] ? (results[2].data.metas || []) : [];
      let backupSeries = results[3] ? (results[3].data.metas || []) : [];

      // --- 1. BACKDROP ---
      let bMovies = [...movies];
      let bSeries = [...series];
      if (col.sortByPopularity) {
        bMovies = sortItems(bMovies);
        bSeries = sortItems(bSeries);
      }

      const moviePosters = bMovies.map(m => m.poster).filter(isValidImage);
      const seriePosters = bSeries.map(m => m.poster).filter(isValidImage);

      const mixedPosters = [];
      const seenPosters = new Set();

      // Top items entrelacés en priorité (au centre de la grille)
      const maxLen = Math.max(moviePosters.length, seriePosters.length);
      for (let i = 0; i < maxLen; i++) {
        if (moviePosters[i] && !seenPosters.has(moviePosters[i])) {
          mixedPosters.push(moviePosters[i]);
          seenPosters.add(moviePosters[i]);
        }
        if (seriePosters[i] && !seenPosters.has(seriePosters[i])) {
          mixedPosters.push(seriePosters[i]);
          seenPosters.add(seriePosters[i]);
        }
      }

      // Complément avec les mieux notés pour la périphérie (sans doublons)
      if (backupMovies.length > 0 || backupSeries.length > 0) {
        const bkMoviePosters = backupMovies.map(m => m.poster).filter(isValidImage);
        const bkSeriePosters = backupSeries.map(m => m.poster).filter(isValidImage);
        const maxBkLen = Math.max(bkMoviePosters.length, bkSeriePosters.length);

        for (let i = 0; i < maxBkLen; i++) {
          if (mixedPosters.length >= 45) break;
          if (bkMoviePosters[i] && !seenPosters.has(bkMoviePosters[i])) {
            mixedPosters.push(bkMoviePosters[i]);
            seenPosters.add(bkMoviePosters[i]);
          }
          if (mixedPosters.length >= 45) break;
          if (bkSeriePosters[i] && !seenPosters.has(bkSeriePosters[i])) {
            mixedPosters.push(bkSeriePosters[i]);
            seenPosters.add(bkSeriePosters[i]);
          }
        }
      }

      // Remplissage de secours si le catalogue compte moins de 45 éléments
      while (mixedPosters.length < 45) {
        mixedPosters.push(...mixedPosters);
      }

      const rows = placePostersFromCenter(mixedPosters, 5, 9);
      await page.setContent(buildBackdropHtml(rows), { waitUntil: 'domcontentloaded' });

      // Remplacement direct de tout visuel invalide ou ratio incorrect
      await page.evaluate(async (fallbackList) => {
        const imgs = Array.from(document.querySelectorAll('img'));
        await Promise.race([
          Promise.all(imgs.map(img => {
            if (img.complete) return;
            return new Promise(resolve => {
              img.onload = resolve;
              img.onerror = resolve;
            });
          })),
          new Promise(resolve => setTimeout(resolve, 6000))
        ]);

        let fb = 0;
        for (const img of imgs) {
          const ratio = img.naturalHeight / (img.naturalWidth || 1);
          if (img.naturalWidth < 250 || ratio < 1.3 || ratio > 1.7) {
            img.src = fallbackList[fb % fallbackList.length];
            fb++;
          }
        }
      }, mixedPosters.slice(0, 15));

      const backdropBuf = await page.screenshot({ type: 'webp', quality: 92 });
      fs.writeFileSync(path.join(distDir, col.backdropOutput), backdropBuf);
      console.log(`✅ Backdrop : dist/${col.backdropOutput}`);

      // --- 2. COVER (Uniquement si coverOutput est défini) ---
      if (col.coverOutput) {
        const preferFirst = (col.id === 'prochainement' || col.id === 'mieux_notes');
        const coverMovie = pickCoverItem(movies, preferFirst);
        const coverSerie = pickCoverItem(series, preferFirst);

        const movieBg = coverMovie.background || coverMovie.backdrop || coverMovie.poster;
        const serieBg = coverSerie.background || coverSerie.backdrop || coverSerie.poster;

        await page.setContent(buildCoverHtml(movieBg, serieBg, col.title, col.caption), { waitUntil: 'domcontentloaded' });

        await page.evaluate(async () => {
          const imgs = Array.from(document.querySelectorAll('img'));
          await Promise.race([
            Promise.all(imgs.map(img => {
              if (img.complete) return;
              return new Promise(resolve => {
                img.onload = resolve;
                img.onerror = resolve;
              });
            })),
            new Promise(resolve => setTimeout(resolve, 5000))
          ]);
        });

        const coverBuf = await page.screenshot({ type: 'webp', quality: 92 });
        fs.writeFileSync(path.join(distDir, col.coverOutput), coverBuf);
        console.log(`✅ Cover    : dist/${col.coverOutput}`);
      }

      // --- 3. TITLE (Uniquement si titleOutput est défini) ---
      if (col.titleOutput) {
        await page.setContent(buildTitleHtml(col.title), { waitUntil: 'domcontentloaded' });
        
        await page.evaluate(async () => {
          await document.fonts.ready;
        });

        const titleNode = await page.$('#title-node');
        const titleBuf = await titleNode.screenshot({ type: 'webp', omitBackground: true, quality: 92 });
        fs.writeFileSync(path.join(distDir, col.titleOutput), titleBuf);
        console.log(`✅ Title    : dist/${col.titleOutput}`);
      }

    } catch (err) {
      console.error(`❌ Erreur sur ${col.name}:`, err.message);
    }
  }

  await browser.close();
  
  // Génération du dashboard web
  const dashboardHtml = buildDashboardHtml(COLLECTIONS);
  fs.writeFileSync(path.join(distDir, 'index.html'), dashboardHtml);
  console.log(`✅ Dashboard : dist/index.html`);

  console.log('\n🎉 Terminé ! Les 21 visuels (11 backdrops, 5 covers, 5 titles) et le dashboard sont dans /dist.');
}

run().catch(err => {
  console.error('Erreur :', err.message);
  process.exit(1);
});