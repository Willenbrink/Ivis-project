import React, { useState, useCallback, useEffect } from "react";
import ReactDom from "react-dom";
import { parseJSON } from "../../utils/parseMapJSON";
import { Legend } from "../../utils/legend";
import { LineDraw } from "../../utils/lineDraw";
import colorScheme from "../../utils/colorScheme";
import InfoPopover from "../../utils/InfoPopover";
import { interpolateRgb } from "d3";
import { country_values_stats } from "../../model/dataHandler";
import { Form, InputGroup, Button } from "react-bootstrap";
import { useRef } from "react";
import { categories } from "../../utils/categories";
import useWindowDimensions from "../../hooks/windowResizeHook";
import CategorySelectorInfo from "./CategorySelectorInfo";
import ResetZoomButton from "./ResetZoomButton";

// Adapted from:
// https://www.pluralsight.com/guides/using-d3.js-inside-a-react-app

const canvasWidth = "100%";
const canvasHeight = "100%";

export default function WorldMap({activeTab}) {
  // Currently selected country
  const [selected, setSelected] = useState(null);
  const [hovered, setHovered] = useState(null);
  // Interactive category selection
  const [category, setCategory] = useState(categories.intervention);
  // Zooming
  const [zoomLevel, zoomLevelSetter] = useState(null);
  // For reseting the map zoom
  const [doReset, setDoReset] = useState(false);
  // Zoom/pan callback
  const [zoomCall, setZoomCall] = useState(()=>{})

  // Fix for map not rendering on start
  const svgRef = useRef(null)
  const [svgHasMounted, setSvgHasMounted] = useState(false)
  useEffect(()=>{
    /* 
    Only render the map when the svg element has been assigned to the react reference (svgRef).
    We do this because svgRef is used in child components to draw the map.
    */
    if(svgRef.current !== null) {
      setSvgHasMounted(true)
    } else {
      // When we switch tab, svgRef is set to null, so we also se svgHasMounted to false
      setSvgHasMounted(false)
    }
    /* 
    svgRef?.current?.clientWidth: when the width of the svg changes it triggers the useEffect (it rerenders the map)
    This solves a bug where the map is rendered but with height, width = 0
    */
  },[activeTab, svgRef?.current?.clientWidth])


  const mapData = parseJSON();
  if (!mapData) {
    return <pre>Loading...</pre>;
  }

  const categoryStatistics = country_values_stats(category.id);
  const range = selected
        ? {min: categoryStatistics.min, selected: selected[category.id], max: categoryStatistics.max}
        : {min: -1, selected: null, max: 1};


  function valueToColor(value) {
    if (!value)
      return colorScheme.noData;
    var relative_value;
    if(range.selected) {
      relative_value = (value - range.selected) / (range.max - range.min);
    } else {
      // If range.selected is null, we have our reference at 0.
      // But, this means that the extreme ends are only "half the bar" away from the reference.
      // Therefore, we multiply by 2
      relative_value = 2 * value / (range.max - range.min);
    }
    const extreme_color = relative_value < 0 ? colorScheme.left : colorScheme.right;
    //between 0 and 1. 0 is white (=similar to selected), 1 is extreme_color (=not similar to selected)
    const absolute_value = Math.abs(relative_value);
    return interpolateRgb(colorScheme.middle, extreme_color)(absolute_value);
  };
  function countryToColor(country, _) {
    return valueToColor(country[category.id]);
  };

  const colors = { left: valueToColor(range.min), middle: colorScheme.middle, right: valueToColor(range.max) };
  const markers = {};
  if (selected)
    markers[selected.id] = { ...selected, hasTooltip: !hovered, value: (selected[category.id] - categoryStatistics.min) / (categoryStatistics.max - categoryStatistics.min), color: colorScheme.selectedCountry };
  if (hovered)
    markers[hovered.id] = { ...hovered, hasTooltip: true, value: ( hovered[category.id] - categoryStatistics.min) / (categoryStatistics.max - categoryStatistics.min), color: colorScheme.hoveredCountry };

  const svg = (
      <svg width={canvasWidth} height={canvasHeight} ref={svgRef} onMouseLeave={() => { setHovered(null) } }>
          {svgHasMounted &&
           <>
              <LineDraw
                data={mapData}
                countryToColor={countryToColor}
                selectCountry={setSelected}
                selected={selected}
                hovered={hovered}
                setHovered={setHovered}
                svgRef={svgRef}
                zoomLevel={zoomLevel}
                zoomLevelSetter={zoomLevelSetter}
                doReset={doReset}
                setDoReset={setDoReset}
                setZoomCall={setZoomCall}
              />
              {svgRef.current &&
              <Legend
                svgRef={svgRef}
                range={range}
                showRange={true}
                category={category}
                categoryStatistics={categoryStatistics}
                selected={selected}
                colors={colors}
                markers={markers}
                zoomCall={zoomCall}
              />}
          </>
          }
      </svg>
  );
  return (
    activeTab && (
    <div id="WorldCanvasDiv" className="d-flex flex-grow-1 flex-column">
      <div className="d-flex flex-column flex-grow-1 position-relative">
        {svg}
      </div>
      <CategorySelectorInfo category={category} setCategory={setCategory} />
      <ResetZoomButton zoomLevel={zoomLevel} setDoReset={setDoReset}/>
      {/* 
      <div className="w-25 mx-3">
        <p className="fs-4 mb-2 border-bottom">{categoriesObjects[category].title}</p>
        <p>{categoriesObjects[category].info}</p>
        HERE WE CAN PLACE A POSSIBLE COUNTRY SELECTOR FOR COMPARIONS
      </div>
      */}
    </div>)
    )
}

export const useD3 = (renderChartFn, dependencies) => {
  const ref = React.useRef();

  React.useEffect(() => {
    renderChartFn(d3.select(ref.current));
    return () => {};
  }, dependencies);
  return ref;
};
