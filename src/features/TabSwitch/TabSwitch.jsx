import { useEffect } from "react";
import { Children, useRef, useState } from "react"
import { Nav, Tab } from "react-bootstrap";

export default function TabSwitch({children}) {
  const [activeTab, setActiveTab] = useState(0)
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
  return (
    <Tab.Container id="left-tabs-example" defaultActiveKey={activeTab}>
      <Nav ref={tabsRef} className="border-bottom border-2 px-5" variant="pills" >
      {Children.map(children, (child, idx) => {
        return(
        <Nav.Item className=''>
        <Nav.Link as="button" eventKey={idx} className='d-flex justify-content-center'><div className='d-flex align-items-center justify-content-center gap-2 fs-5 px-4'>{child.props.icon}<p className='m-0'>{child.props.title}</p></div></Nav.Link>
      </Nav.Item>
        )
      })}
        </Nav>
          <Tab.Content className='w-100 d-flex flex-column flex-grow-1' >
          {Children.map(children, (child, idx) => {
            return(
            <Tab.Pane eventKey={idx} key={idx} className={activeTab === idx ? 'd-flex flex-column flex-grow-1' : ''}>
            {child}
          </Tab.Pane>
         ) })}
          </Tab.Content>
    </Tab.Container>
  );
}