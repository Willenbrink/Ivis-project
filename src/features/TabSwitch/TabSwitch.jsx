import { useEffect } from "react";
import { Children, useRef, useState } from "react"
import { Nav, Tab } from "react-bootstrap";

export default function TabSwitch({children, activeTabNumber, setActiveTabNumber}) {
  const tabsRef = useRef()
  // This code was an attempt to solve a window size issue
  //
  /*
  const [height, setHeight] = useState(window.innerHeight)
  // Set height when component has mounted
  useEffect(()=>{
    if (tabsRef.current){
      setHeight(window.innerHeight - tabsRef.current.getBoundingClientRect().height)
    }
  }, [tabsRef.current])

  // Set height when window 
  useEffect(()=>{
    function HandleResize(){
      const newHeight = window.innerHeight - tabsRef.current.getBoundingClientRect().height
      if (height !== newHeight) setHeight(newHeight)
    }
    window.addEventListener('resize', HandleResize)
    return (() => {
      window.removeEventListener('resize', HandleResize)
    })
  },[])
  */
  // style={{height: `${height}px`}}
  const chosenTab = "text-primary fw-light border-primary border-bottom border-3 rounded-0"
  const tab = "fw-light rounded-0 text-secondary"

  return (
    <Tab.Container id="left-tabs-example" defaultActiveKey={activeTabNumber} activeKey={activeTabNumber}>
      <Nav id="navigation-bar" ref={tabsRef} className="shadow px-5" >
      {Children.map(children, (child, idx) => {
        return(
        <Nav.Item className='nav-item border-0'>
                <Nav.Link as="button" eventKey={idx} onClick={() => setActiveTabNumber(idx)} className={`border-0 nav-links d-flex justify-content-center ${activeTabNumber === idx ? chosenTab : tab}`}><div className='nav-button-div d-flex align-items-center justify-content-center gap-2 fs-5 px-4'>{child.props.icon}<p className='m-0'>{child.props.title}</p></div></Nav.Link>
      </Nav.Item>
        )
      })}
        </Nav>
          <Tab.Content className='w-100 d-flex flex-column flex-grow-1' >
          {Children.map(children, (child, idx) => {
            return(
            <Tab.Pane eventKey={idx} key={idx} className={activeTabNumber === idx ? 'd-flex flex-column flex-grow-1' : ''}>
            {child}
          </Tab.Pane>
         ) })}
          </Tab.Content>
    </Tab.Container>
  );
}