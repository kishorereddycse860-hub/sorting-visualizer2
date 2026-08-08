/* Insertion Sort — Select element -> Compare -> Shift -> Insert -> Repeat */
function insertionSortSteps(inputArray) {
  const a = inputArray.slice();
  const n = a.length;
  const steps = [];
  let comparisons = 0;
  let swaps = 0; // counted as shifts, reported as "swaps" for stats consistency

  const pushStep = (extra) => {
    const sortedRange = extra.sortedUpTo !== undefined ? extra.sortedUpTo : null;
    steps.push(Object.assign({
      array: a.slice(),
      comparisons,
      swaps,
      sorted: sortedRange !== null ? Array.from({ length: sortedRange + 1 }, (_, k) => k) : [],
    }, extra));
  };

  pushStep({ sortedUpTo: 0, message: `Starting Insertion Sort — first element is trivially sorted.` });

  for (let i = 1; i < n; i++) {
    const key = a[i];
    let j = i - 1;
    pushStep({ comparing: [i], sortedUpTo: i - 1, message: `Selecting ${key} to insert into the sorted portion.` });

    while (j >= 0) {
      comparisons++;
      pushStep({ comparing: [j, j + 1], sortedUpTo: i - 1, message: `Comparing ${key} with ${a[j]}` });
      if (a[j] > key) {
        a[j + 1] = a[j];
        swaps++;
        pushStep({ swapping: [j, j + 1], sortedUpTo: i - 1, message: `Shifting ${a[j]} one position right.` });
        j--;
      } else {
        break;
      }
    }
    a[j + 1] = key;
    pushStep({ sortedUpTo: i, message: `Inserting ${key} at position ${j + 1}.` });
  }

  pushStep({ sortedUpTo: n - 1, message: `Insertion Sort complete — ${comparisons} comparisons, ${swaps} shifts.` });

  return steps;
}
