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
      /* MTQ (Martinique), REU (Réunion) --> Two french departments
        These countries have separate keys in CountriesChangePr.json
        But in the topoJson map data they're in the same path-data as France.
        
        In Species: pets vs. humans, at least one of them was the most human-friendly, so
        when brushing no country was "visible".

        Solutions:
        1. Separate the path data from France, i.e give them unique paths (TIME CONSUMING???)
        2. Aggregate MTQ and REU's ansers to France (HOW???)
        --> 3. Delete the countries from the data and write a disclaimer (EASIEST) 
      */
        delete data.json_data.countries.MTQ
        delete data.json_data.countries.REU
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

  useEffect(()=>{//console.log('activeTab: ', activeTabNumber)
  },[activeTabNumber])

  return (
    <div className="h-100 vh-100 w-100 d-flex flex-column" style={{minHeight: '100%'}}>
      <link id="themeLink" rel="stylesheet" href="darkMode.css" />
      <TabSwitch activeTabNumber={activeTabNumber} setActiveTabNumber={setActiveTabNumber}>
        <HomePage icon={<div className='' style={{height: '2rem'}}><MMLogo/></div>} setActiveTabNumber={setActiveTabNumber}/>
        {(data !== null && map !== null && activeTabNumber === 1)
         ? <WorldMap data={data} map={map} icon="" title="Single Category Map"/>
         : <div title="Single Category Map">Loading</div>}
        {(data !== null && map !== null && activeTabNumber === 2)
         ? <CountryDistance data={data} map={map} icon="" title="Difference Map"/>
         : <div title="Difference Map">Loading</div>}
        {(data !== null && map !== null && clusterData !== null && activeTabNumber === 3)
         ? <Cluster clusterData={clusterData} data={data} map={map} icon="" title="Culture Group Map"/>
         : <div title="Culture Group Map">Loading</div>}
        {/* <div icon="" title="RelativeToCountryViz" className='h-100'><div className='d-flex pt-5 justify-content-center h-100'>Work in progress</div></div>*/ }
        { activeTabNumber === 4
          ? <AboutTab icon="" title="About"/>
          : <div title="About">Loading</div>}
      </TabSwitch>
    </div>
  )
}

export default App
