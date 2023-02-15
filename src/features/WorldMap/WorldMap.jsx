import React, { useState, useCallback, useEffect } from "react";
import ReactDom from "react-dom";
import { parseJSON } from "./parseMapJSON";
import { LineDraw } from "./lineDraw";
import { zoom, select } from "d3";

/*export let selected = "";
export const setSelected = (id) => {
  selected = id;
  //this.setState({selected: id});

  useEffect
};*/

const canvasWidth = 960;
const canvasHeight = 500;

export default function WorldMap() {
  const mapData = parseJSON();
  console.log(mapData)
  if (!mapData) {
    return <pre>Loading...</pre>;
  }
  let svg = (
    <svg width={canvasWidth} height={canvasHeight}>
      <LineDraw data={mapData} />
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
