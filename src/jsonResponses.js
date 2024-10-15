const fs = require('fs');

// Reads the JSON file and stores it in an object
const pokedexData = JSON.parse(fs.readFileSync(`${__dirname}/../data/pokedex.json`));

const respondJSON = (request, response, status, object) => {
  const content = JSON.stringify(object);

  response.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(content, 'utf8'),
  });

  // Don't send a response body if the request method was HEAD or if the status code is 204
  if (request.method !== 'HEAD' && status !== 204) {
    response.write(content);
  }

  response.end();
};

// Returns a 400 status and an appropriate JSON object if the 'num' query parameter is missing
const missingIdQueryParam = (request, response) => {
  const responseJSON = {
    message: "Missing required query parameter 'id'",
    id: 'badRequest',
  };

  respondJSON(request, response, 400, responseJSON);
};

// Returns a 400 status and an appropriate JSON object if the 'num' query parameter is invalid
const invalidIdQueryParam = (request, response) => {
  const responseJSON = {
    message: 'Invalid query parameter',
    id: 'badRequest',
  };

  respondJSON(request, response, 400, responseJSON);
};

// Retreives and returns an object containing the info for the pokemon with the
// requested id. If no pokemon with that id is found, the function will return undefined
const getPokemonById = (request) => {
  const data = pokedexData.find((p) => p.id === parseInt(request.query.id, 10));
  return data;
};

// Retrieves data about a specific pokemon, specified by a pokedex number in the query params
const getPokemon = (request, response) => {
  if (!request.query.id) {
    return missingIdQueryParam(request, response);
  }

  const data = getPokemonById(request);
  if (!data) { return invalidIdQueryParam(request, response); }

  // const responseJSON = data;
  return respondJSON(request, response, 200, data);
};

// Retreives all of the pokemon data that is currently stored and returns it as a JSON
const getAllPokemon = (request, response) => respondJSON(request, response, 200, pokedexData);

const getImage = (request, response) => {
  if (!request.query.id) { return missingIdQueryParam(request, response); }

  const data = getPokemonById(request);
  if (!data) { return invalidIdQueryParam(request, response); }

  return respondJSON(request, response, 200, data.img);
};

// Retreives the type(s) of the pokemon with the specified index
const getType = (request, response) => {
  if (!request.query.id) { return missingIdQueryParam(request, response); }

  const data = getPokemonById(request);
  if (!data) { return invalidIdQueryParam(request, response); }

  // const responseJSON = data.type;
  return respondJSON(request, response, 200, data.type);
};

// Retreives a list of every type that a specified pokemon is weak to
const getWeaknesses = (request, response) => {
  if (!request.query.id) { return missingIdQueryParam(request, response); }

  const data = getPokemonById(request);
  if (!data) { return invalidIdQueryParam(request, response); }

  // const responseJSON = data.weaknesses;
  return respondJSON(request, response, 200, data.weaknesses);
};

// Retreives the evolution(s) of the specified pokemon, if it has any
// If the specified pokemon does not have any evolutions, returns
// a JSON stating that along with a 200 status code
const getEvolution = (request, response) => {
  if (!request.query.id) { return missingIdQueryParam(request, response); }

  const data = getPokemonById(request);
  if (!data) { return invalidIdQueryParam(request, response); }

  if (!data.next_evolution) {
    const responseJSON = {
      message: 'Specified pokemon does not have any evolutions',
      id: 'success',
    };
    return respondJSON(request, response, 200, responseJSON);
  }

  // const responseJSON = pokedexData[request.query.num - 1].next_evolution;
  return respondJSON(request, response, 200, data.next_evolution);
};

// Retreives the height of the specified pokemon
const getHeight = (request, response) => {
  if (!request.query.id) { return missingIdQueryParam(request, response); }

  const data = getPokemonById(request);
  if (!data) { return invalidIdQueryParam(request, response); }

  return respondJSON(request, response, 200, data.height);
};

// Retreives the weight of the specfied pokemon
const getWeight = (request, response) => {
  if (!request.query.id) { return missingIdQueryParam(request, response); }

  const data = getPokemonById(request);
  if (!data) { return invalidIdQueryParam(request, response); }

  return respondJSON(request, response, 200, data.weight);
};

// Returns a 404 and a corresponding JSON object if the requested page could not be found
const getNotFound = (request, response) => {
  const responseJSON = {
    message: 'The requested page was not found',
    id: 'notFound',
  };

  return respondJSON(request, response, 404, responseJSON);
};

// Creates a JSON object with the provided data for a new pokemon,
// and adds it to the array of pokemon objects
const addPokemon = (request, response) => {
  const {
    id, num, name, img, type, height, weight, weaknesses,
  } = request.body;

  // Make sure all required query params are present
  if (!id || !num || !name || !img || !type || !height || !weight || !weaknesses) {
    const responseJSON = {
      message: 'Missing one or more required attributes',
      id: 'badRequest',
    };

    return respondJSON(request, response, 400, responseJSON);
  }

  const dataJSON = {
    id: parseInt(id, 10),
    num,
    name,
    img,
    type,
    height,
    weight,
    weaknesses,
  };

  // Needed to create empty arrays for type and weaknesses (done above)
  // Now the actual data can be added
  dataJSON.type = type;
  dataJSON.weaknesses = weaknesses;

  let statusCode = 204;

  const data = pokedexData.find((p) => p.id === dataJSON.id);

  if (!data) {
    statusCode = 201;
    pokedexData.push(dataJSON);

    const responseJSON = {
      message: 'Successfully added new pokemon',
      id: 'success',
    };
    return respondJSON(request, response, statusCode, responseJSON);
  }

  // If a pokemon with this id already exists, update all the information
  data.num = dataJSON.num;
  data.name = dataJSON.name;
  data.img = dataJSON.img;
  data.type = dataJSON.type;
  data.height = dataJSON.height;
  data.weight = dataJSON.weight;
  data.weaknesses = dataJSON.weaknesses;

  pokedexData[id] = data;

  return respondJSON(request, response, statusCode, {});
};

// Changes the name of a specified pokemon to the provided new name
const updateName = (request, response) => {
  const responseJSON = {
    message: 'Missing one or more required attributes: id, name',
    id: 'badRequest',
  };

  const { id, name } = request.body;

  if (!id || !name) { return respondJSON(request, response, 400, responseJSON); }

  const data = pokedexData.find((p) => p.id === parseInt(request.body.id, 10));

  if (!data) { return invalidIdQueryParam(request, response); }

  data.name = name;
  pokedexData[id].name = data.name;
  return respondJSON(request, response, 204, {});
};

// Change the image for a specific pokemon to the provided new image
const updateImage = (request, response) => {
  const responseJSON = {
    message: 'Missing one or more required attributes: id, img',
    id: 'badRequest',
  };

  const { id, img } = request.body;

  if (!id || !img) { return respondJSON(request, response, 400, responseJSON); }

  const data = pokedexData.find((p) => p.id === parseInt(request.body.id, 10));

  if (!data) { return invalidIdQueryParam(request, response); }

  data.img = img;
  pokedexData[id].img = data.img;
  return respondJSON(request, response, 204, {});
};

// Adds a specified type to a specified pokemon
const addType = (request, response) => {
  const responseJSON = {
    message: 'Missing one or more required attributes: id, type',
    id: 'badRequest',
  };

  const { id, type } = request.body;

  if (!id || !type) { return respondJSON(request, response, 400, responseJSON); }

  const data = pokedexData.find((p) => p.id === parseInt(request.body.id, 10));

  if (!data) { return invalidIdQueryParam(request, response); }

  if (Array.isArray(data.type)) {
    data.push(type);
  } else {
    const currType = data.type;
    data.type = [];
    data.push(currType);
    data.push(type);
  }

  pokedexData[id].type = data.type;
  return respondJSON(request, response, 204, {});
};

// Changes the type(s) of the specified pokemon to the type(s) provided in the request body
const updateType = (request, response) => {
  const responseJSON = {
    message: 'Missing one or more required attributes: id, type',
    id: 'badRequest',
  };

  const { id, type } = request.body;

  if (!id || !type) { return respondJSON(request, response, 400, responseJSON); }

  const data = pokedexData.find((p) => p.id === parseInt(request.body.id, 10));

  if (!data) { return invalidIdQueryParam(request, response); }

  data.type = type;
  pokedexData[id].type = data.type;
  return respondJSON(request, response, 204, {});
};

// Updates the height of a specified pokemon to a provided value
const updateHeight = (request, response) => {
  const responseJSON = {
    message: 'Missing one or more required attributes: id, height',
    id: 'badRequest',
  };

  const { id, height } = request.body;

  if (!id || !height) { return respondJSON(request, response, 400, responseJSON); }

  const data = pokedexData.find((p) => p.id === parseInt(request.body.id, 10));

  if (!data) { return invalidIdQueryParam(request, response); }

  data.height = height;
  pokedexData[id].height = data.height;
  return respondJSON(request, response, 204, {});
};

// Updates the weight of a specified pokemon to a provided value
const updateWeight = (request, response) => {
  const responseJSON = {
    message: 'Missing one or more required attributes: id, weight',
    id: 'badRequest',
  };

  const { id, weight } = request.body;

  if (!id || !weight) { return respondJSON(request, response, 400, responseJSON); }

  const data = pokedexData.find((p) => p.id === parseInt(request.body.id, 10));

  if (!data) { return invalidIdQueryParam(request, response); }

  data.weight = weight;
  pokedexData[id].weight = data.weight;
  return respondJSON(request, response, 204, {});
};

// Adds a weakness to the list of weaknesses
const addWeakness = (request, response) => {
  const responseJSON = {
    message: 'Missing one or more required attributes: id, weakness',
    id: 'badRequest',
  };

  const { id, weaknesses } = request.body;

  if (!id || !weaknesses) { return respondJSON(request, response, 400, responseJSON); }

  const data = pokedexData.find((p) => p.id === parseInt(request.body.id, 10));

  if (!data) { return invalidIdQueryParam(request, response); }

  if (Array.isArray(data.weaknesses)) {
    data.push(weaknesses);
  } else {
    const currWeakness = data.weaknesses;
    data.weaknesses = [];
    data.push(currWeakness);
    data.push(weaknesses);
  }

  pokedexData[id].weaknesses = data.weaknesses;
  return respondJSON(request, response, 204, {});
};

// Updates the list of weaknesses to match the list provided in the request
const updateWeaknesses = (request, response) => {
  const responseJSON = {
    message: 'Missing one or more required attributes: id, weaknesses',
    id: 'badRequest',
  };

  const { id, weaknesses } = request.body;

  if (!id || !weaknesses) { return respondJSON(request, response, 400, responseJSON); }

  const data = pokedexData.find((p) => p.id === parseInt(request.body.id, 10));

  if (!data) { return invalidIdQueryParam(request, response); }

  data.weaknesses = weaknesses;
  pokedexData[id].weaknesses = data.weaknesses;
  return respondJSON(request, response, 204, {});
};

// Adds an evolution to a specific pokemon
const addEvolution = (request, response) => {
  const responseJSON = {
    message: 'Missing one or more required attributes: id, evoId, evoName',
    id: 'badRequest',
  };

  const { id, evoId, evoName } = request.body;

  if (!id || !evoId || !evoName) { return respondJSON(request, response, 400, responseJSON); }

  const data = pokedexData.find((p) => p.id === parseInt(request.body.id, 10));

  if (!data) { return invalidIdQueryParam(request, response); }

  // Create an object to hold the data about the evolution
  const evo = {
    num: `${evoId}`,
    name: evoName,
  };

  if (!data.next_evolution) {
    data.next_evolution = evo;
    pokedexData[id].next_evolution = data.next_evolution;
    return respondJSON(request, response, 201, {});
  }

  // Ensure that evolutions are stored in an array
  const evoArray = [];
  data.next_evolution.forEach((element) => {
    evoArray.push(element);
  });

  evoArray.push(evo);

  data.next_evolution = evoArray;
  pokedexData[id].next_evolution = data.next_evolution;
  return respondJSON(request, response, 204, {});
};

module.exports = {
  pokedexData,
  getPokemon,
  getAllPokemon,
  getImage,
  getType,
  getWeaknesses,
  getEvolution,
  getHeight,
  getWeight,
  getNotFound,
  addPokemon,
  updateName,
  updateImage,
  addType,
  updateType,
  updateHeight,
  updateWeight,
  addWeakness,
  updateWeaknesses,
  addEvolution,
};
