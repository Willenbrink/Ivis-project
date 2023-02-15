import React, { useState, useCallback, useEffect } from "react";
import ReactDom from "react-dom";
import { parseJSON } from "./parseMapJSON";
import { LineDraw } from "./lineDraw";
import { zoom, select, interpolateRgb } from "d3";
import { get_country_value, country_values_range } from "../../model/dumbDataHandler";
/*export let selected = "";
export const setSelected = (id) => {
  selected = id;
  //this.setState({selected: id});

  useEffect
};*/

const canvasWidth = 960;
const canvasHeight = 500;

export default function WorldMap() {
  //currently selected country (alpha3)
  const [selected, setSelected] = useState(null);
  //TODO interactive cathegory selection. (cathegory index)
  const [cathegory, setCathegory] = useState(0);
  function valToColor(raw_value, alpha3_for_reference) {
    //value is as in the original data set.
    // c.color = c.alpha3 == selected ? "red" : "green"; 
    const selectedValue = get_country_value(selected, cathegory);
    const relative_value = (raw_value - selectedValue) / country_values_range(cathegory);
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
    <svg width={canvasWidth} height={canvasHeight}>
      <LineDraw
        data={{ ...mapData, iso_countries: mapData.iso_countries.map(c => ({...c, color: valToColor(get_country_value(c.alpha3, cathegory),c.alpha3)})) }}
        selectCountry={setSelected}
      />
    </svg>
  );
  return svg;
}

export const useD3 = (renderChartFn, dependencies) => {
  const ref = React.useRef();

  React.useEffect(() => {
    renderChartFn(d3.select(ref.current));
    return () => {};
  }, dependencies);
  return ref;
};
