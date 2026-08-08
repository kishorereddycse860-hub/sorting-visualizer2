/* Selection Sort — Find minimum -> Compare -> Select minimum -> Swap -> Repeat */
function selectionSortSteps(inputArray) {
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

  pushStep({ message: `Starting Selection Sort on ${n} elements.` });

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    pushStep({ min: minIdx, message: `Assuming ${a[i]} at position ${i} is the minimum.` });

    for (let j = i + 1; j < n; j++) {
      comparisons++;
      pushStep({
        comparing: [minIdx, j],
        min: minIdx,
        message: `Comparing current minimum ${a[minIdx]} with ${a[j]}`,
      });
      if (a[j] < a[minIdx]) {
        minIdx = j;
        pushStep({ min: minIdx, message: `New minimum found: ${a[minIdx]} at position ${minIdx}.` });
      }
    }

    if (minIdx !== i) {
      [a[i], a[minIdx]] = [a[minIdx], a[i]];
      swaps++;
      pushStep({ swapping: [i, minIdx], message: `Swapping ${a[minIdx]} and ${a[i]} into position ${i}.` });
    }
    sortedIdx.add(i);
    pushStep({ message: `Position ${i} finalized with value ${a[i]}.` });
  }

  for (let k = 0; k < n; k++) sortedIdx.add(k);
  pushStep({ message: `Selection Sort complete — ${comparisons} comparisons, ${swaps} swaps.` });

  return steps;
}
