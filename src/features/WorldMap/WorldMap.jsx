import React, { useState, useCallback, useEffect } from "react";
import ReactDom from "react-dom";
import { parseJSON } from "./parseMapJSON";
import { LineDraw } from "./lineDraw";
import { zoom, select, interpolateRgb } from "d3";
import { get_country_value, country_values_range } from "../../model/dumbDataHandler";
import { Form, InputGroup } from "react-bootstrap";
import { useRef } from "react";
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
const categories = ['Omission --> Commission', 'Passengers --> Pedestrians', 'Law: Illegal --> Legal', 'Gender: Male --> Female', 'Fitness: Large --> Fit', 'Social Status: Low --> High', 'Age: Elderly --> Young', 'Number of Characters: Less --> More', 'Species: Pets --> Humans' ]

export default function WorldMap() {
  //currently selected country (alpha3)
  const [selected, setSelected] = useState(null);
  const [hovered, setHovered] = useState(null);
  //TODO interactive cathegory selection. (cathegory index)
  const [category, setCategory] = useState(0);
  const svgRef = useRef()

    if (selected != null) console.log(get_country_value(selected, category));

  function valToColor(raw_value, alpha3_for_reference) {
    //value is as in the original data set.
    // c.color = c.alpha3 == selected ? "red" : "green"; 
    if (raw_value == null) return null;
    const selectedValue = (selected != null ? get_country_value(selected, category) : 0);
    const relative_value = (raw_value - selectedValue) / country_values_range(category, selected == null);
    const extreme_color = relative_value > 0 ? "red" : "green";
    //between 0 and 1. 0 is white (=similar to selected), 1 is extreme_color (=not similar to selected)
    const absolute_value = Math.abs(relative_value);
    return interpolateRgb("white", extreme_color)(absolute_value).toString();
    }
  const mapData = parseJSON();
  if (!mapData) {
    return <pre>Loading...</pre>;
  }
  let svg = (
      <svg width={canvasWidth} height={canvasHeight} ref={svgRef} onMouseLeave={() => { setHovered(null) } }>
          <LineDraw
              data={{ ...mapData, iso_countries: mapData.iso_countries.map(c => ({ ...c, color: valToColor(get_country_value(c.alpha3, category), c.alpha3) })) }}
              selectCountry={setSelected} selected={selected} hovered={hovered} setHovered={setHovered} svgRef={svgRef}
      />
    </svg>
  );
  return (
    <div id="WorldCanvasDiv">
      <InputGroup>
          <InputGroup.Text id='basic-addon2' className='bg-white'>Categories:</InputGroup.Text>
          <Form.Select 
          aria-label="Default select example"
          onChange={((e) => setCategory(e.target.value))}
          value={category}
          >
            {categories.map((cat, idx) => 
            <option key={`option_${idx}`} value={idx}>{cat}</option> )}
          </Form.Select>
        </InputGroup>
      {svg}
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
