const http = require('http');
const query = require('querystring');
const htmlHandler = require('./htmlResponses.js');
const jsonHandler = require('./jsonResponses.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const urlStruct = {
  '/': htmlHandler.getIndex(),
  '/docs': htmlHandler.getDocumentation(),
  '/style.css': htmlHandler.getCSS(),
  '/getPokemon': jsonHandler.getPokemon(), // TODO: Query params for getting a specific pokemon or group of pokemon. No params will return all pkmn
  '/getTypes': jsonHandler.getTypes(), // TODO: Query params for getting types of a specific pokemon. If params are missing or invalid, return 400
  '/getWeaknesses': jsonHandler.getWeaknesses(), // TODO: Query params for getting weaknesses of a specific pkmn. If params are missing or invalid, return 400
  '/getEvolution': jsonHandler.getEvolution(), // TODO: Query params to specify a pokemon to get their evolution(s)
  '/getHeightWeight': jsonHandler.getHeightWeight(), // TODO: Query params for getting the height & weight of a specific pokemon
  '/addPokemon': jsonHandler.addPokemon(), // TODO: Require user to provide details about a pokemon, then use that to create a new entry in the object.
  '/addType': jsonHandler.addType(), // TODO: Adds an additional type to the array of types for a specific pokemon
  '/removeType': jsonHandler.removeType(), // TODO: Remove a specific type from the array of types for a specific pokemon. If that type is not present, return a 400
};

const parseBody = (request, response, handler) => {
  const body = [];

  // If an error occurs, return a 400 status code
  request.on('error', (err) => {
    console.dir(err);
    response.statusCode = 400;
    response.end();
  });

  // If we receive data from the request body, append it to the array
  request.on('data', (chunk) => {
    body.push(chunk);
  });

  request.on('end', () => {
    const bodyString = Buffer.concat(body).toString();
    request.body = query.parse(bodyString);

    // Once we have the bodyParams object, we will call the handler function. We then
    // proceed much like we would with a GET request.
    handler(request, response);
  });
};

// Handles POST requests
const handlePost = (request, response, parsedUrl) => {
  // If they go to /addUser
  if (parsedUrl.pathname === urlStruct['/getPokemon']) {
    parseBody(request, response, jsonHandler.addUser);
  }
};

// Handles GET requests
const handleGet = (request, response, parsedUrl) => {
  // Routes to the appropriate location based on the request made
  if (parsedUrl.pathname === '/') {
    htmlHandler.getIndex(request, response);
  } else if (parsedUrl.pathname === '/style.css') {
    htmlHandler.getCSS(request, response);
  } else if (parsedUrl.pathname === '/getUsers') {
    jsonHandler.getUsers(request, response);
  } else {
    jsonHandler.getNotFound(request, response);
  }
};

const onRequest = (request, response) => {
  const protocol = request.connection.encrypted ? 'https' : 'http';
  const parsedUrl = new URL(request.url, `${protocol}://${request.headers.host}`);

  if (request.method === 'POST') {
    handlePost(request, response, parsedUrl);
  } else {
    handleGet(request, response, parsedUrl);
  }
};

http.createServer(onRequest).listen(port, () => {
  console.log(`Listening on 127.0.0.1:${port}`);
});
