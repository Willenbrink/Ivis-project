import { Button, ButtonGroup } from "react-bootstrap";

export default function HomePage({setActiveTabNumber}){
  return(
    <div className="d-flex flex-grow-1 flex-column align-items-center">
      <div className="w-75 d-flex flex-column align-items-center pt-5">
        <p className="fs-2">The moral machine map</p>
        <p>This app is a visual representation of the data gathered by the
          Moral Machine project.</p>
        <p>
          The aim of the project is to gather a
          human perspective on how ‘intelligent’ machine systems, in
          particular self driving cars, should act in morally complex
          situations such as when all avaliable actions will lead to the loss
          of life.
        </p>
        <p>
        This visualization has grouped the answers given to the
          dilemmas presented byt the Moral Machine project based on the
          origin country of the respondent. By doing this the aim is to
          allow for the exploration of differences and similarities between
          countries in the context of these moral dilemmas.
        </p>
        <div className="d-flex gap-5">
          <Button onClick={()=>{}}>More About</Button>
          <Button onClick={()=>{}}>Start exploring</Button>
        </div>
        <p>
          Disclaimer: This application is only meant to visualize the data gathered by the moral
          machine project and no conclusions drawn from the visualization shall be
          considered the opinion of its creators
        </p>

      </div>
    </div>
  )
}