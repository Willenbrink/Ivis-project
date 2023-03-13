// Loosely inspired by: https://stackoverflow.com/questions/44447847/enums-in-javascript-with-es6
// TODO maybe we should also freeze stuff and wrap that in functions so keys and id are guaranteed identical?

import AgeFrom from "../assets/legendImages/age/AgeFrom";
import AgeTo from "../assets/legendImages/age/AgeTo";
import FitnessFrom from "../assets/legendImages/fitness/FitnessFrom";
import FitnessTo from "../assets/legendImages/fitness/FitnessTo";
import GenderTo from "../assets/legendImages/gender/GenderTo";
import GenderFrom from "../assets/legendImages/gender/GnederFrom";
import InterventionFrom from "../assets/legendImages/intervention/InterventionFrom";
import InterventionTo from "../assets/legendImages/intervention/InterventionTo";
import LawFrom from "../assets/legendImages/law/LawFrom";
import LawTo from "../assets/legendImages/law/LawTo";
import NumberFrom from "../assets/legendImages/number/NumberFrom";
import NumberTo from "../assets/legendImages/number/NumberTo";
import PassengersFrom from "../assets/legendImages/passengers/PassengersFrom";
import PassengersTo from "../assets/legendImages/passengers/PassengersTo";
import SpeciesFrom from "../assets/legendImages/species/SpeciesFrom";
import SpeciesTo from "../assets/legendImages/species/SpeciesTo";
import StatusFrom from "../assets/legendImages/status/StatusFrom";
import StatusTo from "../assets/legendImages/status/StatusTo";

export const distance =  {
  id: 'distance',
  name: 'Total distance across all categories',
  from: ['No difference'],
  to: ['Maximal difference'],
  info: 'Here the data of multiple categories is considered at once. We visualize the difference between the results of the experiment in the country you select and all other countries by color: The closer the countries are, the whiter the color. For calculating this proximity we interpret the selected categories as a multidimensional space and calculate the euclidean distances. The numeric values used for this are the same as in the Single Category Map. An example: When only considering law and gender, Sweden and Turkey are pretty closely aligned. But when we add species, the distance between them increases.'
  }

export const categories = {
  intervention: {
    id: 'intervention',
    name: 'Intervention: Staying in the same lane vs. Switching lane',
    name_short: 'Intervention',
    from: ['Staying in the same', 'lane matters most'],
    to: ['Switching lane','matters most'],
    info:'Is it more important to stay in the same lane or to switch?',
    fromIcon: <InterventionFrom/>,
    toIcon: <InterventionTo/>
  }, 
  passengers: {
    id: 'passengers',
    name: 'Self-protection: Passengers vs. Pedestrians',
    from: ['Saving passengers', 'matters most'],
    to: ['Saving pedestrians', 'matters most'],
    info:'What is more important: saving the passengers or the pedestrians?',
    fromIcon: <PassengersFrom/>,
    toIcon: <PassengersTo/>
  }, 
  law: {
    id: 'law',
    name: 'Law: Illegal vs. Legal',
    name_short: 'Legal bias',
    from: ['Saving lawbreakers', 'matters most'],
    to: ['Saving law-abiding', 'people matters most'],
    info:'Is it more important to save law-abiding people or lawbreakers?',
    fromIcon: <LawFrom/>,
    toIcon: <LawTo/>
  }, 
  gender: {
    id: 'gender',
    name: 'Gender: Male vs. Female',
    name_short: 'Gender bias',
    from: ['Saving males', 'matters most'],
    to: ['Saving females', 'matters most'],
    info:'Is it more important to save men or women?',
    fromIcon: <GenderFrom/>,
    toIcon: <GenderTo/>
  }, 
  fitness: {
    id: 'fitness',
    name: 'Fitness: Large vs. Fit',
    name_short: 'Fitness bias',
    from: ['Saving large people', 'matters most'],
    to: ['Saving fit people', 'matters most'],
    info: 'Is it more important to save fit or unfit(large) people?',
    fromIcon: <FitnessFrom/>,
    toIcon: <FitnessTo/>
  },
  status: {
    id: 'status',
    name: 'Social Status: Low vs. High',
    name_short: 'Social status',
    from: ['Saving low status', 'people matters most'],
    to: ['Saving high status', 'people matters most'],
    info: 'Is it more important to save people with high social status than low social status?',
    fromIcon: <StatusFrom/>,
    toIcon: <StatusTo/>
  }, 
  age: {
    id: 'age',
    name: 'Age: Elderly vs. Young',
    name_short: 'Age bias',
    from: ['Saving elderly', 'people matters most'],
    to: ['Saving young', 'people matters most'],
    info: 'Is it more important to save elderly or young people?',
    fromIcon: <AgeFrom/>,
    toIcon: <AgeTo/>
  }, 
  number: {
    id: 'number',
    name: 'Number of casualities: Less vs. More',
    name_short: 'Number of casualities',
    from: ['Saving less lives', 'matters most'],
    to: ['Saving more lives', 'matters most'],
    info: 'Is it important to save more lives?',
    fromIcon: <NumberFrom/>,
    toIcon: <NumberTo/>
  }, 
  species: {
    id: 'species',
    name: 'Species: Pets vs. Humans',
    name_short: 'Species bias',
    from: ['Saving pets', 'matters most'],
    to: ['Saving humans', 'matters most'],
    info: 'Is it more important to save humans or pets?',
    fromIcon: <SpeciesFrom/>,
    toIcon: <SpeciesTo/>
  }
};
