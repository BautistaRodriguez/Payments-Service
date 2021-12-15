const { category_one_payment_per_student, category_two_payment_per_student } = require("../config");
const { logInfo, logError } = require("../utils/log");
const { getSuscription } = require('./requestsService');
const databaseConfig = require("../databasepg")

const getSuscriptionPrice = ({config}) => (suscriptionId) => {
  logInfo("Getting suscription cost for suscription " + suscriptionId)

  return new Promise ((resolve, reject) => {
    getSuscription(suscriptionId, function(suscription) {
      return resolve(suscription.data.price)
    })
  })
}

const updateUserSuscription = ({config}) => (suscriptionId, userId, is_paid) => {
  return new Promise ((resolve, reject) => {
    logInfo("Updating table user_suscriptions for user " + userId)

    var client = databaseConfig.client;

    const selectQueryParams ={
      name: 'fetch suscriptions',
      text:  'SELECT * FROM user_suscriptions w WHERE w.User_id= $1',
      values: [userId],
    }

    client.query(selectQueryParams, async (err, res)=>{
      if(!err) {
        if (res.rows.length > 0) { // User already has a suscription
          logInfo("User has suscription id: " + res.rows[0]['suscription_id'])

          updateUserSuscriptionRecord(userId, is_paid, suscriptionId)
            .then(resolve())
            .catch(err => reject(err))
        } else { // User does not have any records yet
          logInfo("User does not have suscription. Creating record")

          createUserSuscriptionRecord(userId, suscriptionId)
            .then(resolve())
            .catch(err => reject(err))
        }
      } else {
        reject(err)
      }
    })

    client.end
  })
}

const createUserSuscriptionRecord = (userId, suscriptionId) => {
  return new Promise ((resolve, reject) => {
    logInfo("Creating suscription record for user " + userId + " with suscription " + suscriptionId)

    var client = databaseConfig.client;

    const queryParams ={
      name: 'create record for user and suscription',
      text: `INSERT INTO user_suscriptions(expired_date, is_paid, suscription_id, user_id) VALUES (to_timestamp(${Date.now() + 30*86400000} / 1000.0), $1, $2, $3)`,
      values: [true, suscriptionId, userId]
    }

    client.query(queryParams, (err, res)=>{
      if(!err) {
        resolve()
      } else {
        reject(err)
      }
    })

    client.end
  })
}


const updateUserSuscriptionRecord = (userId, value, suscriptionId) => {
  return new Promise ((resolve, reject) => {
    logInfo("Updating record for user " + userId + " with value " + value + " and suscription " + suscriptionId)

    var client = databaseConfig.client;
    var text, values

    if (value) {
      text = `UPDATE user_suscriptions SET is_paid = true, suscription_id = $1, expired_date = (to_timestamp(${Date.now() + 30*86400000} / 1000.0)) WHERE User_id= $2`
      values = [suscriptionId, userId]
    } else {
      text = `UPDATE user_suscriptions SET is_paid = false, expired_date = (to_timestamp(${Date.now()}) WHERE User_id = $1`
      values = [userId]
    }

    const queryParams ={
      name: 'update record in user_suscription',
      text:  text,
      values: values
    }

    client.query(queryParams, (err, res)=>{
      if(!err) {
        resolve()
      } else {
        reject(err);
      }
    })

    client.end
  })
}

const getSuscriptionStatus = ({config}) => (userId) => {
  return new Promise ((resolve, reject) => {
    var client = databaseConfig.client

    const queryParams ={
      name: 'get suscription status for user',
      text:  'SELECT is_paid FROM user_suscriptions where User_id = $1',
      values: [userId]
    }

    client.query(queryParams, (err, res)=>{
      if(!err) {
        if (res.rows.length > 0) {
          logInfo("User suscription is paid? " + res.rows[0]['is_paid'])
          resolve(res.rows[0]['is_paid'])
        } else {
          reject("User not found")
        }
      } else {
        reject(err);
      }
    })

    client.end
  })
}

module.exports = dependencies => ({
  getSuscriptionPrice: getSuscriptionPrice(dependencies),
  updateUserSuscription: updateUserSuscription(dependencies),
  getSuscriptionStatus: getSuscriptionStatus(dependencies)
});
