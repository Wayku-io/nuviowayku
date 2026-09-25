document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const searchInput = document.getElementById('search-input');
  const typeRadios = document.querySelectorAll('input[name="search-type"]');
  const resultsGrid = document.getElementById('search-results');
  const selectedList = document.getElementById('selected-list');
  const emptyListMsg = document.getElementById('empty-list-msg');
  const itemCountBadge = document.getElementById('item-count');
  const clearBtn = document.getElementById('clear-btn');
  const generateBtn = document.getElementById('generate-btn');
  const catalogNameInput = document.getElementById('catalog-name');
  const sortSelect = document.getElementById('sort-select');
  const loadBtn = document.getElementById('load-btn');

  const settingsBtn = document.getElementById('settings-btn');
  const settingsModal = document.getElementById('settings-modal');
  const closeSettingsBtn = document.getElementById('close-settings');
  const saveSettingsBtn = document.getElementById('save-settings');
  const tmdbKeyInput = document.getElementById('tmdb-key');
  const githubTokenInput = document.getElementById('github-token');
  
  const resultContainer = document.getElementById('result-container');
  const resultUrl = document.getElementById('result-url');
  const copyUrlBtn = document.getElementById('copy-url-btn');
  
  const loadModal = document.getElementById('load-modal');
  const closeLoadBtn = document.getElementById('close-load');
  const loadList = document.getElementById('load-list');

  // --- State ---
  let tmdbKey = localStorage.getItem('tmdb_api_key') || '';
  let githubToken = localStorage.getItem('github_token') || '';
  let selectedItems = []; // Array of objects { id, type, title, year, poster }
  let searchTimeout = null;
  let loadedCatalogName = null;

  function updateGenerateButtonState() {
    const currentName = catalogNameInput.value.trim();
    if (loadedCatalogName && currentName === loadedCatalogName) {
      generateBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
        Mettre à jour la collection
      `;
    } else {
      generateBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        Créer la collection
      `;
    }
  }

  catalogNameInput.addEventListener('input', updateGenerateButtonState);
  updateGenerateButtonState();

  let sortableInstance = new Sortable(selectedList, {
    animation: 150,
    ghostClass: 'glass-bg',
    onEnd: (evt) => {
      // Reorder array based on new DOM order
      const newIndex = evt.newIndex;
      const oldIndex = evt.oldIndex;
      
      const item = selectedItems.splice(oldIndex, 1)[0];
      selectedItems.splice(newIndex, 0, item);
      
      // Si l'utilisateur réorganise manuellement, on repasse le select sur "Manuel"
      sortSelect.value = "manual";
    }
  });

  // --- Sorting Logic ---
  sortSelect.addEventListener('change', (e) => {
    const sortBy = e.target.value;
    if (sortBy === 'manual') return; // Ne rien faire, laisser l'ordre actuel
    
    selectedItems.sort((a, b) => {
      if (sortBy === 'year-asc') {
        return parseInt(a.year || 0) - parseInt(b.year || 0);
      } else if (sortBy === 'year-desc') {
        return parseInt(b.year || 0) - parseInt(a.year || 0);
      } else if (sortBy === 'alpha-asc') {
        return a.title.localeCompare(b.title);
      }
    });
    
    renderList();
  });

  // --- Settings Logic ---
  if (!tmdbKey || !githubToken) {
    settingsModal.classList.remove('hidden');
  }

  settingsBtn.addEventListener('click', () => {
    tmdbKeyInput.value = tmdbKey;
    githubTokenInput.value = githubToken;
    settingsModal.classList.remove('hidden');
  });

  closeSettingsBtn.addEventListener('click', () => {
    settingsModal.classList.add('hidden');
  });

  saveSettingsBtn.addEventListener('click', () => {
    tmdbKey = tmdbKeyInput.value.trim();
    githubToken = githubTokenInput.value.trim();
    localStorage.setItem('tmdb_api_key', tmdbKey);
    localStorage.setItem('github_token', githubToken);
    settingsModal.classList.add('hidden');
    if (searchInput.value) performSearch();
  });

  // --- Load Logic ---
  loadBtn.addEventListener('click', async () => {
    if (!githubToken) {
      alert("Veuillez configurer votre GitHub Token pour charger vos collections depuis le cloud.");
      settingsModal.classList.remove('hidden');
      return;
    }
    
    loadModal.classList.remove('hidden');
    loadList.innerHTML = '<div style="text-align:center; padding: 2rem;"><span class="badge">Chargement...</span></div>';
    
    try {
      const owner = "Wayku-io";
      const repo = "nuviowayku";
      const path = `tools/catalog-generator/manifests`;
      const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
      
      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      
      if (res.status === 404) {
        loadList.innerHTML = '<div class="empty-state">Aucune collection trouvée sur votre GitHub.</div>';
        return;
      }
      
      if (!res.ok) throw new Error("Erreur API");
      
      const directories = await res.json();
      if (!Array.isArray(directories) || directories.length === 0) {
        loadList.innerHTML = '<div class="empty-state">Aucune collection trouvée.</div>';
        return;
      }
      
      loadList.innerHTML = '';
      for (const dir of directories) {
        if (dir.type === 'dir') {
          const rowDiv = document.createElement('div');
          rowDiv.style.display = 'flex';
          rowDiv.style.gap = '0.5rem';

          const btn = document.createElement('button');
          btn.className = 'btn btn-secondary';
          btn.style.flex = '1';
          btn.style.justifyContent = 'flex-start';
          
          let displayName = dir.name.replace('custom.', '').replace(/_/g, ' ');
          displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
          
          btn.style.minWidth = '0'; // Important for ellipsis in flex
          
          btn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
            <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-align: left;">${displayName}</span>
          `;
          
          btn.addEventListener('click', async () => {
            btn.innerHTML = 'Chargement...';
            try {
              const manifestUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${dir.path}/manifest.json`;
              const mRes = await fetch(manifestUrl, {
                headers: {
                  'Authorization': `Bearer ${githubToken}`,
                  'Accept': 'application/vnd.github.v3+json'
                }
              });
              if (!mRes.ok) throw new Error("Manifeste introuvable");
              const mData = await mRes.json();
              
              const jsonStr = decodeURIComponent(escape(atob(mData.content)));
              const manifest = JSON.parse(jsonStr);
              
              let allMetas = [];
              if (manifest.metas) {
                // Rétrocompatibilité avec les anciens manifestes
                allMetas = manifest.metas;
              } else {
                // Nouveau système : aller chercher les fichiers catalog/{type}/{id}.json
                for (const cat of (manifest.catalogs || [])) {
                  const catUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${dir.path}/catalog/${cat.type}/${cat.id}.json`;
                  try {
                    const cRes = await fetch(catUrl, { headers: { 'Authorization': `Bearer ${githubToken}` }});
                    if (cRes.ok) {
                      const cData = await cRes.json();
                      const cObj = JSON.parse(decodeURIComponent(escape(atob(cData.content))));
                      if (cObj.metas) allMetas = allMetas.concat(cObj.metas);
                    }
                  } catch(e) { console.warn("Erreur chargement catalogue", e); }
                }
              }

              catalogNameInput.value = manifest.name || displayName;
              loadedCatalogName = catalogNameInput.value;
              selectedItems = allMetas.map(meta => ({
                id: meta.id,
                type: meta.type === 'tv' ? 'series' : meta.type,
                title: meta.name || meta.title,
                year: meta.year || meta.releaseInfo || 'N/A',
                poster: meta.poster
              }));
              renderList();
              updateGenerateButtonState();
              
              loadModal.classList.add('hidden');
              
              const jsDelivrUrl = `https://cdn.jsdelivr.net/gh/${owner}/${repo}@main/${dir.path}/manifest.json`;
              resultUrl.value = jsDelivrUrl;
              resultContainer.classList.remove('hidden');
              
            } catch (e) {
              alert("Erreur lors de la lecture de la collection.");
              btn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                ${displayName}
              `;
            }
          });

          const delBtn = document.createElement('button');
          delBtn.className = 'btn btn-secondary';
          delBtn.style.padding = '0.5rem';
          delBtn.title = "Supprimer la collection";
          const trashIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--danger);"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`;
          delBtn.innerHTML = trashIcon;

          delBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            if (!confirm(`Voulez-vous vraiment supprimer définitivement "${displayName}" de votre GitHub ?`)) return;
            
            delBtn.innerHTML = '...';
            try {
              const manifestPath = `${dir.path}/manifest.json`;
              const url = `https://api.github.com/repos/${owner}/${repo}/contents/${manifestPath}`;
              
              // Fonction utilitaire de suppression
              async function deleteFile(filePath) {
                const u = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;
                const res = await fetch(u, { headers: { 'Authorization': `Bearer ${githubToken}` }});
                if (!res.ok) return; // Fichier n'existe plus
                const data = await res.json();
                await fetch(u, {
                  method: 'DELETE',
                  headers: { 'Authorization': `Bearer ${githubToken}`, 'Content-Type': 'application/json' },
                  body: JSON.stringify({ message: `CatalogGen: Delete file ${filePath}`, sha: data.sha, branch: 'main' })
                });
                fetch(`https://purge.jsdelivr.net/gh/${owner}/${repo}@main/${filePath}`).catch(() => {});
              }

              // 1. Lire le manifest pour savoir quels catalogues supprimer
              const getRes = await fetch(url, { headers: { 'Authorization': `Bearer ${githubToken}` }});
              if (getRes.ok) {
                const fileData = await getRes.json();
                const mObj = JSON.parse(decodeURIComponent(escape(atob(fileData.content))));
                // Supprimer les fichiers catalogues
                for (const cat of (mObj.catalogs || [])) {
                  await deleteFile(`${dir.path}/catalog/${cat.type}/${cat.id}.json`);
                }
              }
              
              // 2. Supprimer le manifest.json lui-même
              await deleteFile(manifestPath);
              
              // Retirer de l'interface
              rowDiv.remove();
              
              if (loadList.children.length === 0) {
                loadList.innerHTML = '<div class="empty-state">Aucune collection trouvée.</div>';
              }
              
              // Si la collection chargée est celle supprimée, on vide l'interface
              if (loadedCatalogName === displayName || catalogNameInput.value === displayName) {
                 clearBtn.click();
              }
              
              // Purger JSDelivr silencieusement
              fetch(`https://purge.jsdelivr.net/gh/${owner}/${repo}@main/${manifestPath}`).catch(() => {});
              
            } catch (err) {
              alert("Erreur lors de la suppression: " + err.message);
              delBtn.innerHTML = trashIcon;
            }
          });

          const copyBtn = document.createElement('button');
          copyBtn.className = 'btn btn-secondary';
          copyBtn.style.padding = '0.5rem';
          copyBtn.title = "Copier le lien direct";
          const copyIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
          copyBtn.innerHTML = copyIcon;

          copyBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const jsDelivrUrl = `https://cdn.jsdelivr.net/gh/${owner}/${repo}@main/${dir.path}/manifest.json`;
            
            const tempInput = document.createElement('input');
            tempInput.value = jsDelivrUrl;
            document.body.appendChild(tempInput);
            tempInput.select();
            document.execCommand('copy');
            document.body.removeChild(tempInput);
            
            copyBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #22c55e"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
            setTimeout(() => { copyBtn.innerHTML = copyIcon; }, 1500);
          });

          rowDiv.appendChild(btn);
          rowDiv.appendChild(copyBtn);
          rowDiv.appendChild(delBtn);
          loadList.appendChild(rowDiv);
        }
      }
      
      if (loadList.innerHTML === '') {
        loadList.innerHTML = '<div class="empty-state">Aucune collection trouvée.</div>';
      }
      
    } catch (e) {
      loadList.innerHTML = `<div class="empty-state" style="color:var(--danger)">Erreur: ${e.message}</div>`;
    }
  });

  closeLoadBtn.addEventListener('click', () => {
    loadModal.classList.add('hidden');
  });

  // --- Search Logic ---
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(performSearch, 500);
  });

  typeRadios.forEach(radio => {
    radio.addEventListener('change', performSearch);
  });

  async function performSearch() {
    const query = searchInput.value.trim();
    if (!query) {
      resultsGrid.innerHTML = '';
      return;
    }
    if (!tmdbKey) {
      resultsGrid.innerHTML = '<div class="empty-state">Veuillez renseigner votre clé API TMDB dans les paramètres.</div>';
      return;
    }

    const type = document.querySelector('input[name="search-type"]:checked').value;
    const baseUrl = `https://api.themoviedb.org/3/search/${type}?api_key=${tmdbKey}&query=${encodeURIComponent(query)}&language=fr-FR`;

    try {
      // Fetch 2 pages pour avoir plus de résultats (40 max au lieu de 20)
      const [res1, res2] = await Promise.all([
        fetch(`${baseUrl}&page=1`),
        fetch(`${baseUrl}&page=2`)
      ]);
      
      let allResults = [];
      if (res1.ok) {
        const data1 = await res1.json();
        allResults = allResults.concat(data1.results || []);
      }
      if (res2.ok) {
        const data2 = await res2.json();
        allResults = allResults.concat(data2.results || []);
      }
      
      // Trier par popularité pour remonter les vrais films de la franchise (pertinence)
      allResults.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
      
      // Dédupliquer au cas où
      const uniqueResults = [];
      const seen = new Set();
      for (const r of allResults) {
        if (!seen.has(r.id)) {
          seen.add(r.id);
          uniqueResults.push(r);
        }
      }
      
      displayResults(uniqueResults, type);
    } catch (err) {
      resultsGrid.innerHTML = `<div class="empty-state" style="color: var(--danger)">Erreur de recherche. Vérifiez votre clé API.</div>`;
    }
  }

  function displayResults(results, type) {
    if (!results || results.length === 0) {
      resultsGrid.innerHTML = '<div class="empty-state">Aucun résultat trouvé.</div>';
      return;
    }

    resultsGrid.innerHTML = '';
    
    // Filter items without poster
    const validResults = results.filter(r => r.poster_path);

    validResults.forEach(item => {
      const title = type === 'movie' ? item.title : item.name;
      const date = type === 'movie' ? item.release_date : item.first_air_date;
      const year = date ? date.split('-')[0] : 'N/A';
      const posterUrl = `https://image.tmdb.org/t/p/w200${item.poster_path}`;
      
      // Use standard Stremio ID prefix: tmdb:ID for movies, tmdb:ID for series
      const tmdbPrefixId = `tmdb:${item.id}`;
      // Stremio attend 'series' pour les séries, pas 'tv'
      const stremioType = type === 'tv' ? 'series' : 'movie';

      const card = document.createElement('div');
      card.className = 'movie-card';
      card.innerHTML = `
        <img src="${posterUrl}" alt="${title}">
        <div class="overlay">
          <div class="title">${title} (${year})</div>
        </div>
      `;

      card.addEventListener('click', () => {
        addItemToList({
          id: tmdbPrefixId,
          type: stremioType,
          title: title,
          year: year,
          poster: posterUrl
        });
      });

      resultsGrid.appendChild(card);
    });
  }

  // --- List Logic ---
  function addItemToList(item) {
    // Avoid duplicates
    if (selectedItems.find(i => i.id === item.id)) return;

    selectedItems.push(item);
    renderList();
  }

  function renderList() {
    if (selectedItems.length === 0) {
      selectedList.innerHTML = '';
      selectedList.appendChild(emptyListMsg);
      itemCountBadge.textContent = '0 élément';
      return;
    }

    selectedList.innerHTML = '';
    selectedItems.forEach((item, index) => {
      const li = document.createElement('div');
      li.className = 'list-item';
      li.dataset.index = index;
      li.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--text-secondary); cursor: grab"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
        <img src="${item.poster}" alt="poster">
        <div class="list-item-info">
          <div class="list-item-title">${item.title}</div>
          <div class="list-item-year">${item.type === 'movie' ? 'Film' : 'Série'} • ${item.year}</div>
        </div>
        <button class="remove-btn" title="Retirer">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      `;

      li.querySelector('.remove-btn').addEventListener('click', () => {
        selectedItems.splice(index, 1);
        renderList();
      });

      selectedList.appendChild(li);
    });

    itemCountBadge.textContent = `${selectedItems.length} élément${selectedItems.length > 1 ? 's' : ''}`;
  }

  clearBtn.addEventListener('click', () => {
    selectedItems = [];
    loadedCatalogName = null;
    catalogNameInput.value = '';
    updateGenerateButtonState();
    renderList();
  });

  // --- Export Logic ---
  generateBtn.addEventListener('click', async () => {
    if (selectedItems.length === 0) {
      alert("Veuillez ajouter des éléments à la collection avant de générer.");
      return;
    }
    
    if (!githubToken) {
      alert("Veuillez configurer votre GitHub Token dans les paramètres pour générer l'URL.");
      settingsModal.classList.remove('hidden');
      return;
    }

    const name = catalogNameInput.value.trim() || "Ma Collection";
    const id = "custom." + name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    
    const metas = selectedItems.map(item => ({
      id: item.id,
      type: item.type,
      name: item.title,
      poster: item.poster,
      year: item.year
    }));

    const uniqueTypes = [...new Set(metas.map(m => m.type))];
    if (uniqueTypes.length === 0) uniqueTypes.push('movie');

    const manifest = {
      id: "org.custom.catalog." + id,
      version: "1.0.0",
      name: name,
      description: "Custom catalog generated via CatalogGen",
      resources: ["catalog"], // Pas de "meta", Stremio utilisera TMDB/Cineta par défaut
      types: uniqueTypes,
      catalogs: uniqueTypes.map(t => ({
        type: t,
        id: id,
        name: name
      }))
    };

    generateBtn.innerHTML = "Création du fichier...";
    generateBtn.disabled = true;

    try {
      const owner = "Wayku-io";
      const repo = "nuviowayku";
      
      // Fonction utilitaire pour pousser un fichier sur GitHub
      async function pushFile(filePath, contentObj, commitMessage) {
        const url = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;
        let sha = null;
        const getRes = await fetch(url, { headers: { 'Authorization': `Bearer ${githubToken}` }});
        if (getRes.ok) {
          const getData = await getRes.json();
          sha = getData.sha;
        }
        const contentStr = JSON.stringify(contentObj, null, 2);
        const base64Content = btoa(unescape(encodeURIComponent(contentStr)));
        const body = { message: commitMessage, content: base64Content, branch: 'main' };
        if (sha) body.sha = sha;
        const putRes = await fetch(url, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${githubToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        });
        if (!putRes.ok) throw new Error(`Erreur GitHub API sur ${filePath}`);
        
        // Purger JSDelivr silencieusement
        fetch(`https://purge.jsdelivr.net/gh/${owner}/${repo}@main/${filePath}`).catch(() => {});
      }

      const manifestPath = `tools/catalog-generator/manifests/${id}/manifest.json`;

      // 1. Pousser le manifest.json
      await pushFile(manifestPath, manifest, `CatalogGen: Update manifest for ${name}`);

      // 2. Pousser les fichiers de catalogues (un par type de média)
      // C'est ce que Stremio et AIO Metadata attendent pour lire le contenu statique
      for (const type of uniqueTypes) {
        const typeMetas = metas.filter(m => m.type === type);
        const catalogObj = { metas: typeMetas };
        const catPath = `tools/catalog-generator/manifests/${id}/catalog/${type}/${id}.json`;
        await pushFile(catPath, catalogObj, `CatalogGen: Update ${type} catalog for ${name}`);
      }

      // 3. Construire l'URL JSDelivr et l'afficher
      const jsDelivrUrl = `https://cdn.jsdelivr.net/gh/${owner}/${repo}@main/${manifestPath}`;
      
      loadedCatalogName = name;
      
      resultUrl.value = jsDelivrUrl;
      resultContainer.classList.remove('hidden');
      
    } catch (err) {
      alert("Erreur lors de la génération: " + err.message);
    } finally {
      updateGenerateButtonState();
      generateBtn.disabled = false;
    }
  });

  copyUrlBtn.addEventListener('click', () => {
    resultUrl.select();
    document.execCommand('copy');
    const originalText = copyUrlBtn.textContent;
    copyUrlBtn.textContent = 'Copié !';
    setTimeout(() => copyUrlBtn.textContent = originalText, 1500);
  });

});
