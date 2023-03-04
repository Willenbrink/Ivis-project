import React, { useState, useCallback, useEffect } from "react";
import ReactDom from "react-dom";
import { Legend } from "../../utils/legend";
import { LineDraw } from "../../utils/lineDraw";
import colorScheme from "../../utils/colorScheme";
import { distance } from "../../utils/categories";
import InfoPopover from "../../utils/InfoPopover";
import { interpolateRgb } from "d3";
import { Form, InputGroup, Button } from "react-bootstrap";
import { useRef } from "react";

// Adapted from:
// https://www.pluralsight.com/guides/using-d3.js-inside-a-react-app

const canvasWidth = "100%";
const canvasHeight = "100%";
/*
 * selectedCathegories: array of ids (strings) of cathegories. country to draw: country-object, selected: country-object
 */
const countryToColor = (selectedCathegories) => (country, selected) => {
  //console.log("countryToColor", country, selected)
  if (selectedCathegories.length === 0) return colorScheme.noData;
  if (!country.hasData) return colorScheme.noData;
  if (!selected) return colorScheme.middle;

  var relative_value;
  var dist_sq = 0;
  // Choose higher values to make the dimension with the largest distance play a larger role.
  // Inspired by Shephard Interpolation: https://en.wikipedia.org/wiki/Inverse_distance_weighting#/media/File:Shepard_interpolation_2.png
  // Image that three countries have the results A: (0,0), B: (0.5, 0.5), C: (0, 0.9)
  // With exponent = 1, C is closer to A than B as 0.9 < 0.5 + 0.5
  // With exponent = 2, B is closer as (0.25 + 0.25)^0.5 < 0.9^2^0.5 = 0.9
  const exponent = 2;
  for (const k of selectedCathegories) {
    dist_sq += Math.abs(country[k] - selected[k]) ** exponent;
  }
  relative_value = exponent * dist_sq ** (1 / exponent);
  const extreme_color =
    relative_value < 0 ? colorScheme.left : colorScheme.right;
  //between 0 and 1. 0 is white (=similar to selected), 1 is extreme_color (=not similar to selected)
  const absolute_value = Math.abs(relative_value);
  return interpolateRgb(colorScheme.middle, extreme_color)(absolute_value);
};

export default function CountryDistance({ data, map, isActiveTab }) {
  //currently selected country
  const [selected, setSelected] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [zoomLevel, zoomLevelSetter] = useState(null);
  //interactive category selection

  const [svgHasMounted, setSvgHasMounted] = useState(false);
  //for reseting the map
  const [doReset, setDoReset] = useState(false);
  const svgRef = useRef();

  // which checkboxes are checked
  const [selectedCathegories, setSelectedCathegories] = useState(
    data.keys.map((name) => true)
  );
  // Temporary fix for map not rendering on start
  useEffect(() => {
    async function mount() {
      setTimeout(() => {
        setSvgHasMounted(isActiveTab);
      }, 300);
      // if (!svgHasMounted && svgRef.current?.clientWidth > 0) setSvgHasMounted(true)
    }
    mount();
  }, [isActiveTab]);

  const categoryStatistics = data.country_values_stats();
  const colors = { left: colorScheme.middle, right: colorScheme.right };

  const markers = {};
  //if (hovered)
  //    markers[hovered.id] = { ...hovered, hasTooltip: true, value: (hovered[distance.id] + 1) / 2, color: colorScheme.hoveredCountry };

  const range = selected
    ? {
        min: categoryStatistics.min,
        selected: selected[distance.id],
        max: categoryStatistics.max,
      }
    : { min: -1, selected: null, max: 1 };

  const svg = (
    <svg
      width={canvasWidth}
      height={canvasHeight}
      ref={svgRef}
      onMouseLeave={() => {
        setHovered(null);
      }}
    >
      {svgHasMounted && (
        <>
          <LineDraw
            data={map}
            selectCountry={setSelected}
            selected={selected}
            hovered={hovered}
            setHovered={setHovered}
            svgRef={svgRef}
            zoomLevel={zoomLevel}
            zoomLevelSetter={zoomLevelSetter}
            doReset={doReset}
            setDoReset={setDoReset}
            countryToColor={countryToColor(data.keys.filter((_, idx) => selectedCathegories[idx]))} //countryToColor(names of selected cathegories)
          />
          {svgRef.current && (
            <Legend
              svgRef={svgRef}
              range={range}
              categoryStatistics={categoryStatistics}
              category={distance}
              selected={selected}
              colors={colors}
              markers={markers}
            />
          )}
        </>
      )}
    </svg>
  );

  //multi-select of cathegories
  function selectAll() {
    setSelectedCathegories(data.keys.map((_) => true));
  }
  function selectNone() {
    setSelectedCathegories(data.keys.map((_) => false));
  }
  function toggleCathegory(index) {
    setSelectedCathegories(
      selectedCathegories.map((checked, idx) =>
        idx === index ? !checked : checked
      )
    );
  }
  const checkboxes = data.keys.map((name, idx) => (
    <Form.Check
      type="checkbox"
      label={name}
      key={name}
      checked={selectedCathegories[idx]}
      onChange={() => toggleCathegory(idx)}
    />
  ));
  return (
    isActiveTab && (
      <div id="WorldCanvasDiv" className="d-flex flex-grow-1 flex-column">
        <div className="d-flex flex-column flex-grow-1 position-relative">
          {svg}
        </div>

        <div className="px-5 pt-2 position-absolute" id="cd_control">
          <InputGroup>
            <InputGroup.Text id="basic-addon2" className="bg-light">
              Country distance
            </InputGroup.Text>
            <InfoPopover
              title={distance.name_short || distance.name}
              info={distance.info}
            />
          </InputGroup>
          {selected === null ? (
            <div style={{ textAlign: "center", borderRadius: ".3em", borderStyle: "solid", borderWidth: ".2em", padding: ".2em", margin: ".2em", marginLeft: "0", borderColor:colorScheme.hoveredCountry}}>
              Please select a country as reference point.
            </div>
          ) : (
            <div>
              {checkboxes}
              {selectedCathegories.every(Boolean) ? 
              <Button variant="light" size="sm" onClick={selectNone}>Select none</Button> : 
              <Button variant="primary" size="sm" onClick={selectAll}>
                Select all
              </Button>}
            </div>
          )}
        </div>

        <div
          id="zoomDiv"
          style={{ position: "absolute", margin: "10px", right: 0 }}
        >
          <p hidden={true} style={{ textAlign: "right" }}>
            Zoom: {zoomLevel ? zoomLevel.toFixed(2) : "1.00"}
          </p>
          <Button
            onClick={(e) => {
              setDoReset(true);
            }}
            hidden={!zoomLevel || !(zoomLevel < 0.5 || zoomLevel > 2)}
          >
            Reset Map
          </Button>
        </div>
        {/* 
      <div className="w-25 mx-3">
        <p className="fs-4 mb-2 border-bottom">{categoriesObjects[category].title}</p>
        <p>{categoriesObjects[category].info}</p>
      </div>
      */}
      </div>
    )
  );
}

export const useD3 = (renderChartFn, dependencies) => {
  const ref = React.useRef();

  React.useEffect(() => {
    renderChartFn(d3.select(ref.current));
    return () => {};
  }, dependencies);
  return ref;
};
