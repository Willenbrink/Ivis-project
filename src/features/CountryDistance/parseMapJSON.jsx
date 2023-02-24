import React, { useState, useCallback, useEffect } from "react";
import { json } from "d3";
import { feature, mesh } from "topojson-client";
import { get_country_data } from "../../model/dataHandler";
import iso from "iso-3166-1";

const mapJSON = "https://unpkg.com/world-atlas@2.0.2/countries-110m.json";

export const parseJSON = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    
    json(mapJSON).then((jsonData) => {
      
      const { features } = feature(jsonData, jsonData.objects.countries);

      //[{ "alpha3": "FJI", "name": "Fiji", "geometry": {"type": "MultiPolygon","coordinates": [[[[100,-10]]]] }]
      const iso_countries = features
        .filter((d) => d.id !== undefined)
        .reduce((acc, d) => {
          const alpha3 = iso.whereNumeric(d.id).alpha3;
          const data = get_country_data(alpha3);
          acc[alpha3] = {
            // The country data already includes a field named "id". Therefore, we do not add "alpha3" too.
            ...data,
            // If the country has no data, data is null. Therefore we have to write the id again.
            id: alpha3,
            hasData: !!data,
            name: d.properties.name,
            geometry: d.geometry,
          };
          return acc;
        }, {});
        
      //[{ "name": "Fiji", "geometry": {"type": "MultiPolygon","coordinates": [[[[100,-10]]]] }]
      const non_iso_countries = features
        .filter((d) => d.id === undefined)
        .map((d) => ({ name: d.properties.name, geometry: d.geometry }));
      
      setData({
        iso_countries,
        non_iso_countries,
        interiorBorders: mesh(jsonData, jsonData.objects.countries),
      });
    });
  }, []);

  return data;
};