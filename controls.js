/* Controls — DOM wiring for nav, theme, panel controls, algorithms
   reference page, and comparison mode. */

function initNav() {
  const links = document.querySelectorAll('[data-nav]');
  const navLinksWrap = document.querySelector('.nav-links');
  links.forEach((el) => {
    el.addEventListener('click', () => {
      const target = el.getAttribute('data-nav');
      showView(target);
      navLinksWrap.classList.remove('open');
    });
  });
  document.getElementById('navBurger').addEventListener('click', () => {
    navLinksWrap.classList.toggle('open');
  });
}

function showView(name) {
  document.querySelectorAll('.view').forEach((v) => v.classList.remove('active'));
  document.getElementById(`view-${name}`).classList.add('active');
  document.querySelectorAll('.nav-link').forEach((l) => {
    l.classList.toggle('active', l.getAttribute('data-nav') === name);
  });
  window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
}

function initTheme() {
  const root = document.documentElement;
  const saved = null; // no localStorage per environment constraints — session default only
  const toggle = document.getElementById('themeToggle');
  toggle.addEventListener('click', () => {
    const cur = root.getAttribute('data-theme');
    const next = cur === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    toggle.querySelector('.theme-icon').textContent = next === 'dark' ? '☾' : '☀';
  });
}

function initHeroTrace() {
  const trace = document.getElementById('heroTrace');
  if (!trace) return;
  const bars = generateRandomArray(48);
  const max = Math.max(...bars);
  trace.innerHTML = '';
  bars.forEach((v) => {
    const span = document.createElement('span');
    span.style.height = `${(v / max) * 100}%`;
    trace.appendChild(span);
  });
}

function populateAlgoMeta() {
  const miniDesc = document.getElementById('algoMiniDesc');
  const miniCx = document.getElementById('complexityMini');
  const info = ALGO_INFO[VizState.algoKey];
  document.getElementById('vizAlgoName').textContent = info.name;
  miniDesc.textContent = info.desc;
  miniCx.innerHTML = `
    <div><span class="cx-label">Best</span><span class="cx-val">${info.best}</span></div>
    <div><span class="cx-label">Avg</span><span class="cx-val">${info.avg}</span></div>
    <div><span class="cx-label">Worst</span><span class="cx-val">${info.worst}</span></div>
    <div><span class="cx-label">Space</span><span class="cx-val">${info.space}</span></div>
  `;
}

function initControlPanel() {
  const algoSelect = document.getElementById('algoSelect');
  algoSelect.addEventListener('change', () => {
    VizState.algoKey = algoSelect.value;
    populateAlgoMeta();
    recomputeSteps();
    clearStepLog();
  });

  const sizeSlider = document.getElementById('sizeSlider');
  const sizeValue = document.getElementById('sizeValue');
  sizeSlider.addEventListener('input', () => {
    sizeValue.textContent = sizeSlider.value;
  });
  sizeSlider.addEventListener('change', () => {
    VizState.originalArray = generateRandomArray(parseInt(sizeSlider.value, 10));
    recomputeSteps();
    clearStepLog();
    showToast('Array Generated ✓');
  });

  document.getElementById('randomBtn').addEventListener('click', () => {
    VizState.originalArray = generateRandomArray(parseInt(sizeSlider.value, 10));
    recomputeSteps();
    clearStepLog();
    showToast('Array Generated ✓');
  });

  document.getElementById('manualBtn').addEventListener('click', applyManualInput);
  document.getElementById('manualInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') applyManualInput();
  });

  const speedSlider = document.getElementById('speedSlider');
  const speedValue = document.getElementById('speedValue');
  speedSlider.addEventListener('input', () => {
    VizState.speedLevel = parseInt(speedSlider.value, 10);
    speedValue.textContent = SPEED_LABELS[VizState.speedLevel];
  });

  document.getElementById('playBtn').addEventListener('click', () => {
    if (VizState.isPlaying) {
      pause();
      showToast('Visualization Paused');
    } else {
      play();
      showToast(VizState.stepIndex === 0 ? 'Visualization Started' : 'Visualization Resumed');
    }
  });
  document.getElementById('stepFwdBtn').addEventListener('click', stepForward);
  document.getElementById('stepBackBtn').addEventListener('click', stepBackward);
  document.getElementById('resetBtn').addEventListener('click', resetVisualization);
}

function applyManualInput() {
  const input = document.getElementById('manualInput');
  const hint = document.getElementById('inputHint');
  const raw = input.value.trim();
  if (!raw) {
    hint.textContent = 'Enter comma-separated numbers, e.g. 45, 12, 78';
    hint.className = 'input-hint error';
    return;
  }
  const parts = raw.split(',').map((s) => s.trim()).filter((s) => s.length > 0);
  const nums = parts.map((p) => Number(p));
  if (nums.length < 2) {
    hint.textContent = 'Enter at least 2 values.';
    hint.className = 'input-hint error';
    return;
  }
  if (nums.some((n) => Number.isNaN(n) || !Number.isFinite(n))) {
    hint.textContent = 'Only valid numbers are allowed.';
    hint.className = 'input-hint error';
    return;
  }
  if (nums.length > 80) {
    hint.textContent = 'Please enter 80 values or fewer.';
    hint.className = 'input-hint error';
    return;
  }
  // Normalize for bar heights: shift so minimum displayable value is at least 1
  const minVal = Math.min(...nums);
  const shift = minVal <= 0 ? Math.abs(minVal) + 1 : 0;
  const normalized = nums.map((n) => Math.round(n) + shift);

  VizState.originalArray = normalized;
  document.getElementById('sizeSlider').value = Math.min(70, Math.max(5, normalized.length));
  document.getElementById('sizeValue').textContent = normalized.length;
  recomputeSteps();
  clearStepLog();
  hint.textContent = `Custom array of ${normalized.length} values set.`;
  hint.className = 'input-hint ok';
  showToast('Array Generated ✓');
}

/* ---------- Algorithms reference page ---------- */

function populateAlgorithmsPage() {
  const cardsWrap = document.getElementById('algoCards');
  const tableBody = document.getElementById('complexityTableBody');
  cardsWrap.innerHTML = '';
  tableBody.innerHTML = '';

  Object.entries(ALGO_INFO).forEach(([key, info]) => {
    const card = document.createElement('div');
    card.className = 'algo-card';
    card.innerHTML = `
      <h3>${info.name}</h3>
      <p>${info.desc}</p>
      <div class="cx-row">
        <div><span>Best</span>${info.best}</div>
        <div><span>Avg</span>${info.avg}</div>
        <div><span>Worst</span>${info.worst}</div>
        <div><span>Space</span>${info.space}</div>
      </div>
    `;
    card.addEventListener('click', () => {
      VizState.algoKey = key;
      document.getElementById('algoSelect').value = key;
      populateAlgoMeta();
      recomputeSteps();
      clearStepLog();
      showView('visualizer');
    });
    cardsWrap.appendChild(card);

    const row = document.createElement('tr');
    row.innerHTML = `<td>${info.name}</td><td>${info.best}</td><td>${info.avg}</td><td>${info.worst}</td><td>${info.space}</td>`;
    tableBody.appendChild(row);
  });
}

/* ---------- Comparison mode ---------- */

function initComparisonPage() {
  const selA = document.getElementById('compareA');
  const selB = document.getElementById('compareB');
  [selA, selB].forEach((sel, idx) => {
    sel.innerHTML = '';
    Object.entries(ALGO_INFO).forEach(([key, info]) => {
      const opt = document.createElement('option');
      opt.value = key;
      opt.textContent = info.name;
      sel.appendChild(opt);
    });
    sel.selectedIndex = idx === 0 ? 0 : 4;
  });

  const sizeSlider = document.getElementById('compareSize');
  const sizeValue = document.getElementById('compareSizeValue');
  sizeSlider.addEventListener('input', () => { sizeValue.textContent = sizeSlider.value; });

  document.getElementById('runCompareBtn').addEventListener('click', runComparison);
}

function runComparison() {
  const keyA = document.getElementById('compareA').value;
  const keyB = document.getElementById('compareB').value;
  const size = parseInt(document.getElementById('compareSize').value, 10);
  const arr = generateRandomArray(size);

  const stepsA = ALGO_INFO[keyA].fn(arr);
  const stepsB = ALGO_INFO[keyB].fn(arr);
  const lastA = stepsA[stepsA.length - 1];
  const lastB = stepsB[stepsB.length - 1];

  const maxSteps = Math.max(stepsA.length, stepsB.length);
  const maxComp = Math.max(lastA.comparisons, lastB.comparisons, 1);
  const maxSwap = Math.max(lastA.swaps, lastB.swaps, 1);

  const results = document.getElementById('compareResults');
  const buildCard = (key, last, stepsLen) => {
    const info = ALGO_INFO[key];
    return `
      <div class="compare-card">
        <h4>${info.name}</h4>
        <div class="compare-row"><span>Comparisons</span><span>${last.comparisons}</span></div>
        <div class="compare-bar-track"><div class="compare-bar-fill" style="width:${(last.comparisons / maxComp) * 100}%"></div></div>
        <div class="compare-row"><span>Swaps / Writes</span><span>${last.swaps}</span></div>
        <div class="compare-bar-track"><div class="compare-bar-fill" style="width:${(last.swaps / maxSwap) * 100}%; background:var(--signal-coral)"></div></div>
        <div class="compare-row"><span>Total Steps</span><span>${stepsLen - 1}</span></div>
        <div class="compare-bar-track"><div class="compare-bar-fill" style="width:${((stepsLen - 1) / maxSteps) * 100}%; background:var(--signal-amber)"></div></div>
        <div class="compare-row"><span>Array Size</span><span>${size}</span></div>
      </div>
    `;
  };

  results.innerHTML = buildCard(keyA, lastA, stepsA.length) + buildCard(keyB, lastB, stepsB.length);
  showToast('Comparison Complete ✓');
}
