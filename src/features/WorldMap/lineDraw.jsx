import { geoNaturalEarth1, geoPath, geoGraticule, event, select, zoom } from "d3";
import React, { useState, useCallback, useEffect } from "react";
import { useRef } from "react";
//import { selected, setSelected } from "./WorldMap";

const projection = geoNaturalEarth1();
const path = geoPath(projection);
const graticule = geoGraticule();


export function LineDraw({
  data: { iso_countries, non_iso_countries, interiorBorders }, selectCountry, svgRef
}) {
  const gRef = useRef()
  useEffect(()=>{
    const svg = select(svgRef.current)
    svg.call(zoom().on('zoom', () => {
      g.attr('transform', event.transform);
    }));
  }, [])

  return (
    <g className="mark" ref={gRef}>
      <path className="earthSphere" d={path({ type: "Sphere" })} />
      <path className="graticule" d={path(graticule())} />
      {
        //example country: {"color": "#040", "alpha3": "FJI", "geometry": {"type": "MultiPolygon","coordinates": [[[[100,-10]...]]]
        iso_countries.map(c => (
          <path
            key={c.alpha3}
            id={c.alpha3}
            fill={c.color}
            className="country"
            d={path(c.geometry)}
            onClick={(e) => {
              selectCountry(e.target.id);
            }}
          />
        ))
      }{
        //example country: {"geometry": {"type": "MultiPolygon","coordinates": [[[[100,-10]...]]]
        non_iso_countries.map((c, idx) => (
          <path
            key={`no_iso_country_${idx}`}
            fill="#555"
            className="no_iso_country"
            d={path(c.geometry)}
          />
        ))
      }
      <path className="interiorBorders" d={path(interiorBorders)} />
    </g>
  );
}
