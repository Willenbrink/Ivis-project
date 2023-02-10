import { Children, useState } from "react"
import { Nav, Tab } from "react-bootstrap";

export default function TabSwitch({children}) {
  const [activeTab, setActiveTab] = useState(0)
  return (
    <Tab.Container id="left-tabs-example" defaultActiveKey={activeTab} className='h-100 w-100'>
      <Nav className="border-bottom border-2" variant="pills" >
      {Children.map(children, (child, idx) => {
        return(
        <Nav.Item className=''>
        <Nav.Link as="button" eventKey={idx} className='d-flex justify-content-center'><div className='d-flex align-items-center justify-content-center gap-2 fs-5 px-4'>{child.props.icon}<p className='m-0'>{child.props.title}</p></div></Nav.Link>
      </Nav.Item>
        )
      })}
        </Nav>
          <Tab.Content className='w-100 h-100'>
          {Children.map(children, (child, idx) => {
            return(
            <Tab.Pane eventKey={idx} key={idx} className='w-100 h-100'>
            {child}
          </Tab.Pane>
         ) })}
          </Tab.Content>
    </Tab.Container>
  );
}