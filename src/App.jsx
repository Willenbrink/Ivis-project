import './scss/bootstrap.scss'
import TabSwitch from './features/TabSwitch/TabSwitch'
import WorldMap from './features/WorldMap/WorldMap'
import AboutTab from './features/AboutTab/AboutTab'
import CountryDistance from './features/CountryDistance/CountryDistance'
import { useEffect, useState } from 'react'

function App() {
  const [activetab, setActivetab] = useState(0)
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
      <TabSwitch activetab={activetab} setActivetab={setActivetab}>
        <WorldMap activetab={activetab === 0 ? true : undefined} icon="" title="Single Category Map"/>
        <CountryDistance activetab={activetab === 1 ? true : undefined} icon="" title="Difference Map"/>
        <div activetab={activetab === 2 ? true : undefined} icon="" title="RelativeToCountryViz" className='h-100'><div className='d-flex pt-5 justify-content-center h-100'>Work in progress</div></div>
        <AboutTab activetab={activetab === 3 ? true : undefined} icon="" title="About"/>
      </TabSwitch>
    </div>
  )
}

export default App
