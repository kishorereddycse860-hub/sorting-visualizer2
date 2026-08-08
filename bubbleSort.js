/* Bubble Sort — generates a full array of "step" snapshots.
   Each step describes exactly one operation of the real algorithm:
   Compare -> Swap if required -> Move forward -> Repeat. */
function bubbleSortSteps(inputArray) {
  const a = inputArray.slice();
  const n = a.length;
  const steps = [];
  let comparisons = 0;
  let swaps = 0;
  const sortedIdx = new Set();

  const pushStep = (extra) => {
    steps.push(Object.assign({
      array: a.slice(),
      comparisons,
      swaps,
      sorted: Array.from(sortedIdx),
    }, extra));
  };

  pushStep({ message: `Starting Bubble Sort on ${n} elements.` });

  for (let i = 0; i < n - 1; i++) {
    let swappedThisPass = false;
    for (let j = 0; j < n - 1 - i; j++) {
      comparisons++;
      pushStep({
        comparing: [j, j + 1],
        message: `Comparing ${a[j]} and ${a[j + 1]}`,
      });

      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        swaps++;
        swappedThisPass = true;
        pushStep({
          swapping: [j, j + 1],
          message: `Swapping ${a[j + 1]} and ${a[j]} — ${a[j + 1]} was greater`,
        });
      }
    }
    sortedIdx.add(n - 1 - i);
    pushStep({ message: `Element ${a[n - 1 - i]} is fixed at position ${n - 1 - i}.` });
    if (!swappedThisPass) break;
  }

  for (let k = 0; k < n; k++) sortedIdx.add(k);
  pushStep({ message: `Bubble Sort complete — ${comparisons} comparisons, ${swaps} swaps.` });

  return steps;
}
