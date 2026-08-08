/* Quick Sort (Lomuto partition) — Select pivot -> Partition -> Swap/Move
   -> Recursive partitioning. Each pivot's final resting index is
   genuinely in its correct sorted position, so it's marked finalized
   as soon as the partition completes. */
function quickSortSteps(inputArray) {
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

  pushStep({ message: `Starting Quick Sort on ${n} elements.` });

  function partition(lo, hi) {
    const pivotVal = a[hi];
    pushStep({ pivot: hi, range: [lo, hi], message: `Selecting pivot ${pivotVal} at position ${hi}.` });

    let i = lo - 1;
    for (let j = lo; j < hi; j++) {
      comparisons++;
      pushStep({
        comparing: [j, hi],
        pivot: hi,
        range: [lo, hi],
        message: `Comparing ${a[j]} with pivot ${pivotVal}`,
      });
      if (a[j] < pivotVal) {
        i++;
        if (i !== j) {
          [a[i], a[j]] = [a[j], a[i]];
          swaps++;
          pushStep({
            swapping: [i, j],
            pivot: hi,
            range: [lo, hi],
            message: `Swapping ${a[j]} and ${a[i]} — ${a[i]} belongs left of the pivot.`,
          });
        }
      }
    }
    [a[i + 1], a[hi]] = [a[hi], a[i + 1]];
    swaps++;
    sortedIdx.add(i + 1);
    pushStep({
      swapping: [i + 1, hi],
      range: [lo, hi],
      message: `Placing pivot ${a[i + 1]} at its final position ${i + 1}.`,
    });
    return i + 1;
  }

  function quickSort(lo, hi) {
    if (lo >= hi) {
      if (lo === hi) { sortedIdx.add(lo); pushStep({ message: `Single element ${a[lo]} is already in place.` }); }
      return;
    }
    pushStep({ range: [lo, hi], message: `Partitioning range [${lo}..${hi}]` });
    const p = partition(lo, hi);
    quickSort(lo, p - 1);
    quickSort(p + 1, hi);
  }

  quickSort(0, n - 1);

  for (let k = 0; k < n; k++) sortedIdx.add(k);
  pushStep({ message: `Quick Sort complete — ${comparisons} comparisons, ${swaps} swaps.` });

  return steps;
}
