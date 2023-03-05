export function getRange(selected, category, categoryStatistics){
  return selected
        ? {min: categoryStatistics.min, selected: selected[category.id], max: categoryStatistics.max}
        : {min: -1, selected: null, max: 1};
}