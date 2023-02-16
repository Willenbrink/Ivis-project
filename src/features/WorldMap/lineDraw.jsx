import { geoNaturalEarth1, geoPath, geoGraticule, select, zoom } from "d3";
import React, { useState, useCallback, useEffect } from "react";
import { useRef } from "react";
//import { selected, setSelected } from "./WorldMap";

const projection = geoNaturalEarth1();
const path = geoPath(projection);
const graticule = geoGraticule();

let selectedCountry = null;

export function LineDraw({
  data: { iso_countries, non_iso_countries, interiorBorders }, selectCountry,selected,hovered, setHovered,svgRef
}) {
  const gRef = useRef()
  const legendRef = useRef()
  useEffect(()=>{
    if (svgRef && gRef) {
      const svg = select(svgRef.current)
      const g = select(gRef.current)
      svg.call(zoom().on('zoom', (event) => {
        g.attr('transform', event.transform);
      }))
  }
  }, [])
    return (
        <>
        <g className="mark" ref={gRef}>
                <path className="earthSphere" d={path({ type: "Sphere" })}
                    onMouseOver={() => {
                        setHovered(null);
                }} />
                <path className="graticule" d={path(graticule())}
                    onMouseOver={() => {
                        setHovered(null);
                    }} />
          {
            //example country: {"color": "#040", "alpha3": "FJI", "geometry": {"type": "MultiPolygon","coordinates": [[[[100,-10]...]]]
                      //example country: {"color": "#040", "alpha3": "FJI", "geometry": {"type": "MultiPolygon","coordinates": [[[[100,-10]...]]]
                      iso_countries.map(c => (
                          <path
                              key={c.alpha3}
                              id={c.alpha3}
                              fill={c.color}
                              className="country"
                              d={path(c.geometry)}
                              onMouseOver={() => {
                                  if (selected == null || selected != c.id) setHovered(c);
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
            {
                ((hovered != null && (selected == null || selected != hovered))) ?
                    (
                        <path
                                key="hovered"
                                id={hovered.alpha3}
                                fill={hovered.color}
                                className="hoveredCountry"
                                d={path(hovered.geometry)}
                                onMouseLeave={() => {
                                    setHovered(null);
                                }}
                                onClick={(e) => {
                                    setHovered(null);
                                    selectCountry(e.target.id);
                                    selectedCountry = hovered;
                                    
                                }}
                        />
                        ) : ""
                } {
            (selected != null) ?
            (
                <path
                    key={"selected"}
                    id={"selectedCountryBorder"}
                    fill="none"
                    className="selectedCountry"
                    d={path(selectedCountry.geometry)}
                />
            ) : ""
                }
        </g>
        <g className='' ref={legendRef}>
          {/* <rect x="275.62" y="471" width="52" height="10" fill="#fff7ec" stroke="#333" stroke-width="0.3"></rect> */}
        </g>
    </>
  );
}
