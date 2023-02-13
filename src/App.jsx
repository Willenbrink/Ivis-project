import './scss/bootstrap.scss'
import TabSwitch from './features/TabSwitch/TabSwitch'
import WorldMap from './features/WorldMap/WorldMap'

function App() {
  return (
    <div className="vh-100 w-100" style={{minHeight: '100vh', maxHeight: '100vh'}}>
      <TabSwitch>
        <WorldMap icon="" title="World map"/>
        <div icon="" title="Tab 2">Hello</div>
        <div icon="" title="Tab 3">Hello</div>
      </TabSwitch>
    </div>
  )
}

export default App
