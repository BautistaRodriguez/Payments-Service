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

const updateUserSuscription = ({config}) => async (suscriptionId, userId) => {
  logInfo("Updating table user_suscriptions for user " + userId)

  var client = databaseConfig.client;

  const selectQueryParams ={
    name: 'fetch suscriptions',
    text:  'SELECT * FROM user_suscriptions w WHERE w.User_id= $1',
    values: [userId],
  }

  await client.query(selectQueryParams, async (err, res)=>{
    if(!err) {
      if (res.rows.length > 0)
        logInfo("User has suscription id: " + res.rows[0]['suscription_id'])

        if (res.rows[0]['suscription_id'] == suscriptionId) {
          logInfo("User already has suscription. Updating is_paid")
          updateIsPaidColumn(userId, true)
        } else {
          logInfo("User does not have suscription. Creating record")
          createUserSuscriptionRecord(userId, suscriptionId)
        }
    } else {
      logError(err.message);
      throw Error(err.message)
    }
  })

  client.end
}

const createUserSuscriptionRecord = (userId, suscriptionId) => {
  logInfo("Creating suscription record for user user " + userId + " with suscription " + suscriptionId)

  var client = databaseConfig.client;

  const queryParams ={
    name: 'create record for user and suscription',
    text: `INSERT INTO user_suscriptions(expired_date, is_paid, suscription_id, user_id) VALUES (to_timestamp(${Date.now() + 30*86400000} / 1000.0), $1, $2, $3)`,
    values: [true, suscriptionId, userId]
  }

  client.query(queryParams, (err, res)=>{
    if(!err) {
      logInfo("Created new record for user " + userId + " and suscription " + suscriptionId)
    } else {
      logError(err.message);
      throw Error(err.message)
    }
  })

  client.end
}


const updateIsPaidColumn = (userId, value) => {
  logInfo("Updating is_paid for user " + userId + " with value " + value)

  var client = databaseConfig.client;
  var text, values

  if (value) {
    text = `UPDATE user_suscriptions SET is_paid = true, expired_date = (to_timestamp(${Date.now() + 30*86400000} / 1000.0)) WHERE User_id= $1`
    values = [userId]
  } else {
    text = 'UPDATE user_suscriptions SET is_paid = false WHERE User_id = $1'
    values = [userId]
  }

  const queryParams ={
    name: 'update is_paid addresses',
    text:  text,
    values: values
  }

  client.query(queryParams, (err, res)=>{
    if(!err) {
      logInfo("Updated user " + userId)
    } else {
      logError(err.message);
      throw Error(err.message)
    }
  })

  client.end
}

module.exports = dependencies => ({
  getSuscriptionPrice: getSuscriptionPrice(dependencies),
  updateUserSuscription: updateUserSuscription(dependencies)
});
