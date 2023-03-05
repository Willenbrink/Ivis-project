type country = {
  id: string;
  intervention: float;
  passengers: float;
  law: float;
  gender: float;
  fitness: float;
  status: float;
  age: float;
  number: float;
  species: float;
  (* Not sure what these values exactly represent but they are relatively consistent. *)
  (* Presumably they encode the spread of (i.e. confidence in) the answers *)
  (* intervention_se: float; *)
  (* passengers_se: float; *)
  (* law_se: float; *)
  (* gender_se: float; *)
  (* fitness_se: float; *)
  (* status_se: float; *)
  (* age_se: float; *)
  (* number_se: float; *)
  (* species_se: float; *)
} [@@deriving yojson { meta = true }]

type country_assoc = (string * country) list

let country_assoc_to_yojson xs = `Assoc (List.map (fun (id,c) -> id, country_to_yojson c) xs)

module Country = struct
  type t = country

  let dist a b =
    let exp = 2. in
    let cats = [
      a.intervention, b.intervention;
      a.passengers, b.passengers;
      a.law, b.law;
      a.gender, b.gender;
      a.fitness, b.fitness;
      a.status, b.status;
      a.age, b.age;
      a.number, b.number;
      a.species, b.species;
    ]
    in
    List.fold_left (fun acc (x,y) -> acc +. Float.pow (x -. y) exp ) 0. cats
    |> (fun x -> Float.pow x (1. /. exp))

  let compare a b =
    let d = dist a b in
    if d < 0.
    then -1
    else if d > 0.
    then 1
    else 0
end

module CountrySet = Set.Make (Country)

module CountryCluster = struct
  include CountrySet
  type t = CountrySet.t
  type elt = CountrySet.elt

  let singleton = CountrySet.singleton
  let join = CountrySet.union

  let dist a b =
    let seq =
      CountrySet.to_seq a
      |> Seq.flat_map (fun c1 -> CountrySet.to_seq b |> Seq.map (fun c2 -> c1,c2))
    in
    let single_linkage seq =
      Seq.fold_left (fun acc (c1,c2) -> min acc @@ Country.dist c1 c2) Float.infinity seq
    in
    let maximum_linkage seq =
      Seq.fold_left (fun acc (c1,c2) -> max acc @@ Country.dist c1 c2) 0. seq
    in
    (* TODO *)
    (* let ward_linkage seq = *)
    (*   Seq.fold_left (fun acc (c1,c2) -> max acc @@ Country.dist c1 c2) 0. seq *)
    (* in *)
    maximum_linkage seq


  let to_string_list set =
      to_seq set |> Seq.map (fun c -> c.id) |> List.of_seq
  let to_yojson set =
      to_string_list set |> [%to_yojson: string list]
end

module ClusterAlgo = struct
  include Clustering.Agglomerative.Make (Country) (CountryCluster)
end

type cluster = ClusterAlgo.cluster = { set : CountryCluster.t; tree : tree; uid : int } [@@deriving to_yojson]
and tree = ClusterAlgo.tree =
  | Node of cluster * cluster
  | Leaf [@@deriving to_yojson]

(* let cluster_to_yojson {set; tree; _} = match tree with *)
(*   | Leaf -> `Null *)
(*   | Node (c1,c2) -> "" *)

let clustering (countries : country list) =
  let open ClusterAlgo in
  let clusters = cluster countries in
  let depth_list =
    all_clusters clusters
    (* |> List.iter (fun (cluster, depth) -> Printf.printf "%i (size: %i): %s\n" depth (CountryCluster.cardinal cluster) (CountryCluster.fold (fun c acc -> acc ^ ", " ^ c.id) cluster "")) *)
    |> List.map (fun (cluster,depth) -> CountryCluster.to_string_list cluster, depth)
    |> [%to_yojson: (string list * int) list]
  in
  let cluster_tree = [%to_yojson: cluster] clusters in

  depth_list, cluster_tree

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
  let depth_list_json = full_path "depth_list" in
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
  let depth_list, cluster_tree = clustering countries in
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
  write_file depth_list_json depth_list;
  write_file cluster_tree_json cluster_tree;
  (* print_endline (Yojson.Safe.to_string yojson); *)
