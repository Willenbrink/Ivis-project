import './scss/bootstrap.scss'
import TabSwitch from './features/TabSwitch/TabSwitch'
import WorldMap from './features/WorldMap/WorldMap'
import AboutTab from './features/AboutTab/AboutTab'
import CountryDistance from './features/CountryDistance/CountryDistance'
import { useEffect, useState } from 'react'
import { parseJSON } from './utils/parseMapJSON'
import { fetch_data } from './model/dataHandler'

function App() {
  const [activeTab, setActiveTab] = useState(0)
  const [height, setHeight] = useState(null)
  const [width, setWidth] = useState(null)
  const [data, setData] = useState(null)
  const [map, setMap] = useState(null)
  useEffect(()=>{
    function handleResize(){
      setHeight(window.innerHeight)
      setWidth(window.innerWidth)
    }
    window.addEventListener('resize', handleResize)
    fetch_data().then((data) => {
      setData(data);
      parseJSON(data).then((map) => setMap(map)) //needs to be called after data is set
    })
    
    return ()=>{
      window.removeEventListener('resize', handleResize)
    }
    
  },[])

  return (
    <div className="h-100 vh-100 w-100 d-flex flex-column" style={{minHeight: '100%'}}>
      <TabSwitch activeTab={activeTab} setActiveTab={setActiveTab}>
        {(data !== null && map !== null) ? <WorldMap data={data} map={map} isActiveTab={activeTab === 0} icon="" title="Single Category Map"/>: <pre>"Loading..."</pre>}
        {(data !== null && map !== null) ? <CountryDistance data={data} map={map} isActiveTab={activeTab === 1} icon="" title="Difference Map"/> : <pre>"Loading..."</pre>}
        <div icon="" title="RelativeToCountryViz" className='h-100'><div className='d-flex pt-5 justify-content-center h-100'>Work in progress</div></div>
        <AboutTab activeTab={activeTab === 3} icon="" title="About"/>
      </TabSwitch>
    </div>
  )
}

export default App
