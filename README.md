<div align="center">

[![Typing SVG](https://readme-typing-svg.demolab.com?font=Fira+Code&weight=500&size=22&pause=1000&color=2D2D2D&center=true&vCenter=true&width=600&lines=hey%2C+I'm+Ziike+%F0%9F%91%8B;I+build+things+for+the+web;with+care%2C+craft%2C+%26+a+few+too+many+tabs+open.)](https://git.io/typing-svg)

</div>

---

I'm a developer who likes interfaces that feel **considered** — small, sturdy, and a little bit human.  
I care about the seams: the empty states, the error copy, the way a thing _feels_ when you actually use it.

When I'm not writing code you'll find me sketching, tinkering with side projects, or overengineering my note-taking system.  
Currently open to interesting work → **domchuks75@gmail.com**

---

### 🛠 things I reach for

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![CSS](https://img.shields.io/badge/CSS-1572B6?style=flat-square&logo=css3&logoColor=white)

---

### 📦 recent work

| Project                                                                      | What it is                                                                             |
| ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| [**Git Frames**](https://github.com/iamziike/git-frames)                     | VS Code extension — breaks a pile of staged changes into clean, self-contained commits |
| [**Code Flow Visualizer**](https://github.com/iamziike/code-flow-visualizer) | sketch how a system flows as connected blocks, then turn it into code                  |
| [**This Portfolio**](https://github.com/iamziike/iamziike)                   | hand-drawn, sketchbook-style site built on a pencil design system                      |

---

### 📊 by the numbers

<div align="center">

<img height="160" src="https://github-readme-stats.vercel.app/api?username=iamziike&show_icons=true&theme=default&hide_border=true&count_private=true&include_all_commits=true" />
<img height="160" src="https://github-readme-stats.vercel.app/api/top-langs/?username=iamziike&layout=compact&theme=default&hide_border=true&langs_count=6" />

</div>

<div align="center">

[![GitHub Streak](https://streak-stats.demolab.com?user=iamziike&theme=default&hide_border=true&date_format=j%20M%5B%20Y%5D)](https://git.io/streak-stats)

</div>

---

### 🐍 contribution graph

<div align="center">

![snake animation](https://raw.githubusercontent.com/iamziike/iamziike/output/github-contribution-grid-snake.svg)

</div>

---

<div align="center">

![visitors](https://visitor-badge.laobi.icu/badge?page_id=iamziike.iamziike)

</div>

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs["recommended-typescript"],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

