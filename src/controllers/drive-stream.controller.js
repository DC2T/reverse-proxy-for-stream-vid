const fetch = require("node-fetch");
const redis = require("redis");
const { promisify } = require("util");
const queryString = require("query-string");

const REDIS_PROT = process.env.REDIS_PROT || 6379;
const client_redis = redis.createClient(REDIS_PROT);
const getAsync = promisify(client_redis.get).bind(client_redis);

// const file_id = "1zIH-mJciulvSZh3GfZ_fbAKGd2qNQkMs";

const getLinkStream = async (req, res, next) => {
  const idMovieStream = req.query.id;

  //lấy dữ liệu từ cache
  const cookieStream = await getAsync(`${idMovieStream}_cookie`);
  const urlStream = await getAsync(`${idMovieStream}_urlStream`);

  // nếu tồn tại thì nhảy tiếp
  if (cookieStream && urlStream) {
    req.cookieStream = cookieStream;
    req.urlStream = urlStream;
    return next();
  }
  // không thì tìm nạp
  else {
    const cookieStream = await fetch(
      `https://drive.google.com/u/7/get_video_info?docid=${idMovieStream}`
    ).then(
      (response) => response.headers.raw()["set-cookie"][0].split("; ")[0]
    );

    const opts = {
      headers: {
        cookie: cookieStream,
      },
    };

    await fetch(
      `https://drive.google.com/u/7/get_video_info?docid=${idMovieStream}`,
      opts
    )
      .then((response) => response.text())
      .then(async (body) => {
        const data = queryString.parse(body);
        const arrUrl = data.fmt_stream_map.split(",");
        //lấy chất lượng cao nhất
        const url = arrUrl[arrUrl.length - 1].split("|")[1];
        //lưu url vào cache
        client_redis.setex(`${idMovieStream}_cookie`, 3600, cookieStream);
        client_redis.setex(`${idMovieStream}_urlStream`, 3600, url);

        req.cookieStream = cookieStream;
        req.urlStream = url;
      });
    return next();
  }
};

const streamVideo = async (req, res) => {
  const headers = {
    "cache-control": "max-age=0,s-maxage=21600",
    "content-type": "video/mp4",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Range,User-Agent",
  };
  delete req.headers.host;
  delete req.headers.referer;

  req.headers["cookie"] = req.cookieStream;

  const getVideo = await fetch(req.urlStream, {
    method: "GET",
    headers: req.headers,
  });
  console.log(getVideo.headers);
  headers["content-range"] = `${getVideo.headers.get("content-range")}`;
  headers["content-length"] = `${getVideo.headers.get("content-length")}`;

  res.writeHead(206, headers);
  getVideo.body.pipe(res);
};

module.exports = {
  getLinkStream,
  streamVideo,
};
