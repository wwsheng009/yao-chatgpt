/**
 * api guard
 * @param {string} path api path
 * @param {map} params api path params
 * @param {map} queries api queries in url query string
 * @param {object|string} payload json object or string
 * @param {map} headers request headers
 */
function CheckAccessKey(path, params, queries, payload, headers) {
  var token;
  let auth = headers["Authorization"];
  if (auth) {
    token = auth[0].replace("Bearer ", "");
  }
  token = token || (queries["token"] && queries["token"][0]);
  if (!token) {
    error();
  }
  let access_key = Process("yao.env.get", "ACCESS_KEY");
  if (!access_key) {
    throw new Exception("ACCESS_KEY Not set", 403);
  }
  if (access_key !== token) {
    error();
  }
}

function error() {
  throw new Exception("Not Authorized", 403);
}
