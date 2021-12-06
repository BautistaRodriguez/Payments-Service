const cron = require('node-cron');
const config = require("../SCconfig");
const { logInfo, logError } = require('../utils/log');
const { getCourses, getCourseInfo, getCourseInscriptions } = require('./requestsService');
const databaseConfig = require("../databasepg");
const services = require("./services")({ config });
const moment = require('moment')
const { category_one_payment_per_student, category_two_payment_per_student, category_three_payment_per_student, category_four_payment_per_student } = require('./../config')

exports.runCronJobs = () => {
  sendProfessorsPayemnts()
  //checkStudentPayments()
}

const checkStudentPayments = () => {
  logInfo("Job 'Student's suscription payments' started succesfully with server")

  cron.schedule(process.env.CRON_STUDENTS_JOB, async function() {
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
  deployerWallet = services.walletService.getDeployerWallet(config)

  cron.schedule(process.env.CRON_PROFESSORS_JOB, function() {
    logInfo("Running job to send payments to professor")

    getCourses(function(courses) {
      logInfo("Got " + courses.data.length + " courses")

      for (const course of courses.data){
        getCourseInfo(course['id'], function() {
          const ownerId = course['owner']['id']
          const courseSuscription = 1 || course['suscriptions'][0]['id']

          services.walletService.getWallet(ownerId)
            .then(wallet => {
              logInfo("Wallet address for user " + ownerId + " is " + wallet.address)
              logInfo("Got information for course " + course['id'] + ". Owner is user with id " + ownerId + " . Course in suscription " + courseSuscription)

              getCourseInscriptions(course['id'], async function (studentsInCourse) {
                logInfo("Course " + course['id'] + " has " + studentsInCourse.data.length + " students")
                var payment = 0

                if (studentsInCourse.data.length != 0) {
                  if (courseSuscription == 1){
                    payment = (studentsInCourse.data.length * category_one_payment_per_student)
                  } else if (courseSuscription == 2) {
                    payment = (studentsInCourse.data.length * category_two_payment_per_student)
                  } else if (courseSuscription == 3) {
                    payment = (studentsInCourse.data.length * category_three_payment_per_student)
                  } else {
                    payment = (studentsInCourse.data.length * category_four_payment_per_student)
                  }

                  logInfo("Sending " + payment + " ETH to user " + ownerId)
                  await services.contractInteraction.sendMoneyToWallet(wallet.address, payment.toString(), deployerWallet)
                  await new Promise(resolve => setTimeout(resolve, 5000));
                }
              })
            })
            .catch(err => logError(err))
        })
      }
    })
  })
}
