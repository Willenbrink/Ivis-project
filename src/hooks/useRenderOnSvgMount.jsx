import { useEffect, useState } from "react"

export default function useRenderOnSvgMount(svgRef, activetab){
  const [svgHasMounted, setSvgHasMounted] = useState(false)
  useEffect(()=>{
    /* 
    Only render the map when the svg element has been assigned to the react reference (svgRef).
    We do this because svgRef is used in child components to draw the map.
    */
    if(svgRef.current !== null && activetab) {
      setSvgHasMounted(true)
    } else {
      // When we switch tab, svgRef is set to null, so we also se svgHasMounted to false
      setSvgHasMounted(false)
    }
    /* 
    svgRef?.current?.clientWidth: when the width of the svg changes it triggers the useEffect (it rerenders the map)
    This solves a bug where the map is rendered but with height, width = 0
    */
  },[activetab, svgRef?.current?.clientWidth])

  return svgHasMounted
}