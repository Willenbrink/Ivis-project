import { zoomIdentity, geoNaturalEarth1, geoPath, geoGraticule, select, zoom, svg, interpolateRgb } from "d3";
import React, { useState, useCallback, useEffect } from "react";
import { useRef } from "react";

export default function ClusterLegend({svgRef, numClusters, setNumClusters}){

  /*
  THIS IS CURRENTLY NOT USED. WILL PROBABLY DELETE LATER!!

  */
  const [labelWidth, setLabelWidth] = useState(null)
  const legendRef = useRef()

  let clusterLabels = Array.from({ length: numClusters }, (value, index) => `Cluster ${index + 1}`);

  // Get max widths for all left labels and right labels --> this assigns fixed widths for the labels no matter the chosen category
  useEffect(()=>{
    const w = GetWidths(clusterLabels)
    setLabelWidth(w)
  },[])

  if (!svgRef.current || labelWidth == null || svgRef.current.getBoundingClientRect().width === 0) return

  const [svgHeight, svgWidth] = [svgRef.current.getBoundingClientRect().height, svgRef.current.getBoundingClientRect().width]

  // TODO: fix minimum size of legend
  const boxHeight = svgHeight * 0.05
  const fontSize = "16" // this has to be changed if we change the font or font size
  const lineColor = '#000000'
  const noDataStr = 'No data'
  const boxMargins = 5;

  const padding = {
    x: 50,
    y: 20
  }

  const containerHeight = 200
  const container = {
    x: padding.x,
    y: svgHeight - padding.y - containerHeight,
    width: svgWidth - (padding.x * 2),
    height: containerHeight,
    padding: { x: 20, y: 20 }
  }

  const title = {
    x: container.x + container.padding.x,
    y: container.y + container.padding.y,
    string: 'Clustering based on answer similarities for all cateories'
  }

  const noDataText = {
    x: container.x + container.padding.x,
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

/*
  const labelLeft = {
    x: noDataBox.x + noDataBox.width + 20,
    y: svgHeight - padding.y + boxHeight/2 + fontSize/4 - fontSize - (category.from.length > 1 ? fontSize/2 * (Math.floor(category.from.length/2)) : 0),
    width: labelWidth, // the longest word that appears here is passengers, so this is this word's width
    color: lineColor,
    fontSize
  }

  const labelRight = {
    x: svgWidth - labelWidth - (padding.x * 2),
    y: svgHeight - padding.y + boxHeight/2 + fontSize/4 - fontSize - (category.to.length > 1 ? fontSize/2 * (Math.floor(category.to.length/2)) : 0),
    width: labelWidth, // the longest word that appears here is passengers, so this is this word's width
    color: lineColor,
    fontSize
  }
  */
  // The available line width when you subtract the content around it
  // const availableWidthLine = svgWidth - (labelLeft.x + labelLeft.width + 5) - (svgWidth - labelRight.x)
  // Length of the line to the left of the box
  /*
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
  */

 

  /*
  // Scale numbers
  const scaleNumberCommons = {
    y: hBox.y - 10,
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
  */

  return (
    <svg className=''>
      <svg x={container.x} y={container.y} width={container.width} height={container.height}>
        <rect width='100%' height='100%' fill='white' rx='15' stroke='gray'></rect>
      </svg>
        
            {/*showScaleNumbers && (
              <>
                <text x={scaleNumber_1.x} y={scaleNumber_1.y} height={scaleNumber_1.height} fill={scaleNumber_1.fill} style={scaleNumber_1.style}>100%</text>
                <text x={scaleNumber_2.x} y={scaleNumber_2.y} height={scaleNumber_2.height} fill={scaleNumber_2.fill} style={scaleNumber_2.style}>50%</text>
                <text x={scaleNumber_3.x} y={scaleNumber_3.y} height={scaleNumber_3.height} fill={scaleNumber_3.fill} style={scaleNumber_3.style}>0%</text>
                <text x={scaleNumber_4.x} y={scaleNumber_4.y} height={scaleNumber_4.height} fill={scaleNumber_4.fill} style={scaleNumber_4.style}>50%</text>
                <text x={scaleNumber_5.x} y={scaleNumber_5.y} height={scaleNumber_5.height} fill={scaleNumber_5.fill} style={scaleNumber_5.style}>100%</text>
              </>
            )*/}
        
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

function GetWidths(clusterLabels){
  // calculates the max width for all from and to labels (example for from: Omission, example for to: Commission)
  // the idea is that we assign enough space for the labels so the lines and boxes between will have a fixed width when changing categories
  let width = 0
  Object.values(clusterLabels).forEach((label) => {
      const newWidth = GetWidth(label)
      if (newWidth > width) width = newWidth
  })
  return width
}
