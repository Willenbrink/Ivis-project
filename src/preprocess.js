// TODO as long as preprocessing happens live, keep it here.
// Move out later if we do preprocessing only once

import * as fs from 'fs';
import { parse } from '@vanillaes/csv'

var base_dir = "raw/"
var countries_change_pr_path = base_dir + "Datasets/Moral\ Machine\ Data/CountriesChangePr.csv"


function readFile(path, f) {
  return fs.readFileSync(path, 'UTF-8', (err, content) => {
    if(err) {
      console.log("Failed to parse the file at %s. Ensure you have unpacked the tar.gz containing the .csv\n", path);
      console.log(err);
    }
    return f(content);
  });
}

function loadCsvs() {
  var out;
  var content = parse(readFile(countries_change_pr_path));
  console.log(content);
  return content;
}

console.log(loadCsvs());
