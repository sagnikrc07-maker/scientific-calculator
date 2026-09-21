# OmniCalc Pro Suite 🚀

A modern, responsive, high-precision Web Application combining an advanced **Scientific Calculator**, **Measurement & Unit Converters Hub (9 categories)**, **BMI Health Calculator**, and **Age & Life Statistics Suite**.

Built with **HTML5**, **CSS3 (Lumina & Lumina Noir design system)**, and modular **Vanilla JavaScript**.

---

## ✨ Features

- **Scientific Calculator:** Algebraic precedence (PEMDAS), Trigonometry (`sin`, `cos`, `tan`, `asin`, `acos`, `atan`) with instantaneous **DEG / RAD** switching, `ln`, `log`, powers ($x^y, x^2, x^3$), square root ($\sqrt{x}$), factorials ($n!$), memory bank (`MC`, `MR`, `M+`, `M-`, `MS`), and persistent history log.
- **Unit Converters (9 Categories):** Length, Weight/Mass, Area, Temperature, Speed, Pressure, Power, Currency (with live exchange rates), and Simultaneous 4-Way Number Systems (Decimal, Hexadecimal, Binary, Octal).
- **BMI Health Calculator:** Metric & Imperial inputs, color-coded rainbow gauge meter, WHO health classification, and healthy weight range calculation.
- **Age & Life Statistics Calculator:** Exact age in Years, Months, and Days, next birthday countdown ring, and total days, weeks, months, hours, minutes, and estimated lifetime heartbeats.
- **Dual Themes:** Clean Light Mode and Deep Charcoal Dark Mode with localStorage preference memory.
- **Full Responsiveness:** Optimized for Mobile, Tablet, and Desktop.

---

## 🚀 Deployment

This web application is 100% static (HTML5, CSS3, Vanilla JS) and can be hosted on any static hosting service (such as GitHub Pages, Cloudflare Pages, Netlify, or Apache/Nginx).

### Deploying to GitHub Pages

1. Push your repository to GitHub:
   ```bash
   git add .
   git commit -m "Deploy OmniCalc Pro Suite"
   git push origin main
   ```
2. In your GitHub repository, go to **Settings** → **Pages**.
3. Under **Branch**, select `main` and `/ (root)`, then click **Save**.
4. Your site will be live at `https://<username>.github.io/<repo-name>/`.

---

## 💻 Local Development

To run locally in your browser:
- Simply open `index.html` in any modern web browser.
- Or use any static dev server:
  ```bash
  npx serve .
  # or
  python -m http.server 3000
  ```

---

## 📁 Project Structure

```
├── index.html        # Main HTML5 application
├── styles.css        # Lumina & Lumina Noir CSS design tokens & animations
├── script.js         # Core JavaScript application engine
├── package.json      # Project metadata and dev scripts
├── favicon.svg       # Application vector icon
├── manifest.json     # PWA manifest for mobile / standalone support
├── robots.txt        # Search engine crawler configuration
└── .gitignore        # Ignored files for clean deployments
```

---

## 📄 License
MIT
