// Loosely inspired by: https://stackoverflow.com/questions/44447847/enums-in-javascript-with-es6
// TODO maybe we should also freeze stuff and wrap that in functions so keys and id are guaranteed identical?

export const distance =  {
  id: 'distance',
  name: 'Total distance across all categories',
  from: ['No difference'],
  to: ['Maximal difference'],
  info: 'This is a WIP display of the total distance between the selected and all other countries. There is no absolute value so you have to select a country first. One result visualized here that is otherwise hard to see is: Germany, Turkey and China differ a lot from each other. That is, they belong to different culture groups. This is different from e.g. Venezuela and Brazil. They differ from each other a bit but both differ significantly from the rest of the world. They share a culture group. Clustering (unimplemented as of now) will show this in more detail.',
}

export const categories = {
  intervention: {
    id: 'intervention',
    name: 'Avoiding intervention: Omission vs. Commission',
    name_short: 'Avoiding intervention',
    from: ['Staying in the same', 'lane matters most'],
    to: ['Switching lane','matters most'],
    info:'Should we favor continuing on the same path(omission) or intervention(commission)?'
  }, 
  passengers: {
    id: 'passengers',
    name: 'Passengers vs. Pedestrians',
    from: ['Saving passengers', 'matters most'],
    to: ['Saving pedestrians', 'matters most'],
    info:'What is more important: saving the passengers or the pedestrians?'
  }, 
  law: {
    id: 'law',
    name: 'Law: Illegal vs. Legal',
    name_short: 'Legal bias',
    from: ['Saving lawbreakers', 'matters most'],
    to: ['Saving law-abiding', 'people matters most'],
    info:'How important is it to follow the law?'
  }, 
  gender: {
    id: 'gender',
    name: 'Gender: Male vs. Female',
    name_short: 'Gender bias',
    from: ['Saving males', 'matters most'],
    to: ['Saving females', 'matters most'],
    info:'Is it more important to save men or women?'
  }, 
  fitness: {
    id: 'fitness',
    name: 'Fitness: Large vs. Fit',
    name_short: 'Fitness bias',
    from: ['Saving large people', 'matters most'],
    to: ['Saving fit people', 'matters most'],
    info: 'Is it more important to save fit or unfit(large) people?'
  },
  status: {
    id: 'status',
    name: 'Social Status: Low vs. High',
    name_short: 'Social status',
    from: ['Saving high status', 'people matters most'],
    to: ['Saving low status', 'people matters most'],
    info: 'Is it more important to save people with high social status than low social status?'
  }, 
  age: {
    id: 'age',
    name: 'Age: Elderly vs. Young',
    name_short: 'Age bias',
    from: ['Saving elderly', 'people matters most'],
    to: ['Saving young', 'people matters most'],
    info: 'Is it more important to save elderly or young people?'
  }, 
  number: {
    id: 'number',
    name: 'Number of Characters: Less vs. More',
    name_short: 'Number of casualities',
    from: ['Saving less lives', 'matters most'],
    to: ['Saving more lives', 'matters most'],
    info: 'Is it important to save more lives?'
  }, 
  species: {
    id: 'species',
    name: 'Species: Pets vs. Humans',
    name_short: 'Species bias',
    from: ['Saving pets', 'matters most'],
    to: ['Saving humans', 'matters most'],
    info: 'Is it more important to save humans or other animals?'
  }
};
