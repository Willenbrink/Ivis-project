import React, { useState, useCallback, useEffect } from "react";
import { json } from "d3";
import { feature, mesh } from "topojson-client";

const mapJSON = "https://unpkg.com/world-atlas@2.0.2/countries-110m.json";

export const parseJSON = () => { 
  const [data, setData] = useState(null);
  
	console.log(data) 
  
	useEffect(() => {
  	json(mapJSON).then(jsonData =>{ 
      const { countries } = jsonData.objects;
    	setData({
        countries: feature(jsonData, countries),
      	interiorBorders: mesh(jsonData, countries, (a, b) => a !== b)
      })
    })
  }, []);
  
  return data;
}