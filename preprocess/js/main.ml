open Js_of_ocaml

let () =
  Js.export "clusteringLib"
    (object%js
      method clustering normalize json =
        let json = Jstr.to_string json in
        (* We know this to be true due to native.ml *)
        let `Assoc [ "keys", keys; "countries", countries ] = Yojson.Safe.from_string json in
        let countries = Lib.country_assoc_of_yojson countries in
        Brr.Console.log [Brr.Console.str "Starting clustering now"];
        let clusters =
          List.map (fun (_,c) -> c) countries
          |> Lib.clustering normalize
        in
        Yojson.Safe.to_string clusters |> Jstr.of_string
    end)
