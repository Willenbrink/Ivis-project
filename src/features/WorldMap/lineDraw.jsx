import { geoNaturalEarth1, geoPath, geoGraticule, select, zoom, svg } from "d3";
import React, { useState, useCallback, useEffect } from "react";
import { useRef } from "react";
import { categoriesObjects } from "../../utils/categories";
//import { selected, setSelected } from "./WorldMap";

const projection = geoNaturalEarth1();
const path = geoPath(projection);
const graticule = geoGraticule();

export function LineDraw({
  data: { iso_countries, non_iso_countries, interiorBorders }, selectCountry,selected,hovered, setHovered,svgRef, category, categoryStatistics
}) {
  const gRef = useRef()
  const zoomInScaleLimit = 8
  const [labelWidths, setLabelWidths] = useState({ left: 0, right: 0 })

  useEffect(()=>{
    if (svgRef && gRef) {
      const svg = select(svgRef.current)
      const g = select(gRef.current)
      svg.call(zoom().scaleExtent([0.5, zoomInScaleLimit])
      .translateExtent([[0, 0], [svgRef.current.clientWidth,svgRef.current.clientHeight]]).on('zoom', (event) => {
        g.attr('transform', event.transform);
      }))
  }
  }, [])

  useEffect(()=>{
    const [left, right] = GetWidths()
    setLabelWidths({ left, right })
  },[])

    return (
        <>
        <g className="mark" ref={gRef}>
                <path className="earthSphere" d={path({ type: "Sphere" })}
                    onMouseOver={() => {
                        setHovered(null);
                }} onClick={() => {
                  selectCountry(null);
              }} />
                <path className="graticule" d={path(graticule())}
                    onMouseOver={() => {
                        setHovered(null);
                }} onClick={() => {
                  selectCountry(null);
              }}/>
          {
            //example country: {"color": "#040", "alpha3": "FJI", "geometry": {"type": "MultiPolygon","coordinates": [[[[100,-10]...]]]
                      //example country: {"color": "#040", "alpha3": "FJI", "geometry": {"type": "MultiPolygon","coordinates": [[[[100,-10]...]]]
                      iso_countries.map(c => (
                          <path
                              key={c.alpha3}
                              id={c.alpha3}
                              fill={c.color != null ? c.color : "#555"}
                              className="country"
                              d={path(c.geometry)}
                              onMouseOver={() => {
                                  if (c.color != null) setHovered(c.alpha3);
                                  else setHovered(null);
                              }}
                          />
                      ))
            }{
            //example country: {"geometry": {"type": "MultiPolygon","coordinates": [[[[100,-10]...]]]
            non_iso_countries.map((c, idx) => (
              <path
                key={`no_iso_country_${idx}`}
                fill="#555"
                className="no_iso_country"
                d={path(c.geometry)}
              />
            ))
            }
            <path className="interiorBorders" d={path(interiorBorders)} />
                {
                    (hovered != null) ?
                        (
                        <path
                                key="hovered"
                                id={iso_countries.find(c => c.alpha3 === hovered).alpha3}
                                fill={iso_countries.find(c => c.alpha3 === hovered).color}
                                className="hoveredCountry"
                                d={path(iso_countries.find(c => c.alpha3 === hovered).geometry)}
                                onMouseLeave={() => {
                                    setHovered(null);
                                }}
                                onClick={(e) => {
                                    setHovered(null);
                                    selectCountry(e.target.id);
                                }}
                        />
                        ) : ""
                } {
            (selected != null) ?
            (
                <path
                    key={"selected"}
                    id="selectedCountryBorder"
                    fill="none"
                    className="selectedCountry"
                    d={path(iso_countries.find(c => c.alpha3 === selected).geometry)}
                />
            ) : ""
                }
        </g>
        {svgRef.current && <Legend svgRef={svgRef} category={category} labelWidths={labelWidths} categoryStatistics={categoryStatistics}/>}
    </>
  );
}

function Legend({svgRef, category, labelWidths, categoryStatistics}){
  if (!svgRef.current) return
  const legendRef = useRef()

  const [svgHeight, svgWidth] = [svgRef.current.getBoundingClientRect().height, svgRef.current.getBoundingClientRect().width]

  // TODO: fix minimum size of legend
  const boxHeight = svgHeight * 0.05
  const fontSize = "16" // this has to be changed if we change the font or font size
  const lineColor = '#000000'
  const noDataStr = 'No data'


  const padding = {
    x: 50,
    y: 100
  }

  const noDataText = {
    x: padding.x,
    y: svgHeight - padding.y + boxHeight/2 + fontSize/4,
    width: GetWidth(noDataStr), // this has to be measured if we change the text size or font
    color: lineColor,
    fontSize
  }

  const noDataBox = {
    x: noDataText.x + noDataText.width + 5,
    y: svgHeight - padding.y,
    height: boxHeight,
    width: boxHeight,
    color: lineColor
  }

  const labelLeft = {
    x: noDataBox.x + noDataBox.width + 20,
    y: svgHeight - padding.y + boxHeight/2 + fontSize/4,
    width: labelWidths.left, // the longest word that appears here is passengers, so this is this word's width
    color: lineColor,
    fontSize
  }

  const labelRight = {
    x: svgWidth - labelWidths.right,
    y: svgHeight - padding.y + boxHeight/2 + fontSize/4,
    width: labelWidths.right, // the longest word that appears here is passengers, so this is this word's width
    color: lineColor,
    fontSize
  }
  // The available line width when you subtract the content around it
  const availableWidthLine = svgWidth - (labelLeft.x + labelLeft.width + 5) - (svgWidth - labelRight.x)
  // Length of the line to the left of the box
  const lineRangeLeft = categoryStatistics.min < 0 
    ? (1 - Math.abs(categoryStatistics.min))
    : (1 + categoryStatistics.min)
  const lineWidthLeft = Math.round(lineRangeLeft/2 * availableWidthLine)
  // Lenght of the box
  const boxWidth = Math.round(categoryStatistics.range/2 * availableWidthLine)
  // Lenght of the line to the right of the box
  const lineWidthRight = availableWidthLine - lineWidthLeft - boxWidth
  console.log('available: ', availableWidthLine)
  console.log('left: ', lineWidthLeft)
  console.log('box: ', boxWidth)
  console.log('box: ', lineWidthRight)
  const vertLineLeft = {
    x1: labelLeft.x + labelLeft.width + 5,
    y1: svgHeight - padding.y + boxHeight,
    x2: labelLeft.x + labelLeft.width + 5,
    y2: svgHeight - padding.y,
    strokeWidth: "2", // the longest word that appears here is passengers, so this is this word's width
    color: lineColor
  }

  const hLineLeft = {
    x1: vertLineLeft.x1,
    y1: svgHeight - padding.y + boxHeight/2,
    x2: labelLeft.x + labelLeft.width + lineWidthLeft,
    y2: svgHeight - padding.y + boxHeight/2,
    strokeWidth: "2", // the longest word that appears here is passengers, so this is this word's width
    color: lineColor
  }

  const colorBox = {
    x: hLineLeft.x2,
    y: svgHeight - padding.y,
    height: boxHeight,
    width: boxWidth,
    color: '#ffffff'
  }

  const hLineRight = {
    x1: colorBox.x + colorBox.width,
    y1: svgHeight - padding.y + boxHeight/2,
    x2: colorBox.x + colorBox.width + lineWidthRight,
    y2: svgHeight - padding.y + boxHeight/2,
    strokeWidth: "2", // the longest word that appears here is passengers, so this is this word's width
    color: lineColor
  }

  const vertLineRight = {
    x1: hLineRight.x2,
    y1: svgHeight - padding.y + boxHeight,
    x2: hLineRight.x2,
    y2: svgHeight - padding.y,
    strokeWidth: "2", // the longest word that appears here is passengers, so this is this word's width
    color: lineColor
  }

  const styleTransition = {transition: "0.3s"}

  return (
    <g className='' ref={legendRef}>
        <text fontSize={noDataText.fontSize} x={noDataText.x} y={noDataText.y} width={noDataText.width} height={noDataText.height} fill={noDataText.color}>{noDataStr}</text>
        <rect x={noDataBox.x} y={noDataBox.y} width={noDataBox.width} height={noDataBox.height} fill={noDataBox.color} stroke="#333" stroke-width="0.3"></rect>
        {/* Line starts here */}
        <text x={labelLeft.x} y={labelLeft.y} width={labelLeft.width} height={labelLeft.height} fill={labelLeft.color}>{category.from}</text>
        <line x1={vertLineLeft.x1} y1={vertLineLeft.y1} x2={vertLineLeft.x2} y2={vertLineLeft.y2} style={{...styleTransition, stroke:"rgb(0,0,0)", strokeWidth: vertLineLeft.strokeWidth}} />
        <line x1={hLineLeft.x1} y1={hLineLeft.y1} x2={hLineLeft.x2} y2={hLineLeft.y2} style={{transition:"transform 300ms ease-in", stroke:"rgb(0,0,0)", strokeWidth: hLineLeft.strokeWidth}} />
        {/* Box with colors */}
        <rect x={colorBox.x} y={colorBox.y} width={colorBox.width} height={colorBox.height} fill={colorBox.color} stroke="#333" stroke-width="0.3" style={styleTransition}></rect>
        <line x1={vertLineRight.x1} y1={vertLineRight.y1} x2={vertLineRight.x2} y2={vertLineLeft.y2} style={{...styleTransition, stroke:"rgb(0,0,0)", strokeWidth: vertLineRight.strokeWidth}} />
        <line x1={hLineRight.x1} y1={hLineRight.y1} x2={hLineRight.x2} y2={hLineRight.y2} style={{...styleTransition, stroke:"rgb(0,0,0)", strokeWidth: hLineRight.strokeWidth}} />
        <text x={labelRight.x} y={labelRight.y} width={labelRight.width} height={labelRight.height} fill={labelRight.color}>{category.to}</text>
    </g>
  )
}

function GetWidth(text){
  // measures a text label's width
  const textElement = document.createElement('span');
  textElement.innerText = text
  // render the span element with text
  document.body.appendChild(textElement)
  // measure its width
  const width = textElement.offsetWidth
  // remove it from the dom
  document.body.removeChild(textElement)
  textElement.remove()
  return width
}

function GetWidths(){
  // calculates the max width for all from and to labels (example for from: Omission, example for to: Commission)
  // the idea is that we assign enough space for the labels so the lines and boxes between will have a fixed width when changing categories
  let left = 0
  let right = 0
  categoriesObjects.forEach((cat) => {
    const leftNew = GetWidth(cat.from)
    const rightNew = GetWidth(cat.to)
    if (leftNew > left) left = leftNew
    if (rightNew > right) right = rightNew
  })
  return [left, right]
}