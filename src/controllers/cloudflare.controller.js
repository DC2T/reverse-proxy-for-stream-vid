const fetch = require("node-fetch");

const getFile = async (req, res) => {
  const id = req.params.id;
  console.log(id);

  const urlDownload = `https://drive.google.com/uc?id=${id}&export=download`;

  await fetch(urlDownload).then((response) => {
    res.setHeader("Content-Type", "charset=utf-8");
    res.writeHead(200, { "Access-Control-Allow-Origin": "*" });
    response.body.pipe(res);
  });
};

module.exports = {
  getFile,
};
