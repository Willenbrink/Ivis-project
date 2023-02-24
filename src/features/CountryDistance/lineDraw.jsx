import { zoomIdentity, geoNaturalEarth1, geoPath, geoGraticule, select, zoom, svg, interpolateRgb } from "d3";
import React, { useState, useCallback, useEffect } from "react";
import { useRef } from "react";
import { get_keys } from "../../model/dataHandler";
/*
const projection = geoNaturalEarth1().translate([width / 2, height / 1.4])    // translate to center of screen. You might have to fiddle with this
//depending on the size of your screen
.scale([150]);
const path = geoPath(projection)
const graticule = geoGraticule()

const selectedLineWidth = 1;
const hoveredLineWidth = 1.3;
const borderLineWidth = 0.5;
const zoomLineStrength = 0.5;
*/

export const colorScheme = {
  left: '#ef4400',
  middle: '#f7f7f7',
  right: '#0083cf',
  selectedCountry: '#00A600',
  hoveredCountry: '#00CC00',
  //"#D0D0D0"
  noData: 'gray',
};

function valToColor(country, selected) {
  if (!country.hasData)
    return colorScheme.noData;
  if(!selected) {
    return colorScheme.middle;
  }

  var relative_value;
  var dist_sq = 0;
  // Choose higher values to make the dimension with the largest distance play a larger role.
  // Inspired by Shephard Interpolation: https://en.wikipedia.org/wiki/Inverse_distance_weighting#/media/File:Shepard_interpolation_2.png
  // Image that three countries have the results A: (0,0), B: (0.5, 0.5), C: (0.9)
  // With exponent = 1, C is closer to A than B as 0.9 < 0.5 + 0.5
  // With exponent = 2, B is closeras (0.25 + 0.25)^0.5 < 0.9^2^0.5 = 0.9
  const exponent = 2;
  for(const k of get_keys()) {
    dist_sq += Math.abs(country[k] - selected[k]) ** exponent;
  }
  relative_value = exponent * dist_sq ** (1/exponent);
  const extreme_color = relative_value < 0 ? colorScheme.left : colorScheme.right;
  //between 0 and 1. 0 is white (=similar to selected), 1 is extreme_color (=not similar to selected)
  const absolute_value = Math.abs(relative_value);
  return interpolateRgb(colorScheme.middle, extreme_color)(absolute_value);
};

export function LineDraw({
  data: { iso_countries, non_iso_countries, interiorBorders }, selectCountry, selected, hovered, setHovered, svgRef, zoomLevel, zoomLevelSetter, doReset, setDoReset
}) {

  const gRef = useRef()
  const zoomInScaleLimit = 8
  const zoomOutScaleLimit = 0.12
  // console.log(svgRef.current.clientWidth)
  // console.log('PAAAAATH: ', graticule())
  const projection = geoNaturalEarth1().scale(249.5 * svgRef.current.clientHeight/950).translate([svgRef.current.clientWidth/2,svgRef.current.clientHeight/2])
  // console.log('PROJECTION: ', projection)
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
                fill={valToColor(c, selected)}
                className="country"
                d={path(c.geometry)}
                onMouseOver={() => {
                  if (c.hasData) setHovered(c.id);
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
                  id={hovered}
                  fill="transparent"
                  stroke={colorScheme.hoveredCountry}
                  strokeWidth={` ${hoveredLineWidth * zoomFactor}px`}
                  d={path(iso_countries[hovered].geometry)}
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
