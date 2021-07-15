// constructor
const Verification = function (action) {
  this.username = action.username;
};

Verification.cekemail = (params, result) => {
  // f.query("DELETE FROM \"tipe_asset\" WHERE \"id\" = '" + id + "'", 2);
  result(null, { username: params.username });
};

module.exports = Verification;

