var http = require("http"),
    fs = require("fs");

const sendResponse = (message, status, res) => {
  res.writeHeader(status, { "Content-Type": "application/json" });
  res.write(JSON.stringify({ message, status }));
  return res.end();
};

const error = (message, res) => sendResponse(message, 500, res);
const badRequest = (message, res) => sendResponse(message, 400, res);

const okJSON = (data, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.write(JSON.stringify(data));
  res.end();
};

const routes = {};

routes[""] = (route, req, res) => {
  try {
    fs.readFile("./client/index.html", function (err, html) {
      if (err) {
        return error(err.message, res);
      }
      res.writeHeader(200, { "Content-Type": "text/html" });
      res.write(html);
      res.end();
    });
  } catch (err) {
    console.error(err);
    return error("internal server error", res);
  }
};

const assetTypes = {
  ".js": "text/javascript",
  ".css": "text/css",
  ".html": "text/html",
};
routes["assets"] = (route, req, res) => {
  try {
    if (route[2] && route[2].indexOf("..") > -1) {
      throw "no going back";
    }

    let contentType = assetTypes[route[2].substring(route[2].lastIndexOf("."))];
    if (!contentType) {
      throw "unsupported asset";
    }

    fs.readFile(`./client/assets/${route[2]}`, function (err, file) {
      if (err) {
        return error(err.message, res);
      }
      res.writeHeader(200, { "Content-Type": contentType });
      res.write(file);
      res.end();
    });
  } catch (err) {
    console.error(err);
    return error("internal server error", res);
  }
};

http
  .createServer(function (req, res) {
    const route = (req.url || "").split("/");
    if (!routes[route[1]]) {
      return notFound(req, res);
    }
    routes[route[1]](route, req, res);
  })
  .listen(8080);

// global history array for reviews
const reviewHistory = [];

// require dataset and cache
const DataSet = require("./dataset.js");
const data = new DataSet();
const Cache = require("./cache.js");
const cache = new Cache();

// task route
routes["task"] = (route, req, res) => {
  try {
    let timestamp = route[2] ? Number(route[2]) : Date.now();

    if (isNaN(timestamp) || timestamp <= 0) {
      return badRequest("Invalid timestamp", res);
    }

    const cacheKey = Math.floor(timestamp / 30000);

    if (req.headers["no-cache"]) {
      cache.invalidate(cacheKey);
    }

    let result = cache.get(cacheKey);
    if (!result) {
      result = data.top3(timestamp);
      cache.set(cacheKey, result, 31000);
    }

    // save to global history
    result.top3Reviews.forEach(review => {
      reviewHistory.push(review);
    });

    okJSON(result, res);
  } catch (err) {
    console.error(err);
    return error("internal server error", res);
  }
};

// ratingAverage route
routes["ratingAverage"] = (route, req, res) => {
  try {
    const oneHourAgo = Date.now() - 3600000;
    // filter reviews in the past hour
    const recentReviews = reviewHistory.filter(review => review.date >= oneHourAgo);
    if (recentReviews.length === 0) {
      return okJSON({ averageRating: 0.00 }, res);
    }
  } catch (err) {
    console.error(err);
    return error("internal server error", res);
  }
};

// overwrite the default 404 route to return HTML
const notFound = (req, res) => {
  res.writeHead(404, { "Content-Type": "text/html" });
  res.write("<h1>not found</h1>");
  res.end();
};

