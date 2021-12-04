const cron = require('node-cron');
const config = require("../SCconfig");
const { logInfo } = require('../utils/log');
const { getCollaborators } = require('./requestsService');
const databaseConfig = require("../databasepg")
const services = require("./services")({ config });

exports.runCronJobs = () => {
  sendProfessorsPayemnts()
}


const sendProfessorsPayemnts = () => {
  logInfo("Job 'Professors Payments' started succesfully with server")
  var client =databaseConfig.client;
  // Get wallet service
  deployerWaller = services.walletService.getDeployerWallet(config)

  cron.schedule('* * * * *', function() {
    logInfo("Running job to send payments to proffesor")

    getCollaborators(function(collaborators) {
      logInfo("Got " + collaborators.data.length + " collaborators")

      // TODO Get SC founds
      scTotalFounds = 0.0001

      paymentForEach = scTotalFounds / collaborators.data.length
      logInfo("Each collaborator will receive " + paymentForEach + " ether(s)")

      collaborators = collaborators.data

      // Corre en O(nxm) . Se puede hacer o(n) haciendo un SELECT... WHERE w.User_id IN [users id de profs]
      // n: todos los usuarios en la tabla, m: todos los colaboradores
      for(const collaborator of collaborators){

        const queryParams ={
          name: 'fetch addresses',
          text:  'Select * from wallet_info w where w.User_id= $1',
          values: [collaborator.id],
        }
        client.query(queryParams, (err,res)=>{
          if(!err) {
            console.log(res.rows[0]['wallet_address'])
            logInfo("Sending " + paymentForEach + " to user id: " + collaborator.id)

             //Al descomentar va a mandar keth
            //services.contractInteraction.sendMoneyToWallet(res.rows[0]['wallet_address'], paymentForEach.toString(), deployerWaller)
          }else{
            console.log(err.message);
          }
        })
      }
      client.end;
    })
  });
}
