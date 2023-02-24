import { zoomIdentity, geoNaturalEarth1, geoPath, geoGraticule, select, zoom, svg, interpolateRgb } from "d3";
import React, { useState, useCallback, useEffect } from "react";
import { useRef } from "react";
import colorScheme from "./colorScheme";

export function LineDraw({
  data: { iso_countries, non_iso_countries, interiorBorders }, selectCountry, selected, hovered, setHovered, svgRef, zoomLevel, zoomLevelSetter, doReset, setDoReset, countryToColor
}) {

  const gRef = useRef()
  const zoomInScaleLimit = 8
  const zoomOutScaleLimit = 0.12
  const projection = geoNaturalEarth1().scale(249.5 * svgRef.current.clientHeight/950).translate([svgRef.current.clientWidth/2,svgRef.current.clientHeight/2])
  //.translate([svgRef.current.clientWidth / 2, svgRef.current.clientHeight / 1.4])
  const path = geoPath(projection)
  const graticule = geoGraticule()

  const selectedLineWidth = 1;
  const hoveredLineWidth = 1.3;
  const borderLineWidth = 0.5;
  const zoomLineStrength = 0.5;

  const zoomFactor = (1 / (Math.max(1, zoomLevel) * zoomLineStrength))
  // Zooming and panning
  useEffect(()=>{
    if (svgRef && gRef) {
      const svg = select(svgRef.current)
      const g = select(gRef.current)
      svg.call(zoom().scaleExtent([zoomOutScaleLimit, zoomInScaleLimit])
                     .translateExtent([[0, 0], [svgRef.current.clientWidth,svgRef.current.clientHeight]]).on('zoom', (event) => {
                       g.attr('transform', event.transform)
                       zoomLevelSetter(event.transform.k)
                     }))
    }
  }, [])
  //resetting the zoom
  if (doReset) {
    setDoReset(false)
    if (svgRef && gRef) {
      const g = select(gRef.current)
      g.attr('transform', zoomIdentity);
      zoomLevelSetter(null)
    } 
  }

  return (
      <g className="mark" ref={gRef} >
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
            Object.values(iso_countries).map(c => {
              return <path
                key={c.id}
                id={c.id}
                fill={countryToColor(c, selected)}
                className="country"
                d={path(c.geometry)}
                onMouseOver={() => {
                  if (c.hasData) setHovered(c);
                  else setHovered(null);
                }}
              />}
            )
          }
          {
            //example country: {"geometry": {"type": "MultiPolygon","coordinates": [[[[100,-10]...]]]
            non_iso_countries.map((c, idx) => (
              <path
                key={`no_iso_country_${idx}`}
                fill={colorScheme.noData}
                className="no_iso_country"
                d={path(c.geometry)}
              />
            ))
          }
          <path className="interiorBorders" d={path(interiorBorders)} strokeWidth={` ${borderLineWidth * zoomFactor}px`} />
          {
            (hovered != null) ?
              (
                <path
                  key="hovered"
                  id={hovered.id}
                  fill="transparent"
                  stroke={colorScheme.hoveredCountry}
                  strokeWidth={` ${hoveredLineWidth * zoomFactor}px`}
                  d={path(iso_countries[hovered.id].geometry)}
                  onMouseLeave={() => {
                    setHovered(null);
                  }}
                  onClick={(e) => {
                    setHovered(null);
                    selectCountry(iso_countries[e.target.id]);
                  }}
                />
              ) : ""
          }
          {
            selected ?
              (
                <path
                  key="selected"
                  id="selectedCountryBorder"
                  fill="transparent"
                  strokeWidth={` ${selectedLineWidth * zoomFactor}px`}
                  stroke={colorScheme.selectedCountry}
                  d={path(selected.geometry)}
                />
              ) : ""
          }
      </g>
  );
}