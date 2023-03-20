import React, { useState, useCallback, useEffect } from "react";
import ReactDom from "react-dom";
import { Legend } from "../../utils/legend";
import { LineDraw } from "../../utils/lineDraw";
import colorScheme from "../../utils/colorScheme";
import { distance } from "../../utils/categories";
import InfoPopover from "../../utils/InfoPopover";
import ResetZoomButton from "../../utils/ResetZoomButton";
import { interpolateRgb } from "d3";
import { InputGroup, Button, Form } from "react-bootstrap";
import { useRef } from "react";
import useRenderOnSvgMount from "../../hooks/useRenderOnSvgMount";

// Adapted from:
// https://www.pluralsight.com/guides/using-d3.js-inside-a-react-app

 /*
   * selectedCategories: array of ids (strings) of categories. country to draw: country-object, selected: country-object
   */
 const countryToColor = (selectedCategories, selectedCountry) => (country) => {
  //console.log("countryToColor", country, selected)
  if (!country) return colorScheme.noData;
  if (selectedCategories.length === 0) return colorScheme.noData;
  if (!country.hasData) return colorScheme.noData;
  if (!selectedCountry) return colorScheme.middle;

  var relative_value;
  var dist_sq = 0;
  // Choose higher values to make the dimension with the largest distance play a larger role.
  // Inspired by Shephard Interpolation: https://en.wikipedia.org/wiki/Inverse_distance_weighting#/media/File:Shepard_interpolation_2.png
  // Image that three countries have the results A: (0,0), B: (0.5, 0.5), C: (0, 0.9)
  // With exponent = 1, C is closer to A than B as 0.9 < 0.5 + 0.5
  // With exponent = 2, B is closer as (0.25 + 0.25)^0.5 < 0.9^2^0.5 = 0.9
  const exponent = 2;
  for (const k of selectedCategories) {
    dist_sq += Math.abs(country[k] - selectedCountry[k]) ** exponent;
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

  // Zooming and panning
  const [zoomLevel, setZoomLevel] = useState(null);
  const [doResetZoom, setDoResetZoom] = useState(false);

  // which checkboxes are checked
  const [selectedCategories, setSelectedCategories] = useState(
    data.keys.map((_) => true)
  );

  // Fix for map not rendering on start
  const svgRef = useRef();
  const svgHasMounted = useRenderOnSvgMount(svgRef, isActiveTab);

  const svgLegendRef = useRef(null);
  const svgLegendHasMounted = useRenderOnSvgMount(svgLegendRef, isActiveTab);

  const categoryStatistics = data.country_values_stats();
  const colors = { left: colorScheme.middle, right: colorScheme.right };

  const markers = {};

  const range = selected
    ? {
        min: categoryStatistics.min,
        selected: selected[distance.id],
        max: categoryStatistics.max,
      }
    : { min: -1, selected: null, max: 1 };

  const svg = (
    <svg
      width="100%"
      height="100%"
      ref={svgRef}
      onMouseLeave={() => {
        setHovered(null);
      }}
      onClick={()=> {if (!hovered) setSelected(null)}}
    >
      {svgHasMounted && (
        <>
          <LineDraw
            mapWithData={map}
            svgRef={svgRef}
            countryToColor={countryToColor(
              data.keys.filter((_, idx) => selectedCategories[idx]), selected)} 
              //countryToColor(names of selected categories, selected country)
            selected={selected}
            setSelected={setSelected}
            hovered={hovered}
            setHovered={setHovered}
            zoomLevel={zoomLevel}
            setZoomLevel={setZoomLevel}
            doResetZoom={doResetZoom}
            setDoResetZoom={setDoResetZoom}
            setZoomCall={() => {}}
            category={distance}
          />
          {svgRef.current && (
            <Legend
              svgRef={svgRef}
              range={range}
              category={distance}
              categoryStatistics={categoryStatistics}
              selected={null}
              colors={colors}
              markers={markers}
            />
          )}
        </>
      )}
    </svg>
  );

  const legend = (
    <svg ref={svgLegendRef} height="100%" width="100%">
      {svgLegendHasMounted && svgLegendRef.current && (
        <Legend
          svgRef={svgLegendRef}
          range={range}
          category={distance}
          categoryStatistics={categoryStatistics}
          selected={null}
          colors={colors}
          markers={markers}
          zoomCall={() => {}}
        />
      )}
    </svg>
  );

  //multi-select of categories
  function selectAll() {
    setSelectedCategories(data.keys.map((_) => true));
  }
  function selectNone() {
    setSelectedCategories(data.keys.map((_) => false));
  }
  function toggleCathegory(index) {
    setSelectedCategories(
      selectedCategories.map((checked, idx) =>
        idx === index ? !checked : checked
      )
    );
  }
  const checkboxes = data.keys.map((name, idx) => (
    <Form.Check
      type="checkbox"
      label={name}
      key={name}
      checked={selectedCategories[idx]}
      onChange={() => toggleCathegory(idx)}
    />
  ));

  return (
    <div id="WorldCanvasDiv" className="d-flex flex-grow-1 flex-column">
      <div className="d-flex flex-column flex-grow-1 position-relative">
        {svg}
      </div>

      <div className="px-5 pt-2 position-absolute" id="cd_control">
        <InputGroup>
          <InputGroup.Text id="basic-addon2" className="country-distance">
            Country distance
          </InputGroup.Text>
          <InfoPopover
            title={distance.name_short || distance.name}
            info={distance.info}
            isActiveTab={isActiveTab}
          />
        </InputGroup>
        {selected === null ? (
          <div
            style={{
              textAlign: "center",
              borderRadius: ".3em",
              borderStyle: "solid",
              borderWidth: ".2em",
              padding: ".2em",
              margin: ".2em",
              marginLeft: "0",
              borderColor: colorScheme.hoveredCountry,
            }}
          >
            Please select a country as reference point.
          </div>
        ) : (
          <div>
            {checkboxes}
            {selectedCategories.every(Boolean) ? (
              <Button variant="light" size="sm" onClick={selectNone}>
                Select none
              </Button>
            ) : (
              <Button variant="primary" size="sm" onClick={selectAll}>
                Select all
              </Button>
            )}
          </div>
        )}
      </div>

      <ResetZoomButton zoomLevel={zoomLevel} setDoResetZoom={setDoResetZoom}/>
      {/*
        <div className="position-absolute start-0 bottom-0 w-100" style={{ background: 'linear-gradient(360deg, rgb(256,256,256,0.5) 80%, transparent)', backdropFilter: 'blur(1px)', height: '25%'}}>
        {legend}
      </div>
      */}
      {/* 
      <div className="w-25 mx-3">
        <p className="fs-4 mb-2 border-bottom">{categoriesObjects[category].title}</p>
        <p>{categoriesObjects[category].info}</p>
      </div>
      */}
    </div>
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
