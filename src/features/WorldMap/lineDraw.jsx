import { geoNaturalEarth1, geoPath, geoGraticule, select, zoom } from "d3";
import React, { useState, useCallback, useEffect } from "react";
import { useRef } from "react";
//import { selected, setSelected } from "./WorldMap";

const projection = geoNaturalEarth1();
const path = geoPath(projection);
const graticule = geoGraticule();

const selectedLineWidth = 1;
const hoveredLineWidth = 1.3;
const borderLineWidth = 0.5;
const zoomLineStrength = 0.5;

export function LineDraw({
    data: { iso_countries, non_iso_countries, interiorBorders }, selectCountry, selected, hovered, setHovered, zoomLevel, zoomLevelSetter, svgRef
}) {
        const gRef = useRef()
        const legendRef = useRef()
        useEffect(()=>{
            if (svgRef && gRef) {
                const svg = select(svgRef.current)
                const g = select(gRef.current)
                svg.call(zoom().on('zoom', (event) => {
                g.attr('transform', event.transform);
                zoomLevelSetter(Math.max(event.transform.k, 1));
            }))
        }
    }, [])
    return (
        <>
        <g className="mark" ref={gRef}>
                <path className="earthSphere" d={path({ type: "Sphere" })}
                    onMouseOver={() => {
                        setHovered(null);
                    }} onClick={() => {
                        selectCountry(null);
                    }} />
                <path className="graticule" d={path(graticule())}
                    onMouseOver={() => {
                        setHovered(null);
                    }} onClick={() => {
                        selectCountry(null);
                    }} />
          {
            //example country: {"color": "#040", "alpha3": "FJI", "geometry": {"type": "MultiPolygon","coordinates": [[[[100,-10]...]]]
                      //example country: {"color": "#040", "alpha3": "FJI", "geometry": {"type": "MultiPolygon","coordinates": [[[[100,-10]...]]]
                      iso_countries.map(c => (
                          <path
                              key={c.alpha3}
                              id={c.alpha3}
                              fill={c.color != null ? c.color : "#555"}
                              className="country"
                              d={path(c.geometry)}
                              onMouseOver={() => {
                                  if (c.color != null) setHovered(c.alpha3);
                                  else setHovered(null);
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
                <path className="interiorBorders" d={path(interiorBorders)} strokeWidth={` ${borderLineWidth * (1 / (zoomLevel * zoomLineStrength))}px`} />
                {
                    (hovered != null) ?
                        (
                            <path
                                key="hovered"
                                id={iso_countries.find(c => c.alpha3 === hovered).alpha3}
                                fill={iso_countries.find(c => c.alpha3 === hovered).color}
                                className="hoveredCountry"
                                strokeWidth={` ${hoveredLineWidth * (1 / (zoomLevel * zoomLineStrength))}px`}
                                d={path(iso_countries.find(c => c.alpha3 === hovered).geometry)}
                                onMouseLeave={() => {
                                    setHovered(null);
                                }}
                                onClick={(e) => {
                                    setHovered(null);
                                    selectCountry(e.target.id);
                                }}
                        />
                        ) : ""
                } {
            (selected != null) ?
            (
                <path
                    key={"selected"}
                    id="selectedCountryBorder"
                                fill="none"
                                strokeWidth={` ${selectedLineWidth * (1 / (zoomLevel * zoomLineStrength))}px`}
                    className="selectedCountry"
                    d={path(iso_countries.find(c => c.alpha3 === selected).geometry)}
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
