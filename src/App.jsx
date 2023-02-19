import './scss/bootstrap.scss'
import TabSwitch from './features/TabSwitch/TabSwitch'
import WorldMap from './features/WorldMap/WorldMap'
import AboutTab from './features/AboutTab/AboutTab'

function App() {
  return (
    <div className="h-100 vh-100 w-100 d-flex flex-column" style={{minHeight: '100%'}}>
      <TabSwitch>
        <WorldMap icon="" title="PerCategoryViz"/>
        <div icon="" title="RelativeToCountryViz" className='h-100'><div className='d-flex pt-5 justify-content-center h-100'>Work in progress</div></div>
        <AboutTab icon="" title="About"/>
      </TabSwitch>
    </div>
  )
}

export default App
