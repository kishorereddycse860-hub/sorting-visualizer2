/* Visualizer — owns the array state, the precomputed step trace for the
   selected algorithm, and playback (play/pause/resume/step/reset). */

const ALGO_INFO = {
  bubble: {
    name: 'Bubble Sort',
    fn: bubbleSortSteps,
    desc: 'Repeatedly compares adjacent elements and swaps them if they are in the wrong order, letting larger values "bubble" to the end.',
    best: 'O(n)', avg: 'O(n\u00B2)', worst: 'O(n\u00B2)', space: 'O(1)',
  },
  selection: {
    name: 'Selection Sort',
    fn: selectionSortSteps,
    desc: 'Scans the unsorted portion for the minimum element and swaps it into place at the front, one position at a time.',
    best: 'O(n\u00B2)', avg: 'O(n\u00B2)', worst: 'O(n\u00B2)', space: 'O(1)',
  },
  insertion: {
    name: 'Insertion Sort',
    fn: insertionSortSteps,
    desc: 'Builds the sorted array one element at a time, shifting larger elements right to insert each new value in place.',
    best: 'O(n)', avg: 'O(n\u00B2)', worst: 'O(n\u00B2)', space: 'O(1)',
  },
  merge: {
    name: 'Merge Sort',
    fn: mergeSortSteps,
    desc: 'Recursively divides the array into halves, sorts each half, then merges the sorted halves back together.',
    best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n log n)', space: 'O(n)',
  },
  quick: {
    name: 'Quick Sort',
    fn: quickSortSteps,
    desc: 'Picks a pivot, partitions the array so smaller elements move left and larger ones move right, then recurses on each side.',
    best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n\u00B2)', space: 'O(log n)*',
  },
};

const SPEED_MS = [800, 400, 150, 40];
const SPEED_LABELS = ['Slow', 'Normal', 'Fast', 'Very Fast'];

const VizState = {
  originalArray: [],
  algoKey: 'bubble',
  steps: [],
  stepIndex: 0,
  isPlaying: false,
  timer: null,
  speedLevel: 1,
};

function generateRandomArray(size) {
  const arr = [];
  for (let i = 0; i < size; i++) arr.push(Math.floor(Math.random() * 96) + 5);
  return arr;
}

function recomputeSteps() {
  stopPlayback();
  const fn = ALGO_INFO[VizState.algoKey].fn;
  VizState.steps = fn(VizState.originalArray);
  VizState.stepIndex = 0;
  VizState.isPlaying = false;
  renderCurrentStep();
  updatePlayButton();
}

function stopPlayback() {
  if (VizState.timer) {
    clearTimeout(VizState.timer);
    VizState.timer = null;
  }
  VizState.isPlaying = false;
}

function play() {
  if (VizState.stepIndex >= VizState.steps.length - 1) return;
  VizState.isPlaying = true;
  updatePlayButton();
  tick();
}

function tick() {
  if (!VizState.isPlaying) return;
  if (VizState.stepIndex >= VizState.steps.length - 1) {
    stopPlayback();
    updatePlayButton();
    return;
  }
  VizState.stepIndex++;
  renderCurrentStep();
  VizState.timer = setTimeout(tick, SPEED_MS[VizState.speedLevel]);
}

function pause() {
  stopPlayback();
  updatePlayButton();
}

function stepForward() {
  stopPlayback();
  if (VizState.stepIndex < VizState.steps.length - 1) {
    VizState.stepIndex++;
    renderCurrentStep();
  }
  updatePlayButton();
}

function stepBackward() {
  stopPlayback();
  if (VizState.stepIndex > 0) {
    VizState.stepIndex--;
    renderCurrentStep();
  }
  updatePlayButton();
}

function resetVisualization() {
  stopPlayback();
  VizState.stepIndex = 0;
  renderCurrentStep();
  updatePlayButton();
  clearStepLog();
  showToast('Reset ✓');
}

/* ---------- Rendering ---------- */

function renderCurrentStep() {
  const step = VizState.steps[VizState.stepIndex];
  if (!step) return;
  renderBars(step);
  renderStats(step);
  renderStepLogEntry(step);
  const opEl = document.getElementById('vizOp');
  if (opEl) opEl.textContent = step.message || '';
}

function renderBars(step) {
  const container = document.getElementById('barsContainer');
  if (!container) return;
  const arr = step.array;
  const max = Math.max(...arr, 1);
  const sortedSet = new Set(step.sorted || []);
  const compareSet = new Set(step.comparing || []);
  const swapSet = new Set(step.swapping || []);
  const showValue = arr.length <= 40;

  if (container.children.length !== arr.length) {
    container.innerHTML = '';
    for (let i = 0; i < arr.length; i++) {
      const bar = document.createElement('div');
      bar.className = 'bar';
      const valSpan = document.createElement('span');
      valSpan.className = 'bar-value';
      bar.appendChild(valSpan);
      container.appendChild(bar);
    }
  }

  for (let i = 0; i < arr.length; i++) {
    const bar = container.children[i];
    bar.style.height = `${(arr[i] / max) * 100}%`;
    let cls = 'bar';
    if (sortedSet.has(i)) cls += ' state-sorted';
    if (step.pivot === i) cls += ' state-pivot';
    if (step.min === i) cls += ' state-min';
    if (compareSet.has(i)) cls += ' state-compare';
    if (swapSet.has(i)) cls += ' state-swap';
    bar.className = cls;
    bar.children[0].textContent = showValue ? arr[i] : '';
  }
}

function renderStats(step) {
  const total = VizState.steps.length ? VizState.steps.length - 1 : 0;
  document.getElementById('statAlgo').textContent = ALGO_INFO[VizState.algoKey].name;
  document.getElementById('statSize').textContent = step.array.length;
  document.getElementById('statComparisons').textContent = step.comparisons;
  document.getElementById('statSwaps').textContent = step.swaps;
  document.getElementById('statStep').textContent = `${VizState.stepIndex} / ${total}`;
  document.getElementById('stepCounter').textContent = `Step ${VizState.stepIndex} / ${total}`;
  const done = VizState.stepIndex === total && total > 0;
  document.getElementById('statStatus').textContent = done ? 'Sorting Completed ✓' : (VizState.isPlaying ? 'Sorting...' : (VizState.stepIndex === 0 ? 'Idle' : 'Paused'));
}

function renderStepLogEntry(step) {
  const inner = document.getElementById('stepLogInner');
  if (!inner) return;
  const line = document.createElement('div');
  line.textContent = `#${VizState.stepIndex}  ${step.message || ''}`;
  inner.appendChild(line);
  while (inner.children.length > 200) inner.removeChild(inner.firstChild);
  const log = document.getElementById('stepLog');
  log.scrollTop = log.scrollHeight;
}

function clearStepLog() {
  const inner = document.getElementById('stepLogInner');
  if (inner) inner.innerHTML = '';
}

function updatePlayButton() {
  const btn = document.getElementById('playBtn');
  if (!btn) return;
  const total = VizState.steps.length ? VizState.steps.length - 1 : 0;
  if (VizState.stepIndex >= total && total > 0) {
    btn.textContent = 'Completed';
    btn.disabled = true;
  } else {
    btn.disabled = false;
    btn.textContent = VizState.isPlaying ? 'Pause' : (VizState.stepIndex === 0 ? 'Start' : 'Resume');
  }
}

let toastTimer = null;
function showToast(msg) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.textContent = ''; }, 2200);
}
