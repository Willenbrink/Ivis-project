import { Form, InputGroup } from "react-bootstrap";
import { categories } from "../../utils/categories";
import InfoPopover from "../../utils/InfoPopover";

export default function CategorySelectorInfo({setCategory, category, isActiveTab}){
  return(
    <InputGroup className="px-5 pt-2 position-absolute" style={{width: "90%"}}>
      <InputGroup.Text id='basic-addon2' className='bg-light'>Categories:</InputGroup.Text>
        <Form.Select 
        aria-label="Default select example!"
        onChange={((e) => setCategory(categories[e.target.value]))}
        value={category?.id}
        className='fw-bold'
        >
          {Object.entries(categories).map(([id, cat]) => {
            return <option key={id} value={id}>{cat.name}</option> ;
          })}
        </Form.Select>
      <InfoPopover title={categories[category.id].name_short || categories[category.id].name} info={categories[category.id].info} isActiveTab={isActiveTab}/>
    </InputGroup>
  )
}