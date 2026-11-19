# CapTei Headwear

Site de loja de bonés feito em HTML, CSS e JavaScript puro (sem framework e sem build).

## Páginas

- `index.html` — página inicial (hero, categorias, favoritos, manifesto, newsletter)
- `catalogo.html` — catálogo com filtros por categoria, cor, preço e busca (`?cat=Aba%20curva`)
- `login.html` — entrar / criar conta (abas, `?tab=register`)

## Funcionalidades

- Carrinho lateral salvo no `localStorage` (chave `capesnc_cart`)
- Produtos definidos em `script.js` (`PRODUCTS`), com imagem SVG gerada no código como reserva se a foto faltar
- Login, cadastro, newsletter e checkout são apenas demonstração (sem back-end)

## Estrutura

```
index.html
catalogo.html
login.html
style.css
script.js
img/
  logo.svg
  bone-vinho.jpg
  bone-oliva.jpg
  bone-preto.jpg
  modelo.jpg
```

## Rodar localmente

Abra `index.html` no navegador, ou sirva a pasta:

```bash
python3 -m http.server 8000
```

## Publicar

É um site estático: funciona direto no GitHub Pages (Settings → Pages → branch `main`, pasta `/`) ou na Vercel.
