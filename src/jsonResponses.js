const fs = require('fs');

const pokedexData = JSON.parse(fs.readFileSync(`${__dirname}/../data/pokedex.json`));

const respondJSON = (request, response, status, object) => {
  const content = JSON.stringify(object);

  response.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(content, 'utf8'),
  });

  if (request.method !== 'HEAD' && status !== 204) {
    response.write(content);
  }
  response.end();
};

// Returns a 400 status and an appropriate JSON object if the 'num' query parameter is missing
const missingNumQueryParam = (request, response) => {
  const responseJSON = {
    message: "Missing required query parameter 'num' set to an integer between 1 and 151 inclusive",
    id: 'badRequest',
  };
  respondJSON(request, response, 400, responseJSON);
};

// Returns a 400 status and an appropriate JSON object if the 'num' query parameter is invalid
const invalidNumQueryParam = (request, response) => {
  const responseJSON = {
    message: "Invalid query parameter. 'num' must be an integer between 1 and 151",
    id: 'badRequest',
  };
  respondJSON(request, response, 400, responseJSON);
};

// Retrieves data about a specific pokemon, specified by a pokedex number in the query params
const getPokemon = (request, response) => {
  if (!request.query.num) {
    missingNumQueryParam(request, response);
  } else if (request.query.num < 1 || request.query.num > 151) {
    invalidNumQueryParam(request, response);
  } else {
    const responseJSON = pokedexData[request.query.num - 1];
    respondJSON(request, response, 200, responseJSON);
  }
};

// Retreives all of the pokemon data that is currently stored and returns it as a JSON
const getAllPokemon = (request, response) => {
  respondJSON(request, response, 200, pokedexData);
};

// Retreives the type(s) of the pokemon with the specified index
const getTypes = (request, response) => {
  if (!request.query.num) {
    missingNumQueryParam(request, response);
  } else if (request.query.num < 1 || request.query.num > 151) {
    invalidNumQueryParam(request, response);
  } else {
    const responseJSON = pokedexData[request.query.num - 1].type;
    respondJSON(request, response, 200, responseJSON);
  }
};

// Retreives a list of every type that a specified pokemon is weak to
const getWeaknesses = (request, response) => {
  if (!request.query.num) {
    missingNumQueryParam(request, response);
  } else if (request.query.num < 1 || request.query.num > 151) {
    invalidNumQueryParam(request, response);
  } else {
    const responseJSON = pokedexData[request.query.num - 1].weaknesses;
    respondJSON(request, response, 200, responseJSON);
  }
};

// Retreives the evolution(s) of the specified pokemon, if it has any
// If the specified pokemon does not have any evolutions, returns
// a JSON stating that along with a 200 status code
const getEvolution = (request, response) => {
  if (!request.query.num) {
    missingNumQueryParam(request, response);
  } else if (request.query.num < 1 || request.query.num > 151) {
    invalidNumQueryParam(request, response);
  } else if (!pokedexData[request.query.num - 1].next_evolution) {
    const responseJSON = {
      message: 'Specified pokemon does not have any evolutions',
      id: 'success',
    };
    respondJSON(request, response, 200, responseJSON);
  } else {
    const responseJSON = pokedexData[request.query.num - 1].next_evolution;
    respondJSON(request, response, 200, responseJSON);
  }
};

// Retreives the height and the weight of the specified pokemon
const getHeightWeight = (request, response) => {
  if (!request.query.num) {
    missingNumQueryParam(request, response);
  } else if (request.query.num < 1 || request.query.num > 151) {
    invalidNumQueryParam(request, response);
  } else {
    const responseJSON = {
      height: pokedexData[request.query.num - 1].height,
      weight: pokedexData[request.query.num - 1].weight,
    };
    respondJSON(request, response, 200, responseJSON);
  }
};

// Returns a 404 and a corresponding JSON object if the requested page could not be found
const getNotFound = (request, response) => {
  const responseJSON = {
    message: 'The requested page was not found',
    id: 'notFound',
  };

  return respondJSON(request, response, 404, responseJSON);
};

const addPokemon = (request, response) => {
  const responseJSON = {
    message: 'Missing one or more required query params: num, name.',
  };

  const {
    num, name, img, type, height, weight, weaknesses, nextEvolution,
  } = request.body;

  // Make sure both required query params are present
  if (!num || !name) {
    responseJSON.id = 'missingParams';
    return respondJSON(request, response, 400, responseJSON);
  }

  // Set default status to 204 (updated)
  let responseCode = 204;

  // If the user doesn't exist yet, create it and set the status code to 201 (created)
  if (!pokedexData[name]) {
    responseCode = 201;
    pokedexData[name] = {
      id: Object.length(pokedexData) + 1,
      num,
      name,
    };
  }

  // All of these attributes are optional query parameters
  // If any are provided, the value of that attribute will be updated accordingly
  if (img) { pokedexData[name].img = img; }
  if (type) { pokedexData[name].type = type; }
  if (height) { pokedexData[name].height = height; }
  if (weight) { pokedexData[name].weight = weight; }
  if (weaknesses) { pokedexData[name].weaknesses = weaknesses; }
  if (nextEvolution) { pokedexData[name].next_evolution = nextEvolution; }

  if (responseCode === 201) {
    responseJSON.message = 'Created Successfully';
    return respondJSON(request, response, responseCode, responseJSON);
  }

  return respondJSON(request, response, responseCode, {});
};

const addType = (request, response) => {
  const responseJSON = {
    message: 'Missing one or more required query params: num, type.',
  };

  const { num, type } = request.body;

  if (!num || !type) {
    responseJSON.id = 'missingParams';
    return respondJSON(request, response, 400, responseJSON);
  }
  if (!pokedexData.num.contains(num)) {
    return invalidNumQueryParam(request, response);
  }

  if (pokedexData[num].type.contains(type)) {
    responseJSON.message = 'Type was already present, no changes needed';
    responseJSON.id = 'success';
    return respondJSON(request, response, 304, responseJSON);
  }

  pokedexData[num].type.push(type);
  return respondJSON(request, response, 204, {});
};

module.exports = {
  pokedexData,
  getPokemon,
  getAllPokemon,
  getTypes,
  getWeaknesses,
  getEvolution,
  getHeightWeight,
  getNotFound,
  addPokemon,
  addType,
};
