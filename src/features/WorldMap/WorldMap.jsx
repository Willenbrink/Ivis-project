import React, { useState, useCallback, useEffect } from "react";
import ReactDom from "react-dom";
import { parseJSON } from "./parseMapJSON";
import { LineDraw, Legend } from "./lineDraw";
import { country_values_stats } from "../../model/dataHandler";
import { Form, InputGroup, Button } from "react-bootstrap";
import { useRef } from "react";
import { categories } from "../../utils/categories";
import InfoPopover from "./InfoPopover";

// Adapted from:
// https://www.pluralsight.com/guides/using-d3.js-inside-a-react-app

const canvasWidth = "100%";
const canvasHeight = "100%";

export default function WorldMap() {
  //currently selected country
  const [selected, setSelected] = useState(null);
  const [hovered, setHovered] = useState(null);
   const [zoomLevel, zoomLevelSetter] = useState(null);
  //interactive category selection
  const [category, setCategory] = useState(categories.species.id);
  const [svgHasMounted, setSvgHasMounted] = useState(false)
  //for reseting the map
  const [doReset, setDoReset] = useState(false);
  const svgRef = useRef()
  
  // Temporary fix for map not rendering on start
  useEffect(()=>{
    async function mount() {
      await setTimeout(()=>{
        setSvgHasMounted(true)
      }, 300)
      // if (!svgHasMounted && svgRef.current?.clientWidth > 0) setSvgHasMounted(true)
    }
    mount()
  },[])

  const mapData = parseJSON();
  if (!mapData) {
    return <pre>Loading...</pre>;
  }

  const categoryStatistics = country_values_stats(category.id);
  const range = selected
        ? {min: categoryStatistics.min, selected: selected[category.id], max: categoryStatistics.max}
        : {min: -1, selected: null, max: 1};
  const svg = (
      <svg width={canvasWidth} height={canvasHeight} ref={svgRef} onMouseLeave={() => { setHovered(null) } }>
          <>
              {svgHasMounted &&
              <LineDraw
                data={mapData}
                selectCountry={setSelected}
                selected={selected}
                range={range}
                hovered={hovered}
                setHovered={setHovered}
                svgRef={svgRef}
                zoomLevel={zoomLevel}
                zoomLevelSetter={zoomLevelSetter}
                doReset={doReset}
                setDoReset={setDoReset}
                category={category}
              />
              }
              {svgHasMounted && svgRef.current &&
              <Legend
                svgRef={svgRef}
                range={range}
                category={category}
                categoryStatistics={categoryStatistics}
                selected={selected}
              />}
          </>
      </svg>
  );
  return (
    <div id="WorldCanvasDiv" className="d-flex flex-grow-1 flex-column">
      <div className="d-flex flex-column flex-grow-1 position-relative">
        {svg}
      </div>
          <InputGroup className="px-5 pt-2 position-absolute" style={{width: "90%"}}>
            <InputGroup.Text id='basic-addon2' className='bg-light'>Categories:</InputGroup.Text>
            <Form.Select 
            aria-label="Default select example!"
            onChange={((e) => setCategory(categories[e.target.value]))}
            value={category}
            className='fw-bold'
            >
              {Object.entries(categories).map(([id, cat]) => {
                return <option key={id} value={id}>{cat.name}</option> ;
              })}
            </Form.Select>
            <InfoPopover title={categories[category.id].name_short || categories[category.id].name} info={categories[category.id].info}/>
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
