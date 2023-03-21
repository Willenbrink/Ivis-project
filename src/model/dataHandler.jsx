// data is an object of form: {keys: id list, countries: (id -> data) object}.
// Where keys is a list of 3-letter country code
// and data is an object containing a countrys id and a (key -> float) mapping with the keys defined before.

//ES6 class:
class Data {
  // @fields: json_data, keys
  // @methods: get_country_data(country), country_values_stats(cathegory)
  constructor(json_data) {
    this.json_data = json_data;
    this.keys = [];
    if (json_data !== undefined && json_data !== null) {
      this.keys = this.json_data.keys 
    }
  }
  /*
    * @param {String} country: 3-letter country code
    * @return {Object} country data
    */
  get_country_data(country) {
    if (!this.json_data || !country || !this.json_data.countries[country]) {
      return null;
    }
    return this.json_data.countries[country];
  }
  country_values_stats(category) {
    if (!this.json_data) return null;
    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;
    for (let country in this.json_data.countries) {
      const value = this.get_country_data(country)[category];
      if (value < min) {
        min = value;
      }
      if (value > max) {
        max = value;
      }
    }
    return { min, max, range: max - min };
  }
  get_cluster_data() {
    if (!this.json_data)
      return null;
    return this.json_data;
  }
}
/*
 * fetch data from json, @return Data
 */
export async function fetch_data() {
  return fetch("CountriesChangePr.json").then((x) => x.json()).then(x => new Data(x));
}

export async function fetch_cluster_data() {
  const single = fetch("single.json").then((x) => x.json()).then(x => new Data(x));
  const single_norm = fetch("single_norm.json").then((x) => x.json()).then(x => new Data(x));
  const maximum = fetch("maximum.json").then((x) => x.json()).then(x => new Data(x));
  const maximum_norm = fetch("maximum_norm.json").then((x) => x.json()).then(x => new Data(x));
  const ward = fetch("ward.json").then((x) => x.json()).then(x => new Data(x));
  const ward_norm = fetch("ward_norm.json").then((x) => x.json()).then(x => new Data(x));

  return {
    single: await single,
    single_norm: await single_norm,
    maximum: await maximum,
    maximum_norm: await maximum_norm,
    ward: await ward,
    ward_norm: await ward_norm,
  }
}
