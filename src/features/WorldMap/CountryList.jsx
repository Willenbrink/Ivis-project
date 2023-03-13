export default function CountryList({brushedCountries, svgHeight, brushRange}){
  const subtitle = brushRange[1] == 2 
    ? "Countries visible with data: "
    : "Countries in selection: "
  return (
    <div className="position-absolute end-0 pe-3" style={{height: '200px', bottom: `${0.05*svgHeight + 50 + 32 + 80}px`}}>
      <div className="country-list-box h-100 w-100 rounded shadow-sm d-flex flex-column p-4">
        <p className="small text-secondary border-bottom mb-2" style={{width: '220px'}}>{subtitle + brushedCountries.length}</p>
        <div className="w-100 overflow-scroll">
          {brushedCountries.map(c => <p className="m-0 small">{c.name}</p>)}
        </div>
      </div>
    </div>
  )
}