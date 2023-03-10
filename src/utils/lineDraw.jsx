import {
  zoomIdentity,
  geoNaturalEarth1,
  geoPath,
  geoGraticule,
  select,
  zoom,
} from "d3";
import React, { useEffect } from "react";
import { useRef } from "react";
import colorScheme from "./colorScheme";

class worldMapSVG {
  svg; //svg dom element: the world map.
  updateCallbacks = {}; //countryToColor, selected
  update(toUpdate) {
    for (const [key, value] of Object.entries(toUpdate)) {
      //check if key is in updateCallbacks
      if (key in this.updateCallbacks) this.updateCallbacks[key](value);
      else console.log("[lineDraw] key not in updateCallbacks", key);
    }
  }
  constructor( 
    iso_countries, 
    non_iso_countries,
    gRef,
    path,
    countryToColor,
    selected,
    setSelected,
        ) {
      // Line width variables
      const selectedLineWidth = 2;
      const hoveredLineWidth = 2.6;
      const borderLineWidth = 1;

      const graticule = geoGraticule();
      
      const earthSphere_path = <path
      vector-effect="non-scaling-stroke"
      className="earthSphere"
      d={path({ type: "Sphere" })}
      //onMouseOver={() => setHovered(null)}
      onClick={() => setSelected(null)}
    />;
      const graticule_path = <path
      vector-effect="non-scaling-stroke"
        className="graticule"
        d={path(graticule())}
        strokeWidth="0.4"
        //onMouseOver={() => setHovered(null)}
        onClick={() => setSelected(null)}
      />   
      
      const filtered_map = countryToColor() === colorScheme.outOfRange 
      const no_iso_countries_paths = 
        //example country: {"geometry": {"type": "MultiPolygon","coordinates": [[[[100,-10]...]]]
        non_iso_countries.map((c, idx) => { 
          
          return (
            <path
              vector-effect="non-scaling-stroke"
              key={`no_iso_country_${idx}`}
              id={c.name}
              fill={countryToColor()}
              fillOpacity={filtered_map ? "10%" : "100%"}
              strokeOpacity={filtered_map ? "10%" : "100%"}
              className="no_iso_country"
              stroke={colorScheme.border}
              strokeWidth={` ${borderLineWidth}px`}
              d={path(c.geometry)}
            />
          );
        })
        const iso_countries_paths = 
        //example country: {"color": "#040", "id": "FJI", "geometry": {"type": "MultiPolygon","coordinates": [[[[100,-10]...]]]
          Object.values(iso_countries).map((c) => {
            const cInRange = countryToColor(c) !== colorScheme.outOfRange;
            return (
            <path
              vector-effect="non-scaling-stroke"
              key={c.id}
              id={c.id}
              fill={
                countryToColor(c)
              }
              fillOpacity={cInRange ? "100%" : "10%"}
              strokeOpacity={cInRange ? "100%" : "10%"}
              className={c.hasData ? "country" : "unselectableCountry"}
              d={path(c.geometry)}
              stroke={colorScheme.border}
              strokeWidth={` ${borderLineWidth}px`}
              /*onMouseOver={() => {
                  if (c.hasData) setHovered(c);
                  else setHovered(null);
                }}*/
            />
          );
        })
      const all_countries_paths = [...iso_countries_paths, ...no_iso_countries_paths]
      const hover_paths = 
        //example country: {"color": "#040", "id": "FJI", "geometry": {"type": "MultiPolygon","coordinates": [[[[100,-10]...]]]
        Object.values(iso_countries).filter(c => c.hasData).map((c) => 
          <path
          vector-effect="non-scaling-stroke"
            key={c.id}
            id={c.id}
            fill={countryToColor(c)}
            className="hoverCountry"
            d={path(c.geometry)}
            stroke={colorScheme.hoveredCountry}
            strokeWidth={` ${hoveredLineWidth}px`}
            onClick={(e) => {
              setSelected(iso_countries[e.target.id]);
            }}
          />
      )
      var selected_path = (
        <path
          vector-effect="non-scaling-stroke"
          key="selected"
          id="selectedCountryBorder"
          fill="transparent"
          strokeWidth={` ${selectedLineWidth}px`}
          stroke={colorScheme.selectedCountry}
          d={path(selected ? selected.geometry : null)}
        />
      )
      const selected_path_or_nothing = selected && selected_path
      
      this.svg = <g className="mark" ref={gRef}>
        {earthSphere_path},
        {graticule_path},
        {all_countries_paths},
        {hover_paths},
        {selected_path_or_nothing}
    </g>
  }
}

export function LineDraw({
  mapWithData: { iso_countries, non_iso_countries },
  svgRef,
  countryToColor,
  selected,
  setSelected,
  zoomLevel,
  setZoomLevel,
  doResetZoom,
  setDoResetZoom,
  setZoomCall,
  category,
}) {
  /*
  selected: null OR {id: 'BRA', intervention: 0.0301955307022192, passengers: .... 
  hovered: null OR {id: 'BRA', intervention: 0.0301955307022192, passengers: ....
  category: {id: 'intervention', name: 'Avoiding intervention: Omission vs. Comm...  --> (see categories.js)
  */

  /* STUFF THAT POTENTIALLY CHANGES ON RE-RENDER 
    (everything else should be in class.)
  */
  // Create projection after the svg's size


  const projection = geoNaturalEarth1()
    .scale((249.5 * svgRef.current.clientHeight) / 950)
    .translate([
      svgRef.current.clientWidth / 2,
      svgRef.current.clientHeight / 2,
    ]);
  const path = geoPath(projection);

  const gRef = useRef();
  // Zooming and panning
  //const zoomFactor = 1 / (Math.max(1, zoomLevel) * zoomLineStrength);

  //of course we are very efficcient and only generate the whole SVG thing once :)
  const [almightySVG, _] = React.useState(() => new worldMapSVG(
    iso_countries,
    non_iso_countries,
    gRef,
    path,
    countryToColor,
    selected,
    setSelected,
    category,
  ));

  function ZoomCall() {
    const zoomInScaleLimit = 150;
    const zoomOutScaleLimit = 0.12;

    const svg = select(svgRef.current);
    const g = select(gRef.current);
    svg.call(
      zoom()
        .scaleExtent([zoomOutScaleLimit, zoomInScaleLimit])
        .translateExtent([
          [0, 0],
          [svgRef.current.clientWidth, svgRef.current.clientHeight],
        ])
        .on("zoom", (event) => {
          g.attr("transform", event.transform);
          //setZoomLevel(event.transform.k)
        })
        .on("end", (event) => {
          //g.attr('transform', event.transform)
          setZoomLevel(event.transform.k);
        })
    );
  }

  function initSVG() {
    if (svgRef && gRef) {
      // Turn on the zoom function
      ZoomCall();
      // Save the turn on zoom function to parent component
      setZoomCall(() => ZoomCall);
    }
  }

  //first we need the SVG to be created.
  useEffect(initSVG, []);
  
  //resetting the zoom
  if (doResetZoom) {
    setDoResetZoom(false);
    if (svgRef && gRef) {
      const g = select(gRef.current);
      g.attr("transform", zoomIdentity);
      setZoomLevel(null);
    }
  }

  if (zoomLevel >= 2) {
    console.log("UPDATE :)")
    
  }
  return almightySVG.svg;
}
