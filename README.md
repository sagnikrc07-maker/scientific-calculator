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

## 🚀 Deploying to Vercel

This repository is pre-configured and 100% ready for instant deployment on [Vercel](https://vercel.com).

### Method 1: Deploy via GitHub (Recommended)

1. Push this project folder to your GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of OmniCalc Pro Suite"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/omnicalc-pro.git
   git push -u origin main
   ```
2. Log in to [Vercel Dashboard](https://vercel.com/dashboard).
3. Click **"Add New..."** → **"Project"**.
4. Import your GitHub repository.
5. Vercel will automatically detect the static configuration from `vercel.json` and `package.json`.
6. Click **"Deploy"**. Your live URL will be ready in seconds!

---

### Method 2: Deploy via Vercel CLI

1. Install the Vercel CLI (if not already installed):
   ```bash
   npm i -g vercel
   ```
2. In this project directory, run:
   ```bash
   vercel
   ```
3. Follow the prompts in your terminal to log in and deploy.
4. For production deployment:
   ```bash
   vercel --prod
   ```

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
├── vercel.json       # Vercel deployment configuration & security headers
├── package.json      # Project metadata and dev scripts
├── favicon.svg       # Application vector icon
├── manifest.json     # PWA manifest for mobile / standalone support
├── robots.txt        # Search engine crawler configuration
└── .gitignore        # Ignored files for clean deployments
```

---

## 📄 License
MIT
