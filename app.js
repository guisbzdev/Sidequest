const app = document.querySelector("#app");

// Pequenos helpers deixam os templates abaixo mais fáceis de ler.
function createStars(rating) {
  const numericRating = Math.max(0, Math.min(5, Number(rating) || 0));
  const fullStars = Math.floor(numericRating);
  const halfStar = numericRating % 1 ? "½" : "";
  const emptyStars = 5 - Math.ceil(numericRating);
  return "★".repeat(fullStars) + halfStar + "☆".repeat(emptyStars);
}

function getRoute() {
  const hash = window.location.hash.replace(/^#\/?/, "");
  const [page = "home", value] = hash.split("/");
  return { page, value: value ? decodeURIComponent(value) : null };
}

function getImagePath(imageName) {
  return `assets/images/${imageName}`;
}

function getGameUrl(game) {
  return `#/jogo/${game.slug}`;
}

function getSynopsis(game) {
  // synopsis é opcional para facilitar a migração dos cadastros antigos.
  return game.synopsis || game.description;
}

function getGalleryImages(game) {
  // Sem uma galeria cadastrada, a capa funciona como um fallback elegante.
  return game.gallery?.length
    ? game.gallery
    : [{ src: game.image, alt: `Capa de ${game.title}` }];
}

function galleryTemplate(game) {
  const images = getGalleryImages(game);
  const slides = images
    .map((media, index) => {
      const number = String(index + 1).padStart(2, "0");
      if (media.type === "video") {
        return `<div class="gallery-slide gallery-video"><iframe src="${media.src}" title="${media.title || `Vídeo de ${game.title}`}" loading="lazy" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe><span>${number}</span></div>`;
      }
      return `<a class="gallery-slide" href="${getImagePath(media.src)}" target="_blank" rel="noreferrer"><img src="${getImagePath(media.src)}" alt="${media.alt || game.title}" loading="lazy" /><span>${number}</span></a>`;
    })
    .join("");

  return `<section class="game-gallery" aria-labelledby="gallery-title">
    <div class="gallery-heading"><div><p class="eyebrow">olhe mais de perto</p><h2 id="gallery-title">Galeria</h2></div><span class="gallery-count">${images.length} ${images.length === 1 ? "imagem" : "imagens"}</span></div>
    <div class="gallery-shell"><button class="gallery-button gallery-previous" aria-label="Imagem anterior">←</button><div class="gallery-track">${slides}</div><button class="gallery-button gallery-next" aria-label="Próxima imagem">→</button></div>
    ${images.length === 1 ? "<p class=\"gallery-hint\">Adicione mais imagens em <code>gallery</code> nos dados deste jogo.</p>" : ""}
  </section>`;
}

function getSearchableText(game) {
  return [game.title, game.category, game.genre, ...(game.categories || []), ...(game.tags || []), game.description].join(" ").toLowerCase();
}

function exploreTemplate() {
  const genres = [...new Set(games.flatMap((game) => game.categories || []))].filter((item) => !["Visual Novels", "Indies"].includes(item));
  const platforms = [...new Set(games.flatMap((game) => game.platforms || []))];
  const firstGame = games[0];

  return `<section class="explore-hero"><div><p class="eyebrow">modo descoberta</p><h1>Explore sem<br /><em>um mapa.</em></h1><p>Nem toda boa recomendação aparece na categoria óbvia. Misture filtros, siga uma vibe ou deixe a curadoria escolher um caminho para você.</p></div><div class="explore-symbol">✦<span>uma busca<br />com intenção</span></div></section>
  <section class="explore-page" id="explorar"><div class="discovery-card"><div><p class="eyebrow">a sugestão de agora</p><h2 id="surprise-title">${firstGame.title}</h2><p id="surprise-description">${firstGame.description}</p></div><a id="surprise-link" class="button button-accent" href="${getGameUrl(firstGame)}">abrir recomendação <span>↗</span></a><button id="surprise-button" class="discovery-refresh" type="button">sortear outra <span>⤨</span></button></div>
  <div class="explore-tools"><div><p class="eyebrow">encontre por afinidade</p><h2>Qual é a sua<br /><em>vibe hoje?</em></h2></div><div class="vibe-list"><button class="vibe-button active" data-vibe="Todos">tudo</button>${genres.map((genre) => `<button class="vibe-button" data-vibe="${genre}">${genre}</button>`).join("")}</div></div>
  <div class="explore-filters"><label>coleção<select id="explore-category"><option value="Todos">Todas</option><option value="Visual Novels">Visual Novels</option><option value="Indies">Indies</option></select></label><label>plataforma<select id="explore-platform"><option value="Todos">Todas</option>${platforms.map((platform) => `<option value="${platform}">${platform}</option>`).join("")}</select></label><label class="explore-search">buscar<input id="explore-search" type="search" placeholder="nome, gênero ou tag" /></label></div>
  <div class="explore-results-heading"><p class="eyebrow">catálogo aberto</p><span id="explore-count">${games.length} jogos encontrados</span></div><div id="explore-results" class="explore-grid"></div><p id="explore-empty" class="explore-empty" hidden>Nenhum jogo combina com essa busca. Tente misturar outros filtros.</p></section>`;
}

function cardTemplate(game) {
  const gameUrl = getGameUrl(game);

  return `<article class="game-card accent-${game.accent}">
    <a href="${gameUrl}" class="card-image">
      <img src="${getImagePath(game.image)}" alt="Capa de ${game.title}" loading="lazy" />
      <span class="card-category">${game.category}</span>
      <span class="card-arrow">↗</span>
    </a>
    <div class="card-content">
      <div class="card-meta">
        <span>${game.genre}</span>
        <span class="rating" aria-label="Nota ${game.rating} de 5">${createStars(game.rating)}</span>
      </div>
      <h3><a href="${gameUrl}">${game.title}</a></h3>
      <p>${game.description}</p>
      <a href="${gameUrl}" class="card-link">ver recomendação <span>→</span></a>
    </div>
  </article>`;
}

function carouselTemplate(title, categoryGames, options = {}) {
  const isTopPick = options.isTopPick === true;
  const rowClass = isTopPick ? " top-picks-row" : "";
  const eyebrow = isTopPick ? "seleção pessoal" : "coleção";

  return `<section class="category-row${rowClass}" aria-labelledby="category-${title}">
    <div class="category-heading">
      <div>
        <p class="eyebrow">${eyebrow}</p>
        <h2 id="category-${title}">${title}</h2>
      </div>
      <span class="carousel-count">${categoryGames.length} jogos</span>
    </div>
    <div class="carousel-shell">
      <button class="carousel-button carousel-previous" data-direction="previous" aria-label="Anterior em ${title}">←</button>
      <div class="carousel-track">${categoryGames.map(cardTemplate).join("")}</div>
      <button class="carousel-button carousel-next" data-direction="next" aria-label="Próximo em ${title}">→</button>
    </div>
  </section>`;
}

function getCollectionCategories(collectionGames, collectionName) {
  const categories = collectionGames.flatMap((game) => game.categories || []);
  return [...new Set(categories)].filter((category) => category !== collectionName);
}

function collectionTemplate(collectionName, collectionGames) {
  const categories = getCollectionCategories(collectionGames, collectionName);
  const topPicks = collectionGames.filter((game) => game.isTopPick);
  const categoryRows = categories.length ? categories : [collectionName];

  const topPicksSection = topPicks.length
    ? carouselTemplate("Top Picks", topPicks, { isTopPick: true })
    : "";

  const regularSections = categoryRows
    .map((category) => {
      const gamesInCategory = collectionGames.filter((game) =>
        game.categories?.includes(category)
      );
      return carouselTemplate(category, gamesInCategory);
    })
    .join("");

  return `<section class="collection-hero">
    <p class="eyebrow">catálogo sidequest</p>
    <h1>${collectionName}<br /><em>para descobrir.</em></h1>
    <p>Uma seleção de ${collectionName.toLowerCase()} escolhidos pela atmosfera, pelas ideias e pelas histórias que deixam alguma coisa depois que terminam.</p>
  </section>
  <section class="catalog-section collection-catalog" id="catalogo">
    <div class="collection-heading">
      <div>
        <p class="eyebrow">${collectionGames.length} recomendações</p>
        <h2>Explore por<br /><em>categoria.</em></h2>
      </div>
      <a class="back-link-inline" href="#/">← catálogo completo</a>
    </div>
    ${topPicksSection}
    ${regularSections}
  </section>`;
}

function homeTemplate() {
  const categories = categoryOrder.filter((category) =>
    games.some((game) => game.categories?.includes(category))
  );

  const catalogSections = categories
    .map((category) => {
      const categoryGames = games.filter((game) => game.categories?.includes(category));
      return carouselTemplate(category, categoryGames);
    })
    .join("");

  return `<section class="hero" aria-labelledby="hero-title">
    <div class="hero-copy">
      <p class="eyebrow">curadoria independente · 2026</p>
      <h1 id="hero-title">Jogos que<br /><em>ficam</em> com você.</h1>
      <p class="hero-description">Uma seleção feita com calma de visual novels e indies para descobrir histórias, mundos e ideias fora do óbvio.</p>
      <a class="button button-light" href="#catalogo">começar a explorar <span>↓</span></a>
    </div>
    <div class="hero-art">
      <div class="art-orbit orbit-one"></div>
      <div class="art-orbit orbit-two"></div>
      <a class="hero-card card-back" href="#/jogo/until-then" aria-label="Abrir recomendação de Until Then"><img src="assets/images/until-then/until-then-thumb.png" alt="Capa de Until Then" /></a>
      <a class="hero-card card-front" href="#/jogo/the-house-in-fata-morgana" aria-label="Abrir recomendação de The House in Fata Morgana"><img src="assets/images/the-house-in-fata-morgana/hifm.jpg" alt="Capa de The House in Fata Morgana" /></a>
      <div class="hero-label"><span>01</span> destaque da semana</div>
    </div>
  </section>
  <section class="catalog-section" id="catalogo">
    <div class="section-heading">
      <div><p class="eyebrow">o catálogo</p><h2>Encontre sua<br /><em>próxima história.</em></h2></div>
      <p class="section-intro">Navegue pelas coleções e abra qualquer card para ver a recomendação completa.</p>
    </div>
    ${catalogSections}
  </section>
  <section class="about-section" id="sobre">
    <p class="eyebrow">manifesto</p>
    <h2>Menos algoritmo.<br /><em>Mais intenção.</em></h2>
    <p>Sidequest é um caderno aberto de recomendações. Cada jogo aqui tem um motivo para existir — uma atmosfera, uma mecânica, uma personagem ou uma pergunta que continua na cabeça depois dos créditos. O site funciona como uma recomendação pessoal minha para você, só de jogos com personalidade de verdade, idenpendente se são jogos famosos ou desconhecidos, pois oque mais importa é a experiência valer a pena.</p>
    <a class="text-link" href="mailto:oi@sidequest.local">tem uma recomendação? <span>↗</span></a>
  </section>`;
}

function detailTemplate(game) {
  const relatedLink = game.link
    ? `<a class="button button-accent" href="${game.link}" target="_blank" rel="noreferrer">onde encontrar <span>↗</span></a>`
    : "";

  return `<a class="back-link" href="#/">← voltar para o catálogo</a>
  <article class="detail-page">
    <div class="detail-cover accent-${game.accent}"><img src="${getImagePath(game.image)}" alt="Capa de ${game.title}" /></div>
    <div class="detail-copy">
      <p class="eyebrow">minha recomendação · ${game.category}</p>
      <h1>${game.title}</h1>
      <div class="detail-rating"><span>${createStars(game.rating)}</span><small>${(Number(game.rating) || 0).toFixed(1)} / 5</small></div>
      <p class="detail-lead">${getSynopsis(game)}</p>
      <div class="detail-block"><p class="detail-label">por que jogar</p><p>${game.recommendation}</p></div>
      <div class="detail-info">
        <div><p class="detail-label">gênero</p><p>${game.genre}</p></div>
        <div><p class="detail-label">plataformas</p><p>${(game.platforms || []).join(" · ") || "Não informado"}</p></div>
      </div>
      <div class="tag-list">${(game.tags || []).map((tag) => `<span>${tag}</span>`).join("")}</div>
      ${relatedLink}
    </div>
  </article>`;
}

function notFoundTemplate() {
  return `<section class="not-found"><p class="eyebrow">404</p><h1>Jogo não encontrado.</h1><p>Esse cadastro não existe ou foi removido.</p><a class="button button-accent" href="#/">voltar ao catálogo</a></section>`;
}

function wireCarousels() {
  document.querySelectorAll(".category-row").forEach((row) => {
    const track = row.querySelector(".carousel-track");
    const firstCard = track.querySelector(".game-card");
    const getStep = () => Math.max(track.clientWidth * 0.8, firstCard?.clientWidth || 260);

    row.querySelector(".carousel-previous").addEventListener("click", () => {
      track.scrollBy({ left: -getStep(), behavior: "smooth" });
    });
    row.querySelector(".carousel-next").addEventListener("click", () => {
      track.scrollBy({ left: getStep(), behavior: "smooth" });
    });
  });
}

function wireGallery() {
  const track = document.querySelector(".gallery-track");
  if (!track) return;

  const step = () => track.clientWidth * 0.86;
  document.querySelector(".gallery-previous").addEventListener("click", () => {
    track.scrollBy({ left: -step(), behavior: "smooth" });
  });
  document.querySelector(".gallery-next").addEventListener("click", () => {
    track.scrollBy({ left: step(), behavior: "smooth" });
  });
}

function wireExplore() {
  const results = document.querySelector("#explore-results");
  if (!results) return;

  const explorePage = document.querySelector(".explore-page");
  const exploreTools = document.querySelector(".explore-tools");
  const visualNovels = games.filter((game) => game.category === "Visual Novels");
  const indies = games.filter((game) => game.category === "Indies");
  const generalCategories = categoryOrder.filter((category) =>
    !["Visual Novels", "Indies"].includes(category) &&
    games.some((game) => game.categories?.includes(category))
  );
  const exploreCarousels = document.createElement("div");
  exploreCarousels.className = "explore-carousels";
  exploreCarousels.innerHTML = [
    carouselTemplate("Visual Novels", visualNovels),
    carouselTemplate("Indies", indies),
    ...generalCategories.map((category) => carouselTemplate(
      category,
      games.filter((game) => game.categories?.includes(category))
    ))
  ].join("");
  explorePage.insertBefore(exploreCarousels, exploreTools);
  wireCarousels();

  const categorySelect = document.querySelector("#explore-category");
  const platformSelect = document.querySelector("#explore-platform");
  const searchInput = document.querySelector("#explore-search");
  const count = document.querySelector("#explore-count");
  const emptyState = document.querySelector("#explore-empty");
  let selectedVibe = "Todos";

  function renderResults() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    const filteredGames = games.filter((game) => {
      const matchesCategory = categorySelect.value === "Todos" || game.category === categorySelect.value;
      const matchesPlatform = platformSelect.value === "Todos" || game.platforms?.includes(platformSelect.value);
      const matchesVibe = selectedVibe === "Todos" || game.categories?.includes(selectedVibe);
      const matchesSearch = !searchTerm || getSearchableText(game).includes(searchTerm);
      return matchesCategory && matchesPlatform && matchesVibe && matchesSearch;
    });

    results.innerHTML = filteredGames.map(cardTemplate).join("");
    count.textContent = `${filteredGames.length} ${filteredGames.length === 1 ? "jogo encontrado" : "jogos encontrados"}`;
    emptyState.hidden = filteredGames.length > 0;
  }

  document.querySelectorAll(".vibe-button").forEach((button) => {
    button.addEventListener("click", () => {
      selectedVibe = button.dataset.vibe;
      document.querySelectorAll(".vibe-button").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      renderResults();
    });
  });

  categorySelect.addEventListener("change", renderResults);
  platformSelect.addEventListener("change", renderResults);
  searchInput.addEventListener("input", renderResults);

  document.querySelector("#surprise-button").addEventListener("click", () => {
    const randomGame = games[Math.floor(Math.random() * games.length)];
    document.querySelector("#surprise-title").textContent = randomGame.title;
    document.querySelector("#surprise-description").textContent = randomGame.description;
    document.querySelector("#surprise-link").href = getGameUrl(randomGame);
  });

  renderResults();
}

function render() {
  const { page, value } = getRoute();
  const game = page === "jogo" ? games.find((item) => item.slug === value) : null;
  const collectionName = page === "indies" ? "Indies" : page === "visual-novels" ? "Visual Novels" : null;
  const collectionGames = collectionName ? games.filter((item) => item.category === collectionName) : [];
  const isUnknownGame = page === "jogo" && !game;

  if (game) {
    app.innerHTML = detailTemplate(game);
  } else if (isUnknownGame) {
    app.innerHTML = notFoundTemplate();
  } else if (collectionName) {
    app.innerHTML = collectionTemplate(collectionName, collectionGames);
  } else {
    app.innerHTML = homeTemplate();
  }

  if (!game && !isUnknownGame) {
    wireCarousels();
  }
  if (game) {
    app.insertAdjacentHTML("beforeend", galleryTemplate(game));
    wireGallery();
  }
  if (page === "explorar") {
    wireExplore();
  }

  if (page === "catalogo" || page === "sobre") {
    document.getElementById(page)?.scrollIntoView({ behavior: "smooth" });
  } else {
    window.scrollTo({ top: 0, behavior: "instant" });
  }
}

window.addEventListener("hashchange", render);
render();
