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
    folder: 'principales/nouveautes',
    sortByPopularity: true,
    movieSource: `${BASE_URL}/catalog/movie/tmdb.discover.movie.sorties_digitales_copy.mpzretj9.json`,
    serieSource: `${BASE_URL}/catalog/series/tmdb.discover.movie.nouveaut_s_copy.mpa0h2yk.json`
  },
  {
    id: 'populaires',
    name: 'Populaires',
    title: 'Populaires',
    caption: 'Films & Séries • Tendances du moment',
    folder: 'principales/populaires',
    sortByPopularity: false,
    movieSource: `${BASE_URL}/catalog/movie/trakt.trending.movies.json`,
    serieSource: `${BASE_URL}/catalog/series/trakt.trending.shows.json`
  },
  {
    id: 'prochainement',
    name: 'Prochainement',
    title: 'Prochainement',
    caption: 'Films & Séries • Les plus attendus',
    folder: 'principales/prochainement',
    sortByPopularity: false,
    movieSource: `${BASE_URL}/catalog/movie/trakt.anticipated.movies.json`,
    serieSource: `${BASE_URL}/catalog/series/trakt.anticipated.shows.json`
  },
  {
    id: 'mieux_notes',
    name: 'Mieux notés',
    title: 'Mieux notés',
    caption: 'Films & Séries • La crème de la crème',
    folder: 'principales/mieux_notes',
    sortByPopularity: false,
    movieSource: `${BASE_URL}/catalog/movie/mdblist.101881.json`,
    serieSource: `${BASE_URL}/catalog/series/mdblist.101882.json`
  },
  {
    id: 'recommandations',
    name: 'Recommandations',
    title: 'Recommandations',
    caption: 'Films & Séries • Sélection sur mesure',
    folder: 'principales/recommandations',
    sortByPopularity: true,
    movieSource: `${BASE_URL}/catalog/movie/trakt.recommendations.movies.json`,
    serieSource: `${BASE_URL}/catalog/series/trakt.recommendations.shows.json`
  },

  // --- Plateformes de Streaming (Uniquement Backdrop) ---
  {
    id: 'top10_netflix',
    name: 'Top 10 Netflix',
    folder: 'plateformes/netflix',
    sortByPopularity: false,
    movieSource: `${BASE_URL}/catalog/movie/flixpatrol.netflix.fr.movie.json`,
    serieSource: `${BASE_URL}/catalog/series/flixpatrol.netflix.fr.series.json`,
    backupMovieSource: `${BASE_URL}/catalog/movie/tmdb.discover.movie.a_vient_de_sortir_sur_netflix_copy.mpbcuxcq.json`,
    backupSerieSource: `${BASE_URL}/catalog/series/tmdb.discover.series.a_vient_de_sortir_sur_netflix_copy.mpbcuy2s.json`
  },
  {
    id: 'top10_prime_video',
    name: 'Top 10 Prime Video',
    folder: 'plateformes/prime_video',
    sortByPopularity: false,
    movieSource: `${BASE_URL}/catalog/movie/flixpatrol.amazon-prime.fr.movie.json`,
    serieSource: `${BASE_URL}/catalog/series/flixpatrol.amazon-prime.fr.series.json`,
    backupMovieSource: `${BASE_URL}/catalog/movie/tmdb.discover.movie.les_mieux_not_s_sur_netflix_copy.mpbhw6jo.json`,
    backupSerieSource: `${BASE_URL}/catalog/series/tmdb.discover.series.les_mieux_not_es_sur_netflix_copy.mpbhw8cp.json`
  },
  {
    id: 'top10_apple_tv',
    name: 'Top 10 Apple TV+',
    folder: 'plateformes/apple_tv',
    sortByPopularity: false,
    movieSource: `${BASE_URL}/catalog/movie/flixpatrol.apple-tv.fr.movie.json`,
    serieSource: `${BASE_URL}/catalog/series/flixpatrol.apple-tv.fr.series.json`,
    backupMovieSource: `${BASE_URL}/catalog/movie/tmdb.discover.movie.les_mieux_not_s_sur_netflix_copy.mpbhw6tp.json`,
    backupSerieSource: `${BASE_URL}/catalog/series/tmdb.discover.series.les_mieux_not_es_sur_netflix_copy.mpbhw8mt.json`
  },
  {
    id: 'top10_disney',
    name: 'Top 10 Disney+',
    folder: 'plateformes/disney',
    sortByPopularity: false,
    movieSource: `${BASE_URL}/catalog/movie/flixpatrol.disney.fr.movie.json`,
    serieSource: `${BASE_URL}/catalog/series/flixpatrol.disney.fr.series.json`,
    backupMovieSource: `${BASE_URL}/catalog/movie/tmdb.discover.movie.les_mieux_not_s_sur_netflix_copy.mpbhw73y.json`,
    backupSerieSource: `${BASE_URL}/catalog/series/tmdb.discover.series.les_mieux_not_es_sur_netflix_copy.mpbhw8wy.json`
  },
  {
    id: 'top10_hbo_max',
    name: 'Top 10 HBO Max',
    folder: 'plateformes/hbo_max',
    sortByPopularity: false,
    movieSource: `${BASE_URL}/catalog/movie/flixpatrol.hbo-max.fr.movie.json`,
    serieSource: `${BASE_URL}/catalog/series/flixpatrol.hbo-max.fr.series.json`,
    backupMovieSource: `${BASE_URL}/catalog/movie/tmdb.discover.movie.les_mieux_not_s_sur_netflix_copy.mpbhw7dw.json`,
    backupSerieSource: `${BASE_URL}/catalog/series/tmdb.discover.series.les_mieux_not_es_sur_netflix_copy.mpbhw97l.json`
  },
  {
    id: 'top10_paramount',
    name: 'Top 10 Paramount+',
    folder: 'plateformes/paramount',
    sortByPopularity: false,
    movieSource: `${BASE_URL}/catalog/movie/flixpatrol.paramount.fr.movie.json`,
    serieSource: `${BASE_URL}/catalog/series/flixpatrol.paramount.fr.series.json`,
    backupMovieSource: `${BASE_URL}/catalog/movie/tmdb.discover.movie.les_mieux_not_s_sur_netflix_copy.mpbhw7os.json`,
    backupSerieSource: `${BASE_URL}/catalog/series/tmdb.discover.series.les_mieux_not_es_sur_netflix_copy.mpbhw9k1.json`
  },
  {
    id: 'genre_action',
    name: 'Action',
    title: 'Action',
    caption: 'Films & Séries',
    folder: 'genres/action',
    movieSource: `${BASE_URL}/catalog/movie/tmdb.discover.movie.action.mpegynci.json`,
    serieSource: `${BASE_URL}/catalog/series/tmdb.discover.movie.action_copy.mpegysup.json`,
    useMovieForCover: true
  },
  {
    id: 'genre_comedie',
    name: 'Comédie',
    title: 'Comédie',
    caption: 'Films & Séries',
    folder: 'genres/comedie',
    movieSource: `${BASE_URL}/catalog/movie/tmdb.discover.movie.action_copy.mpegzpmg.json`,
    serieSource: `${BASE_URL}/catalog/series/tmdb.discover.movie.action_copy_copy.mpeh11x6.json`,
    useMovieForCover: true
  },
  {
    id: 'genre_crime',
    name: 'Crime',
    title: 'Crime',
    caption: 'Films & Séries',
    folder: 'genres/crime',
    movieSource: `${BASE_URL}/catalog/movie/tmdb.discover.movie.action_copy.mpeh1bp5.json`,
    serieSource: `${BASE_URL}/catalog/series/tmdb.discover.movie.action_copy_copy.mpeh22b2.json`,
    useMovieForCover: true
  },
  {
    id: 'genre_drame',
    name: 'Drame',
    title: 'Drame',
    caption: 'Films & Séries',
    folder: 'genres/drame',
    movieSource: `${BASE_URL}/catalog/movie/tmdb.discover.movie.crime_copy.mpeh30bz.json`,
    serieSource: `${BASE_URL}/catalog/series/tmdb.discover.movie.crime_copy_copy.mpeh3bsj.json`,
    useMovieForCover: true
  },
  {
    id: 'genre_kdrama',
    name: 'K-Drama',
    title: 'K-Drama',
    caption: 'Films & Séries',
    folder: 'genres/kdrama',
    movieSource: `${BASE_URL}/catalog/movie/mdblist.130778.json`,
    serieSource: `${BASE_URL}/catalog/series/mdblist.130775.json`,
    useMovieForCover: true
  },
  {
    id: 'genre_fantastique',
    name: 'Fantastique',
    title: 'Fantastique',
    caption: 'Films & Séries',
    folder: 'genres/fantastique',
    movieSource: `${BASE_URL}/catalog/movie/tmdb.discover.movie.drame_copy.mpeh3wlv.json`,
    serieSource: `${BASE_URL}/catalog/series/tmdb.discover.movie.drame_copy_copy.mpeh4679.json`,
    useMovieForCover: true
  },
  {
    id: 'genre_horreur',
    name: 'Horreur',
    title: 'Horreur',
    caption: 'Films & Séries',
    folder: 'genres/horreur',
    movieSource: `${BASE_URL}/catalog/movie/tmdb.discover.movie.fantastique_copy.mpeh5vcp.json`,
    serieSource: `${BASE_URL}/catalog/series/tmdb.discover.movie.fantastique_copy_copy.mpeh6hdm.json`,
    useMovieForCover: true
  },
  {
    id: 'genre_mystere',
    name: 'Mystère',
    title: 'Mystère',
    caption: 'Films & Séries',
    folder: 'genres/mystere',
    movieSource: `${BASE_URL}/catalog/movie/tmdb.discover.movie.horreur_copy.mpeh907o.json`,
    serieSource: `${BASE_URL}/catalog/series/tmdb.discover.movie.horreur_copy_copy.mpeh9aoq.json`,
    useMovieForCover: true
  },
  {
    id: 'genre_romance',
    name: 'Romance',
    title: 'Romance',
    caption: 'Films & Séries',
    folder: 'genres/romance',
    movieSource: `${BASE_URL}/catalog/movie/tmdb.discover.movie.myst_re_copy.mpeha185.json`,
    serieSource: `${BASE_URL}/catalog/series/tmdb.discover.movie.myst_re_copy_copy.mpehafc4.json`,
    useMovieForCover: true
  },
  {
    id: 'genre_thriller',
    name: 'Thriller',
    title: 'Thriller',
    caption: 'Films & Séries',
    folder: 'genres/thriller',
    movieSource: `${BASE_URL}/catalog/movie/tmdb.discover.movie.romance_copy.mpehcdq4.json`,
    serieSource: `${BASE_URL}/catalog/series/tmdb.discover.movie.romance_copy_copy.mpehcoz1.json`,
    useMovieForCover: true
  },
  {
    id: 'decade_2020s',
    name: 'Années 2020',
    title: '2020 - 2029',
    caption: 'Films & Séries',
    folder: 'decennies/2020s',
    movieSource: `${BASE_URL}/catalog/movie/tmdb.discover.movie.thriller_copy.mpei8vue.json`,
    serieSource: `${BASE_URL}/catalog/series/tmdb.discover.movie.thriller_copy_copy.mpeiaomb.json`,
    useMovieForCover: true
  },
  {
    id: 'decade_2010s',
    name: 'Années 2010',
    title: '2010 - 2019',
    caption: 'Films & Séries',
    folder: 'decennies/2010s',
    movieSource: `${BASE_URL}/catalog/movie/tmdb.discover.movie.2020s_copy.mpeiclt4.json`,
    serieSource: `${BASE_URL}/catalog/series/tmdb.discover.series.2020s_copy.mpeicmav.json`,
    useMovieForCover: true
  },
  {
    id: 'decade_2000s',
    name: 'Années 2000',
    title: '2000 - 2009',
    caption: 'Films & Séries',
    folder: 'decennies/2000s',
    movieSource: `${BASE_URL}/catalog/movie/tmdb.discover.movie.2010s_copy_copy.mpeidi01.json`,
    serieSource: `${BASE_URL}/catalog/series/tmdb.discover.series.2010s_copy_copy.mpeidie2.json`,
    useMovieForCover: true
  },
  {
    id: 'decade_1990s',
    name: 'Années 1990',
    title: '1990 - 1999',
    caption: 'Films & Séries',
    folder: 'decennies/1990s',
    movieSource: `${BASE_URL}/catalog/movie/tmdb.discover.movie.2010s_copy_copy_copy.mpeidr8i.json`,
    serieSource: `${BASE_URL}/catalog/series/tmdb.discover.series.2010s_copy_copy_copy.mpeidrkj.json`,
    useMovieForCover: true
  },
  {
    id: 'decade_1980s',
    name: 'Années 1980',
    title: '1980 - 1989',
    caption: 'Films & Séries',
    folder: 'decennies/1980s',
    movieSource: `${BASE_URL}/catalog/movie/tmdb.discover.movie.2010s_copy_copy_copy_copy.mpeie1e5.json`,
    serieSource: `${BASE_URL}/catalog/series/tmdb.discover.series.2010s_copy_copy_copy_copy.mpeie1qe.json`,
    useMovieForCover: true
  },
  {
    id: 'decade_1970s',
    name: 'Années 1970',
    title: '1970 - 1979',
    caption: 'Films & Séries',
    folder: 'decennies/1970s',
    movieSource: `${BASE_URL}/catalog/movie/tmdb.discover.movie.2010s_copy_copy_copy_copy_copy.mpeien08.json`,
    serieSource: `${BASE_URL}/catalog/series/tmdb.discover.series.2010s_copy_copy_copy_copy_copy.mpeienct.json`,
    useMovieForCover: true
  },
  {
    id: 'decade_1960s',
    name: 'Années 1960',
    title: '1960 - 1969',
    caption: 'Films & Séries',
    folder: 'decennies/1960s',
    movieSource: `${BASE_URL}/catalog/movie/tmdb.discover.movie.2010s_copy_copy_copy_copy_copy_copy.mpeig352.json`,
    serieSource: `${BASE_URL}/catalog/series/tmdb.discover.series.2010s_copy_copy_copy_copy_copy_copy.mpeig3ou.json`,
    useMovieForCover: true
  },
  {
    id: 'decade_1950s',
    name: 'Années 1950',
    title: '1950 - 1959',
    caption: 'Films & Séries',
    folder: 'decennies/1950s',
    movieSource: `${BASE_URL}/catalog/movie/tmdb.discover.movie.1960s_copy.mpeijg6u.json`,
    serieSource: `${BASE_URL}/catalog/series/tmdb.discover.series.1960s_copy.mpeijgoa.json`,
    useMovieForCover: true
  }
];

function isValidImage(url) {
  if (!url || typeof url !== 'string') return false;
  const lower = url.toLowerCase();
  return !(
    lower.includes('placeholder') || 
    lower.includes('no_poster') || 
    lower.includes('noposter') ||
    lower.includes('metahub.space') ||
    lower.includes('images.metahub.space') ||
    lower.includes('strem.io') ||
    lower.includes('stremio') ||
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

function buildCoverCarouselHtml(posters, title, bgImage, isFocus = false) {
  const dividerHtml = isFocus ? '<div class="divider"></div>' : '';
  
  // Keep only up to 5 posters
  const displayPosters = posters.slice(0, 5);
  while (displayPosters.length < 5 && displayPosters.length > 0) {
    displayPosters.push(displayPosters[0]); // fallback if fewer than 5
  }

  // Reorder for CSS layout: nth-child(3) is center
  const orderedPosters = [
    displayPosters[3], // left extremity
    displayPosters[1], // left middle
    displayPosters[0], // center
    displayPosters[2], // right middle
    displayPosters[4]  // right extremity
  ];

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
        background: #141724;
        overflow: hidden;
        position: relative;
        font-family: 'Montserrat', sans-serif;
      }

      .bg-img {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        z-index: 0;
      }

      /* Couche de flou et d'assombrissement sur le backdrop */
      .bg-blur {
        position: absolute;
        inset: -100px;
        background: rgba(10, 11, 16, 0.4);
        backdrop-filter: blur(60px);
        -webkit-backdrop-filter: blur(60px);
        z-index: 1;
      }

      .carousel {
        position: absolute;
        top: 60px;
        left: 0;
        width: 100%;
        height: 850px;
        display: flex;
        justify-content: center;
        align-items: center;
        perspective: 1600px;
        z-index: 5;
      }
      
      /* Affiches encore plus grandes */
      .poster {
        position: absolute;
        width: 500px;
        height: 750px;
        border-radius: 24px;
        box-shadow: 0 50px 100px rgba(0,0,0,0.8);
        -webkit-box-reflect: below 15px linear-gradient(transparent 65%, rgba(255,255,255,0.4));
        background: #1e2233;
        border: 1px solid rgba(255,255,255,0.1);
      }
      
      .poster img { 
        width: 100%; 
        height: 100%; 
        object-fit: cover; 
        border-radius: 24px;
      }

      /* Écartement et taille ajustés */
      .poster:nth-child(1) { transform: translateX(-760px) translateZ(-400px) rotateY(20deg); z-index: 1; opacity: 0.8; filter: brightness(0.7); }
      .poster:nth-child(2) { transform: translateX(-400px) translateZ(-180px) rotateY(14deg); z-index: 2; opacity: 0.95; filter: brightness(0.85); }
      .poster:nth-child(3) { transform: translateX(0) translateZ(100px) scale(1.05); z-index: 3; box-shadow: 0 60px 120px rgba(0,0,0,0.9); border: 2px solid rgba(255,255,255,0.3); }
      .poster:nth-child(4) { transform: translateX(400px) translateZ(-180px) rotateY(-14deg); z-index: 2; opacity: 0.95; filter: brightness(0.85); }
      .poster:nth-child(5) { transform: translateX(760px) translateZ(-400px) rotateY(-20deg); z-index: 1; opacity: 0.8; filter: brightness(0.7); }

      .overlay {
        position: absolute;
        inset: 0;
        pointer-events: none;
        z-index: 6;
        background: linear-gradient(to top, rgba(15, 17, 26, 0.98) 0%, rgba(15, 17, 26, 0.5) 20%, transparent 45%);
      }

      .text-container {
        position: absolute;
        bottom: 70px;
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
        font-size: 105px;
        font-weight: 900;
        text-transform: uppercase;
        letter-spacing: 12px;
        margin-bottom: 25px;
        white-space: nowrap;
        background: linear-gradient(180deg, #ffffff 30%, #b5b7c0 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        filter: drop-shadow(0 15px 30px rgba(0, 0, 0, 0.95));
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
    <img class="bg-img" src="${bgImage}" />
    <div class="bg-blur"></div>
    <div class="carousel">
      ${orderedPosters.map(url => `<div class="poster"><img src="${url}" /></div>`).join('')}
    </div>

    <div class="overlay"></div>

    <div class="text-container">
      <h1 class="main-title">${title}</h1>
      ${dividerHtml}
    </div>
  </body>
  </html>
  `;
}

function buildDashboardHtml(collections) {
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
      
      links += `<button onclick="copyLink('${baseUrl}/${col.folder}/backdrop.webp', this)">🖼️ Backdrop</button>`;
      if (col.title) {
        links += `<button onclick="copyLink('${baseUrl}/${col.folder}/cover.webp', this)">📱 Cover</button>`;
        links += `<button onclick="copyLink('${baseUrl}/${col.folder}/focus.webp', this)">🎯 Focus</button>`;
        links += `<button onclick="copyLink('${baseUrl}/${col.folder}/title.webp', this)">🔤 Title</button>`;
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
      <div style="width: 100%; margin-top: 40px; grid-column: 1 / -1;">
        <h2 style="font-size: 2rem; border-bottom: 2px solid rgba(255,255,255,0.1); padding-bottom: 10px; margin-bottom: 20px;">${cat.title}</h2>
        <div class="grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px;">
          ${itemsHtml}
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
    ${cardsHtml}
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
  const distDir = path.resolve(__dirname, '../../dist');
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

      const colDir = path.join(distDir, col.folder);
      if (!fs.existsSync(colDir)) {
        fs.mkdirSync(colDir, { recursive: true });
      }
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
      fs.writeFileSync(path.join(distDir, col.folder, 'backdrop.webp'), backdropBuf);
      console.log(`✅ Backdrop : dist/${col.folder}/backdrop.webp`);

      // --- 2. COVER & FOCUS ---
      if (col.title) {
        const firstValidItem = movies.find(m => isValidImage(m.background || m.backdrop)) || series.find(s => isValidImage(s.background || s.backdrop)) || movies[0] || {};
        const bgImage = firstValidItem.background || firstValidItem.backdrop || firstValidItem.poster || '';

        if (col.title) {
          await page.setContent(buildCoverCarouselHtml(mixedPosters, col.title, bgImage, false), { waitUntil: 'domcontentloaded' });

          await page.evaluate(async () => {
            const imgs = Array.from(document.querySelectorAll('img'));
            await Promise.race([
              Promise.all(imgs.map(img => {
                if (img.complete) return;
                return new Promise(resolve => { img.onload = resolve; img.onerror = resolve; });
              })),
              new Promise(resolve => setTimeout(resolve, 5000))
            ]);
          });

          const coverBuf = await page.screenshot({ type: 'webp', quality: 92 });
          fs.writeFileSync(path.join(distDir, col.folder, 'cover.webp'), coverBuf);
          console.log(`✅ Cover    : dist/${col.folder}/cover.webp`);
        }

        if (col.title) {
          await page.setContent(buildCoverCarouselHtml(mixedPosters, col.title, bgImage, true), { waitUntil: 'domcontentloaded' });

          await page.evaluate(async () => {
            const imgs = Array.from(document.querySelectorAll('img'));
            await Promise.race([
              Promise.all(imgs.map(img => {
                if (img.complete) return;
                return new Promise(resolve => { img.onload = resolve; img.onerror = resolve; });
              })),
              new Promise(resolve => setTimeout(resolve, 5000))
            ]);
          });

          const focusBuf = await page.screenshot({ type: 'webp', quality: 92 });
          fs.writeFileSync(path.join(distDir, col.folder, 'focus.webp'), focusBuf);
          console.log(`✅ Focus    : dist/${col.folder}/focus.webp`);
        }
      }

      // --- 3. TITLE (Uniquement si titleOutput est défini) ---
      if (col.title) {
        await page.setContent(buildTitleHtml(col.title), { waitUntil: 'domcontentloaded' });
        
        await page.evaluate(async () => {
          await document.fonts.ready;
        });

        const titleNode = await page.$('#title-node');
        const titleBuf = await titleNode.screenshot({ type: 'webp', omitBackground: true, quality: 92 });
        fs.writeFileSync(path.join(distDir, col.folder, 'title.webp'), titleBuf);
        console.log(`✅ Title    : dist/${col.folder}/title.webp`);
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

  console.log('\n🎉 Terminé ! Les visuels et le dashboard sont dans /dist.');
}

run().catch(err => {
  console.error('Erreur :', err.message);
  process.exit(1);
});