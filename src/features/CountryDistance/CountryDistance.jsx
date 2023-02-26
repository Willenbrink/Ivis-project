import React, { useState, useCallback, useEffect } from "react";
import ReactDom from "react-dom";
import { parseJSON } from "../../utils/parseMapJSON";
import { Legend } from "../../utils/legend";
import { LineDraw } from "../../utils/lineDraw";
import colorScheme from "../../utils/colorScheme";
import { get_keys } from "../../model/dataHandler";
import { distance } from "../../utils/categories";
import InfoPopover from "../../utils/InfoPopover";
import { country_values_stats } from "../../model/dataHandler";
import { interpolateRgb } from "d3";
import { Form, InputGroup, Button } from "react-bootstrap";
import { useRef } from "react";

// Adapted from:
// https://www.pluralsight.com/guides/using-d3.js-inside-a-react-app

const canvasWidth = "100%";
const canvasHeight = "100%";

function countryToColor(country, selected) {
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


export default function CountryDistance({activeTab}) {
  //currently selected country
  const [selected, setSelected] = useState(null);
  const [hovered, setHovered] = useState(null);
   const [zoomLevel, zoomLevelSetter] = useState(null);
  //interactive category selection

  const [svgHasMounted, setSvgHasMounted] = useState(false)
  //for reseting the map
  const [doReset, setDoReset] = useState(false);
  const svgRef = useRef()
  
  // Temporary fix for map not rendering on start
  useEffect(()=>{
    async function mount() {
      await setTimeout(()=>{
        setSvgHasMounted(activeTab)
      }, 300)
      // if (!svgHasMounted && svgRef.current?.clientWidth > 0) setSvgHasMounted(true)
    }
    mount()
  },[activeTab])

  const mapData = parseJSON();
  if (!mapData) {
    return <pre>Loading...</pre>;
  }

  const categoryStatistics = country_values_stats(distance);
  const colors = { left: colorScheme.middle, right: colorScheme.right };

  const markers = {};
  //if (hovered)
  //    markers[hovered.id] = { ...hovered, hasTooltip: true, value: (hovered[distance.id] + 1) / 2, color: colorScheme.hoveredCountry };

    const range = selected
        ? { min: categoryStatistics.min, selected: selected[distance.id], max: categoryStatistics.max }
      : { min: -1, selected: null, max: 1 };

  const svg = (
      <svg width={canvasWidth} height={canvasHeight} ref={svgRef} onMouseLeave={() => { setHovered(null) } }>
          {svgHasMounted &&
          <>
              <LineDraw
                data={mapData}
                selectCountry={setSelected}
                selected={selected}
                hovered={hovered}
                setHovered={setHovered}
                svgRef={svgRef}
                zoomLevel={zoomLevel}
                zoomLevelSetter={zoomLevelSetter}
                doReset={doReset}
                setDoReset={setDoReset}
                countryToColor={countryToColor}
              />
              {svgRef.current &&
              <Legend
                  svgRef={svgRef}
                  range={range}
                  categoryStatistics={categoryStatistics}
                  category={distance}
                  selected={selected}
                  colors={colors}
                  markers={markers}
              />}
          </>
          }
      </svg>
  );
  return (
    activeTab && <div id="WorldCanvasDiv" className="d-flex flex-grow-1 flex-column">
      <div className="d-flex flex-column flex-grow-1 position-relative">
        {svg}
      </div>
          <InputGroup className="px-5 pt-2 position-absolute" style={{width: "90%"}}>
            <InputGroup.Text id='basic-addon2' className='bg-light'>Country distance</InputGroup.Text>
            <InfoPopover title={distance.name_short || distance.name} info={distance.info}/>
          </InputGroup>

      <div id="zoomDiv" style={{position:"absolute", margin:"10px", right: 0}}>
        <p hidden={true} style={{textAlign: "right"}}>Zoom: {zoomLevel?zoomLevel.toFixed(2):"1.00"}</p>
        <Button onClick={(e) => {setDoReset(true);}} hidden={!zoomLevel || !(zoomLevel < 0.5 || zoomLevel > 2)}>Reset Map</Button>
      </div>
      {/* 
      <div className="w-25 mx-3">
        <p className="fs-4 mb-2 border-bottom">{categoriesObjects[category].title}</p>
        <p>{categoriesObjects[category].info}</p>
      </div>
      */}
    </div>);
}

export const useD3 = (renderChartFn, dependencies) => {
  const ref = React.useRef();

  React.useEffect(() => {
    renderChartFn(d3.select(ref.current));
    return () => {};
  }, dependencies);
  return ref;
};
