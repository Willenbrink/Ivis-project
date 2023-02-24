// Loosely inspired by: https://stackoverflow.com/questions/44447847/enums-in-javascript-with-es6
// TODO maybe we should also freeze stuff and wrap that in functions so keys and id are guaranteed identical?

export const distance =  {
  id: 'distance',
  name: 'Total distance across all categories',
  from: 'Not a value',
  to: 'Maximal difference',
  info: 'This is a WIP display of the total distance between the selected and all other countries. There is no absolute value so you have to select a country first. One result visualized here that is otherwise hard to see is: Germany, Turkey and China differ a lot from each other. That is, they belong to different culture groups. This is different from e.g. Venezuela and Brazil. They differ from each other a bit but both differ significantly from the rest of the world. They share a culture group. Clustering (unimplemented as of now) will show this in more detail.',
}

export const categories = {
  intervention: {
    id: 'intervention',
    name: 'Avoiding intervention: Omission vs. Commission',
    name_short: 'Avoiding intervention',
    from: 'Omission',
    to: 'Commission',
    info:'Should we favor continuing on the same path(omission) or intervention(commission)?'
  }, 
  passengers: {
    id: 'passengers',
    name: 'Passengers vs. Pedestrians',
    from: 'Passengers',
    to: 'Pedestrians',
    info:'What is more important: saving the passengers or the pedestrians?'
  }, 
  law: {
    id: 'law',
    name: 'Law: Illegal vs. Legal',
    name_short: 'Legal bias',
    from: 'Illegal',
    to: 'Legal',
    info:'How important is it to follow the law?'
  }, 
  gender: {
    id: 'gender',
    name: 'Gender: Male vs. Female',
    name_short: 'Gender bias',
    from: 'Male',
    to: 'Female',
    info:'Is it more important to save men or women?'
  }, 
  fitness: {
    id: 'fitness',
    name: 'Fitness: Large vs. Fit',
    name_short: 'Fitness bias',
    from: 'Large',
    to: 'Fit',
    info: 'Is it more important to save fit or unfit(large) people?'
  },
  status: {
    id: 'status',
    name: 'Social Status: Low vs. High',
    name_short: 'Social status',
    from: 'Low',
    to: 'High',
    info: 'Is it more important to save people with high social status than low social status?'
  }, 
  age: {
    id: 'age',
    name: 'Age: Elderly vs. Young',
    name_short: 'Age bias',
    from: 'Elderly',
    to: 'Young',
    info: 'Is it more important to save elderly or young people?'
  }, 
  number: {
    id: 'number',
    name: 'Number of Characters: Less vs. More',
    name_short: 'Number of casualities',
    from: 'Less',
    to: 'More',
    info: 'Is it important to save more lives?'
  }, 
  species: {
    id: 'species',
    name: 'Species: Pets vs. Humans',
    name_short: 'Species bias',
    from: 'Pets',
    to: 'Humans',
    info: 'Is it more important to save humans or other animals?'
  }
};
