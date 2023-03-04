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
import { getMarkers } from "../../utils/getMarkers";
import { getRange } from "../../utils/getRange";
import useRenderOnSvgMount from "../../hooks/useRenderOnSvgMount";

// Adapted from:
// https://www.pluralsight.com/guides/using-d3.js-inside-a-react-app


export default function WorldMap({activetab}) {
  // Currently selected and hovered country
  const [selected, setSelected] = useState(null);
  const [hovered, setHovered] = useState(null);
  // Interactive category selection
  const [category, setCategory] = useState(categories.intervention);
  // Zooming/panning
  const [zoomLevel, setZoomLevel] = useState(null);
  const [doResetZoom, setDoResetZoom] = useState(false); // Reset zoom/pan
  const [zoomCall, setZoomCall] = useState(()=>{}) // Turn on zoom/pan callback
  // Brushing
  const [brushRange, setBrushRange] = useState([-1.0,1.0])

  // Render map when svg element has mounted
  const svgRef = useRef(null)
  const [svgHasMounted, setSvgHasMounted] = useState(false)
  useRenderOnSvgMount(svgRef, svgHasMounted, setSvgHasMounted, activetab)


  const mapData = parseJSON();
  if (!mapData) {
    return <pre>Loading...</pre>;
  }

  const categoryStatistics = country_values_stats(category.id)
  const range = getRange(selected, category, categoryStatistics)


  function valueToColor(value, colorForLegend=false) {
    if (!value)
      return colorScheme.noData;
    var relative_value;
    if(range.selected) {
      relative_value = (value - range.selected) / (range.max - range.min);
      //if (!colorForLegend && (relative_value < brushRange[0] || relative_value) > brushRange[1]) return colorScheme.outOfRange    
    } else {
      // If range.selected is null, we have our reference at 0.
      // But, this means that the extreme ends are only "half the bar" away from the reference.
      // Therefore, we multiply by 2
      relative_value = 2 * value / (range.max - range.min);
      // if (!colorForLegend && (relative_value < brushRange[0] || relative_value) > brushRange[1]) return colorScheme.outOfRange    
    }
    const extreme_color = relative_value < 0 ? colorScheme.left : colorScheme.right;
    //between 0 and 1. 0 is white (=similar to selected), 1 is extreme_color (=not similar to selected)
    const absolute_value = Math.abs(relative_value);
    return interpolateRgb(colorScheme.middle, extreme_color)(absolute_value);
  };
  function countryToColor(country, _) {
    return valueToColor(country[category.id]);
  };

  const colors = { left: valueToColor(range.min, true), middle: colorScheme.middle, right: valueToColor(range.max, true) };
  const markers = getMarkers(selected, hovered, category, categoryStatistics)

  const svg = (
      <svg width="100%" height="100%" ref={svgRef} onMouseLeave={() => { setHovered(null) } }>
          {svgHasMounted &&
           <>
              <LineDraw
                data={mapData}
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
                brushRange={brushRange}
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
                brushActive
                setBrushRange={setBrushRange}
                showScaleNumbers
              />}
          </>
          }
      </svg>
  );
  return (
    activetab && (
    <div id="WorldCanvasDiv" className="d-flex flex-grow-1 flex-column">
      <div className="d-flex flex-column flex-grow-1 position-relative">
        {svg}
      </div>
      <CategorySelectorInfo category={category} setCategory={setCategory} />
      <ResetZoomButton zoomLevel={zoomLevel} setDoResetZoom={setDoResetZoom}/>
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
