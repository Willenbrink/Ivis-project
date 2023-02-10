import './scss/bootstrap.scss'
import TabSwitch from './features/TabSwitch/TabSwitch'

function App() {
  return (
    <div className="vh-100 w-100" style={{minHeight: '100vh', maxHeight: '100vh'}}>
      <TabSwitch>
        <div icon="" title="Tab 1">Hello</div>
        <div icon="" title="Tab 2">Hello</div>
      </TabSwitch>
    </div>
  )
}

export default App
