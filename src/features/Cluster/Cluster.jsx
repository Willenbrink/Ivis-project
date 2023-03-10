import React, { useState, useCallback, useEffect } from "react";
import { LineDraw } from "../../utils/lineDraw";
import colorScheme from "../../utils/colorScheme";
import InfoPopover from "../../utils/InfoPopover";
import { Form, InputGroup, Button } from "react-bootstrap";
import { useRef } from "react";
import { categories } from "../../utils/categories";
import ResetZoomButton from "../../utils/ResetZoomButton";
import useRenderOnSvgMount from "../../hooks/useRenderOnSvgMount";
import colors from "./colorScheme"
// Adapted from:
// https://www.pluralsight.com/guides/using-d3.js-inside-a-react-app

export default function Cluster({clusterData, map, isActiveTab}) {
  const [numClusters, setNumClusters] = useState(3);
  const [countryColorDict, _] = useState({});
  const clusters = clustersOfLevel(clusterData.get_cluster_data(), numClusters);

  //currently selected country
  const [selected, setSelected] = useState(null);
  const [hovered, setHovered] = useState(null);
  // Interactive category selection
  const [category, setCategory] = useState(categories.intervention);
  // Zooming/panning
  const [zoomLevel, setZoomLevel] = useState(null);
  const [doResetZoom, setDoResetZoom] = useState(false); // Reset zoom/pan
  const [zoomCall, setZoomCall] = useState(()=>{}) // Turn on zoom/pan callback

  //TODO: Brushing
  const [brushRange, setBrushRange] = useState([-2.0,2.0]) // when brush is off, range is [-2,2]. When brush is on, the range is maximum [-1,1]

  // Render map when svg element has mounted
  const svgRef = useRef(null)
  const svgHasMounted = useRenderOnSvgMount(svgRef, isActiveTab)

  function clusterSize(cluster) {
    if (cluster[0] === "Leaf") return 1;
    return cluster[4];
  }
  function updateCountryColorDict() {
    const number = numClusters;
    countryColorDict[number] = {};
    for (let i = 0; i < clusters.length; i++) {
      for (let j = 0; j < clusters[i].length; j++) {
        countryColorDict[number][clusters[i][j]] = colors[i];
      } 
    }
  }
  function clustersOfLevel(tree, amount) {
    // tree: ["node", countries: [str], left: tree, right: tree, size] | ["leaf", country: [str] ]
    if (tree[0] === "Leaf") return [tree[1]]

    //we minimize the max. cluster size: greedily split the largest cluster
    var clusters = [tree];
    
    while (clusters.length < amount) {
      //find the largest cluster
      var largestClusterIndex = 0;
      for (var i = 1; i < clusters.length; i++) {
        if (clusterSize(clusters[i]) > clusterSize(clusters[largestClusterIndex])) {
          largestClusterIndex = i;
        }
      }
      //split the largest cluster.
      if (clusters[largestClusterIndex][0] === "Leaf") {
        break;
      }
      var left = clusters[largestClusterIndex][2];
      var right = clusters[largestClusterIndex][3];
      //to make the colors more obvious, one of the sub-clusters keeps the old color (=index of cluster)
      clusters[largestClusterIndex] = left;
      clusters.push(right);
    }
    return clusters.map((x) => x[1]);
  }

  // console.log(clusterData.get_cluster_data());
  //console.log(clusters);
  // console.log(clusters.map((x) => x.length));
  function countryToColor(country) {
    if (!country) {
      return colorScheme.noData
    }
    if (countryColorDict[numClusters] === undefined) {
      updateCountryColorDict(numClusters);
    }
    const val = countryColorDict[numClusters][country.id]
    return val ? val : colorScheme.noData;
  };

  const selectedCluster = clusters.filter((cl) => cl.includes(selected?.id))[0]?.map((country) => map.iso_countries[country]).filter((country) => country !== undefined);

  const svg = (
      <svg width="100%" height="100%" ref={svgRef} onMouseLeave={() => { setHovered(null) } }>
          {svgHasMounted &&
           <>
              <LineDraw
                mapWithData={map}
                svgRef={svgRef}
                countryToColor={countryToColor}
                selected={selectedCluster}
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

  const infoClusteringBody = (
    <div>
      <p className="fw-bold m-0">What is this?</p>
      <p>
        This map shows a clustering of the countries, 
      thereby showing the "culture groups" the world can be divided into. 
      Countries within a cluster have given similar responses. 
      Increasing the number of clusters splits the cluster with the largest cultural difference into two.
      </p>
      
      <p className="fw-bold m-0">How is it computed?</p>
      <p>
      To compute the clusters we use the same distances between countries as the Difference Map. 
      Starting with all countries in their own cluster, we repeatedly merge the two clusters 
      that are most similar. The similarity between two clusters is dependent on the pairwise 
      distances. More precisely, Wards minimum variance method is used.
      </p>
    </div>
  )
  return (
    isActiveTab && <div id="WorldCanvasDiv" className="d-flex flex-grow-1 flex-column">
      <div className="d-flex flex-column flex-grow-1 position-relative">
        {svg}
      </div>
      <div className="px-5 pt-2 position-absolute" id="cd_control">
          <InfoPopover
            title='Culture groups according to each countries averaged responses'
            info={infoClusteringBody}
            isActiveTab={isActiveTab}
          />
      </div>
      <ResetZoomButton zoomLevel={zoomLevel} setDoResetZoom={setDoResetZoom}/>
      <div className="position-absolute w-100 bottom-0 d-flex justify-content-center small" style={{pointerEvents: 'none'}}>
        <div className="legend w-75 p-2 px-5 rounded mx-5 my-4 d-flex flex-column shadow">
          <p className="fs-6 fw-bold">Clustering based on answer similarities for all categories</p>
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
