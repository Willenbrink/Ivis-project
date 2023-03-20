open Js_of_ocaml

let () =
  Js.export "clusteringLib"
    (object%js
      method clustering normalize countries =
        Brr.Console.log [countries];
        Lib.clustering normalize countries
    end)
