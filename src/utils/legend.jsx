import { zoomIdentity, geoNaturalEarth1, geoPath, geoGraticule, select, zoom, svg, interpolateRgb } from "d3";
import React, { useState, useCallback, useEffect } from "react";
import { useRef } from "react";
import { categories } from "../utils/categories";
import colorScheme from "./colorScheme"
import * as d3 from "d3"
import AgeFrom from "../assets/legendImages/age/AgeFrom";
import SpeciesFrom from "../assets/legendImages/species/SpeciesFrom";
import SpeciesTo from "../assets/legendImages/species/SpeciesTo";

export function Legend({svgRef, category, categoryStatistics, range, showRange, selected, colors, markers, zoomCall, brushActive=false, setBrushRange, showScaleNumbers=false}){
  const [labelWidths, setLabelWidths] = useState(null)
  const legendRef = useRef()

  // Get max widths for all left labels and right labels --> this assigns fixed widths for the labels no matter the chosen category
  useEffect(()=>{
    const [left, right] = GetWidths()
    setLabelWidths({ left, right })
  },[])

  useEffect(()=>{
    if (brushActive && legendRef.current !== null) {
      const brush = d3.brushX()
      .on("brush", brushed)
      .on("end", brushended)

      const svg = d3.select(legendRef.current)

      function brushed({selection}) {
        if (selection) {
         // convert to values between -1 and 1
         const getRange = (selection) => {
          return [selection[0]/(legendRef.current.width.baseVal.value*0.5) - 1, selection[1]/(legendRef.current.width.baseVal.value*0.5)-1]
        }
          svg.property("value", () => {setBrushRange(getRange(selection))})
          svg.dispatch("input");
        }
      }
      const gb = svg.append("g")
          .call(brush)
          // .call(brush.move, [-2.0,2.0])

      function brushended({selection}) {
        if (!selection) {
          // gb.call(brush.move, [-1.0,1.0])
          setBrushRange([-2.0, 2.0])
        }
      }

    }
    },[legendRef?.current])

    if (!svgRef.current || labelWidths == null || svgRef.current.getBoundingClientRect().width === 0) return

    const [svgHeight, svgWidth] = [svgRef.current.getBoundingClientRect().height, svgRef.current.getBoundingClientRect().width]

  // TODO: fix minimum size of legend
  const boxHeight = svgHeight * 0.05
  const boxHeight_2 = boxHeight * 0.75
  const fontSize = "16" // this has to be changed if we change the font or font size
  const lineColor = '#000000'
  const noDataStr = 'No data'
  const rangeBoxStr_1 = "The range of all"
  const rangeBoxStr_2 = "countries' averages"
  const boxMargins = 5;
  const fontFamily = 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", "Noto Sans", "Liberation Sans", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"'
  const textPadding = 30
  const roundedCorners = '3px'

  const padding = {
    x: 100,
    y: 80
  }

  const paddingColorBox = {
    x: 100,
    y: 25
  }

  const noDataText = {
    x: padding.x + 10,
    y: svgHeight - padding.y + boxHeight/2 + fontSize/4,
    width: GetWidth(noDataStr), // this has to be measured if we change the text size or font
    color: lineColor,
    fontSize
  }

  const noDataBox = {
    x: padding.x + noDataText.width + textPadding,
    y: svgHeight - padding.y,
    height: boxHeight_2,
    width: boxHeight_2,
  }

  const rangeBoxText_1 = {
    x: padding.x - GetWidth(rangeBoxStr_1) + GetWidth(noDataStr) + 15,
    y: svgHeight - padding.y + boxHeight_2 / 2 + fontSize / 4 - noDataBox.height - fontSize / 2 - boxMargins,
    width: GetWidth(rangeBoxStr_1), // this has to be measured if we change the text size or font
    color: lineColor,
    fontSize
  }

  const rangeBoxText_2 = {
    x: padding.x - GetWidth(rangeBoxStr_2) + GetWidth(noDataStr) + 15,
    y: svgHeight - padding.y + boxHeight_2 / 2 + fontSize / 4 - noDataBox.height + fontSize / 2 - boxMargins,
    width: GetWidth(rangeBoxStr_2), // this has to be measured if we change the text size or font
    color: lineColor,
    fontSize
  }

  const rangeBoxBox = {
    x: padding.x + noDataText.width + textPadding,
    y: svgHeight - noDataBox.height - padding.y - boxMargins,
    height: boxHeight_2,
    width: boxHeight_2,
    color: 'rgb(56, 62, 68)'
  }

  const labelLeft = {
    x: noDataBox.x + noDataBox.width + 50 + textPadding,
    y: svgHeight - padding.y + boxHeight/2 + fontSize/4 - fontSize - (category.from.length > 1 ? fontSize/2 * (Math.floor(category.from.length/2)) : 0),
    width: labelWidths.left, // the longest word that appears here is passengers, so this is this word's width
    color: lineColor,
    fontSize
  }

  const paddingLabelRight = 100
  const labelRight = {
    x: svgWidth - labelWidths.right - (padding.x * 2),
    y: svgHeight - padding.y + boxHeight/2 + fontSize/4 - fontSize - (category.to.length > 1 ? fontSize/2 * (Math.floor(category.to.length/2)) : 0),
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
    y: vertLineLeft.y2 - paddingColorBox.y,
    height: boxHeight,
    width: vertLineRight.x - vertLineLeft.x,
    strokeWidth: "2", // the longest word that appears here is passengers, so this is this word's width
    color: lineColor
  }

  const rangeBox = {
    x: labelLeft.x + labelLeft.width + lineWidthLeft,
    y: svgHeight - padding.y - paddingColorBox.y,
    height: boxHeight,
    width: boxWidth,
    color: 'rgb(56, 62, 68)'
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
  const colorBox = selected
  ? {
    x: lineWidthLeft - 5,
    y: svgHeight - padding.y,
    height: boxHeight,
    width: boxWidth,
    color: '#ffffff'
  }
  :
  {
    x: 0,
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

  function topTooltipPath(width, height, offset, radius) {
    const left = -width / 2
    const right = width / 2
    const top = -offset - height
    const bottom = -offset
    return `M 0,0 
      L ${-offset},${bottom} 
      H ${left + radius}
      Q ${left},${bottom} ${left},${bottom - radius}  
      V ${top + radius}   
      Q ${left},${top} ${left + radius},${top}
      H ${right - radius}
      Q ${right},${top} ${right},${top + radius}
      V ${bottom - radius}
      Q ${right},${bottom} ${right - radius},${bottom}
      H ${offset} 
      L 0,0 z`
  }



  function countryMarkers() {
    return (<>{
      Object.keys(markers).map(id => {
        const m = markers[id]
        const x = rangeBox.x + m.value * rangeBox.width;
        const y = svgHeight - padding.y - paddingColorBox.y;
        const width = 3;
        const labelWidth = GetWidth(m.name)

        return (<g key={id}>
          <rect key={"marker" + m.id} x={x} y={y} width={width} height={boxHeight} fill={m.color} style={{...styleTransition}}></rect>

          {m.hasTooltip && <>
            <path key={"tooltipbox" + m.id} d={topTooltipPath(labelWidth + 20, parseInt(fontSize) * 2, 5, 10)} fill='#EEEEEE' stroke='gray' transform={`translate(${x + width/2},${y - 2})`}/>
            <text key={"tooltiplabel" + m.id} transform={`translate(${x + width/2 - labelWidth/2},${y - 18})`}>{m.name}</text>
           </>}
        </g>);
      })
    }</>);
  }


  // Scale numbers
  const scaleNumberCommons = {
    y: hBox.y + boxHeight + parseInt(fontSize) + 10,
    height: parseInt(fontSize) + 10,
    fill: 'black',
    style: {textAnchor: 'middle', fontSize: `${parseInt(fontSize) - 3}`}
  }

  const scaleNumber_1 = {
    ...scaleNumberCommons,
    x: hBox.x
  }
  const scaleNumber_2 = {
    ...scaleNumberCommons,
    x: hBox.x + hBox.width/4,
  }
  const scaleNumber_3 = {
    ...scaleNumberCommons,
    x: hBox.x + hBox.width/2
  }
  const scaleNumber_4 = {
    ...scaleNumberCommons,
    x: hBox.x + ((hBox.width/4) * 3)
  }

  const scaleNumber_5 = {
    ...scaleNumberCommons,
    x: hBox.x + hBox.width
  }

  return (
    <svg height='100%' width='100%' fontFamily={fontFamily} className=''>

        <rect x={15} y={rangeBoxBox.y - 10 -30 } width={svgWidth -30} height={100 + 30} fill='rgb(256,256,256)' rx="15" stroke='rgb(206,212,218)' strokeWidth={1} fillOpacity='100%' filter="drop-shadow(3px 5px 2px rgb(0 0 0 / 0.1))"></rect>
        
        <>{/* No data text */}
            <text fontSize={noDataText.fontSize} x={noDataText.x} y={noDataText.y} width={noDataText.width} height={noDataText.height} fill={noDataText.color}>{noDataStr}</text>
            <rect x={noDataBox.x} y={noDataBox.y} width={noDataBox.width} height={noDataBox.height} fill={colorScheme.noData} stroke="#333" strokeWidth="0.3" rx={roundedCorners}></rect>
          </>
          {showRange ?
            <>{/* Rangebox text */}
                <text fontSize={rangeBoxText_1.fontSize} x={rangeBoxText_1.x} y={rangeBoxText_1.y} width={rangeBoxText_1.width} height={rangeBoxText_1.height} fill={rangeBoxText_1.color}>{rangeBoxStr_1}</text>
                <text fontSize={rangeBoxText_2.fontSize} x={rangeBoxText_2.x} y={rangeBoxText_2.y} width={rangeBoxText_2.width} height={rangeBoxText_2.height} fill={rangeBoxText_2.color}>{rangeBoxStr_2}</text>
                <rect x={rangeBoxBox.x} y={rangeBoxBox.y} width={rangeBoxBox.width} height={rangeBoxBox.height} fill='none' stroke={rangeBox.color} className='dashedRect' strokeWidth="2" rx={roundedCorners}></rect>
            </> : ""}
        <>{/* Legend box and left/right labels */}    
            <svg x={labelLeft.x} y={labelLeft.y - 50} width={labelLeft.width} height={50}>
              {category.fromIcon}
            </svg>
            <text x={labelLeft.x} y={labelLeft.y} width={labelLeft.width} height={labelLeft.height} fill={labelLeft.color} textAnchor='end' fontWeight='bold'>
              {category.from.map((row, idx)=> <tspan key={'rightLabel_' + idx} x={labelLeft.x + labelLeft.width - textPadding} dy="1em">{row}</tspan>)}
            </text>
            <svg x={labelRight.x} y={labelRight.y - 50} width={labelRight.width} height={50}>
              {category.toIcon}
            </svg>
            <text x={labelRight.x} y={labelRight.y} width={labelRight.width} height={labelRight.height} fill={labelRight.color} fontWeight='bold'>
              {category.to.map((row, idx)=> <tspan key={'leftLabel_' + idx} x={labelRight.x + textPadding} dy="1em">{row}</tspan>)}
            </text>
        </>
        <>{/* Two boxes; one with and one without colors */}
        {showScaleNumbers && (
              <>
                <text x={scaleNumber_1.x} y={scaleNumber_1.y} height={scaleNumber_1.height} fill={scaleNumber_1.fill} style={scaleNumber_1.style}>100%</text>
                <text x={scaleNumber_2.x} y={scaleNumber_2.y} height={scaleNumber_2.height} fill={scaleNumber_2.fill} style={scaleNumber_2.style}>50%</text>
                <text x={scaleNumber_3.x} y={scaleNumber_3.y} height={scaleNumber_3.height} fill={scaleNumber_3.fill} style={scaleNumber_3.style}>0%</text>
                <text x={scaleNumber_4.x} y={scaleNumber_4.y} height={scaleNumber_4.height} fill={scaleNumber_4.fill} style={scaleNumber_4.style}>50%</text>
                <text x={scaleNumber_5.x} y={scaleNumber_5.y} height={scaleNumber_5.height} fill={scaleNumber_5.fill} style={scaleNumber_5.style}>100%</text>
                <rect x={scaleNumber_1.x +1} y={hBox.y + boxHeight} height={10} width='1' stroke='rgb(56, 62, 68)' style={scaleNumber_1.style}>100%</rect>
                <rect x={scaleNumber_2.x} y={hBox.y + boxHeight} height={4} width='1' stroke='rgb(56, 62, 68)' style={scaleNumber_2.style}>100%</rect>
                <rect x={scaleNumber_3.x} y={hBox.y + boxHeight} height={10} width='1' stroke='rgb(56, 62, 68)' style={scaleNumber_3.style}>100%</rect>
                <rect x={scaleNumber_4.x} y={hBox.y + boxHeight} height={4} width='1' stroke='rgb(56, 62, 68)' style={scaleNumber_4.style}>100%</rect>
                <rect x={scaleNumber_5.x -2} y={hBox.y + boxHeight} height={10} width='1' stroke='rgb(56, 62, 68)' style={scaleNumber_5.style}>100%</rect>
              </>
            )}
            <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: colors.left, stopOpacity:"1"}} />
                      {(colors.middle != null) ? <stop offset={`${selected ? markers[selected?.id]?.value : 0.5}`} style={{ stopColor: colors.middle, stopOpacity: "1" }} /> : ""}
                <stop offset="100%" style={{stopColor: colors.right, stopOpacity:"1"}} />
            </linearGradient>
            </defs>
            <svg ref={legendRef} x={hBox.x} y={hBox.y} width={hBox.width} height={hBox.height} onMouseOver={()=>{console.log('Zoom OFF'); d3.select(svgRef.current).on('.zoom', null)}} onMouseLeave={()=>{console.log('Zoom ON'); zoomCall()}}>
              <rect width={hBox.width} height={hBox.height} fill='white' stroke="rgb(156, 162, 168)" strokeWidth="2" rx={5}/>          
              <rect x={colorBox.x} width={colorBox.width} height={colorBox.height} fill="url(#gradient)" stroke="none" strokeWidth="0.3" style={{...styleTransition}} rx={roundedCorners}></rect>
            </svg>
        </>
        
        {/* Dotted range box */}
        {showRange && <rect x={rangeBox.x} y={rangeBox.y} width={rangeBox.width} height={rangeBox.height} fill='none' strokeWidth="2" stroke={rangeBox.color} style={{ ...styleTransition }} className="dashedRect"></rect>}
        {/* Middle marker */}
        {/* <path strokeDasharray={`${Math.round((boxHeight + 20)/8)}`}
              strokeOpacity="70%" d={`M0 0 V${boxHeight + 20} 0`}
              stroke='gray' strokeWidth="2"
            transform={`translate(${hBox.x + hBox.width/2},${svgHeight - padding.y - 10})`}/> */}
        {countryMarkers()}
    </svg>
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
    cat.from.forEach((row, idx)=>{
      const leftNew = GetWidth(row)
      if (leftNew > left) left = leftNew
    })
    cat.to.forEach((row, idx)=>{
      const rightNew = GetWidth(row)
      if (rightNew > right) right = rightNew
    })
  })
  return [left, right]
}
