import { useEffect, useRef } from "react";
import { Button, OverlayTrigger, Popover } from "react-bootstrap";

const popover = (title, info) => 
  <Popover id="popover-basic">
    <Popover.Header as="h3">{title}</Popover.Header>
    <Popover.Body>
      {info}
    </Popover.Body>
  </Popover>

export default function InfoPopover({title, info}){
  const buttonRef = useRef()
  useEffect(() => {
    if (buttonRef.current) buttonRef.current.click()
  }, [])
  
  return (
    <OverlayTrigger trigger="click" placement="bottom" overlay={popover(title, info)}>
      <Button ref={buttonRef} variant="light" className='border'>Info</Button>
   </OverlayTrigger>
  )
}