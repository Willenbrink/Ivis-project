import './scss/bootstrap.scss'
import TabSwitch from './features/TabSwitch/TabSwitch'
import WorldMap from './features/WorldMap/WorldMap'
import AboutTab from './features/AboutTab/AboutTab'
import CountryDistance from './features/CountryDistance/CountryDistance'
import { useEffect, useState } from 'react'

function App() {
  const [activeTab, setActiveTab] = useState(0)
  const [height, setHeight] = useState(null)
  const [width, setWidth] = useState(null)

  useEffect(()=>{
    function handleResize(){
      setHeight(window.innerHeight)
      setWidth(window.innerWidth)
    }
    window.addEventListener('resize', handleResize)
    return ()=>{
      window.removeEventListener('resize', handleResize)
    }
  },[])

  return (
    <div className="h-100 vh-100 w-100 d-flex flex-column" style={{minHeight: '100%'}}>
      <TabSwitch activeTab={activeTab} setActiveTab={setActiveTab}>
        <WorldMap activeTab={activeTab === 0} icon="" title="PerCategoryViz"/>
        <CountryDistance activeTab={activeTab === 1} icon="" title="Country Distance"/>
        <div activeTab={activeTab === 2} icon="" title="RelativeToCountryViz" className='h-100'><div className='d-flex pt-5 justify-content-center h-100'>Work in progress</div></div>
        <AboutTab activeTab={activeTab === 3} icon="" title="About"/>
      </TabSwitch>
    </div>
  )
}

export default App
