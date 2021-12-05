const { category_one_payment_per_student, category_two_payment_per_student } = require("../config");
const { logInfo } = require("../utils/log");
const { getSuscription } = require('./requestsService');

const getSuscriptionPrice = ({config}) => (suscriptionId) => {
  logInfo("Getting suscription cost for suscription " + suscriptionId)

  return new Promise ((resolve, reject) => {
    getSuscription(suscriptionId, function(suscription) {
      return resolve(suscription.data.price)
    })
  })
}

module.exports = dependencies => ({
  getSuscriptionPrice: getSuscriptionPrice(dependencies)
});
