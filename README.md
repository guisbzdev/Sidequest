# Sidequest

Catálogo local de recomendações de Visual Novels e jogos Indies. O projeto usa apenas HTML, CSS e JavaScript, sem build ou framework obrigatório.

## Como adicionar um jogo

1. Crie uma pasta com o mesmo nome do `slug` em `assets/images/<slug>/`.
2. Coloque nessa pasta a imagem da capa e as imagens da galeria.
3. Abra `data/games.js`.
4. Copie um objeto existente dentro de `games`.
5. Altere os dados do novo jogo:

```js
{
  slug: "nome-do-jogo",             // URL: #/jogo/nome-do-jogo
  title: "Nome do jogo",
  category: "Indies",              // "Visual Novels" ou "Indies"
  isTopPick: false,                 // true para aparecer no Top Picks
  categories: ["Aventura", "RPG"], // carrosséis desta coleção
  genre: "Aventura · RPG",
  tags: ["Exploração", "História"],
  platforms: ["PC", "Nintendo Switch"],
  rating: 4.5,                      // número entre 0 e 5
  image: "nome-do-jogo/capa.jpg",  // caminho relativo a assets/images
  accent: "violet",                // detalhe visual do card
  description: "Texto curto exibido no card.",
  synopsis: "Sinopse exibida na página individual.",
  recommendation: "Minha opinião e o motivo da recomendação.",
  link: "https://exemplo.com/onde-encontrar",
  gallery: [
    { type: "image", src: "nome-do-jogo/cena-01.jpg", alt: "Cena do jogo" },
    { type: "image", src: "nome-do-jogo/cena-02.jpg", alt: "Outra cena do jogo" },
    { type: "video", src: "https://www.youtube.com/embed/ID_DO_VIDEO", title: "Trailer do jogo" }
  ]
}
```

`synopsis` é opcional por compatibilidade com os cadastros antigos. Se ele não existir, a página individual usa `description` como fallback. `link` também pode ser deixado vazio; nesse caso o botão externo não aparece.

`gallery` também é opcional. Use `type: "image"` para imagens e `type: "video"` para incorporações do YouTube. Se não houver imagens cadastradas, a página usa a capa como fallback e informa no rodapé da galeria onde adicionar novas imagens.

## Categorias e páginas

- `category` define a coleção principal do jogo e determina se ele aparece em `#/visual-novels` ou `#/indies`.
- `categories` define os carrosséis em que o jogo aparece. Para criar uma nova categoria, basta usar um novo nome nesse array e, se quiser controlar a ordem na home, adicioná-lo a `categoryOrder`.
- `isTopPick` controla a seção especial Top Picks da coleção principal.

As páginas individuais são criadas automaticamente pela rota `#/jogo/slug`. Não é necessário criar um novo HTML para cada jogo.

## Abrir localmente

Como o projeto é estático, é possível abrir `index.html` diretamente no navegador. Para evitar limitações do navegador com arquivos locais, também pode usar qualquer servidor local simples, por exemplo:

```bash
npx serve .
```
