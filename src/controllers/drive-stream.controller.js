const fetch = require("node-fetch");
const redis = require("redis");
const { promisify } = require("util");
const queryString = require("query-string");

const REDIS_PROT = process.env.PORT || 6379;
const client_redis = redis.createClient(REDIS_PROT);
const getAsync = promisify(client_redis.get).bind(client_redis);

const file_id = "1zIH-mJciulvSZh3GfZ_fbAKGd2qNQkMs";

const getLinkStream = async (req, res, next) => {
  const idMovieStream = req.query.id;
  console.log(idMovieStream);

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
const urlStream =
  "https://r3---sn-ogul7n7d.c.drive.google.com/videoplayback?expire=1620468254&ei=3imWYLCuG7mC9-APz8G1yAU&ip=14.245.28.160&cp=QVRHUkVfV1JTRVhPOjJRNDYteEUta3ZwbWlqT0pLX2phckhtUEFzbTUxSVYtQVNIU3RmRFNXX1c&id=38207e78caec9fbe&itag=22&source=webdrive&requiressl=yes&mh=7k&mm=32&mn=sn-ogul7n7d&ms=su&mv=m&mvi=3&pl=22&ttl=transient&susc=dr&driveid=1NURiFyCKEId8KJjfWoaoCwpBGhJN-vqN&app=explorer&mime=video/mp4&vprv=1&prv=1&dur=3600.068&lmt=1620453273450093&mt=1620453624&sparams=expire%2Cei%2Cip%2Ccp%2Cid%2Citag%2Csource%2Crequiressl%2Cttl%2Csusc%2Cdriveid%2Capp%2Cmime%2Cvprv%2Cprv%2Cdur%2Clmt&sig=AOq0QJ8wRQIhAPUtV1td9R5U9JwzP-lq6U-EBnGR65UToyAgHIyuoTwoAiA9p_KVweDXhwAgSqeUzrlsPZIEQ23FfXcBWXG5W0kK4A==&lsparams=mh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl&lsig=AG3C_xAwRgIhAJoLFT96uDNGLb5P9DXD-P3J26lqaWf7xggJbqEa8xBjAiEAp9xNYsbRDRgLDLCjVxCobssO82dfPOs8PxpG9-XQxjI=";
const streamVideo = async (req, res) => {
  const headers = {
    "cache-control": "max-age=0,s-maxage=21600",
    "content-type": "video/mp4",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Range,User-Agent",
  };
  req.headers["host"] = "";
  req.headers["cookie"] = req.cookieStream;
  const getVideo = await fetch(req.urlStream, {
    method: "GET",
    headers: req.headers,
  });

  headers["content-range"] = `${getVideo.headers.get("content-range")}`;
  headers["content-length"] = `${getVideo.headers.get("content-length")}`;

  res.writeHead(206, headers);
  getVideo.body.pipe(res);
};

module.exports = {
  getLinkStream,
  streamVideo,
};
