import React, { useState, useCallback, useEffect } from "react";
import ReactDom from "react-dom";
import { Legend } from "../../utils/legend";
import { LineDraw } from "../../utils/lineDraw";
import colorScheme from "../../utils/colorScheme";
import InfoPopover from "../../utils/InfoPopover";
import { interpolateRgb } from "d3";
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


export default function Cluster({clusterData, map, isActiveTab}) {
  const [numClusters, setNumClusters] = useState(3);
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
  const [svgHasMounted, setSvgHasMounted] = useState(false)
  useRenderOnSvgMount(svgRef, svgHasMounted, setSvgHasMounted, isActiveTab)

  const colors = [
  'red',
  'blue',
  'green',
  'pink',
  'yellow',
    'white',
    'brown',
  ];

  function clustersOfLevel(tree, depth) {
    // console.log(tree);
    const [label, cluster, left, right] = tree;
    if(label === "Node" && depth > 1) {
      const recurse = left[1].length > right[1].length ? left : right;
      const non_recurse = left[1].length > right[1].length ? right : left;
      return [].concat([non_recurse[1]], clustersOfLevel(recurse, depth - 1));
    } else {
      return [cluster];
    }
  }

  const clusters = clustersOfLevel(clusterData.get_cluster_data(), numClusters);
  // console.log(clusterData.get_cluster_data());
  console.log(clusters);
  // console.log(clusters.map((x) => x.length));
  function countryToColor(country, _) {
    // console.log(country);
    for(let i = 0; i < clusters.length; i++) {
      if(clusters[i].includes(country.id)) {
        return colors[i];
      }
    }
    return colorScheme.noData;
  };

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
                brushRange={brushRange}
              />
          </>
          }
      </svg>
  );
  return (
    isActiveTab && <div id="WorldCanvasDiv" className="d-flex flex-grow-1 flex-column">
      <div className="d-flex flex-column flex-grow-1 position-relative">
        {svg}
      </div>
      <input type="range" min="1" max="7" value={numClusters} onChange={(ev) => {setNumClusters(ev.target.valueAsNumber);}}/>
      <ResetZoomButton zoomLevel={zoomLevel} setDoResetZoom={setDoResetZoom}/>
      {/* 
      <div className="w-25 mx-3">
        <p className="fs-4 mb-2 border-bottom">{categoriesObjects[category].title}</p>
        <p>{categoriesObjects[category].info}</p>
        HERE WE CAN PLACE A POSSIBLE COUNTRY SELECTOR FOR COMPARIONS
      </div>
      */}
    </div>)
}

export const useD3 = (renderChartFn, dependencies) => {
  const ref = React.useRef();

  React.useEffect(() => {
    renderChartFn(d3.select(ref.current));
    return () => {};
  }, dependencies);
  return ref;
};
