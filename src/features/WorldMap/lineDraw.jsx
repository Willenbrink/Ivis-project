import { geoNaturalEarth1, geoPath, geoGraticule } from "d3";
import React, { useState, useCallback, useEffect } from "react";
//import { selected, setSelected } from "./WorldMap";

const projection = geoNaturalEarth1();
const path = geoPath(projection);
const graticule = geoGraticule();

export function LineDraw({ data: {countries, interiorBorders} } ) {
  const [selected, setSelected] = useState(null);
  return (
  <g className="mark">
  <path className="earthSphere" d={path({ type:"Sphere"})}/>
    <path className="graticule" d={path(graticule())} />
    {
  	countries.features.map(feature => (
      <path id={feature.properties.name} fill={feature.properties.name == selected ? "red" : "green"} className="country" d={path(feature)} onClick={e => {
          setSelected(e.target.id);
        }}/>
    ))} 
      <path className="interiorBorders" d={path(interiorBorders)} />
  </g>);
};