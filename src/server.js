const http = require('http');
const query = require('querystring');
const htmlHandler = require('./htmlResponses.js');
const jsonHandler = require('./jsonResponses.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

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
    const requestType = request.headers['content-type'];

    if (requestType === 'application/json') {
      request.body = JSON.parse(bodyString);
    } else if (requestType === 'application/x-www-form-urlencoded') {
      request.body = query.parse(bodyString);
    }

    handler(request, response);
  });
};

// Handles POST requests
// const handlePost = (request, response, parsedUrl) => {
//   if (parsedUrl.pathname === '/addPokemon') {
//     parseBody(request, response, jsonHandler.addPokemon);
//   } else if (parsedUrl.pathname === '/addType') {
//     parseBody(request, response, jsonHandler.addType);
//   }
// };

// Handles GET requests
const handleRequest = (request, response, parsedUrl) => {
  if (parsedUrl.pathname === '/') {
    htmlHandler.getIndex(request, response);
  } else if (parsedUrl.pathname === '/docs') {
    htmlHandler.getDocs(request, response);
  } else if (parsedUrl.pathname === '/style.css') {
    htmlHandler.getCSS(request, response);
  } else if (parsedUrl.pathname === '/getPokemon') {
    jsonHandler.getPokemon(request, response);
  } else if (parsedUrl.pathname === '/getAllPokemon') {
    jsonHandler.getAllPokemon(request, response);
  } else if (parsedUrl.pathname === '/getImage') {
    jsonHandler.getImage(request, response);
  } else if (parsedUrl.pathname === '/getTypes') {
    jsonHandler.getTypes(request, response);
  } else if (parsedUrl.pathname === '/getWeaknesses') {
    jsonHandler.getWeaknesses(request, response);
  } else if (parsedUrl.pathname === '/getEvolution') {
    jsonHandler.getEvolution(request, response);
  } else if (parsedUrl.pathname === '/getHeight') {
    jsonHandler.getHeight(request, response);
  } else if (parsedUrl.pathname === '/getWeight') {
    jsonHandler.getWeight(request, response);
  } else if (parsedUrl.pathname === '/addPokemon') {
    parseBody(request, response, jsonHandler.addPokemon);
  } else if (parsedUrl.pathname === '/updateTypes') {
    parseBody(request, response, jsonHandler.updateTypes);
  } else {
    jsonHandler.getNotFound(request, response);
  }
};

const onRequest = (request, response) => {
  const protocol = request.connection.encrypted ? 'https' : 'http';
  const parsedUrl = new URL(request.url, `${protocol}://${request.headers.host}`);

  request.query = Object.fromEntries(parsedUrl.searchParams);

  handleRequest(request, response, parsedUrl);
};

http.createServer(onRequest).listen(port, () => {
  console.log(`Listening on 127.0.0.1:${port}`);
});
