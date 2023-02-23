import { zoomIdentity, geoNaturalEarth1, geoPath, geoGraticule, select, zoom, svg, interpolateRgb } from "d3";
import React, { useState, useCallback, useEffect } from "react";
import { useRef } from "react";
import { categories } from "../../utils/categories";
import { get_keys } from "../../model/dataHandler";
/*
const projection = geoNaturalEarth1().translate([width / 2, height / 1.4])    // translate to center of screen. You might have to fiddle with this
//depending on the size of your screen
.scale([150]);
const path = geoPath(projection)
const graticule = geoGraticule()

const selectedLineWidth = 1;
const hoveredLineWidth = 1.3;
const borderLineWidth = 0.5;
const zoomLineStrength = 0.5;
*/

export const colorScheme = {
  left: '#ef4400',
  middle: '#f7f7f7',
  right: '#0083cf',
  selectedCountry: '#00A600',
  hoveredCountry: '#00CC00',
  //"#D0D0D0"
  noData: 'gray',
};

function valToColor(value, range) {
  if (value === undefined)
    return colorScheme.noData;
  var relative_value;
  if(range.selected) {
    relative_value = (value - range.selected) / (range.max - range.min);
  } else {
    // If range.selected is null, we have our reference at 0.
    // But, this means that the extreme ends are only "half the bar" away from the reference.
    // Therefore, we multiply by 2
    relative_value = 2 * value / (range.max - range.min);
  }
  const extreme_color = relative_value < 0 ? colorScheme.left : colorScheme.right;
  //between 0 and 1. 0 is white (=similar to selected), 1 is extreme_color (=not similar to selected)
  const absolute_value = Math.abs(relative_value);
  return interpolateRgb(colorScheme.middle, extreme_color)(absolute_value);
};

export function LineDraw({
  data: { iso_countries, non_iso_countries, interiorBorders }, selectCountry, selected, range, hovered, setHovered, svgRef, zoomLevel, zoomLevelSetter, doReset, setDoReset, category
}) {

  const gRef = useRef()
  const zoomInScaleLimit = 8
  const zoomOutScaleLimit = 0.12
  // console.log(svgRef.current.clientWidth)
  // console.log('PAAAAATH: ', graticule())
  const projection = geoNaturalEarth1().scale(249.5 * svgRef.current.clientHeight/950).translate([svgRef.current.clientWidth/2,svgRef.current.clientHeight/2])
  // console.log('PROJECTION: ', projection)
  //.translate([svgRef.current.clientWidth / 2, svgRef.current.clientHeight / 1.4])
  const path = geoPath(projection)
  const graticule = geoGraticule()

  const selectedLineWidth = 1;
  const hoveredLineWidth = 1.3;
  const borderLineWidth = 0.5;
  const zoomLineStrength = 0.5;

  const zoomFactor = (1 / (Math.max(1, zoomLevel) * zoomLineStrength))
  // Zooming and panning
  useEffect(()=>{
    if (svgRef && gRef) {
      const svg = select(svgRef.current)
      const g = select(gRef.current)
      svg.call(zoom().scaleExtent([zoomOutScaleLimit, zoomInScaleLimit])
                     .translateExtent([[0, 0], [svgRef.current.clientWidth,svgRef.current.clientHeight]]).on('zoom', (event) => {
                       g.attr('transform', event.transform)
                       zoomLevelSetter(event.transform.k)
                     }))
    }
  }, [])
  //resetting the zoom
  if (doReset) {
    setDoReset(false)
    if (svgRef && gRef) {
      const g = select(gRef.current)
      g.attr('transform', zoomIdentity);
      zoomLevelSetter(null)
    } 
  }

  return (
      <g className="mark" ref={gRef} >
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
                }} />
          {
            //example country: {"color": "#040", "alpha3": "FJI", "geometry": {"type": "MultiPolygon","coordinates": [[[[100,-10]...]]]
            //example country: {"color": "#040", "alpha3": "FJI", "geometry": {"type": "MultiPolygon","coordinates": [[[[100,-10]...]]]
            Object.values(iso_countries).map(c => {
              return <path
                key={c.id}
                id={c.id}
                fill={valToColor(c[category], range)}
                className="country"
                d={path(c.geometry)}
                onMouseOver={() => {
                  if (c.hasData) setHovered(c.id);
                  else setHovered(null);
                }}
              />}
            )
          }
          {
            //example country: {"geometry": {"type": "MultiPolygon","coordinates": [[[[100,-10]...]]]
            non_iso_countries.map((c, idx) => (
              <path
                key={`no_iso_country_${idx}`}
                fill={colorScheme.noData}
                className="no_iso_country"
                d={path(c.geometry)}
              />
            ))
          }
          <path className="interiorBorders" d={path(interiorBorders)} strokeWidth={` ${borderLineWidth * zoomFactor}px`} />
          {
            (hovered != null) ?
              (
                <path
                  key="hovered"
                  id={hovered}
                  fill="transparent"
                  stroke={colorScheme.hoveredCountry}
                  strokeWidth={` ${hoveredLineWidth * zoomFactor}px`}
                  d={path(iso_countries[hovered].geometry)}
                  onMouseLeave={() => {
                    setHovered(null);
                  }}
                  onClick={(e) => {
                    setHovered(null);
                    selectCountry(iso_countries[e.target.id]);
                  }}
                />
              ) : ""
          }
          {
            selected ?
              (
                <path
                  key="selected"
                  id="selectedCountryBorder"
                  fill="transparent"
                  strokeWidth={` ${selectedLineWidth * zoomFactor}px`}
                  stroke={colorScheme.selectedCountry}
                  d={path(selected.geometry)}
                />
              ) : ""
          }
      </g>
  );
}

export function Legend({svgRef, category, categoryStatistics, range, selected}){
  const [labelWidths, setLabelWidths] = useState({ left: 0, right: 0 })
  // Get max widths for all left labels and right labels --> this assigns fixed widths for the labels no matter the chosen category
  useEffect(()=>{
    console.log("Computing widths!");
    const [left, right] = GetWidths()
    setLabelWidths({ left, right })
  },[])
  if (!svgRef.current) return
  const legendRef = useRef()

  const [svgHeight, svgWidth] = [svgRef.current.getBoundingClientRect().height, svgRef.current.getBoundingClientRect().width]

  // TODO: fix minimum size of legend
  const boxHeight = svgHeight * 0.05
  const fontSize = "16" // this has to be changed if we change the font or font size
  const lineColor = '#000000'
  const noDataStr = 'No data'


  const padding = {
    x: 100,
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
  }

  const labelLeft = {
    x: noDataBox.x + noDataBox.width + 20,
    y: svgHeight - padding.y + boxHeight/2 + fontSize/4,
    width: labelWidths.left, // the longest word that appears here is passengers, so this is this word's width
    color: lineColor,
    fontSize
  }
  
  const paddingLabelRight = 100
  const labelRight = {
    x: svgWidth - labelWidths.right - (padding.x * 2),
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
  //console.log('available: ', availableWidthLine)
  //console.log('left: ', lineWidthLeft)
  //console.log('box: ', boxWidth)
  //console.log('box: ', lineWidthRight)
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
    x2: labelLeft.x + labelLeft.width + availableWidthLine,
    y2: svgHeight - padding.y + boxHeight/2,
    strokeWidth: "2", // the longest word that appears here is passengers, so this is this word's width
    color: lineColor
  }

  const rangeBox = {
    x: labelLeft.x + labelLeft.width + lineWidthLeft,
    y: svgHeight - padding.y,
    height: boxHeight,
    width: boxWidth,
    color: '#ffffff'
  }
  /*
  const hLineRight = {
    x1: rangeBox.x + rangeBox.width,
    y1: svgHeight - padding.y + boxHeight/2,
    x2: rangeBox.x + rangeBox.width + lineWidthRight,
    y2: svgHeight - padding.y + boxHeight/2,
    strokeWidth: "2", // the longest word that appears here is passengers, so this is this word's width
    color: lineColor
  }
  */

  const vertLineRight = {
    x1: hLineLeft.x2,
    y1: svgHeight - padding.y + boxHeight,
    x2: hLineLeft.x2,
    y2: svgHeight - padding.y,
    strokeWidth: "2", // the longest word that appears here is passengers, so this is this word's width
    color: lineColor
  }

  // no selected country --> colorBox has full width
  const colorBox = range.selected
  ? {
    x: labelLeft.x + labelLeft.width + lineWidthLeft,
    y: svgHeight - padding.y,
    height: boxHeight,
    width: boxWidth,
    color: '#ffffff'
  }
  :
  {
    x: vertLineLeft.x1,
    y: svgHeight - padding.y,
    height: boxHeight,
    width: vertLineRight.x2 - vertLineLeft.x2,
    color: '#ffffff'
  }

  const styleTransition = {transition: "0.3s"}

  const selectedToPercentage = range.selected
        ? Math.round((range.selected - categoryStatistics.min) / (categoryStatistics.max - categoryStatistics.min) * 100)
  : 50

  const countryMarker = {
    x: rangeBox.x + ((selectedToPercentage/100) * rangeBox.width),
    y: svgHeight - padding.y,
    height: boxHeight,
    width: range.selected !== null ? 3 : 0,
    color: colorScheme.selectedCountry,
  }

  function bottomTooltipPath(width, height, offset, radius) {
    const left = -width / 2
    const right = width / 2
    const bottom = offset + height
    const top = offset
    return `M 0,0 
      L ${-offset},${top} 
      H ${left + radius}
      Q ${left},${top} ${left},${top + radius}  
      V ${bottom - radius}   
      Q ${left},${bottom} ${left + radius},${bottom}
      H ${right - radius}
      Q ${right},${bottom} ${right},${bottom - radius}
      V ${top + radius}
      Q ${right},${top} ${right - radius},${top}
      H ${offset} 
      L 0,0 z`
  }


  const middleMarker = {
    x: hLineLeft.x1 + Math.round((hLineLeft.x2 - hLineLeft.x1)/2) ,
    y: svgHeight - padding.y - 10,
    height: boxHeight + 20,
    width: 3,
    color: 'gray'
  }

  /* GAMMAL SVG
  <g className='' ref={legendRef}>
        <text fontSize={noDataText.fontSize} x={noDataText.x} y={noDataText.y} width={noDataText.width} height={noDataText.height} fill={noDataText.color}>{noDataStr}</text>
        <rect x={noDataBox.x} y={noDataBox.y} width={noDataBox.width} height={noDataBox.height} fill={colorScheme.noData} stroke="#333" stroke-width="0.3"></rect>
        <text x={labelLeft.x} y={labelLeft.y} width={labelLeft.width} height={labelLeft.height} fill={labelLeft.color}>{category.from}</text>
        <line x1={vertLineLeft.x1} y1={vertLineLeft.y1} x2={vertLineLeft.x2} y2={vertLineLeft.y2} style={{...styleTransition, stroke:"rgb(0,0,0)", strokeWidth: vertLineLeft.strokeWidth}} />
        <line x1={hLineLeft.x1} y1={hLineLeft.y1} x2={hLineLeft.x2} y2={hLineLeft.y2} style={{transition:"transform 300ms ease-in", stroke:"rgb(0,0,0)", strokeWidth: hLineLeft.strokeWidth}} />
        <rect x={colorBox.x} y={colorBox.y} width={colorBox.width} height={colorBox.height} fill='none' stroke="#333" stroke-width="0.3" style={{...styleTransition, ...linearGradient}}></rect>
        <line x1={vertLineRight.x1} y1={vertLineRight.y1} x2={vertLineRight.x2} y2={vertLineLeft.y2} style={{...styleTransition, stroke:"rgb(0,0,0)", strokeWidth: vertLineRight.strokeWidth}} />
        <line x1={hLineRight.x1} y1={hLineRight.y1} x2={hLineRight.x2} y2={hLineRight.y2} style={{...styleTransition, stroke:"rgb(0,0,0)", strokeWidth: hLineRight.strokeWidth}} />
        <text x={labelRight.x} y={labelRight.y} width={labelRight.width} height={labelRight.height} fill={labelRight.color}>{category.to}</text>
    </g>
  */

  const toolTipLabelWidth = GetWidth(selected?.name)
  const toolTip = (
  <>
    <path d={bottomTooltipPath(toolTipLabelWidth + 20, parseInt(fontSize) * 2, 5, 10)} fill='#EEEEEE' stroke='gray' transform={`translate(${countryMarker.x + countryMarker.width/2},${countryMarker.y + boxHeight + 2})`} style={{...styleTransition}}></path>
    <text transform={`translate(${countryMarker.x + countryMarker.width/2 - toolTipLabelWidth/2},${countryMarker.y + boxHeight + parseInt(fontSize) + 12})`} style={{...styleTransition}}>{selected?.name}</text>
  </>
 )

  return (
    <g className='' ref={legendRef}>
        <text fontSize={noDataText.fontSize} x={noDataText.x} y={noDataText.y} width={noDataText.width} height={noDataText.height} fill={noDataText.color}>{noDataStr}</text>
        <rect x={noDataBox.x} y={noDataBox.y} width={noDataBox.width} height={noDataBox.height} fill={colorScheme.noData} stroke="#333" strokeWidth="0.3"></rect>
        {/* Line starts here */}
        <text x={labelLeft.x} y={labelLeft.y} width={labelLeft.width} height={labelLeft.height} fill={labelLeft.color}>{category.from}</text>
        <line x1={vertLineLeft.x1} y1={vertLineLeft.y1} x2={vertLineLeft.x2} y2={vertLineLeft.y2} style={{...styleTransition, stroke:"rgb(0,0,0)", strokeWidth: vertLineLeft.strokeWidth}} />
        <line x1={hLineLeft.x1} y1={hLineLeft.y1} x2={hLineLeft.x2} y2={hLineLeft.y2} style={{transition:"transform 300ms ease-in", stroke:"rgb(0,0,0)", strokeWidth: hLineLeft.strokeWidth}} />
        {/* <line x1={hLineRight.x1} y1={hLineRight.y1} x2={hLineRight.x2} y2={hLineRight.y2} style={{...styleTransition, stroke:"rgb(0,0,0)", strokeWidth: hLineRight.strokeWidth}} /> */}
        <line x1={vertLineRight.x1} y1={vertLineRight.y1} x2={vertLineRight.x2} y2={vertLineLeft.y2} style={{...styleTransition, stroke:"rgb(0,0,0)", strokeWidth: vertLineRight.strokeWidth}} />
        {/* Box with colors */}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: colorScheme.left, stopOpacity:"1"}} />
            <stop offset={`${selectedToPercentage}%`} style={{stopColor: colorScheme.middle, stopOpacity:"1"}} />
            <stop offset="100%" style={{stopColor: colorScheme.right, stopOpacity:"1"}} />
          </linearGradient>
        </defs>
        <rect x={colorBox.x} y={colorBox.y} width={colorBox.width} height={colorBox.height} fill="url(#gradient)" stroke="none" strokeWidth="0.3" style={{...styleTransition}}></rect>
        {/* Box with range */}
        <rect x={rangeBox.x} y={rangeBox.y} width={rangeBox.width} height={rangeBox.height} fill='none' stroke="#333" strokeWidth="2" style={{...styleTransition}}></rect>
        {/* <rect x={middleMarker.x} y={middleMarker.y} width={middleMarker.width} height={middleMarker.height} stroke={middleMarker.color} style={{...styleTransition, borderStyle: 'dotted'}}></rect>*/}
        <path strokeDasharray={`${Math.round((boxHeight + 20)/8)}`} strokeOpacity="70%" d={`M0 0 V${boxHeight + 20} 0`} stroke='gray' strokeWidth="2" transform={`translate(${middleMarker.x},${middleMarker.y})`}/>
        <rect x={countryMarker.x} y={countryMarker.y} width={countryMarker.width} height={countryMarker.height} fill={countryMarker.color} style={{...styleTransition}}></rect>
        {range.selected && toolTip}
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
  Object.values(categories).forEach((cat) => {
    const leftNew = GetWidth(cat.from)
    const rightNew = GetWidth(cat.to)
    if (leftNew > left) left = leftNew
    if (rightNew > right) right = rightNew
  })
  return [left, right]
}
