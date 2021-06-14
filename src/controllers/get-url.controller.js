const { encrypt } = require("../lib/mahoa");

const getUrl = async (req, res) => {
  const id = req.query.id;
  // lấy id từ database
  // id test
  const url = encrypt(id);
  res.json({ url: url });
};

module.exports = {
  getUrl,
};
