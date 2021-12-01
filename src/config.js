/* eslint-disable no-undef */
module.exports = {
  port: process.env.PORT || 8080,
  log: {
    error: process.env.LOG_ERROR == undefined || process.env.LOG_ERROR == "true",
    warn: process.env.LOG_WARN == undefined || process.env.LOG_WARN == "true",
    info: process.env.LOG_INFO == undefined || process.env.LOG_INFO == "true",
    debug: process.env.LOG_DEBUG == undefined || process.env.LOG_DEBUG == "true",
  },
  base_course_service_url: process.env.BASE_COURSE_SERVICE_URL || "https://course-service-ubademy.herokuapp.com",
};
