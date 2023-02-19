import React, { useState, useCallback, useEffect } from "react";
import ReactDom from "react-dom";
import { parseJSON } from "./parseMapJSON";
import { LineDraw } from "./lineDraw";
import { zoom, select, interpolateRgb } from "d3";
import { get_country_value, country_values_range, country_values_minmax } from "../../model/dumbDataHandler";
import { Form, InputGroup } from "react-bootstrap";
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
  //TODO interactive cathegory selection. (cathegory index)
  const [category, setCategory] = useState(0);
  const svgRef = useRef()

  const colorScheme = {
    left: 'red',
    middle: 'white',
    right: 'green',
    selectedLeft: 'blue',
    selectedMiddle: 'white',
    selectedRight: 'yellow'
  }


  function valToColor(raw_value, alpha3_for_reference) {
    //value is as in the original data set.
    // c.color = c.alpha3 == selected ? "red" : "green"; 
    if (raw_value == null) return null;
    const selectedValue = (selected != null ? get_country_value(selected, category) : 0);
    const relative_value = (raw_value - selectedValue) / (selected != null ? country_values_range(category, false) : 1);
    const extreme_color = relative_value > 0 ? colorScheme.left : colorScheme.right;
    //between 0 and 1. 0 is white (=similar to selected), 1 is extreme_color (=not similar to selected)
    const absolute_value = Math.abs(relative_value);
    return interpolateRgb(colorScheme.middle, extreme_color)(absolute_value).toString();
    }
  const mapData = parseJSON();
  if (!mapData) {
    return <pre>Loading...</pre>;
  }

  const categoryStatistics = { ...country_values_minmax(category), range: country_values_range(category)}
  let svg = (
      <svg width={canvasWidth} height={canvasHeight} ref={svgRef} onMouseLeave={() => { setHovered(null) } }>
          <LineDraw
              data={{ ...mapData, iso_countries: mapData.iso_countries.map(c => ({ ...c, color: valToColor(get_country_value(c.alpha3, category), c.alpha3) })) }}
              selectCountry={setSelected} 
              selected={selected} 
              hovered={hovered} 
              setHovered={setHovered} 
              svgRef={svgRef}
              selectedValue={(selected != null ? get_country_value(selected, category) : null)}
              category={categoriesObjects[category]}
              categoryStatistics={categoryStatistics}
              minMaxColors={selected != null ? {min: valToColor(categoryStatistics.min),mid: colorScheme.middle, max:valToColor(categoryStatistics.max)} : {min: colorScheme.right, mid: colorScheme.middle, max: colorScheme.left}}
              zoomLevel={zoomLevel} 
              zoomLevelSetter={zoomLevelSetter}
      />
    </svg>
  );
  return (
    <div id="WorldCanvasDiv" className="d-flex flex-grow-1">
      <div className="d-flex flex-column flex-grow-1">
        <InputGroup className="px-5">
            <InputGroup.Text id='basic-addon2' className='bg-light'>Categories:</InputGroup.Text>
            <Form.Select 
            aria-label="Default select example"
            onChange={((e) => setCategory(e.target.value))}
            value={category}
            >
              {categories.map((cat, idx) => 
              <option key={`option_${idx}`} value={idx}>{cat}</option> )}
            </Form.Select>
            <InfoPopover title={categoriesObjects[category].title} info={categoriesObjects[category].info}/>
          </InputGroup>
        {svg}
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
