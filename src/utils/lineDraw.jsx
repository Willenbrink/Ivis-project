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

const selectedLineWidth = 2;
const hoveredLineWidth = 2.6;
const borderLineWidth = 1;

class svgHandler {
  svg; //svg dom element: the world map.
  non_iso_countries_paths; //paths for non-iso countries
  selected_path; //path for selected country

  //since JSX elements are immutable, we have to rebuild the whole tree.
  //this method is executed on rerender.
  //TODO: move as much as possible to constructor. (building of paths, ...)
  colorize = (countryToColor, selected) => {
    const iso_countries = this.iso_countries;
    const non_iso_countries = this.non_iso_countries;
    const setSelected = this.setSelected;


    this.earthSphere_path = (
      <path
        vectorEffect="non-scaling-stroke"
        className="earthSphere"
        d={this.pathSphere}
        //onMouseOver={() => setHovered(null)}
        onClick={() => setSelected(null)}
      />
    );
    this.graticule_path = (
      <path
        vectorEffect="non-scaling-stroke"
        className="graticule"
        d={this.pathGraticule}
        strokeWidth="0.4"
        //onMouseOver={() => setHovered(null)}
        onClick={() => setSelected(null)}
      />
    );
    this.non_iso_countries_paths =
      //example country: {"geometry": {"type": "MultiPolygon","coordinates": [[[[100,-10]...]]]
      this.non_iso_pathCountries.map((c, idx) => {
        const cInRange = countryToColor() !== colorScheme.outOfRange;      
        return (
          <path
            fill={countryToColor(c)}
            fillOpacity={cInRange ? "100%" : "10%"}
            strokeOpacity={cInRange ? "100%" : "10%"}
            vectorEffect="non-scaling-stroke"
            key={`no_iso_country_${idx}`}
            id={c.name}
            className="no_iso_country"
            stroke={colorScheme.border}
            strokeWidth={` ${borderLineWidth}px`}
            d={c}
          />
        );
      });
    this.iso_countries_paths =
      //example country: {"color": "#040", "id": "FJI", "geometry": {"type": "MultiPolygon","coordinates": [[[[100,-10]...]]]
      Object.values(this.iso_countries).map((c) => {
        const cInRange = countryToColor(c) !== colorScheme.outOfRange;
        return (
          <path
            vectorEffect="non-scaling-stroke"
            key={c.id}
            id={c.id}
            fill={countryToColor(c)}
            fillOpacity={cInRange ? "100%" : "10%"}
            strokeOpacity={cInRange ? "100%" : "10%"}
            className={c.hasData ? "country" : "unselectableCountry"}
            d={this.iso_pathCountries[c.id]}
            stroke={colorScheme.border}
            strokeWidth={` ${borderLineWidth}px`}
            /*onMouseOver={() => {
                  if (c.hasData) setHovered(c);
                  else setHovered(null);
                }}*/
          />
        );
      });
    this.all_countries_paths = [
      ...this.iso_countries_paths,
      ...this.non_iso_countries_paths,
    ];
    this.hover_paths =
      //example country: {"color": "#040", "id": "FJI", "geometry": {"type": "MultiPolygon","coordinates": [[[[100,-10]...]]]
      Object.values(this.iso_countries)
        .filter((c) => c.hasData)
        .map((c) => {
          return (
          <path
            vectorEffect="non-scaling-stroke"
            key={c.id}
            id={c.id}
            className="hoverCountry"
            d={this.iso_pathCountries[c.id]}
            stroke={colorScheme.hoveredCountry}
            strokeWidth={` ${hoveredLineWidth}px`}
            onClick={(e) => {
              setSelected(iso_countries[e.target.id]);
            }}
          />
          
        )});
    this.selected_path = selected && (
      (selected instanceof Array ? selected : [selected]).map((sel) =>
        <path
        vectorEffect="non-scaling-stroke"
        key={sel.id}
        id={sel.id + "CountryBorder"}
        fill="transparent"
        strokeWidth={` ${selectedLineWidth}px`}
        stroke={colorScheme.selectedCountry}
        d={this.iso_pathCountries[sel.id]}
      />
      )
    );
    this.svg = (
      <g className="mark" ref={this.gRef}>
        {this.earthSphere_path}
        {this.graticule_path}
        {this.all_countries_paths}
        {this.hover_paths}
        {this.selected_path}
      </g>
    );
  };

  constructor(iso_countries, non_iso_countries, gRef, path, setSelected) {
    this.gRef = gRef;
    
    //path is "consumed" here.
    //this.path = path;
    
    this.iso_countries = iso_countries;
    this.non_iso_countries = non_iso_countries;
    this.setSelected = setSelected;
    this.svg = "";


    //path:
    this.pathSphere = path({ type: "Sphere" });
    const graticule = geoGraticule();
    this.pathGraticule = path(graticule());
    this.iso_pathCountries = {};
    this.non_iso_pathCountries = [];
    this.non_iso_countries.forEach((c) => {
      this.non_iso_pathCountries.push(path(c.geometry));
    });
    for (let [id, c] of Object.entries(iso_countries)) {
      this.iso_pathCountries[id] = path(c.geometry);
    };
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
  const [svg_handler, _] = React.useState(
    () =>
      new svgHandler(iso_countries, non_iso_countries, gRef, path, setSelected)
  );

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
  svg_handler.colorize(countryToColor, selected);
  return svg_handler.svg;
}
