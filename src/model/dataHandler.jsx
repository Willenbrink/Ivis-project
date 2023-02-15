import React, { useState, useCallback, useEffect } from "react";

const CSV_PATH = "/public/CountriesChangePr.csv";

//ASYNC STUFF I COULDNT GET TO WORK :/
var parsedCSV = null;
/**
 * @returns {str-Countrycode: [float-values]}
 * with cathegories: [Omission -> Commission]: Estimates,[Passengers -> Pedestrians]: Estimates,Law [Illegal -> Legal]: Estimates,Gender [Male -> Female]: Estimates,Fitness [Large -> Fit]: Estimates,Social Status [Low -> High]: Estimates,Age [Elderly -> Young]: Estimates,No. Characters [Less -> More]: Estimates,Species [Pets -> Humans]: Estimates,[Omission -> Commission]: se,[Passengers -> Pedestrians]: se,Law [Illegal -> Legal]: se,Gender [Male -> Female]: se,Fitness [Large -> Fit]: se,Social Status [Low -> High]: se,Age [Elderly -> Young]: se,No. Characters [Less -> More]: se,Species [Pets -> Humans]: se

 */
async function parseCSV() {
  if (parsedCSV !== null) return parsedCSV;
  parsedCSV = fetch(CSV_PATH)
      .then((response) => response.text())
      .then((text) => {
        const [columns, ...data] = text.split(/\r?\n/);
        parsedCSV = Object.assign({}, ...data.map((row) => {
          const [countrycodes, ...values] = row.split(",");
          return { [countrycodes]: values };
        }));
        console.log(parsedCSV)
        return parsedCSV;
      })
      .catch((e) => {
        console.error("[ERR]" + e);
      });
  
};

export async function get_country_value (alpha3, cathegory_index) {
  if (alpha3 === "DEU") await parseCSV();
  if (alpha3 === null) return 0;
  return -0.2;
};

export async function country_values_range (cathegory_index) {
  return 0.7;
};
