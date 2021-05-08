require("dotenv").config();
const express = require("express");
const { google } = require("googleapis");
const path = require("path");
const fs = require("fs");
const redis = require("redis");
const { default: fetch, Headers } = require("node-fetch");

const PORT = process.env.PORT || 3000;
const REDIS_PROT = process.env.PORT || 6379;

const client_redis = redis.createClient(REDIS_PROT);

const app = express();

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "/public")));

const CLIENT_ID =
  "894731050040-286akvbp41qkckh6kumlhmmtpbhb6l8d.apps.googleusercontent.com";
const CLIENT_SECRET = "qmLxvFR6g6Y6R-Ouxx5U6oLz";
const REDIRECT_URI = "https://developers.google.com/oauthplayground";

const REFRESH_TOKEN =
  "1//04qEk2eY8QqNVCgYIARAAGAQSNwF-L9IrjUQNmzYVqRyXk-eaimDG1MXpuSzto70eFTYQG58XCXM5zjyv-V7ptzAt4kf3g0obpSE";

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);
oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const drive = google.drive({
  version: "v3",
  auth: oauth2Client,
});

const filePath = path.join(__dirname, "anh.jpg");

async function uploadFile() {
  try {
    const response = await drive.files.create({
      requestBody: {
        name: "gai_dep.jpg",
        mimeType: "image/jpg",
      },
      media: {
        mimeType: "image/jpg",
        body: fs.createReadStream(filePath),
      },
    });
    console.log(response.data);
  } catch (error) {
    console.log(error);
  }
}

// uploadFile();

async function getLink(req, res) {
  const id = req.params.id;
  try {
    const fileId = "1zIH-mJciulvSZh3GfZ_fbAKGd2qNQkMs";
    // await drive.permissions.create({
    //   fileId: fileId,
    //   requestBody: {
    //     role: "reader",
    //     type: "anyone",
    //   },
    // });
    // const result = await drive.files.get({
    //   fileId: fileId,
    //   fields: "webViewLink, webContentLink",
    // });

    // client_redis.setex(id, 3600, result.data.webViewLink);

    // res.send(result.data);

    //  ===========================================================

    var dest = fs.createWriteStream(`./public/video/${fileId}.mp4`);
    await drive.files
      .get(
        {
          fileId: fileId,
          alt: "media",
        },
        { responseType: "stream" }
      )
      .then((response) => {
        response.data
          .on("end", function () {
            console.log("Done");
            client_redis.setex(
              id,
              3600,
              `${process.env.URL}/video/${fileId}.mp4`
            );
            res.send(`${process.env.URL}/video/${fileId}.mp4`);
          })
          .on("error", function (err) {
            console.log("Error during download", err);
          })
          .pipe(dest);
      });
    //
  } catch (error) {
    console.log(error);
  }
}

async function cache(req, res, next) {
  const id = req.params.id;

  client_redis.get(id, (err, data) => {
    if (err) throw err;
    if (data !== null) return res.send(data);
    else return next();
  });
}

async function playVideo(req, res) {
  var filePath = "./public/video/" + req.url;

  fs.readFile(filePath, function (error, content) {
    res.writeHead(200, { "Access-Control-Allow-Origin": "*" });
    if (error) {
      if (error.code == "ENOENT") {
        fs.readFile("./404.html", function (error, content) {
          res.end(content, "utf-8");
        });
      } else {
        res.writeHead(500);
        res.end(
          "Sorry, check with the site admin for error: " + error.code + " ..\n"
        );
        res.end();
      }
    } else {
      res.end(content, "utf-8");
    }
  });
}

function downloadFile() {
  const string =
    "status=ok&hl=en&allow_embed=0&ps=docs&partnerid=30&autoplay=0&docid=1zIH-mJciulvSZh3GfZ_fbAKGd2qNQkMs&abd=0&public=true&el=embed&title=20210325_221815.mp4&BASE_URL=https%3A%2F%2Fdrive.google.com%2Fu%2F3%2F&iurl=https%3A%2F%2Fdrive.google.com%2Fu%2F3%2Fvt%3Fauthuser%3D3%26id%3D1zIH-mJciulvSZh3GfZ_fbAKGd2qNQkMs%26s%3DAMedNnoAAAAAYJS6Ygx1wUkIL7nRqnq3gVBp_5lUBiwN&cc3_module=https%3A%2F%2Fs.ytimg.com%2Fyt%2Fswfbin%2Fsubtitles3_module.swf&ttsurl=https%3A%2F%2Fdrive.google.com%2Fu%2F3%2Ftimedtext%3Fauthuser%3D3%26id%3D1zIH-mJciulvSZh3GfZ_fbAKGd2qNQkMs%26vid%3D1818ad23c0f7abe3&reportabuseurl=https%3A%2F%2Fdrive.google.com%2Fu%2F3%2Fabuse%3Fauthuser%3D3%26id%3D1zIH-mJciulvSZh3GfZ_fbAKGd2qNQkMs&token=1&plid=V0QWfKYWJ9PCWQ&fmt_stream_map=18%7Chttps%3A%2F%2Fr2---sn-npoe7nl6.c.drive.google.com%2Fvideoplayback%3Fexpire%3D1620366978%26ei%3DQp6UYMn_CMz0ugWzibioDw%26ip%3D2001%3Aee0%3A4b75%3Ae190%3A91cc%3A5ff6%3A9c4%3A3395%26cp%3DQVRHUkRfVVlVSVhPOkUxeWEtc1gyREFyMVVOdGhCSGRfbkVSRWRkQ0dqall3WDhubGxIUTBJOW0%26id%3D1818ad23c0f7abe3%26itag%3D18%26source%3Dwebdrive%26requiressl%3Dyes%26mh%3Dgt%26mm%3D32%26mn%3Dsn-npoe7nl6%26ms%3Dsu%26mv%3Dm%26mvi%3D2%26pl%3D50%26ttl%3Dtransient%26susc%3Ddr%26driveid%3D1zIH-mJciulvSZh3GfZ_fbAKGd2qNQkMs%26app%3Dexplorer%26mime%3Dvideo%2Fmp4%26vprv%3D1%26prv%3D1%26dur%3D73.816%26lmt%3D1619198286046127%26mt%3D1620352338%26sparams%3Dexpire%252Cei%252Cip%252Ccp%252Cid%252Citag%252Csource%252Crequiressl%252Cttl%252Csusc%252Cdriveid%252Capp%252Cmime%252Cvprv%252Cprv%252Cdur%252Clmt%26sig%3DAOq0QJ8wRgIhAMB88tDDR2wBqY-rmPYfw2RsWB0gBy2_A3836J6VkriOAiEA5Wau3UgKigIP2l0hIxIK5hMtjUynLhtWg0g1rDEa9hE%3D%26lsparams%3Dmh%252Cmm%252Cmn%252Cms%252Cmv%252Cmvi%252Cpl%26lsig%3DAG3C_xAwRQIgJTu2tOpLs5VdzavjNhlugHoEGBgVLhRHseekl1X26qwCIQCOzROZO6u0-_10ClWKys8XJVhcLmlN0EX_4AU7deX9-Q%3D%3D%2C22%7Chttps%3A%2F%2Fr2---sn-npoe7nl6.c.drive.google.com%2Fvideoplayback%3Fexpire%3D1620366978%26ei%3DQp6UYMn_CMz0ugWzibioDw%26ip%3D2001%3Aee0%3A4b75%3Ae190%3A91cc%3A5ff6%3A9c4%3A3395%26cp%3DQVRHUkRfVVlVSVhPOkUxeWEtc1gyREFyMVVOdGhCSGRfbkVSRWRkQ0dqall3WDhubGxIUTBJOW0%26id%3D1818ad23c0f7abe3%26itag%3D22%26source%3Dwebdrive%26requiressl%3Dyes%26mh%3Dgt%26mm%3D32%26mn%3Dsn-npoe7nl6%26ms%3Dsu%26mv%3Dm%26mvi%3D2%26pl%3D50%26ttl%3Dtransient%26susc%3Ddr%26driveid%3D1zIH-mJciulvSZh3GfZ_fbAKGd2qNQkMs%26app%3Dexplorer%26mime%3Dvideo%2Fmp4%26vprv%3D1%26prv%3D1%26dur%3D73.816%26lmt%3D1619198295936813%26mt%3D1620352338%26sparams%3Dexpire%252Cei%252Cip%252Ccp%252Cid%252Citag%252Csource%252Crequiressl%252Cttl%252Csusc%252Cdriveid%252Capp%252Cmime%252Cvprv%252Cprv%252Cdur%252Clmt%26sig%3DAOq0QJ8wRAIgT6ls2EZpID6SjSci5F_tM6gD1crSVsbUbppwAJnOXzYCIG9lwsY6wv10ufOwXhoiThnik3FO3GsqD7fDaUrlEmkB%26lsparams%3Dmh%252Cmm%252Cmn%252Cms%252Cmv%252Cmvi%252Cpl%26lsig%3DAG3C_xAwRgIhAPG4JX3vS2YJ5lsrGzKL7obSeoVaHsOW-m-ul_84oeGjAiEAiZFf_oBXQyQ0eeYLgGtee561yPobuSzL7akrAsMOQGk%3D&url_encoded_fmt_stream_map=itag%3D18%26url%3Dhttps%253A%252F%252Fr2---sn-npoe7nl6.c.drive.google.com%252Fvideoplayback%253Fexpire%253D1620366978%2526ei%253DQp6UYMn_CMz0ugWzibioDw%2526ip%253D2001%253Aee0%253A4b75%253Ae190%253A91cc%253A5ff6%253A9c4%253A3395%2526cp%253DQVRHUkRfVVlVSVhPOkUxeWEtc1gyREFyMVVOdGhCSGRfbkVSRWRkQ0dqall3WDhubGxIUTBJOW0%2526id%253D1818ad23c0f7abe3%2526itag%253D18%2526source%253Dwebdrive%2526requiressl%253Dyes%2526mh%253Dgt%2526mm%253D32%2526mn%253Dsn-npoe7nl6%2526ms%253Dsu%2526mv%253Dm%2526mvi%253D2%2526pl%253D50%2526ttl%253Dtransient%2526susc%253Ddr%2526driveid%253D1zIH-mJciulvSZh3GfZ_fbAKGd2qNQkMs%2526app%253Dexplorer%2526mime%253Dvideo%252Fmp4%2526vprv%253D1%2526prv%253D1%2526dur%253D73.816%2526lmt%253D1619198286046127%2526mt%253D1620352338%2526sparams%253Dexpire%252Cei%252Cip%252Ccp%252Cid%252Citag%252Csource%252Crequiressl%252Cttl%252Csusc%252Cdriveid%252Capp%252Cmime%252Cvprv%252Cprv%252Cdur%252Clmt%2526sig%253DAOq0QJ8wRgIhAMB88tDDR2wBqY-rmPYfw2RsWB0gBy2_A3836J6VkriOAiEA5Wau3UgKigIP2l0hIxIK5hMtjUynLhtWg0g1rDEa9hE%253D%2526lsparams%253Dmh%252Cmm%252Cmn%252Cms%252Cmv%252Cmvi%252Cpl%2526lsig%253DAG3C_xAwRQIgJTu2tOpLs5VdzavjNhlugHoEGBgVLhRHseekl1X26qwCIQCOzROZO6u0-_10ClWKys8XJVhcLmlN0EX_4AU7deX9-Q%253D%253D%26type%3Dvideo%252Fmp4%253B%2Bcodecs%253D%2522avc1.42001E%252C%2Bmp4a.40.2%2522%26quality%3Dmedium%2Citag%3D22%26url%3Dhttps%253A%252F%252Fr2---sn-npoe7nl6.c.drive.google.com%252Fvideoplayback%253Fexpire%253D1620366978%2526ei%253DQp6UYMn_CMz0ugWzibioDw%2526ip%253D2001%253Aee0%253A4b75%253Ae190%253A91cc%253A5ff6%253A9c4%253A3395%2526cp%253DQVRHUkRfVVlVSVhPOkUxeWEtc1gyREFyMVVOdGhCSGRfbkVSRWRkQ0dqall3WDhubGxIUTBJOW0%2526id%253D1818ad23c0f7abe3%2526itag%253D22%2526source%253Dwebdrive%2526requiressl%253Dyes%2526mh%253Dgt%2526mm%253D32%2526mn%253Dsn-npoe7nl6%2526ms%253Dsu%2526mv%253Dm%2526mvi%253D2%2526pl%253D50%2526ttl%253Dtransient%2526susc%253Ddr%2526driveid%253D1zIH-mJciulvSZh3GfZ_fbAKGd2qNQkMs%2526app%253Dexplorer%2526mime%253Dvideo%252Fmp4%2526vprv%253D1%2526prv%253D1%2526dur%253D73.816%2526lmt%253D1619198295936813%2526mt%253D1620352338%2526sparams%253Dexpire%252Cei%252Cip%252Ccp%252Cid%252Citag%252Csource%252Crequiressl%252Cttl%252Csusc%252Cdriveid%252Capp%252Cmime%252Cvprv%252Cprv%252Cdur%252Clmt%2526sig%253DAOq0QJ8wRAIgT6ls2EZpID6SjSci5F_tM6gD1crSVsbUbppwAJnOXzYCIG9lwsY6wv10ufOwXhoiThnik3FO3GsqD7fDaUrlEmkB%2526lsparams%253Dmh%252Cmm%252Cmn%252Cms%252Cmv%252Cmvi%252Cpl%2526lsig%253DAG3C_xAwRgIhAPG4JX3vS2YJ5lsrGzKL7obSeoVaHsOW-m-ul_84oeGjAiEAiZFf_oBXQyQ0eeYLgGtee561yPobuSzL7akrAsMOQGk%253D%26type%3Dvideo%252Fmp4%253B%2Bcodecs%253D%2522avc1.42001E%252C%2Bmp4a.40.2%2522%26quality%3Dhd720&timestamp=1620352578159&length_seconds=73&fmt_list=22%2F1280x692%2F9%2F0%2F115%2C18%2F640x346%2F9%2F0%2F115";
  const data = queryString.parse(string);
  const arrUrl = data.fmt_stream_map.split(",");
  const url_1 = arrUrl[0].split("|")[1];
  const url_2 = arrUrl[1].split("|")[1];
  console.log(url_2);

  fetch(url_2, opts).then((res) => {
    const dest = fs.createWriteStream("./octocat.mp4");
    res.body.pipe(dest);
  });
}
const file_id = "1zIH-mJciulvSZh3GfZ_fbAKGd2qNQkMs";

async function streamVideo() {
  const cookie = await fetch(
    `https://drive.google.com/u/7/get_video_info?docid=${file_id}`
  ).then((res) => res.headers.raw()["set-cookie"][0].split("; ")[0]);

  const opts = {
    headers: {
      cookie: cookie,
    },
  };

  fetch(`https://drive.google.com/u/7/get_video_info?docid=${file_id}`, opts)
    .then((res) => res.text())
    .then(async (body) => {
      const data = queryString.parse(body);
      const arrUrl = data.fmt_stream_map.split(",");
      arrUrl.forEach((element) => {
        const url = element.split("|");
        if (Number(url[0]) === 18) console.log("url360 : " + url[1]);
        if (Number(url[0]) === 22) console.log("url720: " + url[1]);
      });

      // await download(
      //   `https://drive.google.com/u/7/get_video_info?docid=${file_id}`,
      //   opts
      // ).pipe(fs.createWriteStream(`./public/video/${file_id}.mp4`));
    });
}
const urlStream =
  "https://r3---sn-ogul7n7d.c.drive.google.com/videoplayback?expire=1620468254&ei=3imWYLCuG7mC9-APz8G1yAU&ip=14.245.28.160&cp=QVRHUkVfV1JTRVhPOjJRNDYteEUta3ZwbWlqT0pLX2phckhtUEFzbTUxSVYtQVNIU3RmRFNXX1c&id=38207e78caec9fbe&itag=22&source=webdrive&requiressl=yes&mh=7k&mm=32&mn=sn-ogul7n7d&ms=su&mv=m&mvi=3&pl=22&ttl=transient&susc=dr&driveid=1NURiFyCKEId8KJjfWoaoCwpBGhJN-vqN&app=explorer&mime=video/mp4&vprv=1&prv=1&dur=3600.068&lmt=1620453273450093&mt=1620453624&sparams=expire%2Cei%2Cip%2Ccp%2Cid%2Citag%2Csource%2Crequiressl%2Cttl%2Csusc%2Cdriveid%2Capp%2Cmime%2Cvprv%2Cprv%2Cdur%2Clmt&sig=AOq0QJ8wRQIhAPUtV1td9R5U9JwzP-lq6U-EBnGR65UToyAgHIyuoTwoAiA9p_KVweDXhwAgSqeUzrlsPZIEQ23FfXcBWXG5W0kK4A==&lsparams=mh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl&lsig=AG3C_xAwRgIhAJoLFT96uDNGLb5P9DXD-P3J26lqaWf7xggJbqEa8xBjAiEAp9xNYsbRDRgLDLCjVxCobssO82dfPOs8PxpG9-XQxjI=";
async function playVideo2(req, res) {
  const headers = {
    "cache-control": "max-age=0,s-maxage=21600",
    "content-type": "video/mp4",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Range,User-Agent",
  };
  req.headers["host"] = "";
  req.headers["cookie"] = "DRIVE_STREAM=Wqvzpnka0kQ";
  const getVideo = await fetch(urlStream, {
    method: "GET",
    headers: req.headers,
  });

  headers["content-range"] = `${getVideo.headers.get("content-range")}`;
  headers["content-length"] = `${getVideo.headers.get("content-length")}`;

  res.writeHead(206, headers);
  getVideo.body.pipe(res);
}

app.use("/stream/get-link/:id", cache, getLink);
app.use("/playvideo", playVideo2);

app.listen(PORT, () => {
  console.log(`App listening on port: ${PORT}`);
});
