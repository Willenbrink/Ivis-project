import './scss/bootstrap.scss'
import TabSwitch from './features/TabSwitch/TabSwitch'
import WorldMap from './features/WorldMap/WorldMap'
import CountryDistance from './features/CountryDistance/CountryDistance'
import Cluster from './features/Cluster/Cluster'
import AboutTab from './features/AboutTab/AboutTab'
import { useEffect, useState } from 'react'
import { parseJSON } from './utils/parseMapJSON'
import { fetch_data, fetch_cluster_data } from './model/dataHandler'
import MMLogo from './assets/MMLogo'
import HomePage from './features/HomePage/HomePage'

function App() {
  const [activeTabNumber, setActiveTabNumber] = useState(0)
  const [height, setHeight] = useState(null)
  const [width, setWidth] = useState(null)
  const [data, setData] = useState(null)
  const [clusterData, setClusterData] = useState(null)
  const [map, setMap] = useState(null)
  useEffect(()=>{
    function handleResize(){
      setHeight(window.innerHeight)
      setWidth(window.innerWidth)
    }
    window.addEventListener('resize', handleResize);
    fetch_data().then((data) => {
      setData(data);
      parseJSON(data).then((map) => setMap(map)) //needs to be called after data is set
    });

    fetch_cluster_data().then((data) => {
      setClusterData(data);
    });
    
    return ()=>{
      window.removeEventListener('resize', handleResize)
    }
    
  },[])

  useEffect(()=>{console.log('activeTab: ', activeTabNumber)},[activeTabNumber])

  return (
    <div className="h-100 vh-100 w-100 d-flex flex-column" style={{minHeight: '100%'}}>
      <TabSwitch activeTabNumber={activeTabNumber} setActiveTabNumber={setActiveTabNumber}>
        <HomePage icon={<div className='' style={{height: '2rem'}}><MMLogo/></div>} setActiveTabNumber={setActiveTabNumber}/>
        {(data !== null && map !== null) ? <WorldMap data={data} map={map} isActiveTab={activeTabNumber === 1 } icon="" title="Single Category Map"/>: <pre>"Loading..."</pre>}
        {(data !== null && map !== null) ? <CountryDistance data={data} map={map} isActiveTab={activeTabNumber === 2} icon="" title="Difference Map"/> : <pre>"Loading..."</pre>}
        {(data !== null && map !== null && clusterData !== null) ? <Cluster clusterData={clusterData} data={data} map={map} isActiveTab={activeTabNumber === 3} icon="" title="Culture Group Map"/> : <pre>"Loading..."</pre>}
        {/* <div icon="" title="RelativeToCountryViz" className='h-100'><div className='d-flex pt-5 justify-content-center h-100'>Work in progress</div></div>*/ }
        <AboutTab isActiveTab={activeTabNumber === 4 ? true : undefined} icon="" title="About"/>
      </TabSwitch>
    </div>
  )
}

export default App
