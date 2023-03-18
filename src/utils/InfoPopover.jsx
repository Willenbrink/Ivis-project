import { useEffect, useRef, useState } from "react";
import { Button, OverlayTrigger, Popover } from "react-bootstrap";

const popover = (title, info) => 
  <Popover id="popover-basic" style={{maxWidth: '400px'}}>
    <Popover.Header as="h3">{title}</Popover.Header>
    <Popover.Body>
     {info}
    </Popover.Body>
  </Popover>

export default function InfoPopover({title, info}){
  const buttonRef = useRef()
  const [open, setOpen] = useState(false)

  return (
    <OverlayTrigger trigger="click" placement="bottom" rootClose overlay={popover(title, info)} show={open}>
      <Button ref={buttonRef} variant="light" className='border' onClick={()=>{setOpen(!open)}}>Info</Button>
   </OverlayTrigger>
  )
}
