import { zoomIdentity, geoNaturalEarth1, geoPath, geoGraticule, select, zoom, svg, interpolateRgb } from "d3";
import React, { useState, useCallback, useEffect } from "react";
import { useRef } from "react";
import colorScheme from "../../utils/colorScheme";

export default function ClusterLegend({colors, numClusters, setNumClusters, boxHeight}){

  const ColorBoxLabel = ({color='', label='', visible=false, className=''}) => { return (
    <div className='d-flex gap-2 align-items-center pb-2 pe-3' style={{transition: 'opacity 3s', opacity: `${visible ? 1 : 0}`}}>
      <div className='border rounded' style={{height: `${boxHeight}px`, width: `${boxHeight}px`, background: `${color}`}}></div>
      {label}
    </div>
  )} 

  return (
    <div className="position-absolute w-100 bottom-0 d-flex justify-content-center small"  onClick={(e)=>{e.stopPropagation()}}>
        <div className="legend w-75 p-2 px-5 rounded mx-5 my-4 d-flex flex-column shadow">
          <p className="fs-6 fw-bold">Clustering based on answer similarities for all categories</p>
          <div className="d-flex gap-3">
            <div className="d-flex flex-column">
              <p className="text-nowrap">Number of clusters:</p>
              <p className=" invisible m-0 pb-1">Number of clusters:</p>
              <ColorBoxLabel color={colorScheme.noData} label={<p className="text-nowrap m-0 ">No data</p>} visible={true}/>
            </div>
            <div className="d-flex flex-column w-100">
              <div className='d-flex justify-content-between'>
                {colors.map((obj, idx) => <p key={idx} className="m-0">{idx + 1}</p>)}
              </div>
              <input type="range" min="1" max={colors.length} value={numClusters} onChange={(ev) => {setNumClusters(ev.target.valueAsNumber)}} style={{pointerEvents: 'auto'}}/>
              <div className='d-flex justify-content-start mt-4 flex-wrap'>
                {colors.map((obj, idx) => {
                  const labelNumber = idx + 1 > 9
                    ? (<span className="font-monospace m-0">{idx+1}</span>)
                    : (<><span className="font-monospace invisible">2</span><span className="font-monospace">{idx+1}</span></>)
                  return <ColorBoxLabel key={idx} color={obj} label={<p className="text-nowrap m-0">Cluster&nbsp;{labelNumber}</p>} visible={numClusters >= idx+1}/>;
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
  )
}
