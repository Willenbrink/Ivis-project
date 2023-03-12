import { useEffect, useRef, useState } from "react";
import { Button, OverlayTrigger, Popover } from "react-bootstrap";

const popover = ( 
  <Popover id="popover-basic">
    <Popover.Body>
      The range of all countries' avarage answers
    </Popover.Body>
  </Popover>
)

export default function InfoPopover(){
    // stoppa in streckade lådan i popover??
   // skapa en cirkel med i innuti (ikon)
  return (
    <OverlayTrigger trigger="hover" placement="top" rootClose overlay={popover(title, info)}>
  
   </OverlayTrigger>
  )
}