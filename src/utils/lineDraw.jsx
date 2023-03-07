import { zoomIdentity, geoNaturalEarth1, geoPath, geoGraticule, select, zoom } from "d3";
import React, { useEffect } from "react";
import { useRef } from "react";
import colorScheme from "./colorScheme";

export function LineDraw({ mapWithData: { iso_countries, non_iso_countries }, svgRef, countryToColor, selected, setSelected, zoomLevel, setZoomLevel, doResetZoom, setDoResetZoom, setZoomCall, category, brushRange }) {
  /*
  selected: null OR {id: 'BRA', intervention: 0.0301955307022192, passengers: .... 
  hovered: null OR {id: 'BRA', intervention: 0.0301955307022192, passengers: ....
  category: {id: 'intervention', name: 'Avoiding intervention: Omission vs. Comm...  --> (see categories.js)
  */
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
    const zoomInScaleLimit = 150
    const zoomOutScaleLimit = 0.12
  
  // Zooming and panning
  const zoomFactor = (1 / (Math.max(1, zoomLevel) * zoomLineStrength))

  useEffect(()=>{
    if (svgRef && gRef) {
      function ZoomCall(){
        
        const svg = select(svgRef.current)
          const g = select(gRef.current)
          svg.call(zoom().scaleExtent([zoomOutScaleLimit, zoomInScaleLimit])
                         .translateExtent([[0, 0], [svgRef.current.clientWidth,svgRef.current.clientHeight]]).on('zoom', (event) => {
                           g.attr('transform', event.transform)
                           //setZoomLevel(event.transform.k)
                         }).on('end', (event) => {
                             //g.attr('transform', event.transform)
                             setZoomLevel(event.transform.k)
                         }))
        }
      // Turn on the zoom function
      ZoomCall()
      // Save the turn on zoom function to parent component
      setZoomCall(() => ZoomCall)
      }
  }, [])

  //resetting the zoom
  if (doResetZoom) {
    setDoResetZoom(false)
    if (svgRef && gRef) {
      const g = select(gRef.current)
      g.attr('transform', zoomIdentity);
      setZoomLevel(null)
    } 
  }
    const zoomName = "countryZoom" + (zoomLevel < 1 ? 0 : (zoomLevel < 2.5 ? 1 : (zoomLevel < 7 ? 2 : (zoomLevel < 20 ? 3 : (zoomLevel < 50 ? 4 : (zoomLevel < 100 ? 5 : 6))))));
    let count = 0;
    Object.values(iso_countries).forEach(a => { if (a.hasData) count++ });
    console.log(count)
  return (
      <g className="mark" ref={gRef} >
          <path 
            className="earthSphere" 
            d={path({ type: "Sphere" })}
            //onMouseOver={() => setHovered(null)} 
            onClick={() => setSelected(null)} 
          />
          <path 
            className="graticule" 
             d={path(graticule())}
             strokeWidth="0.4"
            //onMouseOver={() => setHovered(null)} 
            onClick={() => setSelected(null)} 
          />
          {
            //example country: {"geometry": {"type": "MultiPolygon","coordinates": [[[[100,-10]...]]]
            non_iso_countries.map((c, idx) => {
              const isBrushOn = brushRange[0] > -2
              return (
              <path
                key={`no_iso_country_${idx}`}
                id={c.name}
                fill={isBrushOn ? colorScheme.outOfRange : colorScheme.noData}
                fillOpacity={isBrushOn ? '10%' : '100%'}
                strokeOpacity={isBrushOn ? '10%' : '100%'}
                className="no_iso_country" 
                stroke={colorScheme.border}
                strokeWidth={` ${borderLineWidth * zoomFactor}px`}
                d={path(c.geometry)}
              />
            )})
          }
          {
            //example country: {"color": "#040", "id": "FJI", "geometry": {"type": "MultiPolygon","coordinates": [[[[100,-10]...]]]
              Object.values(iso_countries).map(c => {
                  const cInRange = isInRange(c[category.id], brushRange)
                  return <path
                      key={c.id}
                      id={c.id}
                      fill={cInRange ? countryToColor(c, selected) : colorScheme.outOfRange}
                      fillOpacity={cInRange ? '100%' : '10%'}
                      strokeOpacity={cInRange ? '100%' : '10%'}
                      className={c.hasData ? zoomName : "unselectableCountry"}
                d={path(c.geometry)}
                stroke={colorScheme.border}
                strokeWidth={` ${borderLineWidth * zoomFactor}px`}
                /*onMouseOver={() => {
                  if (c.hasData) setHovered(c);
                  else setHovered(null);
                }}*/
                  onClick={(e) => {
                      if (c.hasData) setSelected(iso_countries[e.target.id]);
                      else setSelected(null);
                  }}
              />}
            )
          }
          {/*
            hovered &&
                <path
                  key="hovered"
                  id={hovered.id}
                  fill="transparent"
                  stroke={colorScheme.hoveredCountry}
                  strokeWidth={` ${hoveredLineWidth * zoomFactor}px`}
                  d={path(iso_countries[hovered.id].geometry)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={(e) => {
                    setHovered(null);
                    setSelected(iso_countries[e.target.id]);
                  }}
                />*/
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

function isInRange(val, brushRange){
  if (!val && brushRange[0] > -2) return false
  if (val < brushRange[0] || val > brushRange[1]) return false 
  else return true
}
