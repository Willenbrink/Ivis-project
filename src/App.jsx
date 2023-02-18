import './scss/bootstrap.scss'
import TabSwitch from './features/TabSwitch/TabSwitch'
import WorldMap from './features/WorldMap/WorldMap'
import AboutTab from './features/AboutTab/AboutTab'

function App() {
  return (
    <div className="vh-100 w-100" style={{minHeight: '100vh', maxHeight: '100vh'}}>
      <TabSwitch>
        <WorldMap icon="" title="PerCategoryViz"/>
        <div icon="" title="RelativeToCountryViz">Hello</div>
        <AboutTab icon="" title="About"/>
      </TabSwitch>
    </div>
  )
}

export default App
