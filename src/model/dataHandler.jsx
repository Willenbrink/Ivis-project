// data is an object of form: {keys: id list, countries: (id -> data) object}.
// Where keys is a list of 3-letter country code
// and data is an object containing a countrys id and a (key -> float) mapping with the keys defined before.
var data = null;

fetch("CountriesChangePr.json").then((x) => x.json()).then((x) => data = x);

export function get_keys() {
  if (!data)
    return null;
  return data.keys;
}

export function get_country_data(country) {
  if (!data || !country || !data.countries[country])
    return null;
  return data.countries[country];
}

export function country_values_stats(category) {
  if (!data)
    return null;
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;
  for (let country in data.countries) {
      const value = get_country_data(country)[category];
      if (value < min) {
          min = value;
      }
      if (value > max) {
          max = value;
      }
  }
  return {min, max, range: max - min}
}
