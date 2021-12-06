const cron = require('node-cron');
const config = require("../SCconfig");
const { logInfo, logError } = require('../utils/log');
const { getCollaborators } = require('./requestsService');
const databaseConfig = require("../databasepg");
const services = require("./services")({ config });
const parse = require('postgres-date')
const moment = require('moment')

exports.runCronJobs = () => {
  //sendProfessorsPayemnts()
  checkStudentPayments()
}

const checkStudentPayments = () => {
  logInfo("Job 'Student's suscription payments' started succesfully with server")

  cron.schedule('0 0 0 * * *', async function() {
    logInfo("Running job to check suscription's expired date")
    var client = databaseConfig.client;

    const queryParams ={
      name: 'fetch addresses',
      text:  'SELECT * FROM user_suscriptions',
    }

    await client.query(queryParams, (err, res) => {
      if(!err) {
        for (const row of res.rows){
          userId = row['user_id']
          logInfo("Suscription for user " + userId + " expires on " + row['expired_date'])

          if (row['suscription_id'] == 1) {
            logInfo("Suscription is free!")
            continue
          }

          var date_formatted_moment = moment(row['expired_date']).format('L')

          if (new Date(date_formatted_moment) < Date.now()) {
            logInfo("Suscription has expired. Trying to make automatic payment for user " + userId)

            makeAutomaticPayment(userId, row['suscription_id'])
              .then(logInfo("Automatic payment for user " + userId + " succeed!"))
              .catch(err => {
                logError("Error " + err.message + " while making automatic payment for user " + userId);
              })
            }
          }
      } else {
        logError(err.message);
      }
    })

    client.end
  })
}

const makeAutomaticPayment = (userId, suscriptionId) => {
  logInfo("Starting new automatic payment for user " + userId)

  return new Promise ((resolve, reject) => {
    Promise.all([services.suscriptionService.getSuscriptionPrice(suscriptionId), services.walletService.getWallet(userId)])
      .then(async ([price, senderWallet]) => {
        try {
          // Make new deposit to contract
          await services.contractInteraction.deposit(senderWallet, (price).toString())

          // Update table
          services.suscriptionService.updateUserSuscription(suscriptionId, userId, true)
            .then(resolve())
            .catch(err => {
              logError("Error while updating user suscription (is_paid=true) for user " + userId)
              reject(err)
            })

        } catch (err) {
          logError("Automatic payment failed with error " + err.message + ". Updating is_paid to false for user " + userId)

          services.suscriptionService.updateUserSuscription(suscriptionId, userId, false) // is_paid = false
            .then(reject(err))
            .catch(err => {
              logError("Error while updating user suscription (is_paid=false) for user " + userId)
              reject(err)
            })
        }
      })
      .catch(err => reject(err))
  })
}

const sendProfessorsPayemnts = () => {
  logInfo("Job 'Professors Payments' started succesfully with server")
  var client = databaseConfig.client;

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
      for (const collaborator of collaborators){
        const queryParams ={
          name: 'fetch addresses',
          text:  'SELECT * FROM wallet_info w WHERE w.User_id= $1',
          values: [collaborator.id],
        }

        client.query(queryParams, (err,res)=>{
          if(!err) {
            logInfo("Sending " + paymentForEach + " to user id: " + collaborator.id)

            //Al descomentar va a mandar keth
            //services.contractInteraction.sendMoneyToWallet(res.rows[0]['wallet_address'], paymentForEach.toString(), deployerWaller)
          } else {
            console.log(err.message);
          }
        })
      }

      client.end;
    })
  });
}
