const fetch = require("node-fetch");
const apiGoogle = require("../api-driver/api-drive");
const { client_redis, getAsync } = require("../redis/redis");

const getFile = async (req, res) => {
  const id = req.params.id;
  console.log(id);

  const urlDownload = `https://drive.google.com/uc?id=${id}&export=download`;

  await fetch(urlDownload).then((response) => {
    res.writeHead(200, {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "charset=utf-8",
    });
    response.body.pipe(res);
  });
};

const streamVideoM3u8 = async (req, res) => {
  const query = req.query.type;
  const id_foldername = req.params.id;
  const filename = req.params.filename;

  const id_file = await apiGoogle.getFileChild(filename, id_foldername);

  const id = id_file.id;
  let url = "";
  if (query === "cache" || !query)
    url = `https://my-worker.daophimdev.workers.dev/cache-file?id=${id}`;
  else url = `https://my-worker.daophimdev.workers.dev/test-kv?id=${id}`;

  await fetch(url).then((response) => {
    res.writeHead(200, {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "charset=UTF-8",
    });
    response.body.pipe(res);
  });
};

module.exports = {
  getFile,
  streamVideoM3u8,
};
