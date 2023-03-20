import { json } from "d3";
import { feature } from "topojson-client";
import iso from "iso-3166-1";

const mapJSON = "https://unpkg.com/world-atlas@2.0.2/countries-50m.json";

//gets a dataHandler-data-object
//will only be executed once (App useEffect)
export async function parseJSON(data) {
    return json(mapJSON).then((jsonData) => {
        const { features } = feature(jsonData, jsonData.objects.countries);

        let ashmoreAndCartier = null
    //[{ "alpha3": "FJI", "name": "Fiji", "geometry": {"type": "MultiPolygon","coordinates": [[[[100,-10]]]] }]
    const iso_countries = features
      .filter((d) => d.id !== undefined)
      .reduce((acc, d) => {
        const alpha3 = iso.whereNumeric(d.id).alpha3;
        const country_data = data.get_country_data(alpha3);
        // if (d.id === '036') { console.log(d, '------', iso.whereNumeric(d.id).alpha3)}
        if (alpha3 in acc) { 
          // Ashmore And Acartier has the same country code as Austrlia (AUS)
          //console.log('First added key - key: ', alpha3, ', element: ',acc[alpha3], ' Duplicate: key: ', alpha3, ' element: ', d)
          ashmoreAndCartier = { name: d.properties.name, geometry: d.geometry }
        } else {
          acc[alpha3] = {
            // The country data already includes a field named "id". Therefore, we do not add "alpha3" too.
            ...country_data,
            // If the country has no data, data is null. Therefore we have to write the id again.
            id: alpha3,
            hasData: !!country_data,
            name: d.properties.name,
            geometry: d.geometry,
          };
        }
    
        return acc;
      }, {});
      // console.log('FEATURES: ', features)


    //[{ "name": "Fiji", "geometry": {"type": "MultiPolygon","coordinates": [[[[100,-10]]]] }]
    const non_iso_countries = features
      .filter((d) => d.id === undefined)
      .map((d) => ({ name: d.properties.name, geometry: d.geometry }));


    if (ashmoreAndCartier) non_iso_countries.push(ashmoreAndCartier)
    // console.log('iso_countries: ', Object.keys(iso_countries).length)
    // console.log('non_iso_countries: ', non_iso_countries.length)
    /* 
    Object.values(data.json_data.countries).forEach((c) => {
      if (!Object.keys(iso_countries).includes(c.id)) {
        console.log(c)
      }
    })
    */ 
    return {
      iso_countries,
      non_iso_countries,
    };
  });
}