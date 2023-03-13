import React, { useState } from "react";
import { Legend } from "../../utils/legend";
import { LineDraw } from "../../utils/lineDraw";
import colorScheme from "../../utils/colorScheme";
import { interpolateRgb } from "d3";
import { useRef } from "react";
import { categories } from "../../utils/categories";
import CategorySelectorInfo from "./CategorySelectorInfo";
import ResetZoomButton from "./ResetZoomButton";
import { getMarkers } from "../../utils/getMarkers";
import { getRange } from "../../utils/getRange";
import useRenderOnSvgMount from "../../hooks/useRenderOnSvgMount";

// Adapted from:
// https://www.pluralsight.com/guides/using-d3.js-inside-a-react-app


export default function WorldMap({data, map, isActiveTab}) {
  //currently selected country
  const [selected, setSelected] = useState(null);
  const [hovered, setHovered] = useState(null);
  // Interactive category selection
  const [category, setCategory] = useState(categories.intervention);
  // Zooming/panning
  const [zoomLevel, setZoomLevel] = useState(null);
  const [doResetZoom, setDoResetZoom] = useState(false); // Reset zoom/pan
  const [zoomCall, setZoomCall] = useState(()=>{}) // Turn on zoom/pan callback
  // Brushing
  const [brushRange, setBrushRange] = useState([-2.0,2.0]) // when brush is off, range is [-2,2]. When brush is on, the range is maximum [-1,1]

  // Render map when svg element has mounted
  const svgRef = useRef(null)
  // const [svgHasMounted, setSvgHasMounted] = useState(false)
  const svgHasMounted = useRenderOnSvgMount(svgRef, isActiveTab)

  const svgLegendRef = useRef(null)
  const svgLegendHasMounted = useRenderOnSvgMount(svgLegendRef, isActiveTab)

  if (!isActiveTab) return <></>

  const categoryStatistics = data.country_values_stats(category.id)
  const range = getRange(selected, category, categoryStatistics)

  //console.log('Countries:', Object.values(map.iso_countries).filter((c) => c?.hasData && isInRange(c[category.id], brushRange)))

  function valueToColor(value, colorForLegend=false) {
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

  function countryToColor(country) {
    const isBrushOn = brushRange[0] > -2;
    if (!country) {
      return isBrushOn ? colorScheme.outOfRange : colorScheme.noData
    }
    if (!isInRange(country[category.id], brushRange)) {
      return colorScheme.outOfRange;
    }
    return valueToColor(country[category.id]);
  };

  const colors = { left: valueToColor(range.min, true), middle: colorScheme.middle, right: valueToColor(range.max, true) };
  const markers = getMarkers(selected, hovered, category, categoryStatistics)

  const svg = (
      <svg width="100%" height="100%" ref={svgRef} onMouseLeave={() => { setHovered(null) } }>
          {svgHasMounted &&
           <>
              <LineDraw
                mapWithData={map}
                svgRef={svgRef}
                countryToColor={countryToColor}
                selected={selected}
                setSelected={setSelected}
                hovered={hovered}
                setHovered={setHovered}
                zoomLevel={zoomLevel}
                setZoomLevel={setZoomLevel}
                doResetZoom={doResetZoom}
                setDoResetZoom={setDoResetZoom}
                setZoomCall={setZoomCall}
                category={category}
              />
              { svgRef.current &&
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
                brushActive
                setBrushRange={setBrushRange}
                showScaleNumbers
          /> }
          </>
          }
      </svg>
  )

  // backdropFilter: 'blur(2px)',
  return (
    <div id="WorldCanvasDiv" className="d-flex flex-grow-1 flex-column position-relative">
      <div className="d-flex flex-column flex-grow-1 position-relative">
        {svg}
      </div>
      <CategorySelectorInfo category={category} setCategory={setCategory} isActiveTab={isActiveTab}/>
      <ResetZoomButton zoomLevel={zoomLevel} setDoResetZoom={setDoResetZoom}/>
      {/* 
      <div className="position-absolute start-0 bottom-0 w-100" style={{ background: 'linear-gradient(360deg, rgb(256,256,256,0.5) 80%, transparent)', backdropFilter: 'blur(1px)', height: '25%'}}>
        {legend}
      </div>
      */}
      {/* 
      <div className="w-25 mx-3">
        <p className="fs-4 mb-2 border-bottom">{categoriesObjects[category].title}</p>
        <p>{categoriesObjects[category].info}</p>
        HERE WE CAN PLACE A POSSIBLE COUNTRY SELECTOR FOR COMPARIONS
      </div>
      */}
    </div>)
}
/*
export const useD3 = (renderChartFn, dependencies) => {
  const ref = React.useRef();

  React.useEffect(() => {
    renderChartFn(d3.select(ref.current));
    return () => {};
  }, dependencies);
  return ref;
};
*/

function isInRange(val, brushRange) {
  if (!val && brushRange[0] > -2) return false;
  if (val < brushRange[0] || val > brushRange[1]) return false;
  else return true;
}
