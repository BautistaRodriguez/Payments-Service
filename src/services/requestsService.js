const axios = require("axios");
const { logInfo, logError } = require("../utils/log");
const { base_course_service_url } = require("../config");

exports.getCollaborators = (callback) => {
  logInfo("Getting all collaborators from Course Service")

  url = `${base_course_service_url}/api/collaborators`

  axios.get(url)
  .then((res) => {
      callback(res)
  })
  .catch((error) => {
      logError(`Error while making GET request to ${url}. Got ${error}`);
  });
}

exports.getSuscription = (suscriptionId, callback) => {
  logInfo("Getting suscription " + suscriptionId)

  url = `${base_course_service_url}/api/suscriptions/` + suscriptionId

  axios.get(url)
    .then((res) => {
        callback(res)
    })
    .catch((error) => {
        logError(`Error while making GET request to ${url}. Got ${error}`);
    });
}

exports.getCourses = (callback) => {
  logInfo("Getting all courses")

  url = `${base_course_service_url}/api/courses`

  axios.get(url)
    .then((res) => {
      callback(res)
    })
    .catch((error) => {
      reject(logError(`Error while making GET request to ${url}. Got ${error}`));
    });
}

exports.getCourseInfo = (courseId, callback) => {
  logInfo("Getting course info for course " + courseId)

  url = `${base_course_service_url}/api/courses?course_id=` + courseId

  axios.get(url)
    .then((res) => {
        callback(res)
    })
    .catch((error) => {
      logError(`Error while making GET request to ${url}. Got ${error}`);
    });
}

exports.getCourseInscriptions = (courseId, callback) => {
  logInfo("Getting course inscriptions for course " + courseId)

  url = `${base_course_service_url}/api/courses/students/` + courseId

  axios.get(url)
    .then((res) => {
        callback(res)
    })
    .catch((error) => {
      logError(`Error while making GET request to ${url}. Got ${error}`);
    });
}
