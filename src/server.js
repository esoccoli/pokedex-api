const http = require('http');
const query = require('querystring');
const htmlHandler = require('./htmlResponses.js');
const jsonHandler = require('./jsonResponses.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const urlStruct = {
  '/': htmlHandler.getIndex,
  '/docs': htmlHandler.getDocumentation,
  '/style.css': htmlHandler.getCSS,
  '/getPokemon': jsonHandler.getPokemon,
  '/getAllPokemon': jsonHandler.getAllPokemon,
  '/getTypes': jsonHandler.getTypes,
  '/getWeaknesses': jsonHandler.getWeaknesses,
  '/getEvolution': jsonHandler.getEvolution,
  '/getHeightWeight': jsonHandler.getHeightWeight,
  '/addPokemon': jsonHandler.addPokemon, // TODO: Require user to provide details about a pokemon, then use that to create a new entry in the object.
  '/addType': jsonHandler.addType, // TODO: Adds an additional type to the array of types for a specific pokemon
  '/removeType': jsonHandler.removeType, // TODO: Remove a specific type from the array of types for a specific pokemon. If that type is not present, return a 400'
  notFound: jsonHandler.getNotFound,
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
  if (parsedUrl.pathname === '/addUser') {
    parseBody(request, response, jsonHandler.addUser);
  }
};

// Handles GET requests
const handleGet = (request, response, parsedUrl) => {
  console.log('test');
};

const onRequest = (request, response) => {
  const protocol = request.connection.encrypted ? 'https' : 'http';
  const parsedUrl = new URL(request.url, `${protocol}://${request.headers.host}`);

  request.query = Object.fromEntries(parsedUrl.searchParams);

  if (urlStruct[parsedUrl.pathname]) {
    urlStruct[parsedUrl.pathname](request, response);
  } else {
    urlStruct.notFound(request, response);
  }
};

http.createServer(onRequest).listen(port, () => {
  console.log(`Listening on 127.0.0.1:${port}`);
});
