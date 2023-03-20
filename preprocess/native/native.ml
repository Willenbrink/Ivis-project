open Lib

let () =
  let path_data =
    let error () = failwith {|
No or incorrect path passed as argument.
Pass the path to the "Moral Machine Data" directory.
The data is not shared via Github.
Instead, use the Google Drive link.
|}
    in
    if Array.length Sys.argv <= 1
    then error ();
    let file = Sys.argv.(1) in
    if not @@ Sys.file_exists file
    then error ();
    file
  in
  let country_file = "CountriesChangePr.csv" in
  let path_public = Filename.concat path_data "../../../public" in
  let country_csv = Filename.concat path_data country_file in
  let full_path file =
    let open Filename in
    concat path_public @@ file ^ ".json"
  in
  let country_json = full_path (Filename.chop_extension country_file) in
  (* let depth_list_json = full_path "depth_list" in *)
  let cluster_tree_json = full_path "cluster_tree" in

  let row_to_country = function
    | id, [
        "[Omission -> Commission]: Estimates", intervention;
        "[Passengers -> Pedestrians]: Estimates", passengers;
        "Law [Illegal -> Legal]: Estimates", law;
        "Gender [Male -> Female]: Estimates", gender;
        "Fitness [Large -> Fit]: Estimates", fitness;
        "Social Status [Low -> High]: Estimates", status;
        "Age [Elderly -> Young]: Estimates", age;
        "No. Characters [Less -> More]: Estimates", number;
        "Species [Pets -> Humans]: Estimates", species;
        "[Omission -> Commission]: se", intervention_se;
        "[Passengers -> Pedestrians]: se", passengers_se;
        "Law [Illegal -> Legal]: se", law_se;
        "Gender [Male -> Female]: se", gender_se;
        "Fitness [Large -> Fit]: se", fitness_se;
        "Social Status [Low -> High]: se", status_se;
        "Age [Elderly -> Young]: se", age_se;
        "No. Characters [Less -> More]: se", number_se;
        "Species [Pets -> Humans]: se", species_se;
      ]
      ->
      { id;
        intervention; passengers; law; gender; fitness; status; age; number; species;
        (* intervention_se; passengers_se; law_se; gender_se; fitness_se; status_se; age_se; number_se; species_se; *)
      }
    | _ -> failwith "Invalid format"
  in
  let csv = Csv.Rows.load ~has_header:true country_csv in
  let countries =
    csv
    |> List.map Csv.Row.to_assoc
    |> List.map (function
        | ("",id)::data -> (id, List.map (fun (x,y) -> x, float_of_string y) data)
        | _ -> failwith "Invalid format")
    |> List.map row_to_country
  in
  let (* depth_list, *) cluster_tree = clustering true countries in
  let yojson : Yojson.Safe.t =
    `Assoc [
      ("keys", [%to_yojson: string list] @@ List.tl Yojson_meta_country.keys); (* We do not want to export id *)
      ("countries", [%to_yojson: country_assoc] @@ List.map (fun c -> (c.id, c)) countries);
    ]
  in
  let write_file path data =
    Yojson.Safe.to_file ~std:true path data;
    Printf.printf "Successfully wrote file to %s.\n" path;
  in
  write_file country_json yojson;
  (* write_file depth_list_json depth_list; *)
  write_file cluster_tree_json cluster_tree;
  (* print_endline (Yojson.Safe.to_string yojson); *)
