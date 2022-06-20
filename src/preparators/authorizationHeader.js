/**
 * Returns the username- and password-fields from an Http Basic Auth
 * Header
 * @param {Object} req The request object
 * @returns {[string, string]} Username and Password
 */
const basicAuth = (req) => {
  let m = /^Basic (.*)$/.exec(req.get("Authorization") || "");
  if (m) {
    m = /([^:]*):(.*)/.exec(new Buffer(m[1], "base64").toString("ascii"));
    if (m) {
      const email = m[1],
        token = m[2];
      return [email, token];
    }
  }
  return [];
};

/**
 * Returns the token from an Http Bearer Auth
 * Header
 * @param {Object} req The request object
 * @returns {[string, string]} Username and Password
 */
const bearerAuth = (req) => {
  const m = /^Bearer (.*)$/.exec(req.get("Authorization") || "");
  if (m) {
    return m[1];
  }
  return null;
};

module.exports = { basicAuth, bearerAuth };
