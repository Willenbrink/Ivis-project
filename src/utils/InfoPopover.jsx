import { useEffect, useRef, useState } from "react";
import { Button, OverlayTrigger, Popover } from "react-bootstrap";

const popover = (title, info) => 
  <Popover id="popover-basic" style={{maxWidth: '400px'}}>
    <Popover.Header as="h3">{title}</Popover.Header>
    <Popover.Body>
     {info}
    </Popover.Body>
  </Popover>

export default function InfoPopover({title, info, isActiveTab}){
  const buttonRef = useRef()
  const [hasBeenClosed, setHasBeenClosed] = useState(false)

  useEffect(() => {
    //if (buttonRef.current && !hasBeenClosed) buttonRef.current.click()
  }, [isActiveTab])

  
  return isActiveTab 
  ? (
    <OverlayTrigger trigger="click" placement="bottom" rootClose overlay={popover(title, info)} show={isActiveTab && hasBeenClosed}>
      <Button ref={buttonRef} variant="light" className='border' onClick={()=>{setHasBeenClosed(!hasBeenClosed)}}>Info</Button>
   </OverlayTrigger>
  )
  :<></>
}