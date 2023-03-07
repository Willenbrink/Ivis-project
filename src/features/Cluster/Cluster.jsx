import React, { useState, useCallback, useEffect } from "react";
import { LineDraw } from "../../utils/lineDraw";
import colorScheme from "../../utils/colorScheme";
import InfoPopover from "../../utils/InfoPopover";
import { Form, InputGroup, Button } from "react-bootstrap";
import { useRef } from "react";
import { categories } from "../../utils/categories";
import ResetZoomButton from "./ResetZoomButton";
import useRenderOnSvgMount from "../../hooks/useRenderOnSvgMount";
import './Input.css'

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

  const labelsAndColors = [
  {label: 'Cluster 1', color: 'red'},
  {label: 'Cluster 2', color: 'blue'},
  {label: 'Cluster 3', color: 'green'},
  {label: 'Cluster 4', color: 'pink'},
  {label: 'Cluster 5', color: 'yellow'},
  {label: 'Cluster 6', color: 'white'},
  {label: 'Cluster 7', color: 'brown'},
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
        return labelsAndColors[i].color;
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
              {/*svgRef.current && 
              <ClusterLegend svgRef={svgRef} numClusters={numClusters} setNumClusters={setNumClusters}/>
          */}
          </>
          }
      </svg>
  );
  const boxHeight = 25

  function ColorBoxLabel({color='', label='', visible=false}){
    return (
      <div className='d-flex gap-2' style={{transition: 'opacity 3s', opacity: `${visible ? 1 : 0}`}}>
        <div className='border rounded' style={{height: `${boxHeight}px`, width: `${boxHeight}px`, background: `${color}`}}></div>
        <p className="text-nowrap">{label}</p>
      </div>
    )
  }
  return (
    isActiveTab && <div id="WorldCanvasDiv" className="d-flex flex-grow-1 flex-column">
      <div className="d-flex flex-column flex-grow-1 position-relative">
        {svg}
      </div>
      <ResetZoomButton zoomLevel={zoomLevel} setDoResetZoom={setDoResetZoom}/>
      <div className="position-absolute w-100 bottom-0 d-flex justify-content-center small" style={{pointerEvents: 'none'}}>
        <div className="w-75 p-2 px-5 bg-white rounded mx-5 my-4 d-flex flex-column border shadow">
          <p className="fs-6 fw-bold">Clustering based on answer similarities for all cateories</p>
          <div className="d-flex gap-3">
            <div className="d-flex flex-column">
              <p className="text-nowrap">Number of clusters:</p>
              <p className=" invisible m-0">Number of clusters:</p>
              <ColorBoxLabel color={colorScheme.noData} label="No data" visible={true}/>
            </div>
            <div className="d-flex flex-column w-100">
              <div className='d-flex justify-content-between'>
                {labelsAndColors.map((obj, idx) => <p className="m-0">{idx + 1}</p>)}
              </div>
              <input type="range" min="1" max="7" value={numClusters} onChange={(ev) => {setNumClusters(ev.target.valueAsNumber)}} style={{pointerEvents: 'auto'}}/>
              <div className='d-flex justify-content-between mt-4 flex-wrap'>
                {labelsAndColors.map((obj, idx) => <ColorBoxLabel key={obj.label} color={obj.color} label={obj.label} visible={numClusters >= idx+1}/>)}
              </div>
            </div>
          </div>

        </div>
      </div>  


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
