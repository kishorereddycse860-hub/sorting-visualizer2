/* Merge Sort — Divide -> Divide -> Compare -> Merge -> Repeat
   The working array is always the full-length array; steps highlight
   the sub-range currently being divided/merged and the exact indices
   being compared or written. */
function mergeSortSteps(inputArray) {
  const a = inputArray.slice();
  const n = a.length;
  const steps = [];
  let comparisons = 0;
  let swaps = 0; // counted as "writes" during merge, reported as swaps for stat consistency

  const pushStep = (extra) => {
    steps.push(Object.assign({
      array: a.slice(),
      comparisons,
      swaps,
      sorted: [],
    }, extra));
  };

  pushStep({ message: `Starting Merge Sort — dividing the array into halves.` });

  function mergeSort(lo, hi) {
    if (hi - lo <= 1) return;
    const mid = Math.floor((lo + hi) / 2);
    pushStep({
      range: [lo, hi - 1],
      message: `Dividing range [${lo}..${hi - 1}] into [${lo}..${mid - 1}] and [${mid}..${hi - 1}]`,
    });
    mergeSort(lo, mid);
    mergeSort(mid, hi);
    merge(lo, mid, hi);
  }

  function merge(lo, mid, hi) {
    const left = a.slice(lo, mid);
    const right = a.slice(mid, hi);
    let i = 0, j = 0, k = lo;

    pushStep({ range: [lo, hi - 1], message: `Merging [${lo}..${mid - 1}] and [${mid}..${hi - 1}]` });

    while (i < left.length && j < right.length) {
      comparisons++;
      pushStep({
        comparing: [lo + i, mid + j],
        range: [lo, hi - 1],
        message: `Comparing ${left[i]} and ${right[j]}`,
      });
      if (left[i] <= right[j]) {
        a[k] = left[i];
        i++;
      } else {
        a[k] = right[j];
        j++;
      }
      swaps++;
      pushStep({
        swapping: [k],
        range: [lo, hi - 1],
        message: `Placing ${a[k]} at position ${k}`,
      });
      k++;
    }
    while (i < left.length) {
      a[k] = left[i];
      swaps++;
      pushStep({ swapping: [k], range: [lo, hi - 1], message: `Placing remaining ${a[k]} at position ${k}` });
      i++; k++;
    }
    while (j < right.length) {
      a[k] = right[j];
      swaps++;
      pushStep({ swapping: [k], range: [lo, hi - 1], message: `Placing remaining ${a[k]} at position ${k}` });
      j++; k++;
    }
    pushStep({ range: [lo, hi - 1], message: `Range [${lo}..${hi - 1}] merged and sorted.` });
  }

  mergeSort(0, n);

  const finalStep = pushStep;
  steps.push(Object.assign({
    array: a.slice(),
    comparisons,
    swaps,
    sorted: Array.from({ length: n }, (_, k) => k),
    message: `Merge Sort complete — ${comparisons} comparisons, ${swaps} writes.`,
  }));

  return steps;
}
