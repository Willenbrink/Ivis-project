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
import ClusterLegend from "./ClusterLegend";
// Adapted from:
// https://www.pluralsight.com/guides/using-d3.js-inside-a-react-app

export default function Cluster({clusterData, map, isActiveTab}) {
  const [numClusters, setNumClusters] = useState(3);
  const [countryColorDict, _] = useState({});
  const [linkage, setLinkage] = useState("ward_norm");
  const clusters = clustersOfLevel(clusterData[linkage].get_cluster_data(), numClusters);

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
    countryColorDict[linkage] = {};
    countryColorDict[linkage][number] = {};
    for (let i = 0; i < clusters.length; i++) {
      for (let j = 0; j < clusters[i].length; j++) {
        countryColorDict[linkage][number][clusters[i][j]] = colors[i];
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
    if (!countryColorDict[linkage] || countryColorDict[linkage][numClusters] === undefined) {
      updateCountryColorDict(numClusters);
    }
    const val = countryColorDict[linkage][numClusters][country.id]
    return val ? val : colorScheme.noData;
  };

  const selectedCluster = clusters.filter((cl) => cl.includes(selected?.id))[0]?.map((country) => map.iso_countries[country]).filter((country) => country !== undefined);

  const svg = (
      <svg width="100%" height="100%" ref={svgRef} onMouseLeave={() => { setHovered(null) } } onClick={()=> {if (!hovered) setSelected(null)}}>
          {svgHasMounted &&
           <>
              <LineDraw
                mapWithData={map}
                svgRef={svgRef}
                countryToColor={countryToColor}
                selected={selected}
                selectedCluster={selectedCluster}
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
          </>
          }
      </svg>
  );
  const boxHeight = 25

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
      distances using a linkage.
      </p>
      <p className="fw-bold m-0">What are linkages and which are available?</p>
      <p>
        A linkage describes the distance between two clusters and is based on the pairwise distances between countries. The maximum linkage method uses the maximum difference between the countries of the clusters. This means that all countries must be close to another for clusters to be considered close. Ward's minimum variance method aims to minimize the variance within each cluster and is generally superior. The normalized variants weigh each category identically, even if the ranges are smaller. This causes "irrelevant" categories to strongly influence the results. We advise against normalization and include it mainly for consistency with the Moral Machine paper that uses the normalized Ward's linkage.
      </p>
    </div>
  )

  return (
    isActiveTab && <div id="WorldCanvasDiv" className="d-flex flex-grow-1 flex-column">
      <div className="d-flex flex-column flex-grow-1 position-relative">
        {svg}
      </div>

    <InputGroup className="px-5 pt-2 position-absolute" style={{width: "90%"}}>
      <InputGroup.Text id='basic-addon2' className='category-selector-text'>Linkage:</InputGroup.Text>
        <Form.Select
        aria-label="Default select example!"
        onChange={((e) => setLinkage(e.target.value))}
        value={linkage}
        className='fw-bold category-form'
        >
        <option value="maximum">Maximum Linkage</option>
        <option value="maximum_norm">Normalized Maximum Linkage</option>
        <option value="ward">Ward's Linkage</option>
        <option value="ward_norm">Normalized Ward's Linkage</option>
        </Form.Select>
          <InfoPopover
            title='Culture groups according to each countries averaged responses'
            info={infoClusteringBody}
            isActiveTab={isActiveTab}
            className="info-box"
          />
    </InputGroup>
      <ResetZoomButton zoomLevel={zoomLevel} setDoResetZoom={setDoResetZoom}/>
      <ClusterLegend colors={colors} numClusters={numClusters} setNumClusters={setNumClusters} boxHeight={boxHeight}/>
      {/* 
      <div className="w-25 mx-3">
        <p className="fs-4 mb-2 border-bottom">{categoriesObjects[category].title}</p>
        <p>{categoriesObjects[category].info}</p>
        HERE WE CAN PLACE A POSSIBLE COUNTRY SELECTOR FOR COMPARIONS
      </div>
      */}
    </div>)
}
