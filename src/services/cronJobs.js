const cron = require('node-cron');
const config = require("../SCconfig");
const { logInfo, logError } = require('../utils/log');
const { getCourses, getCourseInfo, getCourseInscriptions, getCollaborators } = require('./requestsService');
const databaseConfig = require("../databasepg");
const services = require("./services")({ config });
const moment = require('moment')
const { category_one_payment_per_student, category_two_payment_per_student, category_three_payment_per_student, category_four_payment_per_student } = require('./../config')

exports.runCronJobs = () => {
  sendProfessorsPayments()
  checkStudentPayments()
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

const sendProfessorsPayments = () => {
  logInfo("Job 'Professors Payments' started succesfully with server")

  // Get wallet service
  deployerWallet = services.walletService.getDeployerWallet(config)

  cron.schedule(process.env.CRON_PROFESSORS_JOB, async function() {
    logInfo("Running job to send payments to professor")

    var professors = {}

    new Promise(function(resolve, reject) {
      logInfo("JOB Professors Payments - STEP #1")

      buildProfessorsObjects(function(result) {
        professors = result
        professors["1"] = { "wallet_address": "0x138B90a6675ae7eEc5d8E56208A872659d9854D8", 1: 0, 2: 0, 3: 0, 4: 0, "total_payment": 0 }
        professors["2"] = { "wallet_address": "0x138B90a6675ae7eEc5d8E56208A872659d9854D8", 1: 0, 2: 0, 3: 0, 4: 0, "total_payment": 0 }
        professors["7"] = { "wallet_address": "0x138B90a6675ae7eEc5d8E56208A872659d9854D8", 1: 0, 2: 0, 3: 0, 4: 0, "total_payment": 0 }
        console.log(professors)

        resolve()
      })
    }).then(function() {
      logInfo("JOB Professors Payments - STEP #2")

      return new Promise(function(resolve, reject) {
        getCourses(function(courses) {
          logInfo("Got courses successfully")
          resolve(courses['data'])
        })
      })
    }).then(function(courses) {
      logInfo("JOB Professors Payments - STEP #3")

      logInfo("Analyzing courses")

      return new Promise((resolve, reject) => {
        getCoursesInfoToMakePayments(courses, professors, function(res){
          resolve(res)
        })
      })
    }).then(function(result) {
      logInfo("JOB Professors Payments - STEP #4")
      console.log(result)

      return new Promise((resolve, reject) => {
        calculateAccumulateForProfessors(professors, function(res){
          resolve(res)
        })
      })
    }).then(function(result) {
      logInfo("JOB Professors Payments - STEP #5")
      console.log(result)

      return new Promise((resolve, reject) => {
        sendPayments(professors, deployerWallet, function(res){
          resolve(res)
        })
      })
    }).then(function(result) {
      console.log(result)
    }).catch(err => logError(err))
  })
}

const getCoursesInfoToMakePayments = async (courses, professors, callback) => {
  var promiseArray = [];

  for (const course of courses) {
    promiseArray.push(new Promise((resolve, reject) => {
        getCourseOwnerAndInscriptions(course, function(inscriptionsAmount){
          logInfo("Finish getting info for course " + course['id'] + " . Course has " + inscriptionsAmount + " inscriptions. Course owner is " + course['owner']['id'])

          const courseSuscription = 1 || course['suscriptions'][0]['id']

          console.log("Amount inscriptions: " + inscriptionsAmount + " in suscription: " + courseSuscription + " for professor: " + course['owner']['id'])

          if(inscriptionsAmount > 0){
            professors[course['owner']['id']][courseSuscription] = professors[course['owner']['id']][courseSuscription] + inscriptionsAmount
          }

          resolve()
        })
    }))
  }

  const pro = await Promise.all(promiseArray)
  callback("OK getting courses info to make payments")
}


const getCourseOwnerAndInscriptions = (course, callback) => {
  const courseId = course['id']
  const ownerId = course['owner']['id']
  const courseSuscription = 1 || course['suscriptions'][0]['id']

  logInfo("Owner for course " + course['id'] + " is " + ownerId)
  logInfo("Suscription for course " + course['id'] + " is " + courseSuscription)

  getCourseInscriptions(courseId, function(studentsInCourse){
    logInfo("Course " + courseId + " has " + studentsInCourse.data.length + " students")
    callback(studentsInCourse.data.length)
  })
}


const buildProfessorsObjects = (callback) => {
  var professors = {}
  var promiseArray = [];

  new Promise(function(resolve, reject) {
    getCollaborators(function(collaborators) {
      logInfo("Got " + collaborators['data'].length + " collaborators successfully")
      resolve(collaborators['data'])
    })
  }).then(async function(collaborators) {
    for(const collab of collaborators){
      promiseArray.push(new Promise((resolve, reject) => {
        const collabId = collab['id']

        services.walletService.getWallet(collabId)
          .then(wallet => {
            logInfo("Wallet address for user " + collabId + " is " + wallet.address)

            professors[collabId] = { "wallet_address": wallet.address, 1: 0, 2: 0, 3: 0, 4: 0, "total_payment": 0}

            resolve()
          })
      }))
    }

    const pro = await Promise.all(promiseArray)
    callback(professors)
  })
}


const calculateAccumulateForProfessors = (professors, callback) => {
  Object.keys(professors).forEach(function(key) {
    professors[key]['total_payment'] = professors[key]['1'] * category_one_payment_per_student +
                                      professors[key]['2'] * category_two_payment_per_student +
                                      professors[key]['3'] * category_three_payment_per_student +
                                      professors[key]['4'] * category_four_payment_per_student
    console.log(professors)
  })

  callback("OK estimating total payment for professors")
}


const sendPayments = async (professors, deployerWallet, callback) => {
  var promiseArray = [];

  Object.keys(professors).forEach(function(key) {
    if (professors[key]['total_payment'] > 0) {
      promiseArray.push(new Promise((resolve, reject) => {
        logInfo("Sending " + professors[key]['total_payment'] + " ETH to professor " + key)

        services.contractInteraction.sendMoneyToWallet(professors[key]['wallet_address'],
                                                      professors[key]['total_payment'].toString(),
                                                      deployerWallet)
        .then(setTimeout(() => resolve(), 10000))
      }))
    }
  })

  const pro = await Promise.all(promiseArray)
  callback("OK sending all payments to professors")
}
