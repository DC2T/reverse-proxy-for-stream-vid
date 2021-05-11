const fetch = require("node-fetch");

const getFile = async (req, res) => {
  const id = req.params.id;
  console.log(id);

  const urlDownload = `https://drive.google.com/uc?id=${id}&export=download`;

  await fetch(urlDownload).then((response) => {
    res.status(200);
    response.body.pipe(res);
  });
};

module.exports = {
  getFile,
};
