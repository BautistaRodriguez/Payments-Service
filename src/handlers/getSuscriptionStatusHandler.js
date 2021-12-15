function handler({ suscriptionService }) {
  return function (req, reply) {
    suscriptionService.getSuscriptionStatus(req.params.userId)
      .then(status => reply.code(200).send(status))
      .catch(err => reply.code(400).send(err))
  }
}

module.exports = { handler };
