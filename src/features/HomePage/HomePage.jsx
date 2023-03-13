import { Button, ButtonGroup } from "react-bootstrap";
import AboutImage from "../../assets/AboutImage";

export default function HomePage({ setActiveTabNumber }) {
  return (
    <div className="p-0 d-flex flex-grow-1 flex-column align-items-center">
      <div className="w-75 d-flex flex-grow-1 flex-column align-items-center">
        <p className="fs-1">The moral machine map</p>
        <p>
          This app is a visual representation of the data gathered by the&nbsp;
          <a href="https://www.moralmachine.net/" target="_blank">Moral Machine project.</a>
        </p>
        <p className="fs-4">Moral Machine project</p>
        <p>
          The aim of the project is to gather a human perspective on how
          ‘intelligent’ machine systems, in particular self driving cars, should
          act in morally complex situations such as when all avaliable actions
          will lead to the loss of life.
        </p>
      </div>
      <div style={{ width: "100%", backgroundColor: "#999999" }}>
        <div className="p-3" style={{ height: "50vh" }}>
          <AboutImage />
        </div>
        <div className="d-flex flex-grow-1 flex-column align-items-center pt-4">
        <p className="small w-75" style={{color: "white"}}>
          <strong>Image 1:</strong> an example of a scenario which the
          participants might had to answer. The image is a redraw from the
          original images found at
          {" "}
          <a style={{color: "white"}} href="https://www.moralmachine.net/" target="_blank">
            https://www.moralmachine.net/
          </a>
          .
        </p>
        </div>
      </div>
      <div className="w-75 d-flex flex-grow-1 flex-column align-items-center">
        <p className="fs-4 pt-5">Our visualization</p>
        <p>
          This visualization has grouped the answers given to the dilemmas
          presented byt the Moral Machine project based on the origin country of
          the respondent. By doing this the aim is to allow for the exploration
          of differences and similarities between countries in the context of
          these moral dilemmas.
        </p>
        <div className="d-flex gap-5">
          <Button
            onClick={() => {
              setActiveTabNumber(4);
            }}
          >
            More About
          </Button>
          <Button
            onClick={() => {
              setActiveTabNumber(1);
            }}
          >
            Start exploring
          </Button>
        </div>
        <p className="mt-3">
          Disclaimer: This application is only meant to visualize the data
          gathered by the moral machine project and no conclusions drawn from
          the visualization shall be considered the opinion of its creators
        </p>
      </div>
    </div>
  );
}
