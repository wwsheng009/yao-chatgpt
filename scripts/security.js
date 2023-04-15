/**
 * api guard
 * @param {string} path api path
 * @param {map} params api path params
 * @param {map} queries api queries in url query string
 * @param {object|string} payload json object or string
 * @param {map} headers request headers
 */
function CheckAccessKey(path, params, queries, payload, headers) {
  let token = null;
  let auth = headers["Authorization"];
  if (auth) {
    token = auth[0].replace("Bearer ", "");
  }
  token = token || (queries["token"] && queries["token"][0]);
  if (!token) {
    throw new Exception("Debug Proxy Call token Not set", 403);
  }
  const access_key = Process("yao.env.get", "YAO_API_ACCESS_KEY");
  if (!access_key) {
    throw new Exception("YAO_API_ACCESS_KEY Not set", 403);
  }
  if (access_key !== token) {
    throw new Exception("YAO_API_ACCESS_KEY not equal token", 403);
  }
}
