require("dotenv").config();
const express = require("express");
const path = require("path");
const fs = require("fs");

const fetch = require("node-fetch");

const PORT = process.env.PORT || 3000;

const app = express();

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "/public")));

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

const streamVideoRouter = require("./src/routers/stream-video.router");

// app.use("/stream/get-link/:id", cache, getLink);
app.use(streamVideoRouter);

app.listen(PORT, () => {
  console.log(`App listening on port: ${PORT}`);
});
