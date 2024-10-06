const fs = require('fs');

const pokedexData = JSON.parse(fs.readFileSync(`${__dirname}/../data/pokedex.json`));

const respondJSON = (request, response, status, object) => {
  const content = JSON.stringify(object);

  response.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(content, 'utf8'),
  });

  if (request.method !== 'HEAD') {
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

module.exports = {
  pokedexData,
  getPokemon,
  getAllPokemon,
  getTypes,
  getWeaknesses,
  getEvolution,
  getHeightWeight,
  getNotFound,
};
