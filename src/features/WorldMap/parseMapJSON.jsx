import React, { useState, useCallback, useEffect } from "react";
import { json } from "d3";
import { feature, mesh } from "topojson-client";
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
        .map((d) => ({
          alpha3: iso.whereNumeric(d.id).alpha3, //convert numeric ISO code to alpha3
          name: d.properties.name,
          geometry: d.geometry,
        }));
        
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
