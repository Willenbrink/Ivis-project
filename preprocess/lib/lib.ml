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
let country_assoc_of_yojson ((`Assoc xs) : Yojson.Safe.t) = List.map (fun (id,c) -> id, country_of_yojson c |> Result.get_ok) xs

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
    List.fold_left (fun acc (x,y) -> acc +. Float.pow (abs_float (x -. y)) exp ) 0. cats
    |> (fun x -> Float.pow x (1. /. exp))

  let compare a b = String.compare a.id b.id

  let null = {
    id = "NULL";
    intervention = 0.;
    passengers = 0.;
    law = 0.;
    gender = 0.;
    fitness = 0.;
    status = 0.;
    age = 0.;
    number = 0.;
    species = 0.;
  }

  let (+|) a b = {
    id = a.id ^ b.id;
    intervention = a.intervention +. b.intervention;
    passengers = a.passengers +. b.passengers;
    law = a.law +. b.law;
    gender = a.gender +. b.gender;
    fitness = a.fitness +. b.fitness;
    status = a.status +. b.status;
    age = a.age +. b.age;
    number = a.number +. b.number;
    species = a.species +. b.species;
  }
  let (/|) a f = {
    id = a.id;
    intervention = a.intervention /. f;
    passengers = a.passengers /. f;
    law = a.law /. f;
    gender = a.gender /. f;
    fitness = a.fitness /. f;
    status = a.status /. f;
    age = a.age /. f;
    number = a.number /. f;
    species = a.species /. f;
  }
  let ( *|) a f = a /| (1. /. f)
  let (-|) a b = a +| (b *| (-1.))

  let norm_2 {id;
              intervention;
              passengers;
              law;
              gender;
              fitness;
              status;
              age;
              number;
              species;
             } =
    ignore id;
    List.fold_left (fun acc cat -> Float.pow cat 2. +. acc) 0. [intervention; passengers; law; gender; fitness; status; age; number; species; ]
    |> sqrt

  let absolute {id;
              intervention;
              passengers;
              law;
              gender;
              fitness;
              status;
              age;
              number;
              species;
             } =
    {id;
     intervention = abs_float intervention;
     passengers = abs_float passengers;
     law = abs_float law;
     gender = abs_float gender;
     fitness = abs_float fitness;
     status = abs_float status;
     age = abs_float age;
     number = abs_float number;
     species = abs_float species;
    }

  let normalize countries =
    let avg getter =
      List.fold_left (fun acc x -> acc +. getter x) 0. countries
      /. float_of_int (List.length countries)
    in
    let std getter =
      let mean = avg getter in
      List.fold_left (fun acc x -> let dev = getter x -. mean in acc +. Float.pow dev 2.) 0. countries
      /. float_of_int (List.length countries)
      |> sqrt
    in
    let values = [
      (fun x -> x.intervention);
      (fun x -> x.passengers);
      (fun x -> x.law);
      (fun x -> x.gender);
      (fun x -> x.fitness);
      (fun x -> x.status);
      (fun x -> x.age);
      (fun x -> x.number);
      (fun x -> x.species);
    ]
      |> List.map (fun cat x -> (x -. avg cat) /. std cat)
    in
    List.map (fun c -> {
          id = c.id;
          intervention = List.nth values 0 c.intervention;
          passengers = List.nth values 1 c.passengers;
          law = List.nth values 2 c.law;
          gender = List.nth values 3 c.gender;
          fitness = List.nth values 4 c.fitness;
          status = List.nth values 5 c.status;
          age = List.nth values 6 c.age;
          number = List.nth values 7 c.number;
          species = List.nth values 8 c.species;
        }
      ) countries

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
    let single_linkage =
      Seq.fold_left (fun acc (c1,c2) -> min acc @@ Country.dist c1 c2) Float.infinity seq
    in
    let maximum_linkage =
      Seq.fold_left (fun acc (c1,c2) -> max acc @@ Country.dist c1 c2) 0. seq
    in
    let ward_linkage =
      let open Country in
      let card_a = float_of_int @@ CountrySet.cardinal a in
      let card_b = float_of_int @@ CountrySet.cardinal b in
      let mean_a = CountrySet.fold (fun acc x -> acc +| x) a null /| card_a in
      let mean_b = CountrySet.fold (fun acc x -> acc +| x) b null /| card_b in
      norm_2 (mean_a -| mean_b) *. sqrt (2. *. card_a *. card_b /. (card_a +. card_b))
    in
    ward_linkage


  let to_string_list set =
      to_seq set |> Seq.map (fun c -> c.id) |> List.of_seq
  let to_yojson set =
      to_string_list set |> [%to_yojson: string list]
end

module ClusterAlgo = struct
  include Clustering.Agglomerative.Make (Country) (CountryCluster)
end

type cluster =
  | Node of CountryCluster.t * cluster * cluster * float
  | Leaf of CountryCluster.t [@@deriving to_yojson]


let clustering normalize (countries : country list) =
  let countries =
    if normalize
    then Country.normalize countries
    else countries
  in
  let clusters = ClusterAlgo.cluster countries in
  (* let depth_list = *)
  (*   ClusterAlgo.all_clusters clusters *)
  (*   (\* |> List.iter (fun (cluster, depth) -> Printf.printf "%i (size: %i): %s\n" depth (CountryCluster.cardinal cluster) (CountryCluster.fold (fun c acc -> acc ^ ", " ^ c.id) cluster "")) *\) *)
  (*   |> List.map (fun (cluster,depth) -> CountryCluster.to_string_list cluster, depth) *)
  (*   |> [%to_yojson: (string list * int) list] *)
  (* in *)
  let rec convert_cluster ({ set; tree; merged_at; _ } : ClusterAlgo.cluster) = match tree with
    | None ->
      assert (CountryCluster.cardinal set = 1);
      (* Leaf ((CountryCluster.choose set).id) *)
      Leaf set
    | Some (left, right) ->
      Node (set, convert_cluster left, convert_cluster right, merged_at)
  in
  let cluster_tree = [%to_yojson: cluster] (convert_cluster clusters) in

  cluster_tree
