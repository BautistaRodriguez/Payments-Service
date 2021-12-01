const cron = require('node-cron');
const config = require("../SCconfig");
const { logInfo } = require('../utils/log');
const { getCollaborators } = require('./requestsService');

const services = require("./services")({ config });

exports.runCronJobs = () => {
  sendProfessorsPayemnts()
}

const sendProfessorsPayemnts = () => {
  logInfo("Job 'Professors Payments' started succesfully with server")

  // Get wallet service
  deployerWaller = services.walletService.getDeployerWallet(config)

  // Get SC founds
  scTotalFounds = 2

  getCollaborators(function(collaborators) {
    logInfo("Got " + collaborators.data.length + " collaborators")

    paymentForEach = collaborators.data.length / scTotalFounds
    logInfo("Each collaborator will receive " + paymentForEach + " ether(s)")

    // Parse response json
    collaborators = collaborators.data

    cron.schedule('* * * * *', function() {
      logInfo("Running job to send payments to proffesor")
      //services.contractInteraction.sendMoneyToWallet("0x1e725fbe268df79977c60565eac9066f2f5be095", '0.001', deployerWaller)
    });
  })

}

