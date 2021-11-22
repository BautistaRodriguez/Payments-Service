function schema() {
  return {
    params: {},
  };
}

function handler({ contractInteraction }) {
  /* Llamo a contractInteraction para hacer un send payment */
  console.log("HANDLER SEND PAYMENT");
  return "null";
}

module.exports = { handler, schema };
