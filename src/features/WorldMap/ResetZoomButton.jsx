import { Button } from "react-bootstrap";

export default function ResetZoomButton({zoomLevel, setDoReset}){
  return(
    <div id="zoomDiv" style={{position:"absolute", margin:"10px", right: 0}}>
      <p hidden={true} style={{textAlign: "right"}}>Zoom: {zoomLevel?zoomLevel.toFixed(2):"1.00"}</p>
      <Button onClick={(e) => {setDoReset(true);}} hidden={!zoomLevel || !(zoomLevel < 0.5 || zoomLevel > 2)}>Reset Map</Button>
    </div>
  )
}