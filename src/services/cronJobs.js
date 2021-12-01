const cron = require('node-cron');
const { logInfo } = require('../utils/log');

exports.runCronJobs = () => {
  sendProffesorsPayemnts()
}

const sendProffesorsPayemnts =  () => {
  logInfo("Job 'Proffesors Payments' scheduled succesfully")

  cron.schedule('* * * * *', function() {
    logInfo("Running job to send payments to proffesors")
  });
}

