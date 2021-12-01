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

  cron.schedule('* * * * *', function() {
    logInfo("Running job to send payments to proffesor")

    getCollaborators(function(collaborators) {
      logInfo("Got " + collaborators.data.length + " collaborators")

      // TODO Get SC founds
      scTotalFounds = 0.01

      paymentForEach = collaborators.data.length / scTotalFounds
      logInfo("Each collaborator will receive " + paymentForEach + " ether(s)")

      // Parse response json
      collaborators = collaborators.data

      // TODO
      for(var collaborator in collaborators){
        logInfo("Sending " + paymentForEach + " to user id: " + collaborator['id'])
        wallet = findWallet(collaborator['id'])
        //services.contractInteraction.sendMoneyToWallet(wallet, paymentForEach, deployerWaller)
      }
    })
  });
}
