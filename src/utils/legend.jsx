import { zoomIdentity, geoNaturalEarth1, geoPath, geoGraticule, select, zoom, svg, interpolateRgb } from "d3";
import React, { useState, useCallback, useEffect } from "react";
import { useRef } from "react";
import { categories } from "../utils/categories";
import colorScheme from "./colorScheme"

export function Legend({svgRef, category, categoryStatistics, range, showRange, selected, colors, markers}){
  const [labelWidths, setLabelWidths] = useState({ left: 0, right: 0 })
  // Get max widths for all left labels and right labels --> this assigns fixed widths for the labels no matter the chosen category
  useEffect(()=>{
    //console.log("Computing widths!");
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
  const rangeBoxStr_1 = "The range of all"
  const rangeBoxStr_2 = "countries' answers"
  const boxMargins = 5;

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

  const rangeBoxText_1 = {
    x: padding.x - GetWidth(rangeBoxStr_1) + GetWidth(noDataStr),
    y: svgHeight - padding.y + boxHeight / 2 + fontSize / 4 - noDataBox.height - fontSize / 2 - boxMargins,
    width: GetWidth(rangeBoxStr_1), // this has to be measured if we change the text size or font
    color: lineColor,
    fontSize
  }

  const rangeBoxText_2 = {
    x: padding.x - GetWidth(rangeBoxStr_2) + GetWidth(noDataStr),
    y: svgHeight - padding.y + boxHeight / 2 + fontSize / 4 - noDataBox.height + fontSize / 2 - boxMargins,
    width: GetWidth(rangeBoxStr_2), // this has to be measured if we change the text size or font
    color: lineColor,
    fontSize
  }

  const rangeBoxBox = {
    x: noDataText.x + noDataText.width + 5,
    y: svgHeight - noDataBox.height - padding.y - boxMargins,
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
    x: labelLeft.x + labelLeft.width + 5,
    y1: svgHeight - padding.y + boxHeight,
    y2: svgHeight - padding.y,
    strokeWidth: "2", // the longest word that appears here is passengers, so this is this word's width
    color: lineColor
  }

  const vertLineRight = {
    x: labelLeft.x + labelLeft.width + availableWidthLine,
    y1: svgHeight - padding.y + boxHeight,
    y2: svgHeight - padding.y,
    strokeWidth: "2", // the longest word that appears here is passengers, so this is this word's width
    color: lineColor
  }

  const hBox = {
    x: vertLineLeft.x,
    y: vertLineLeft.y2,
    height: boxHeight,
    width: vertLineRight.x - vertLineLeft.x,
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
    x: vertLineLeft.x,
    y: svgHeight - padding.y,
    height: boxHeight,
    width: vertLineRight.x - vertLineLeft.x,
    color: '#ffffff'
  }

  const styleTransition = {transition: "0.3s"}

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

  function countryMarkers() {
    return (<>{
      Object.values(markers).map(m => {
        const x = rangeBox.x + m.value * rangeBox.width;
        const y = svgHeight - padding.y;
        const width = 3;
        const labelWidth = GetWidth(m.name);

        return (<>
          <rect key={"marker" + m.id} x={x} y={y} width={width} height={boxHeight} fill={m.color} style={{...styleTransition}}></rect>

          {m.hasTooltip && <>
            <path key={"tooltipbox" + m.id} d={bottomTooltipPath(labelWidth + 20, parseInt(fontSize) * 2, 5, 10)} fill='#EEEEEE' stroke='gray' transform={`translate(${x + width/2},${y + boxHeight + 2})`}/>
            <text key={"tooltiplabel" + m.id} transform={`translate(${x + width/2 - labelWidth/2},${y + boxHeight + parseInt(fontSize) + 12})`}>{m.name}</text>
           </>}
        </>);
      })
    }</>);
  }

  return (
    <g className='' ref={legendRef}>
        <>{/* No data text */}
            <text fontSize={noDataText.fontSize} x={noDataText.x} y={noDataText.y} width={noDataText.width} height={noDataText.height} fill={noDataText.color}>{noDataStr}</text>
            <rect x={noDataBox.x} y={noDataBox.y} width={noDataBox.width} height={noDataBox.height} fill={colorScheme.noData} stroke="#333" strokeWidth="0.3"></rect>
          </>
          {showRange ?
              <>{/* Rangebox text */}
                  <text fontSize={rangeBoxText_1.fontSize} x={rangeBoxText_1.x} y={rangeBoxText_1.y} width={rangeBoxText_1.width} height={rangeBoxText_1.height} fill={rangeBoxText_1.color}>{rangeBoxStr_1}</text>
                  <text fontSize={rangeBoxText_2.fontSize} x={rangeBoxText_2.x} y={rangeBoxText_2.y} width={rangeBoxText_2.width} height={rangeBoxText_2.height} fill={rangeBoxText_2.color}>{rangeBoxStr_2}</text>
                  <rect x={rangeBoxBox.x} y={rangeBoxBox.y} width={rangeBoxBox.width} height={rangeBoxBox.height} fill='none' className='dashedRect' strokeWidth="2"></rect>
              </> : ""}
        <>{/* Legend box and left/right labels */}
            <rect x={hBox.x} y={hBox.y} width={hBox.width} height={hBox.height} fill='white' stroke="rgb(0,0,0)" strokeWidth="1"/>
            {/* <line x1={hLineRight.x1} y1={hLineRight.y1} x2={hLineRight.x2} y2={hLineRight.y2} style={{...styleTransition, stroke:"rgb(0,0,0)", strokeWidth: hLineRight.strokeWidth}} /> */}
            <text x={labelLeft.x} y={labelLeft.y} width={labelLeft.width} height={labelLeft.height} fill={labelLeft.color}>{category.from}</text>
            <text x={labelRight.x} y={labelRight.y} width={labelRight.width} height={labelRight.height} fill={labelRight.color}>{category.to}</text>
        </>
        <>{/* Box with colors */}
            <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: colors.left, stopOpacity:"1"}} />
                      {(colors.middle != null) ? <stop offset={`${selected ? markers[selected?.id]?.value : 0.5}`} style={{ stopColor: colors.middle, stopOpacity: "1" }} /> : ""}
                <stop offset="100%" style={{stopColor: colors.right, stopOpacity:"1"}} />
            </linearGradient>
            </defs>
            <rect x={colorBox.x} y={colorBox.y} width={colorBox.width} height={colorBox.height} fill="url(#gradient)" stroke="none" strokeWidth="0.3" style={{...styleTransition}}></rect>
        </>
        
        {/* Dotted range box */}
        {showRange ?
          <rect x={rangeBox.x} y={rangeBox.y} width={rangeBox.width} height={rangeBox.height} fill='none' strokeWidth="2" style={{ ...styleTransition }} className="dashedRect"></rect>
      : ""}
        {/* Middle marker */}
        <path strokeDasharray={`${Math.round((boxHeight + 20)/8)}`}
              strokeOpacity="70%" d={`M0 0 V${boxHeight + 20} 0`}
              stroke='gray' strokeWidth="2"
              transform={`translate(${hBox.x + hBox.width/2},${svgHeight - padding.y - 10})`}/>
        {countryMarkers()}
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
