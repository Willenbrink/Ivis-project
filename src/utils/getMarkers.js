import colorScheme from "./colorScheme";

export function getMarkers(selected, hovered, category, categoryStatistics){
  const markers = {};
  if (selected)
    markers[selected.id] = { ...selected, hasTooltip: !hovered, value: (selected[category.id] - categoryStatistics.min) / (categoryStatistics.max - categoryStatistics.min), color: colorScheme.selectedCountry };
  if (hovered)
    markers[hovered.id] = { ...hovered, hasTooltip: true, value: ( hovered[category.id] - categoryStatistics.min) / (categoryStatistics.max - categoryStatistics.min), color: colorScheme.hoveredCountry };
  return markers
}

export function getMarkersDistance(selected, hovered, distance){
  const markers = {};
  if (selected)
    markers[selected.id] = { ...selected, hasTooltip: !hovered, value: 0, color: colorScheme.selectedCountry };
  if (hovered && distance !== 0 && distance !== null && distance !== undefined)
    markers[hovered.id] = { ...hovered, hasTooltip: true, value: distance, color: colorScheme.hoveredCountry };
  return markers
}
