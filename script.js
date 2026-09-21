/**
 * OmniCalc Pro Suite - Core Application Engine
 * Contains:
 * 1. Toast Notification System
 * 2. Theme & Navigation Managers
 * 3. Scientific Calculator Engine (Precision math, trig in Deg/Rad, memory, history, keyboard)
 * 4. Measurement & Unit Converter Hub (9 categories including Base 2/8/10/16 and Currency)
 * 5. BMI Health Calculator (Metric & Imperial, rainbow gauge, ideal weight range)
 * 6. Age & Life Statistics Calculator (Exact Y/M/D, Next Birthday ring, Zodiac signs, life milestones)
 */

'use strict';

/* ==========================================================================
   1. TOAST NOTIFICATION UTILITY
   ========================================================================== */
function showToast(message, icon = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';

  const iconSpan = document.createElement('span');
  iconSpan.className = 'material-symbols-outlined';
  iconSpan.style.fontSize = '18px';
  iconSpan.textContent = icon;

  const msgSpan = document.createElement('span');
  msgSpan.textContent = message;

  toast.appendChild(iconSpan);
  toast.appendChild(msgSpan);

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

/* ==========================================================================
   2. THEME & NAVIGATION MANAGERS
   ========================================================================== */
const ThemeManager = {
  theme: localStorage.getItem('omnicalc_theme') || 'light',

  init() {
    this.applyTheme(this.theme);

    const topToggle = document.getElementById('top-theme-toggle');

    if (topToggle) topToggle.addEventListener('click', () => this.toggleTheme());
  },

  toggleTheme() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('omnicalc_theme', this.theme);
    this.applyTheme(this.theme);
  },

  applyTheme(theme) {
    const html = document.documentElement;
    const topIcon = document.getElementById('top-theme-icon');
    const topLabel = document.getElementById('top-theme-label');

    if (theme === 'dark') {
      html.classList.add('dark');
      html.classList.remove('light');
      if (topIcon) topIcon.textContent = 'light_mode';
      if (topLabel) topLabel.textContent = 'Light';
    } else {
      html.classList.add('light');
      html.classList.remove('dark');
      if (topIcon) topIcon.textContent = 'dark_mode';
      if (topLabel) topLabel.textContent = 'Dark';
    }
  }
};

const NavigationManager = {
  activeTab: 'calc-panel',
  toolTitles: {
    'calc-panel': 'Scientific Calculator',
    'converter-panel': 'Unit Converters',
    'bmi-panel': 'BMI Calculator',
    'age-panel': 'Age Calculator'
  },

  init() {
    const navButtons = document.querySelectorAll('.nav-item-btn[data-tab]');
    const mobileMenuBtn = document.getElementById('mobile-menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('drawer-backdrop');

    navButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');
        this.switchTab(targetTab);
        this.closeMobileMenu();
      });
    });

    if (mobileMenuBtn) {
      mobileMenuBtn.addEventListener('click', () => this.toggleMobileMenu());
    }

    if (backdrop) {
      backdrop.addEventListener('click', () => this.closeMobileMenu());
    }

    // Key shortcuts / Help modal
    const helpBtn = document.getElementById('help-modal-btn');
    const shortcutsModal = document.getElementById('shortcuts-modal');

    if (helpBtn && shortcutsModal) {
      helpBtn.addEventListener('click', () => shortcutsModal.showModal());
    }
  },

  switchTab(tabId) {
    this.activeTab = tabId;

    // Update Nav Buttons
    document.querySelectorAll('.nav-item-btn[data-tab]').forEach(btn => {
      if (btn.getAttribute('data-tab') === tabId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Update Panels
    document.querySelectorAll('.tool-panel').forEach(panel => {
      if (panel.id === tabId) {
        panel.classList.add('active');
      } else {
        panel.classList.remove('active');
      }
    });

    // Update Header Title
    const titleEl = document.getElementById('current-tool-title');
    if (titleEl && this.toolTitles[tabId]) {
      titleEl.textContent = this.toolTitles[tabId];
    }
  },

  toggleMobileMenu() {
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('drawer-backdrop');
    if (sidebar && backdrop) {
      sidebar.classList.toggle('mobile-open');
      backdrop.classList.toggle('active');
    }
  },

  closeMobileMenu() {
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('drawer-backdrop');
    if (sidebar && backdrop) {
      sidebar.classList.remove('mobile-open');
      backdrop.classList.remove('active');
    }
  }
};

/* ==========================================================================
   3. SCIENTIFIC CALCULATOR ENGINE
   ========================================================================== */
const calcApp = {
  expression: '',
  result: '0',
  isDegree: true,
  is2nd: false,
  memory: 0,
  history: [],
  justCalculated: false,

  init() {
    this.loadHistory();
    this.updateScreen();

    // Deg / Rad toggle
    const degRadBtn = document.getElementById('deg-rad-btn');
    if (degRadBtn) {
      degRadBtn.addEventListener('click', () => {
        this.isDegree = !this.isDegree;
        degRadBtn.textContent = this.isDegree ? 'DEG' : 'RAD';
        showToast(`Switched to ${this.isDegree ? 'Degrees' : 'Radians'} mode`, 'settings');
        this.evaluateLivePreview();
      });
    }

    // Copy Button
    const copyBtn = document.getElementById('calc-copy-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const textToCopy = this.result || this.expression || '0';
        navigator.clipboard.writeText(textToCopy).then(() => {
          showToast('Calculated result copied!', 'content_copy');
        }).catch(() => {
          showToast('Failed to copy to clipboard', 'error');
        });
      });
    }

    // Keyboard support
    document.addEventListener('keydown', (e) => this.handleKeyboard(e));
  },

  toggle2nd() {
    this.is2nd = !this.is2nd;
    const btn2nd = document.getElementById('btn-2nd');
    const badge2nd = document.getElementById('inv-mode-badge');
    const btnSin = document.getElementById('btn-sin');
    const btnCos = document.getElementById('btn-cos');
    const btnTan = document.getElementById('btn-tan');
    const btnLn = document.getElementById('btn-ln');
    const btnLog = document.getElementById('btn-log');
    const btnSqrt = document.getElementById('btn-sqrt');
    const btnPow = document.getElementById('btn-pow');

    if (btn2nd) btn2nd.classList.toggle('active', this.is2nd);
    if (badge2nd) badge2nd.classList.toggle('active', this.is2nd);

    if (this.is2nd) {
      if (btnSin) { btnSin.textContent = 'sin⁻¹'; btnSin.setAttribute('onclick', "calcApp.insertTrig('asin')"); }
      if (btnCos) { btnCos.textContent = 'cos⁻¹'; btnCos.setAttribute('onclick', "calcApp.insertTrig('acos')"); }
      if (btnTan) { btnTan.textContent = 'tan⁻¹'; btnTan.setAttribute('onclick', "calcApp.insertTrig('atan')"); }
      if (btnLn) { btnLn.textContent = 'eˣ'; btnLn.setAttribute('onclick', "calcApp.insertFunc('exp')"); }
      if (btnLog) { btnLog.textContent = '10ˣ'; btnLog.setAttribute('onclick', "calcApp.insertFunc('pow10')"); }
      if (btnSqrt) { btnSqrt.textContent = 'x²'; btnSqrt.setAttribute('onclick', "calcApp.appendSquare()"); }
      if (btnPow) { btnPow.textContent = 'x³'; btnPow.setAttribute('onclick', "calcApp.appendCube()"); }
    } else {
      if (btnSin) { btnSin.textContent = 'sin'; btnSin.setAttribute('onclick', "calcApp.insertTrig('sin')"); }
      if (btnCos) { btnCos.textContent = 'cos'; btnCos.setAttribute('onclick', "calcApp.insertTrig('cos')"); }
      if (btnTan) { btnTan.textContent = 'tan'; btnTan.setAttribute('onclick', "calcApp.insertTrig('tan')"); }
      if (btnLn) { btnLn.textContent = 'ln'; btnLn.setAttribute('onclick', "calcApp.insertFunc('ln')"); }
      if (btnLog) { btnLog.textContent = 'log'; btnLog.setAttribute('onclick', "calcApp.insertFunc('log')"); }
      if (btnSqrt) { btnSqrt.textContent = '√'; btnSqrt.setAttribute('onclick', "calcApp.insertFunc('sqrt')"); }
      if (btnPow) { btnPow.textContent = 'x^y'; btnPow.setAttribute('onclick', "calcApp.appendOperator('^')"); }
    }
  },

  appendDigit(digit) {
    if (this.justCalculated) {
      this.expression = '';
      this.justCalculated = false;
    }
    this.expression += digit;
    this.updateScreen();
    this.evaluateLivePreview();
  },

  appendDecimal() {
    if (this.justCalculated) {
      this.expression = '0';
      this.justCalculated = false;
    }
    if (!this.expression || /[\+\−\×\÷\^\(]\s*$/.test(this.expression)) {
      this.expression += '0.';
    } else {
      // Check if last number already has a decimal
      const parts = this.expression.split(/[\+\−\×\÷\^\(\)\s]+/);
      const lastPart = parts[parts.length - 1];
      if (!lastPart.includes('.')) {
        this.expression += '.';
      }
    }
    this.updateScreen();
    this.evaluateLivePreview();
  },

  appendOperator(op) {
    this.justCalculated = false;
    if (!this.expression) {
      if (op === ' − ') {
        this.expression = '-';
      }
      this.updateScreen();
      return;
    }

    // Prevent duplicate operators
    if (/[\+\−\×\÷\^]\s*$/.test(this.expression) || /\smod\s*$/.test(this.expression)) {
      this.expression = this.expression.replace(/(\s*[\+\−\×\÷\^]\s*|\s*mod\s*)$/, op);
    } else {
      this.expression += op;
    }
    this.updateScreen();
    this.evaluateLivePreview();
  },

  appendSymbol(sym) {
    if (this.justCalculated && sym === '(') {
      this.expression = '';
      this.justCalculated = false;
    }
    this.expression += sym;
    this.updateScreen();
    this.evaluateLivePreview();
  },

  appendConstant(constSymbol) {
    if (this.justCalculated) {
      this.expression = '';
      this.justCalculated = false;
    }
    if (this.expression && /[0-9\)]$/.test(this.expression)) {
      this.expression += ' × ' + constSymbol;
    } else {
      this.expression += constSymbol;
    }
    this.updateScreen();
    this.evaluateLivePreview();
  },

  insertFunc(funcName) {
    if (this.justCalculated) {
      this.expression = '';
      this.justCalculated = false;
    }
    if (this.expression && /[0-9\)]$/.test(this.expression)) {
      this.expression += ' × ' + funcName + '(';
    } else {
      this.expression += funcName + '(';
    }
    this.updateScreen();
    this.evaluateLivePreview();
  },

  insertTrig(trigFunc) {
    this.insertFunc(trigFunc);
  },

  appendSquare() {
    this.appendOperator('^2');
  },

  appendCube() {
    this.appendOperator('^3');
  },

  appendFactorial() {
    if (this.expression && /[0-9\)]$/.test(this.expression)) {
      this.expression += '!';
      this.updateScreen();
      this.evaluateLivePreview();
    }
  },

  appendPercentage() {
    if (this.expression && /[0-9\)]$/.test(this.expression)) {
      this.expression += '%';
      this.updateScreen();
      this.evaluateLivePreview();
    }
  },

  insertReciprocal() {
    if (this.justCalculated && this.result !== 'Error') {
      this.expression = `1 / (${this.result})`;
      this.justCalculated = false;
      this.calculate();
    } else if (this.expression) {
      this.expression = `1 / (${this.expression})`;
      this.updateScreen();
      this.evaluateLivePreview();
    }
  },

  appendExp() {
    if (this.expression && /[0-9]$/.test(this.expression)) {
      this.expression += 'e+';
      this.updateScreen();
      this.evaluateLivePreview();
    }
  },

  toggleSign() {
    if (this.justCalculated && this.result !== 'Error') {
      const num = parseFloat(this.result);
      this.expression = (-num).toString();
      this.justCalculated = false;
      this.updateScreen();
      this.evaluateLivePreview();
      return;
    }
    if (!this.expression) {
      this.expression = '-';
      this.updateScreen();
      return;
    }

    // Toggle negation of last number or expression
    if (/^\-?\d+(\.\d+)?$/.test(this.expression)) {
      if (this.expression.startsWith('-')) {
        this.expression = this.expression.slice(1);
      } else {
        this.expression = '-' + this.expression;
      }
    } else {
      this.expression = `-(${this.expression})`;
    }
    this.updateScreen();
    this.evaluateLivePreview();
  },

  deleteLast() {
    if (this.justCalculated) {
      this.clearAll();
      return;
    }
    if (this.expression.length > 0) {
      // Check for multi-char tokens like 'sin(', ' mod ', etc.
      const match = this.expression.match(/(asin\(|acos\(|atan\(|sin\(|cos\(|tan\(|log\(|ln\(|sqrt\(|abs\(|pow10\(|exp\(|\smod\s|\s[\+\−\×\÷]\s)$/);
      if (match) {
        this.expression = this.expression.slice(0, -match[0].length);
      } else {
        this.expression = this.expression.slice(0, -1);
      }
      this.updateScreen();
      this.evaluateLivePreview();
    }
  },

  clearAll() {
    this.expression = '';
    this.result = '0';
    this.justCalculated = false;
    this.updateScreen();
    const livePreview = document.getElementById('calc-live-preview');
    if (livePreview) livePreview.textContent = '';
  },

  _fact(n) {
    const num = Math.floor(Number(n));
    if (num < 0 || !Number.isFinite(num)) return NaN;
    if (num === 0 || num === 1) return 1;
    if (num > 170) return Infinity; // JS Number overflow limit
    let total = 1;
    for (let i = 2; i <= num; i++) total *= i;
    return total;
  },

  // Zero-Eval, CSP-compliant, high-precision mathematical tokenizer & recursive descent evaluator
  parseAndEvaluate(rawExpr) {
    if (!rawExpr || !rawExpr.trim()) return null;

    let str = rawExpr
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/−/g, '-')
      .replace(/\bmod\b/g, '%');

    // Auto-close unclosed parentheses for enhanced calculator UX
    let openCount = 0;
    for (let i = 0; i < str.length; i++) {
      if (str[i] === '(') openCount++;
      else if (str[i] === ')') openCount--;
    }
    while (openCount > 0) {
      str += ')';
      openCount--;
    }

    const len = str.length;
    let pos = 0;

    function isWhitespace(ch) {
      return ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r';
    }
    function isDigit(ch) {
      return ch >= '0' && ch <= '9';
    }
    function isAlpha(ch) {
      return (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || ch === 'π';
    }

    function nextToken() {
      while (pos < len && isWhitespace(str[pos])) pos++;
      if (pos >= len) return { type: 'EOF' };

      const ch = str[pos];

      // Numbers: decimal, integer, scientific e-notation (e.g. 1e+5)
      if (isDigit(ch) || (ch === '.' && pos + 1 < len && isDigit(str[pos + 1]))) {
        let start = pos;
        let hasDot = false;
        if (str[pos] === '.') {
          hasDot = true;
          pos++;
        }
        while (pos < len && isDigit(str[pos])) pos++;
        if (!hasDot && pos < len && str[pos] === '.') {
          hasDot = true;
          pos++;
          while (pos < len && isDigit(str[pos])) pos++;
        }
        if (pos < len && (str[pos] === 'e' || str[pos] === 'E')) {
          if (pos + 1 < len && (str[pos + 1] === '+' || str[pos + 1] === '-' || isDigit(str[pos + 1]))) {
            pos++;
            if (pos < len && (str[pos] === '+' || str[pos] === '-')) pos++;
            while (pos < len && isDigit(str[pos])) pos++;
          }
        }
        const numStr = str.slice(start, pos);
        const val = Number(numStr);
        if (isNaN(val)) throw new Error('Invalid number');
        return { type: 'NUMBER', value: val };
      }

      // Operators and grouping symbols
      if ('+-*/%^!()'.includes(ch)) {
        pos++;
        return { type: ch };
      }

      // Identifiers: functions and constants
      if (isAlpha(ch)) {
        let start = pos;
        while (pos < len && (isAlpha(str[pos]) || isDigit(str[pos]))) pos++;
        const id = str.slice(start, pos);
        if (id === 'π' || id === 'pi') return { type: 'CONST', value: Math.PI };
        if (id === 'e') return { type: 'CONST', value: Math.E };
        return { type: 'IDENT', name: id.toLowerCase() };
      }

      throw new Error(`Unexpected character: ${ch}`);
    }

    const tokens = [];
    while (true) {
      const tok = nextToken();
      tokens.push(tok);
      if (tok.type === 'EOF') break;
    }

    // Insert implicit multiplication: e.g. 2π, 2(3), (2)(3), 5sin(30)
    const expanded = [];
    for (let i = 0; i < tokens.length; i++) {
      const cur = tokens[i];
      expanded.push(cur);
      if (i + 1 < tokens.length) {
        const next = tokens[i + 1];
        const isCurOperand = cur.type === 'NUMBER' || cur.type === 'CONST' || cur.type === ')' || cur.type === '!';
        const isNextStart = next.type === 'NUMBER' || next.type === 'CONST' || next.type === 'IDENT' || next.type === '(';
        if (isCurOperand && isNextStart) {
          expanded.push({ type: '*' });
        }
      }
    }

    let curIdx = 0;
    function current() {
      return expanded[curIdx];
    }
    function eat(expectedType) {
      const tok = current();
      if (expectedType && tok.type !== expectedType) {
        throw new Error(`Expected '${expectedType}', got '${tok.type}'`);
      }
      curIdx++;
      return tok;
    }

    const self = this;
    const isDeg = this.isDegree;

    function parseExpr() {
      let val = parseTerm();
      while (current().type === '+' || current().type === '-') {
        const op = eat().type;
        const right = parseTerm();
        val = (op === '+') ? val + right : val - right;
      }
      return val;
    }

    function parseTerm() {
      let val = parsePower();
      while (current().type === '*' || current().type === '/' || current().type === '%') {
        const op = eat().type;
        const right = parsePower();
        if (op === '*') {
          val = val * right;
        } else if (op === '/') {
          if (right === 0) throw new Error('Cannot divide by zero');
          val = val / right;
        } else if (op === '%') {
          if (right === 0) throw new Error('Cannot divide by zero');
          val = val % right;
        }
      }
      return val;
    }

    function parsePower() {
      let base = parseUnary();
      if (current().type === '^') {
        eat('^');
        const exp = parsePower(); // Right-associative
        base = Math.pow(base, exp);
      }
      return base;
    }

    function parseUnary() {
      if (current().type === '+') {
        eat('+');
        return parseUnary();
      }
      if (current().type === '-') {
        eat('-');
        return -parseUnary();
      }
      return parsePostfix();
    }

    function parsePostfix() {
      let val = parsePrimary();
      while (current().type === '!' || current().type === '%') {
        const op = eat().type;
        if (op === '!') {
          val = self._fact(val);
          if (isNaN(val)) throw new Error('Invalid input');
        } else if (op === '%') {
          val = val / 100;
        }
      }
      return val;
    }

    function parsePrimary() {
      const tok = current();

      if (tok.type === 'NUMBER') {
        eat();
        return tok.value;
      }
      if (tok.type === 'CONST') {
        eat();
        return tok.value;
      }
      if (tok.type === '(') {
        eat('(');
        const val = parseExpr();
        eat(')');
        return val;
      }
      if (tok.type === 'IDENT') {
        const fnName = tok.name;
        eat('IDENT');
        eat('(');
        const arg = parseExpr();
        eat(')');

        switch (fnName) {
          case 'sin': {
            const rad = isDeg ? (arg * Math.PI / 180) : arg;
            const res = Math.sin(rad);
            return Math.abs(res) < 1e-15 ? 0 : res;
          }
          case 'cos': {
            const rad = isDeg ? (arg * Math.PI / 180) : arg;
            const res = Math.cos(rad);
            return Math.abs(res) < 1e-15 ? 0 : res;
          }
          case 'tan': {
            if (isDeg && Math.abs(arg % 180) === 90) {
              throw new Error('Cannot divide by zero');
            }
            const rad = isDeg ? (arg * Math.PI / 180) : arg;
            const res = Math.tan(rad);
            return Math.abs(res) < 1e-15 ? 0 : res;
          }
          case 'asin': {
            if (arg < -1 || arg > 1) throw new Error('Invalid input');
            const res = Math.asin(arg);
            return isDeg ? (res * 180 / Math.PI) : res;
          }
          case 'acos': {
            if (arg < -1 || arg > 1) throw new Error('Invalid input');
            const res = Math.acos(arg);
            return isDeg ? (res * 180 / Math.PI) : res;
          }
          case 'atan': {
            const res = Math.atan(arg);
            return isDeg ? (res * 180 / Math.PI) : res;
          }
          case 'ln': {
            if (arg <= 0) throw new Error('Invalid input');
            return Math.log(arg);
          }
          case 'log': {
            if (arg <= 0) throw new Error('Invalid input');
            return Math.log10(arg);
          }
          case 'sqrt': {
            if (arg < 0) throw new Error('Invalid input');
            return Math.sqrt(arg);
          }
          case 'abs': {
            return Math.abs(arg);
          }
          case 'exp': {
            return Math.exp(arg);
          }
          case 'pow10': {
            return Math.pow(10, arg);
          }
          default:
            throw new Error(`Unknown function: ${fnName}`);
        }
      }

      throw new Error(`Unexpected token '${tok.type}'`);
    }

    try {
      const res = parseExpr();
      if (current().type !== 'EOF') {
        throw new Error('Unexpected trailing tokens');
      }
      if (typeof res !== 'number' || isNaN(res)) return 'Error: Invalid input';
      if (!isFinite(res)) return 'Error: Cannot divide by zero';
      return res;
    } catch (e) {
      if (e.message.includes('Cannot divide by zero')) return 'Error: Cannot divide by zero';
      if (e.message.includes('Invalid input')) return 'Error: Invalid input';
      return 'Error: Syntax error';
    }
  },

  evaluateLivePreview() {
    const livePreview = document.getElementById('calc-live-preview');
    if (!livePreview) return;

    if (!this.expression.trim()) {
      livePreview.textContent = '';
      return;
    }

    try {
      const val = this.parseAndEvaluate(this.expression);
      if (val !== null && typeof val === 'number') {
        livePreview.textContent = '= ' + this.formatResult(val);
      } else {
        livePreview.textContent = '';
      }
    } catch (e) {
      livePreview.textContent = '';
    }
  },

  calculate() {
    if (!this.expression.trim()) return;

    try {
      const val = this.parseAndEvaluate(this.expression);

      if (val === null || typeof val === 'string') {
        this.result = val || 'Error: Syntax error';
        this.updateScreen(true);
      } else {
        const formatted = this.formatResult(val);
        this.addToHistory(this.expression, formatted);
        this.result = formatted;
        this.justCalculated = true;
        this.updateScreen();
      }
    } catch (err) {
      this.result = 'Error';
      this.updateScreen(true);
    }
  },

  formatResult(val) {
    if (typeof val !== 'number') return val;
    // Avoid floating point inaccuracies (e.g., 0.1 + 0.2 = 0.30000000000000004)
    const fixed = parseFloat(val.toPrecision(12));
    if (Math.abs(fixed) > 1e12 || (Math.abs(fixed) < 1e-6 && fixed !== 0)) {
      return fixed.toExponential(6).replace('e+', 'e');
    }
    return fixed.toString();
  },

  updateScreen(isError = false) {
    const exprEl = document.getElementById('calc-expression-display');
    const resultEl = document.getElementById('calc-result-display');
    const livePreview = document.getElementById('calc-live-preview');

    if (exprEl) exprEl.textContent = this.expression;
    if (resultEl) {
      resultEl.textContent = this.result || '0';
      resultEl.classList.toggle('error-text', isError);
    }
    if (isError && livePreview) {
      livePreview.textContent = '';
    }
  },

  // Memory Functions
  memoryClear() {
    this.memory = 0;
    this.updateMemoryBadge();
    showToast('Memory Cleared (MC)', 'delete');
  },

  memoryRecall() {
    this.appendDigit(this.memory.toString());
    showToast(`Memory Recalled: ${this.memory} (MR)`, 'memory');
  },

  memoryAdd() {
    const cur = parseFloat(this.result) || parseFloat(this.expression) || 0;
    this.memory += cur;
    this.updateMemoryBadge();
    showToast(`Added to Memory: ${cur} (M+)`, 'add_circle');
  },

  memorySubtract() {
    const cur = parseFloat(this.result) || parseFloat(this.expression) || 0;
    this.memory -= cur;
    this.updateMemoryBadge();
    showToast(`Subtracted from Memory: ${cur} (M-)`, 'remove_circle');
  },

  memoryStore() {
    const cur = parseFloat(this.result) || parseFloat(this.expression) || 0;
    this.memory = cur;
    this.updateMemoryBadge();
    showToast(`Stored in Memory: ${cur} (MS)`, 'save');
  },

  updateMemoryBadge() {
    const flag = document.getElementById('calc-mem-flag');
    if (flag) {
      flag.classList.toggle('active', this.memory !== 0);
    }
  },

  // History Stack
  addToHistory(expr, res) {
    this.history.unshift({
      expr,
      res,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    if (this.history.length > 30) this.history.pop();
    this.saveHistory();
    this.renderHistory();
  },

  loadHistory() {
    try {
      const saved = localStorage.getItem('omnicalc_calc_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          this.history = parsed.filter(item => item && typeof item.expr === 'string' && typeof item.res === 'string');
        } else {
          this.history = [];
        }
      }
    } catch (e) {
      this.history = [];
    }
    this.renderHistory();
  },

  saveHistory() {
    try {
      localStorage.setItem('omnicalc_calc_history', JSON.stringify(this.history));
    } catch (e) {}
  },

  clearHistory() {
    this.history = [];
    this.saveHistory();
    this.renderHistory();
    showToast('Calculation log cleared', 'delete');
  },

  renderHistory() {
    const list = document.getElementById('calc-history-list');
    if (!list) return;

    list.replaceChildren();

    if (!Array.isArray(this.history) || this.history.length === 0) {
      const emptyDiv = document.createElement('div');
      emptyDiv.className = 'empty-history';

      const emptyIcon = document.createElement('span');
      emptyIcon.className = 'material-symbols-outlined';
      emptyIcon.style.fontSize = '36px';
      emptyIcon.style.opacity = '0.5';
      emptyIcon.textContent = 'history_edu';

      const emptyP = document.createElement('p');
      emptyP.textContent = 'No calculations yet';

      emptyDiv.appendChild(emptyIcon);
      emptyDiv.appendChild(emptyP);
      list.appendChild(emptyDiv);
      return;
    }

    this.history.forEach((item) => {
      if (!item || typeof item.expr !== 'string' || typeof item.res !== 'string') return;

      const el = document.createElement('div');
      el.className = 'history-item';
      el.title = 'Click to reload expression';

      const exprDiv = document.createElement('div');
      exprDiv.className = 'history-expr';
      exprDiv.textContent = `${item.expr} =`;

      const resDiv = document.createElement('div');
      resDiv.className = 'history-res';
      resDiv.textContent = item.res;

      el.appendChild(exprDiv);
      el.appendChild(resDiv);

      el.addEventListener('click', () => {
        this.expression = item.expr;
        this.result = item.res;
        this.justCalculated = true;
        this.updateScreen();
        showToast('Restored from history', 'history');
      });
      list.appendChild(el);
    });
  },

  handleKeyboard(e) {
    // Only listen when calculator panel is active and not typing in an input
    if (NavigationManager.activeTab !== 'calc-panel') return;
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    const key = e.key;

    if (/^[0-9]$/.test(key)) {
      e.preventDefault();
      this.appendDigit(key);
    } else if (key === '.') {
      e.preventDefault();
      this.appendDecimal();
    } else if (key === '+') {
      e.preventDefault();
      this.appendOperator(' + ');
    } else if (key === '-') {
      e.preventDefault();
      this.appendOperator(' − ');
    } else if (key === '*') {
      e.preventDefault();
      this.appendOperator(' × ');
    } else if (key === '/') {
      e.preventDefault();
      this.appendOperator(' ÷ ');
    } else if (key === '^') {
      e.preventDefault();
      this.appendOperator('^');
    } else if (key === '%') {
      e.preventDefault();
      this.appendPercentage();
    } else if (key === '!') {
      e.preventDefault();
      this.appendFactorial();
    } else if (key === '(' || key === ')') {
      e.preventDefault();
      this.appendSymbol(key);
    } else if (key === 'Enter' || key === '=') {
      e.preventDefault();
      this.calculate();
    } else if (key === 'Backspace') {
      e.preventDefault();
      this.deleteLast();
    } else if (key === 'Escape') {
      e.preventDefault();
      this.clearAll();
    }
  }
};

/* ==========================================================================
   4. MEASUREMENT & UNIT CONVERTERS HUB
   ========================================================================== */
const UnitEngine = {
  currentCategory: 'length',

  // Master Conversion Factors & Offsets (relative to Base Unit)
  categories: {
    length: {
      name: 'Distance / Length',
      icon: 'straighten',
      base: 'm',
      units: {
        km: { name: 'Kilometers (km)', factor: 1000 },
        m: { name: 'Meters (m)', factor: 1 },
        cm: { name: 'Centimeters (cm)', factor: 0.01 },
        mm: { name: 'Millimeters (mm)', factor: 0.001 },
        mi: { name: 'Miles (mi)', factor: 1609.344 },
        yd: { name: 'Yards (yd)', factor: 0.9144 },
        ft: { name: 'Feet (ft)', factor: 0.3048 },
        in: { name: 'Inches (in)', factor: 0.0254 },
        nmi: { name: 'Nautical Miles (nmi)', factor: 1852 },
        um: { name: 'Microns (µm)', factor: 0.000001 }
      },
      benchmarks: [
        { label: '1 Meter', val: '3.28084 ft' },
        { label: '1 Kilometer', val: '0.62137 mi' },
        { label: '1 Mile', val: '1.60934 km' },
        { label: '1 Inch', val: '2.54 cm' },
        { label: '1 Nautical Mile', val: '1.852 km' }
      ]
    },
    mass: {
      name: 'Weight / Mass',
      icon: 'scale',
      base: 'kg',
      units: {
        kg: { name: 'Kilograms (kg)', factor: 1 },
        g: { name: 'Grams (g)', factor: 0.001 },
        mg: { name: 'Milligrams (mg)', factor: 0.000001 },
        lb: { name: 'Pounds (lb)', factor: 0.45359237 },
        oz: { name: 'Ounces (oz)', factor: 0.028349523125 },
        ton: { name: 'Metric Ton (t)', factor: 1000 },
        stone: { name: 'Stone (st)', factor: 6.35029318 },
        ug: { name: 'Micrograms (µg)', factor: 0.000000001 },
        ct: { name: 'Carats (ct)', factor: 0.0002 }
      },
      benchmarks: [
        { label: '1 Kilogram', val: '2.20462 lbs' },
        { label: '1 Pound', val: '453.592 grams' },
        { label: '1 Ounce', val: '28.3495 grams' },
        { label: '1 Stone', val: '14 lbs (6.35 kg)' },
        { label: '1 Metric Ton', val: '1,000 kg' }
      ]
    },
    area: {
      name: 'Area',
      icon: 'square_foot',
      base: 'm2',
      units: {
        m2: { name: 'Square Meters (m²)', factor: 1 },
        km2: { name: 'Square Kilometers (km²)', factor: 1000000 },
        cm2: { name: 'Square Centimeters (cm²)', factor: 0.0001 },
        mm2: { name: 'Square Millimeters (mm²)', factor: 0.000001 },
        ft2: { name: 'Square Feet (ft²)', factor: 0.09290304 },
        yd2: { name: 'Square Yards (yd²)', factor: 0.83612736 },
        mi2: { name: 'Square Miles (mi²)', factor: 2589988.110336 },
        acre: { name: 'Acres (ac)', factor: 4046.8564224 },
        hectare: { name: 'Hectares (ha)', factor: 10000 }
      },
      benchmarks: [
        { label: '1 Acre', val: '43,560 sq ft (~4047 m²)' },
        { label: '1 Hectare', val: '2.47105 Acres (10,000 m²)' },
        { label: '1 Sq Kilometer', val: '0.3861 Sq Miles' },
        { label: '1 Sq Meter', val: '10.7639 Sq Feet' }
      ]
    },
    temperature: {
      name: 'Temperature',
      icon: 'device_thermostat',
      units: {
        C: { name: 'Celsius (°C)' },
        F: { name: 'Fahrenheit (°F)' },
        K: { name: 'Kelvin (K)' },
        R: { name: 'Rankine (°R)' }
      },
      benchmarks: [
        { label: 'Water Freezing', val: '0 °C = 32 °F = 273.15 K' },
        { label: 'Room Temperature', val: '20 °C = 68 °F = 293.15 K' },
        { label: 'Human Body Temp', val: '37 °C = 98.6 °F = 310.15 K' },
        { label: 'Water Boiling', val: '100 °C = 212 °F = 373.15 K' }
      ]
    },
    speed: {
      name: 'Speed / Velocity',
      icon: 'speed',
      base: 'mps',
      units: {
        kmh: { name: 'Kilometers / Hour (km/h)', factor: 1 / 3.6 },
        mph: { name: 'Miles / Hour (mph)', factor: 0.44704 },
        mps: { name: 'Meters / Second (m/s)', factor: 1 },
        knot: { name: 'Knots (kn)', factor: 0.514444 },
        fps: { name: 'Feet / Second (ft/s)', factor: 0.3048 },
        mach: { name: 'Mach (Speed of Sound in air)', factor: 340.29 }
      },
      benchmarks: [
        { label: '100 km/h', val: '62.137 mph (27.78 m/s)' },
        { label: '60 mph', val: '96.56 km/h' },
        { label: '1 Knot', val: '1.15078 mph (1.852 km/h)' },
        { label: 'Mach 1', val: '1,225 km/h (761.2 mph)' }
      ]
    },
    pressure: {
      name: 'Pressure',
      icon: 'compress',
      base: 'pa',
      units: {
        pa: { name: 'Pascal (Pa)', factor: 1 },
        kpa: { name: 'Kilopascal (kPa)', factor: 1000 },
        bar: { name: 'Bar', factor: 100000 },
        psi: { name: 'Pounds / Sq Inch (psi)', factor: 6894.75729 },
        atm: { name: 'Standard Atmosphere (atm)', factor: 101325 },
        torr: { name: 'Torr / mmHg', factor: 133.322368 }
      },
      benchmarks: [
        { label: '1 Atmosphere (atm)', val: '101.325 kPa (14.696 psi)' },
        { label: '1 Bar', val: '100,000 Pa (14.5038 psi)' },
        { label: '1 PSI', val: '6,894.76 Pa' },
        { label: '1 Torr', val: '1 mmHg (~133.32 Pa)' }
      ]
    },
    power: {
      name: 'Power',
      icon: 'bolt',
      base: 'w',
      units: {
        w: { name: 'Watt (W)', factor: 1 },
        kw: { name: 'Kilowatt (kW)', factor: 1000 },
        mw: { name: 'Megawatt (MW)', factor: 1000000 },
        hp_m: { name: 'Horsepower - Metric (hp)', factor: 735.49875 },
        hp_i: { name: 'Horsepower - Mechanical (hp)', factor: 745.69987 },
        btu: { name: 'BTU / Hour (BTU/h)', factor: 0.29307107 },
        js: { name: 'Joules / Second (J/s)', factor: 1 }
      },
      benchmarks: [
        { label: '1 Horsepower (mech)', val: '745.7 Watts (0.746 kW)' },
        { label: '1 Kilowatt (kW)', val: '1.341 Mechanical HP' },
        { label: '1 Megawatt (MW)', val: '1,000,000 Watts' },
        { label: '1 BTU/hour', val: '0.293071 Watts' }
      ]
    },
    currency: {
      name: 'Currency Converter',
      icon: 'currency_exchange',
      base: 'USD',
      // Default exchange rates baseline (USD = 1.0)
      units: {
        USD: { name: 'US Dollar (USD)', factor: 1.0 },
        EUR: { name: 'Euro (EUR)', factor: 1.085 },
        GBP: { name: 'British Pound (GBP)', factor: 1.285 },
        JPY: { name: 'Japanese Yen (JPY)', factor: 0.0067 },
        INR: { name: 'Indian Rupee (INR)', factor: 0.012 },
        CAD: { name: 'Canadian Dollar (CAD)', factor: 0.735 },
        AUD: { name: 'Australian Dollar (AUD)', factor: 0.658 },
        CHF: { name: 'Swiss Franc (CHF)', factor: 1.135 },
        CNY: { name: 'Chinese Yuan (CNY)', factor: 0.138 },
        SGD: { name: 'Singapore Dollar (SGD)', factor: 0.755 },
        AED: { name: 'UAE Dirham (AED)', factor: 0.272 },
        BRL: { name: 'Brazilian Real (BRL)', factor: 0.178 },
        ZAR: { name: 'South African Rand (ZAR)', factor: 0.056 }
      },
      benchmarks: [
        { label: '1 USD', val: '0.92 EUR' },
        { label: '1 USD', val: '0.78 GBP' },
        { label: '1 USD', val: '83.50 INR' },
        { label: '1 USD', val: '150.25 JPY' },
        { label: '1 EUR', val: '1.085 USD' }
      ]
    }
  },

  init() {
    this.bindCategoryButtons();
    this.populateUnits('length');
    this.bindInputs();
    this.initNumberSystem();
    this.initCurrencyRates();
  },

  bindCategoryButtons() {
    const buttons = document.querySelectorAll('.cat-pill-btn[data-category]');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const cat = btn.getAttribute('data-category');
        this.selectCategory(cat);
      });
    });
  },

  selectCategory(cat) {
    this.currentCategory = cat;
    const stdView = document.getElementById('standard-converter-view');
    const numSysView = document.getElementById('number-system-view');
    const currBanner = document.getElementById('currency-extra-card');

    if (cat === 'number_system') {
      if (stdView) stdView.style.display = 'none';
      if (numSysView) numSysView.style.display = 'block';
      if (currBanner) currBanner.style.display = 'none';
      return;
    }

    if (stdView) stdView.style.display = 'grid';
    if (numSysView) numSysView.style.display = 'none';
    if (currBanner) currBanner.style.display = (cat === 'currency') ? 'block' : 'none';

    this.populateUnits(cat);
    this.performConversion();
  },

  populateUnits(cat) {
    const catData = this.categories[cat];
    if (!catData) return;

    // Heading
    const headText = document.getElementById('converter-heading-text');
    if (headText) headText.textContent = catData.name;

    const fromSelect = document.getElementById('unit-from-select');
    const toSelect = document.getElementById('unit-to-select');
    if (!fromSelect || !toSelect) return;

    fromSelect.innerHTML = '';
    toSelect.innerHTML = '';

    const unitKeys = Object.keys(catData.units);
    unitKeys.forEach((key, idx) => {
      const optFrom = document.createElement('option');
      optFrom.value = key;
      optFrom.textContent = catData.units[key].name;
      fromSelect.appendChild(optFrom);

      const optTo = document.createElement('option');
      optTo.value = key;
      optTo.textContent = catData.units[key].name;
      if (idx === 1 || (unitKeys.length === 1 && idx === 0)) optTo.selected = true;
      toSelect.appendChild(optTo);
    });

    // Populate quick benchmarks
    this.renderBenchmarks(catData.benchmarks);
  },

  renderBenchmarks(benchmarks) {
    const list = document.getElementById('quick-ref-list');
    if (!list) return;
    list.replaceChildren();

    if (!benchmarks || benchmarks.length === 0) return;

    benchmarks.forEach(item => {
      const li = document.createElement('li');
      li.className = 'quick-ref-item';

      const labelSpan = document.createElement('span');
      labelSpan.style.color = 'var(--text-secondary)';
      labelSpan.textContent = item.label;

      const valSpan = document.createElement('span');
      valSpan.className = 'quick-ref-val';
      valSpan.textContent = item.val;

      li.appendChild(labelSpan);
      li.appendChild(valSpan);
      list.appendChild(li);
    });
  },

  bindInputs() {
    const fromInput = document.getElementById('unit-from-value');
    const fromSelect = document.getElementById('unit-from-select');
    const toSelect = document.getElementById('unit-to-select');
    const swapBtn = document.getElementById('unit-swap-btn');
    const copyBtn = document.getElementById('unit-copy-btn');

    if (fromInput) fromInput.addEventListener('input', () => this.performConversion());
    if (fromSelect) fromSelect.addEventListener('change', () => this.performConversion());
    if (toSelect) toSelect.addEventListener('change', () => this.performConversion());

    if (swapBtn) {
      swapBtn.addEventListener('click', () => {
        const fVal = fromSelect.value;
        fromSelect.value = toSelect.value;
        toSelect.value = fVal;
        this.performConversion();
      });
    }

    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const toInput = document.getElementById('unit-to-value');
        if (toInput) {
          navigator.clipboard.writeText(toInput.value).then(() => {
            showToast('Conversion result copied!', 'content_copy');
          });
        }
      });
    }
  },

  performConversion() {
    if (this.currentCategory === 'number_system') return;

    const fromVal = parseFloat(document.getElementById('unit-from-value').value);
    const fromUnit = document.getElementById('unit-from-select').value;
    const toUnit = document.getElementById('unit-to-select').value;
    const toInput = document.getElementById('unit-to-value');
    const formulaEl = document.getElementById('conversion-formula-text');

    if (isNaN(fromVal)) {
      if (toInput) toInput.value = '';
      if (formulaEl) formulaEl.textContent = 'Please enter a valid numeric value';
      return;
    }

    let convertedVal = 0;
    let formulaText = '';

    if (this.currentCategory === 'temperature') {
      // Temperature conversion
      convertedVal = this.convertTemperature(fromVal, fromUnit, toUnit);
      formulaText = this.getTempFormulaText(fromVal, fromUnit, toUnit, convertedVal);
    } else {
      // Standard linear conversion
      const catData = this.categories[this.currentCategory];
      const fromFactor = catData.units[fromUnit].factor;
      const toFactor = catData.units[toUnit].factor;

      // Base value = fromVal * fromFactor
      // Converted value = Base value / toFactor
      const inBase = fromVal * fromFactor;
      convertedVal = inBase / toFactor;

      const singleUnitConverted = (1 * fromFactor) / toFactor;
      formulaText = `Formula: 1 ${fromUnit} = ${this.formatUnitResult(singleUnitConverted)} ${toUnit}`;
    }

    if (toInput) toInput.value = this.formatUnitResult(convertedVal);
    if (formulaEl) formulaEl.textContent = formulaText;
  },

  convertTemperature(val, from, to) {
    if (from === to) return val;
    // Step 1: Convert from source to Celsius
    let celsius = 0;
    if (from === 'C') celsius = val;
    else if (from === 'F') celsius = (val - 32) * (5 / 9);
    else if (from === 'K') celsius = val - 273.15;
    else if (from === 'R') celsius = (val - 491.67) * (5 / 9);

    // Step 2: Convert Celsius to target
    if (to === 'C') return celsius;
    if (to === 'F') return (celsius * 9 / 5) + 32;
    if (to === 'K') return celsius + 273.15;
    if (to === 'R') return (celsius + 273.15) * 1.8;
    return celsius;
  },

  getTempFormulaText(val, from, to, res) {
    if (from === 'C' && to === 'F') return `(${val}°C × 9/5) + 32 = ${this.formatUnitResult(res)}°F`;
    if (from === 'F' && to === 'C') return `(${val}°F − 32) × 5/9 = ${this.formatUnitResult(res)}°C`;
    if (from === 'C' && to === 'K') return `${val}°C + 273.15 = ${this.formatUnitResult(res)} K`;
    if (from === 'K' && to === 'C') return `${val} K − 273.15 = ${this.formatUnitResult(res)}°C`;
    return `${val} ${from} = ${this.formatUnitResult(res)} ${to}`;
  },

  formatUnitResult(num) {
    if (isNaN(num)) return '';
    const rounded = parseFloat(num.toPrecision(8));
    if (Math.abs(rounded) > 1e9 || (Math.abs(rounded) < 1e-5 && rounded !== 0)) {
      return rounded.toExponential(4);
    }
    return rounded.toString();
  },

  // Number Systems Simultaneous Converter
  initNumberSystem() {
    const decInput = document.getElementById('numsys-dec');
    const hexInput = document.getElementById('numsys-hex');
    const binInput = document.getElementById('numsys-bin');
    const octInput = document.getElementById('numsys-oct');

    if (!decInput) return;

    const updateAllFromDec = (decVal) => {
      if (isNaN(decVal) || decVal < 0) {
        hexInput.value = '';
        binInput.value = '';
        octInput.value = '';
        return;
      }
      hexInput.value = decVal.toString(16).toUpperCase();
      binInput.value = decVal.toString(2);
      octInput.value = decVal.toString(8);

      // Meta labels
      const bits = decVal === 0 ? 1 : Math.floor(Math.log2(decVal)) + 1;
      const bytes = Math.ceil(bits / 8);
      const binMeta = document.getElementById('numsys-bin-meta');
      const hexMeta = document.getElementById('numsys-hex-meta');
      const octMeta = document.getElementById('numsys-oct-meta');

      if (binMeta) binMeta.textContent = `${bits} bits (${bytes} ${bytes === 1 ? 'Byte' : 'Bytes'})`;
      if (hexMeta) hexMeta.textContent = `0x${hexInput.value}`;
      if (octMeta) octMeta.textContent = `0o${octInput.value}`;
    };

    decInput.addEventListener('input', (e) => {
      const val = parseInt(e.target.value.replace(/\D/g, ''), 10);
      updateAllFromDec(val);
    });

    hexInput.addEventListener('input', (e) => {
      const cleanHex = e.target.value.replace(/[^0-9a-fA-F]/g, '');
      e.target.value = cleanHex.toUpperCase();
      const val = parseInt(cleanHex, 16);
      if (!isNaN(val)) {
        decInput.value = val;
        binInput.value = val.toString(2);
        octInput.value = val.toString(8);
      }
    });

    binInput.addEventListener('input', (e) => {
      const cleanBin = e.target.value.replace(/[^01]/g, '');
      e.target.value = cleanBin;
      const val = parseInt(cleanBin, 2);
      if (!isNaN(val)) {
        decInput.value = val;
        hexInput.value = val.toString(16).toUpperCase();
        octInput.value = val.toString(8);
      }
    });

    octInput.addEventListener('input', (e) => {
      const cleanOct = e.target.value.replace(/[^0-7]/g, '');
      e.target.value = cleanOct;
      const val = parseInt(cleanOct, 8);
      if (!isNaN(val)) {
        decInput.value = val;
        hexInput.value = val.toString(16).toUpperCase();
        binInput.value = val.toString(2);
      }
    });
  },

  // Currency Real-Time Fetch
  initCurrencyRates() {
    const refreshBtn = document.getElementById('currency-refresh-btn');
    if (!refreshBtn) return;

    refreshBtn.addEventListener('click', async () => {
      refreshBtn.disabled = true;
      refreshBtn.innerHTML = '<span class="material-symbols-outlined animate-spin" style="font-size: 16px;">sync</span> Fetching...';
      try {
        const res = await fetch('https://open.er-api.com/v6/latest/USD', {
          signal: AbortSignal.timeout(6000)
        });
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        const data = await res.json();
        if (data && data.rates) {
          const currUnits = this.categories.currency.units;
          Object.keys(currUnits).forEach(c => {
            if (typeof data.rates[c] === 'number' && data.rates[c] > 0) {
              // Rate is 1 USD = X Currency -> Factor is 1/X
              currUnits[c].factor = 1 / data.rates[c];
            }
          });

          const timeEl = document.getElementById('currency-update-time');
          if (timeEl) {
            timeEl.textContent = `Rates Updated: ${new Date().toLocaleTimeString()} (Source: Open Exchange API)`;
          }
          this.performConversion();
          showToast('Currency exchange rates updated live!', 'check_circle');
        }
      } catch (err) {
        showToast('Offline or API limit reached. Using standard baseline rates.', 'info');
      } finally {
        refreshBtn.disabled = false;
        refreshBtn.innerHTML = '<span class="material-symbols-outlined" style="font-size: 16px;">refresh</span> Refresh Live Rates';
      }
    });
  }
};

/* ==========================================================================
   5. BMI CALCULATOR ENGINE
   ========================================================================== */
const bmiApp = {
  isMetric: true,

  init() {
    const metricBtn = document.getElementById('bmi-metric-btn');
    const imperialBtn = document.getElementById('bmi-imperial-btn');
    const metricFields = document.getElementById('bmi-metric-fields');
    const imperialFields = document.getElementById('bmi-imperial-fields');
    const calcTriggerBtn = document.getElementById('bmi-calc-trigger-btn');

    if (metricBtn && imperialBtn) {
      metricBtn.addEventListener('click', () => {
        this.isMetric = true;
        metricBtn.classList.add('active');
        imperialBtn.classList.remove('active');
        if (metricFields) metricFields.style.display = 'block';
        if (imperialFields) imperialFields.style.display = 'none';
        this.calculateBMI();
      });

      imperialBtn.addEventListener('click', () => {
        this.isMetric = false;
        imperialBtn.classList.add('active');
        metricBtn.classList.remove('active');
        if (metricFields) metricFields.style.display = 'none';
        if (imperialFields) imperialFields.style.display = 'block';
        this.calculateBMI();
      });
    }

    // Input changes
    const inputs = document.querySelectorAll('#bmi-metric-fields input, #bmi-imperial-fields input');
    inputs.forEach(inp => {
      inp.addEventListener('input', () => this.calculateBMI());
    });

    if (calcTriggerBtn) {
      calcTriggerBtn.addEventListener('click', () => {
        this.calculateBMI();
        showToast('BMI calculated!', 'monitor_weight');
      });
    }

    this.calculateBMI();
  },

  calculateBMI() {
    let weightKg = 0;
    let heightM = 0;

    if (this.isMetric) {
      weightKg = parseFloat(document.getElementById('bmi-weight-kg')?.value) || 0;
      const heightCm = parseFloat(document.getElementById('bmi-height-cm')?.value) || 0;
      heightM = heightCm / 100;
    } else {
      const weightLbs = parseFloat(document.getElementById('bmi-weight-lbs')?.value) || 0;
      const heightFt = parseFloat(document.getElementById('bmi-height-ft')?.value) || 0;
      const heightIn = parseFloat(document.getElementById('bmi-height-in')?.value) || 0;

      const totalInches = (heightFt * 12) + heightIn;
      weightKg = weightLbs * 0.45359237;
      heightM = totalInches * 0.0254;
    }

    if (weightKg <= 0 || heightM <= 0) {
      this.renderBMI(0, 0);
      return;
    }

    const bmi = weightKg / (heightM * heightM);
    this.renderBMI(bmi, heightM);
  },

  renderBMI(bmi, heightM) {
    const scoreVal = document.getElementById('bmi-score-val');
    const catBadge = document.getElementById('bmi-cat-badge');
    const catText = document.getElementById('bmi-cat-text');
    const catIcon = document.getElementById('bmi-cat-icon');
    const gaugePointer = document.getElementById('bmi-gauge-pointer');
    const healthyRangeText = document.getElementById('bmi-healthy-range-text');
    const primeVal = document.getElementById('bmi-prime-val');
    const insightText = document.getElementById('bmi-health-insight');

    if (!scoreVal) return;

    if (bmi <= 0 || isNaN(bmi)) {
      scoreVal.textContent = '--';
      if (catText) catText.textContent = 'Enter parameters';
      return;
    }

    const formattedBmi = bmi.toFixed(1);
    scoreVal.textContent = formattedBmi;

    // Categorization
    let category = '';
    let badgeClass = '';
    let iconName = '';
    let insight = '';

    if (bmi < 18.5) {
      category = 'Underweight';
      badgeClass = 'cat-underweight';
      iconName = 'info';
      insight = 'Your BMI is below the standard recommended threshold (< 18.5). Consider consulting a healthcare professional regarding a nutrient-dense nutritional plan.';
    } else if (bmi < 25.0) {
      category = 'Normal Weight';
      badgeClass = 'cat-normal';
      iconName = 'check_circle';
      insight = 'Congratulations! Your BMI is within the standard healthy weight range (18.5 - 24.9) recommended by the World Health Organization (WHO).';
    } else if (bmi < 30.0) {
      category = 'Overweight';
      badgeClass = 'cat-overweight';
      iconName = 'warning';
      insight = 'Your BMI indicates you are slightly above the standard healthy weight range. Balanced lifestyle choices, regular exercise, and portion control are beneficial.';
    } else {
      category = 'Obese Range';
      badgeClass = 'cat-obese';
      iconName = 'error';
      insight = 'Your BMI is in the obesity class range (≥ 30.0). It is recommended to consult a physician or certified dietitian for personalized health guidance.';
    }

    if (catBadge) {
      catBadge.className = `bmi-category-badge ${badgeClass}`;
    }
    if (catText) catText.textContent = category;
    if (catIcon) catIcon.textContent = iconName;
    if (insightText) insightText.textContent = insight;

    // Gauge pointer positioning (maps BMI 10 to 45 -> 0% to 100%)
    const minBmi = 10;
    const maxBmi = 45;
    const clampedBmi = Math.max(minBmi, Math.min(maxBmi, bmi));
    const percent = ((clampedBmi - minBmi) / (maxBmi - minBmi)) * 100;

    if (gaugePointer) {
      gaugePointer.style.left = `${percent}%`;
    }

    // Healthy weight range (BMI 18.5 to 24.9)
    if (heightM > 0) {
      const minHealthyKg = 18.5 * (heightM * heightM);
      const maxHealthyKg = 24.9 * (heightM * heightM);

      if (this.isMetric) {
        if (healthyRangeText) healthyRangeText.textContent = `${minHealthyKg.toFixed(1)} kg – ${maxHealthyKg.toFixed(1)} kg`;
      } else {
        const minLbs = minHealthyKg * 2.20462;
        const maxLbs = maxHealthyKg * 2.20462;
        if (healthyRangeText) healthyRangeText.textContent = `${minLbs.toFixed(1)} lbs – ${maxLbs.toFixed(1)} lbs`;
      }

      // BMI Prime (BMI / 25)
      const prime = bmi / 25;
      if (primeVal) primeVal.textContent = prime.toFixed(2);
    }
  }
};

/* ==========================================================================
   6. AGE & LIFE STATISTICS CALCULATOR
   ========================================================================== */
const ageApp = {
  zodiacData: [
    { sign: 'Capricorn', icon: 'snowing', element: 'Earth', start: [12, 22], end: [1, 19] },
    { sign: 'Aquarius', icon: 'air', element: 'Air', start: [1, 20], end: [2, 18] },
    { sign: 'Pisces', icon: 'water', element: 'Water', start: [2, 19], end: [3, 20] },
    { sign: 'Aries', icon: 'local_fire_department', element: 'Fire', start: [3, 21], end: [4, 19] },
    { sign: 'Taurus', icon: 'eco', element: 'Earth', start: [4, 20], end: [5, 20] },
    { sign: 'Gemini', icon: 'all_inclusive', element: 'Air', start: [5, 21], end: [6, 20] },
    { sign: 'Cancer', icon: 'nightlight', element: 'Water', start: [6, 21], end: [7, 22] },
    { sign: 'Leo', icon: 'sunny', element: 'Fire', start: [7, 23], end: [8, 22] },
    { sign: 'Virgo', icon: 'grass', element: 'Earth', start: [8, 23], end: [9, 22] },
    { sign: 'Libra', icon: 'balance', element: 'Air', start: [9, 23], end: [10, 22] },
    { sign: 'Scorpio', icon: 'water_drop', element: 'Water', start: [10, 23], end: [11, 21] },
    { sign: 'Sagittarius', icon: 'north_east', element: 'Fire', start: [11, 22], end: [12, 21] }
  ],

  chineseZodiacAnimals: ['Rat 🐀', 'Ox 🐂', 'Tiger 🐅', 'Rabbit 🐇', 'Dragon 🐉', 'Snake 🐍', 'Horse 🐎', 'Goat 🐐', 'Monkey 🐒', 'Rooster 🐓', 'Dog 🐕', 'Pig 🐖'],

  init() {
    const dobInput = document.getElementById('age-dob-input');
    const targetInput = document.getElementById('age-target-input');
    const calcBtn = document.getElementById('age-calc-btn');

    // Default target date to today
    if (targetInput) {
      targetInput.valueAsDate = new Date();
    }

    if (calcBtn) {
      calcBtn.addEventListener('click', () => {
        this.calculateAge();
        showToast('Age calculated successfully!', 'event');
      });
    }

    if (dobInput) dobInput.addEventListener('change', () => this.calculateAge());
    if (targetInput) targetInput.addEventListener('change', () => this.calculateAge());

    this.calculateAge();
  },

  calculateAge() {
    const dobVal = document.getElementById('age-dob-input')?.value;
    const targetVal = document.getElementById('age-target-input')?.value;

    if (!dobVal) return;

    const birthDate = new Date(dobVal);
    const targetDate = targetVal ? new Date(targetVal) : new Date();

    if (isNaN(birthDate.getTime()) || isNaN(targetDate.getTime())) return;

    if (birthDate > targetDate) {
      showToast('Date of birth cannot be in the future!', 'warning');
      return;
    }

    // Exact Years, Months, Days calculation
    let years = targetDate.getFullYear() - birthDate.getFullYear();
    let months = targetDate.getMonth() - birthDate.getMonth();
    let days = targetDate.getDate() - birthDate.getDate();

    if (days < 0) {
      months -= 1;
      // Get previous month days count
      const prevMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 0);
      days += prevMonth.getDate();
    }

    if (months < 0) {
      years -= 1;
      months += 12;
    }

    // Display primary Y/M/D
    const resYears = document.getElementById('age-res-years');
    const resMonths = document.getElementById('age-res-months');
    const resDays = document.getElementById('age-res-days');

    if (resYears) resYears.textContent = years;
    if (resMonths) resMonths.textContent = months;
    if (resDays) resDays.textContent = days;

    // Total counts
    const totalMs = targetDate.getTime() - birthDate.getTime();
    const totalDays = Math.floor(totalMs / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.floor(totalDays / 7);
    const totalMonths = (years * 12) + months;
    const totalHours = totalDays * 24;
    const totalMinutes = totalHours * 60;
    const estimatedHeartbeats = Math.floor(totalMinutes * 75); // ~75 bpm

    document.getElementById('age-total-days').textContent = totalDays.toLocaleString();
    document.getElementById('age-total-weeks').textContent = totalWeeks.toLocaleString();
    document.getElementById('age-total-months').textContent = totalMonths.toLocaleString();
    document.getElementById('age-total-hours').textContent = totalHours.toLocaleString();
    document.getElementById('age-total-minutes').textContent = totalMinutes.toLocaleString();

    const heartbeatsEl = document.getElementById('age-total-heartbeats');
    if (heartbeatsEl) {
      if (estimatedHeartbeats > 1e9) {
        heartbeatsEl.textContent = `~${(estimatedHeartbeats / 1e9).toFixed(2)} Billion`;
      } else if (estimatedHeartbeats > 1e6) {
        heartbeatsEl.textContent = `~${(estimatedHeartbeats / 1e6).toFixed(1)} Million`;
      } else {
        heartbeatsEl.textContent = estimatedHeartbeats.toLocaleString();
      }
    }

    // Next Birthday Countdown
    this.calculateNextBirthday(birthDate, targetDate);

    // Zodiac Signs
    this.calculateZodiac(birthDate);
  },

  calculateNextBirthday(birthDate, targetDate) {
    const currentYear = targetDate.getFullYear();
    let nextBday = new Date(currentYear, birthDate.getMonth(), birthDate.getDate());

    if (nextBday < targetDate) {
      nextBday = new Date(currentYear + 1, birthDate.getMonth(), birthDate.getDate());
    }

    const diffMs = nextBday.getTime() - targetDate.getTime();
    const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    const options = { month: 'long', day: 'numeric', weekday: 'long' };
    const dateFormatted = nextBday.toLocaleDateString(undefined, options);

    const bdayDateEl = document.getElementById('age-next-bday-date');
    const bdayDetailEl = document.getElementById('age-next-bday-detail');
    const circleDaysEl = document.getElementById('bday-circle-days-val');
    const progressPath = document.getElementById('bday-progress-path');

    if (bdayDateEl) bdayDateEl.textContent = dateFormatted;
    if (bdayDetailEl) {
      const nextAge = nextBday.getFullYear() - birthDate.getFullYear();
      bdayDetailEl.textContent = daysLeft === 0 ? 'Happy Birthday today! 🎉' : `Turns ${nextAge} in ${daysLeft} days`;
    }
    if (circleDaysEl) circleDaysEl.textContent = daysLeft;

    if (progressPath) {
      // 365 days in full circle
      const progressPercent = Math.max(0, Math.min(100, ((365 - daysLeft) / 365) * 100));
      progressPath.setAttribute('stroke-dasharray', `${progressPercent.toFixed(0)}, 100`);
    }
  },

  calculateZodiac(birthDate) {
    const month = birthDate.getMonth() + 1;
    const day = birthDate.getDate();
    const year = birthDate.getFullYear();

    // Western Zodiac
    let signName = 'Capricorn';
    let signElement = 'Earth';
    let iconName = 'stars';

    for (const z of this.zodiacData) {
      const [startM, startD] = z.start;
      const [endM, endD] = z.end;

      if (startM > endM) {
        // Year wrap (Capricorn: Dec 22 - Jan 19)
        if ((month === startM && day >= startD) || (month === endM && day <= endD)) {
          signName = z.sign;
          signElement = z.element;
          iconName = z.icon;
          break;
        }
      } else {
        if ((month === startM && day >= startD) || (month === endM && day <= endD) || (month > startM && month < endM)) {
          signName = z.sign;
          signElement = z.element;
          iconName = z.icon;
          break;
        }
      }
    }

    const zodiacText = document.getElementById('age-zodiac-text');
    const zodiacIcon = document.getElementById('age-zodiac-icon');
    if (zodiacText) zodiacText.textContent = `${signName} (${signElement})`;
    if (zodiacIcon) zodiacIcon.textContent = iconName;

    // Chinese Zodiac: Cycle of 12 animals (Year % 12, 1900 was Year of the Rat (idx 0))
    const chineseIdx = (year - 4) % 12;
    const chineseAnimal = this.chineseZodiacAnimals[(chineseIdx + 12) % 12];

    const chineseZodiacEl = document.getElementById('age-chinese-zodiac');
    if (chineseZodiacEl) chineseZodiacEl.textContent = chineseAnimal;
  }
};

/* ==========================================================================
   INITIALIZATION ON DOM LOAD
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  ThemeManager.init();
  NavigationManager.init();
  calcApp.init();
  UnitEngine.init();
  bmiApp.init();
  ageApp.init();
});
