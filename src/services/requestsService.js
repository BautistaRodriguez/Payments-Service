const axios = require("axios");
const { logInfo, logError } = require("../utils/log");
const { base_course_service_url } = require("../config");

exports.getCollaborators = (callback) => {
  logInfo("Getting all collaborators from Course Service")

  url = `${base_course_service_url}/api/collaborators`

  axios.get(url)
  .then((res) => {
      callback(res)
  }).catch((error) => {
      if (error.response) {
          logError(`Error while making GET request to ${url} got status code: ${error.response.status}`);
      } else {
          response.status(400).send(`Error while making GET request to ${url}`);
      }
  });
}

exports.getSuscription = (suscriptionId, callback) => {
  logInfo("Getting suscription " + suscriptionId)

  url = `${base_course_service_url}/api/suscriptions/` + suscriptionId

  axios.get(url)
  .then((res) => {
      callback(res)
  }).catch((error) => {
      if (error.response) {
          logError(`Error while making GET request to ${url} got status code: ${error.response.status}`);
      } else {
          response.status(400).send(`Error while making GET request to ${url}`);
      }
  });
}
