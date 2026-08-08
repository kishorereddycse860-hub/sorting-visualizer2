document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initTheme();
  initHeroTrace();
  initControlPanel();
  populateAlgoMeta();
  populateAlgorithmsPage();
  initComparisonPage();

  VizState.originalArray = generateRandomArray(20);
  recomputeSteps();
});
