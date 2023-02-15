import { geoNaturalEarth1, geoPath, geoGraticule } from "d3";
import React, { useState, useCallback, useEffect } from "react";
//import { selected, setSelected } from "./WorldMap";

const projection = geoNaturalEarth1();
const path = geoPath(projection);
const graticule = geoGraticule();

export function LineDraw({
  data: { iso_countries, non_iso_countries, interiorBorders },
}) {

  const [selected, setSelected] = useState(null);
  return (
    <g className="mark">
      <path className="earthSphere" d={path({ type: "Sphere" })} />
      <path className="graticule" d={path(graticule())} />
      {
        //example country: {"alpha3": "FJI", "name": "Fiji", "geometry": {"type": "MultiPolygon","coordinates": [[[[100,-10]...]]]
        iso_countries.map(c => (
          <path
            id={c.alpha3}
            fill={c.alpha3 == selected ? "red" : "#070"}
            className="country"
            d={path(c.geometry)}
            onClick={(e) => {
              setSelected(e.target.id);
            }}
          />
        ))
      }{
        non_iso_countries.map(c => (
          <path
            id={c.alpha3}
            fill={c.alpha3 == selected ? "red" : "#555"}
            className="no_iso_country"
            d={path(c.geometry)}
            onClick={(e) => {
              setSelected(e.target.id);
            }}
          />
        ))
      }
      <path className="interiorBorders" d={path(interiorBorders)} />
    </g>
  );
}
