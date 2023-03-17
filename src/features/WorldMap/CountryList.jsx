import { useEffect, useMemo, useState } from "react"
import { Button, Form, InputGroup } from "react-bootstrap"
import { BsSortAlphaDown, BsSortAlphaUp, BsSortNumericDown, BsSortNumericUp, BsSquare, BsSquareFill } from "react-icons/bs"

export default function CountryList({brushedCountries, svgHeight, brushRange, zoomToCountry, selected, setSelected, setHovered, category, countryToColor}){
  
  const [sortBy, setSortBy] = useState('name')
  const [desc, setDesc] = useState(true)

  const sortedCountries = useMemo(()=>{
    const sortKey = sortBy == 'value' ? category.id : 'name'
    return brushedCountries.sort((c1,c2) => sortCountries(c1, c2, sortKey, desc))
  },[sortBy, desc, brushedCountries])

  
  const subtitle = brushRange[1] == 2 
    ? "Included countries: "
    : "Countries in selection: "

  function handleHover(c){
    // setHovered(c)
  }

  function handleSelect(e, c){
    e.stopPropagation()
    zoomToCountry.current({type: 'Feature', geometry: c.geometry})
    setSelected(c)
  }

  const sortButtonIcon = {
    name: desc ? <BsSortAlphaDown/> : <BsSortAlphaUp/>,
    value: desc ? <BsSortNumericDown/> : <BsSortNumericUp/>
  }

  const CountryRow = ({c}) => (
    <div className={`d-flex gap-1 align-items-center ${selected && selected.id == c.id ? 'countryListSelected' : 'countryList'}`} onClick={(e) => handleSelect(e,c)} onMouseOver={() => handleHover(c)}>
      <BsSquareFill style={{color: countryToColor(c)}}/>
      <p className="m-0 small">
        {c.name}
      </p>
    </div>
  )

  return (
    <div className="position-absolute end-0 pe-3" style={{height: '250px', bottom: `${0.05*svgHeight + 50 + 32 + 80}px`}}>
      <div className="country-list-box h-100 w-100 rounded shadow-sm d-flex flex-column p-4">
      <InputGroup className="pb-2" size='sm'>
      <InputGroup.Text id='basic-addon2' className='category-selector-text'>Sort by:</InputGroup.Text>
        <Form.Select 
        aria-label="Default select example!"
        onChange={((e) => setSortBy(e.target.value))}
        value={sortBy}
        className='fw-bold category-form'
        >
          {['name','value'].map((key) => {
            return <option key={key} value={key}>{key}</option> ;
          })}
        </Form.Select>
        <Button className="border" variant='light' onClick={()=>setDesc(!desc)}>{sortButtonIcon[sortBy]}</Button>
    </InputGroup>
        <p className="small text-secondary border-bottom mb-2" style={{width: '220px'}}>{subtitle + brushedCountries.length}</p>
        <div className="w-100 overflow-scroll">
          {sortedCountries.map(c => <CountryRow key={c.id} c={c} />)}
        </div>
      </div>
    </div>
  )
}

function sortCountries(c1, c2, key, desc) {
  // We can sort after name or value in the selected category key = name OR any of the categories
  const polarity = desc ? 1 : -1
  if (c1[key] < c2[key]) {
    return -1 * polarity;
  }
  if (c1[key] > c2[key]) {
    return 1 * polarity;
  }
  return 0;
}
