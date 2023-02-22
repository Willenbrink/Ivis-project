import React, { useState, useCallback, useEffect } from "react";
import ReactDom from "react-dom";
import { parseJSON } from "./parseMapJSON";
import { LineDraw, Legend, colorScheme } from "./lineDraw";
import { zoom, select, interpolateRgb } from "d3";
import { get_country_value_abs, get_country_value_rel, country_values_range, country_values_minmax } from "../../model/dumbDataHandler";
import { Form, InputGroup, Button } from "react-bootstrap";
import { useRef } from "react";
import { categoriesObjects } from "../../utils/categories";
import InfoPopover from "./InfoPopover";
/*export let selected = "";
export const setSelected = (id) => {
  selected = id;
  //this.setState({selected: id});
  
  useEffect
};*/

// Adapted from:
// https://www.pluralsight.com/guides/using-d3.js-inside-a-react-app

const canvasWidth = "100%";
const canvasHeight = "100%";
// const categories = ['Omission --> Commission', 'Passengers --> Pedestrians', 'Law: Illegal --> Legal', 'Gender: Male --> Female', 'Fitness: Large --> Fit', 'Social Status: Low --> High', 'Age: Elderly --> Young', 'Number of Characters: Less --> More', 'Species: Pets --> Humans' ]
const categories = categoriesObjects.map(category => category.name)

export default function WorldMap() {
  //currently selected country (alpha3)
  const [selected, setSelected] = useState(null);
  const [hovered, setHovered] = useState(null);
   const [zoomLevel, zoomLevelSetter] = useState(null);
  //interactive cathegory selection. (cathegory index)
  const [category, setCategory] = useState(0);
  const [svgHasMounted, setSvgHasMounted] = useState(false)
  //for reseting the map
  const [doReset, setDoReset] = useState(false);
  const svgRef = useRef()
  
  // Temporary fix for map not rendering on start
  useEffect(()=>{
    async function mount() {
      await setTimeout(()=>{
        setSvgHasMounted(true)
      }, 100)
      // if (!svgHasMounted && svgRef.current?.clientWidth > 0) setSvgHasMounted(true)
    }
    mount()
  },[])

  const mapData = parseJSON();
  if (!mapData) {
    return <pre>Loading...</pre>;
  }

  const categoryStatistics = { ...country_values_minmax(category), range: country_values_range(category)}
  const range = selected != null
        ? {min: categoryStatistics.min, selected: get_country_value_abs(selected, category), max: categoryStatistics.max}
        : {min: -1, selected: null, max: 1};
  const svg = (
      <svg width={canvasWidth} height={canvasHeight} ref={svgRef} onMouseLeave={() => { setHovered(null) } }>
          <>
              {svgHasMounted &&
              <LineDraw
                data={{ ...mapData, iso_countries: mapData.iso_countries.map(c => ({ ...c, value: get_country_value_abs(c.alpha3, category) })) }}
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
              />
              }
              {svgHasMounted && svgRef.current &&
              <Legend
                svgRef={svgRef}
                range={range}
                category={categoriesObjects[category]}
                categoryStatistics={categoryStatistics}
                selectedCountry={selected != null ? mapData.iso_countries.find(c => c.alpha3 === selected).name : null}
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
            onChange={((e) => setCategory(e.target.value))}
            value={category}
            className='fw-bold'
            >
              {categories.map((cat, idx) => 
                <option key={`option_${idx}`} value={idx}>{cat}</option> )}
            </Form.Select>
            <InfoPopover title={categoriesObjects[category].title} info={categoriesObjects[category].info}/>
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
