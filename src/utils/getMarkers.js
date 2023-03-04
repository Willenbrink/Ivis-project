import colorScheme from "./colorScheme";

export function getMarkers(selected, hovered, category, categoryStatistics){
  const markers = {};
  if (selected)
    markers[selected.id] = { ...selected, hasTooltip: !hovered, value: (selected[category.id] - categoryStatistics.min) / (categoryStatistics.max - categoryStatistics.min), color: colorScheme.selectedCountry };
  if (hovered)
    markers[hovered.id] = { ...hovered, hasTooltip: true, value: ( hovered[category.id] - categoryStatistics.min) / (categoryStatistics.max - categoryStatistics.min), color: colorScheme.hoveredCountry };
  return markers
}