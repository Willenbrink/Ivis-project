import { zoomIdentity, geoNaturalEarth1, geoPath, geoGraticule, select, zoom, svg, interpolateRgb } from "d3";
import React, { useState, useCallback, useEffect } from "react";
import { useRef } from "react";
import colorScheme from "./colorScheme";

export function LineDraw({ data: { iso_countries, non_iso_countries }, selectCountry, selected, hovered, setHovered, svgRef, zoomLevel, zoomLevelSetter, doReset, setDoReset, countryToColor, setZoomCall}) {

  const gRef = useRef()
  
  // Create projection after the svg's size
  const projection = geoNaturalEarth1().scale(249.5 * svgRef.current.clientHeight/950).translate([svgRef.current.clientWidth/2,svgRef.current.clientHeight/2])
  const path = geoPath(projection)
  const graticule = geoGraticule()

  // Line width variables
  const selectedLineWidth = 1;
  const hoveredLineWidth = 1.3;
  const borderLineWidth = 0.5;
  const zoomLineStrength = 0.5;
  
  // Zooming and panning
  const zoomFactor = (1 / (Math.max(1, zoomLevel) * zoomLineStrength))

  useEffect(()=>{
    if (svgRef && gRef) {
      function ZoomCall(){
        const zoomInScaleLimit = 8
        const zoomOutScaleLimit = 0.12
        const svg = select(svgRef.current)
          const g = select(gRef.current)
          svg.call(zoom().scaleExtent([zoomOutScaleLimit, zoomInScaleLimit])
                         .translateExtent([[0, 0], [svgRef.current.clientWidth,svgRef.current.clientHeight]]).on('zoom', (event) => {
                           g.attr('transform', event.transform)
                           zoomLevelSetter(event.transform.k)
                         }))
        }
      // Turn on the zoom function
      ZoomCall()
      // Save the turn on zoom function to parent component
      setZoomCall(() => ZoomCall)
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
            //example country: {"geometry": {"type": "MultiPolygon","coordinates": [[[[100,-10]...]]]
            non_iso_countries.map((c, idx) => (
              <path
                key={`no_iso_country_${idx}`}
                fill={colorScheme.noData}
                className="no_iso_country"
                stroke={colorScheme.border}
                strokeWidth={` ${borderLineWidth * zoomFactor}px`}
                d={path(c.geometry)}
              />
            ))
          }
          {
            //example country: {"color": "#040", "id": "FJI", "geometry": {"type": "MultiPolygon","coordinates": [[[[100,-10]...]]]
            Object.values(iso_countries).map(c => {
              return <path
                key={c.id}
                id={c.id}
                fill={countryToColor(c, selected)}
                className="country"
                d={path(c.geometry)}
                stroke={colorScheme.border}
                strokeWidth={` ${borderLineWidth * zoomFactor}px`}
                onMouseOver={() => {
                  if (c.hasData) setHovered(c);
                  else setHovered(null);
                }}
              />}
            )
          }
          {
            hovered &&
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
          }
          {
            selected &&
                <path
                  key="selected"
                  id="selectedCountryBorder"
                  fill="transparent"
                  strokeWidth={` ${selectedLineWidth * zoomFactor}px`}
                  stroke={colorScheme.selectedCountry}
                  d={path(selected.geometry)}
                />
          }
      </g>
  );
}
