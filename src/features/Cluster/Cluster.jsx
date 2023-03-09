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
  const svgHasMounted = useRenderOnSvgMount(svgRef, isActiveTab)

  // Created using IWantHue
  const colors_7 =
        ["#be5dae",
"#61ab51",
"#7377cc",
"#a3943f",
"#cc566a",
"#4ab0aa",
"#cd6c39"];
  const colors_10 =
        ["#c75980",
         "#98894c",
         "#bd5cb5",
         "#b3a533",
         "#798dc6",
         "#d46f27",
         "#4aaa86",
         "#7a6bd5",
         "#5cac48",
         "#cd5a4d"]
  ;
  const colors_20 =


["#cfa637",
"#6f6ada",
"#9bb833",
"#bb55c2",
"#5aba50",
"#d3529a",
"#448a48",
"#d6436a",
"#58c7ae",
"#cf4734",
"#6197d5",
"#ca7432",
"#745ea5",
"#96a857",
"#d08ecd",
"#776b27",
"#a04b6c",
"#2f8a72",
"#c56f62",
"#cf9f68"]
;
  const colors = colors_7;

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
  //console.log(clusters);
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
                {colors.map((obj, idx) => <p key={idx} className="m-0">{idx + 1}</p>)}
              </div>
              <input type="range" min="1" max={colors.length} value={numClusters} onChange={(ev) => {setNumClusters(ev.target.valueAsNumber)}} style={{pointerEvents: 'auto'}}/>
              <div className='d-flex justify-content-between mt-4 flex-wrap'>
                {colors.map((obj, idx) => {
                  const label = "Cluster " + (idx + 1);
                  return <ColorBoxLabel key={label} color={obj} label={label} visible={numClusters >= idx+1}/>;
                })}
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
