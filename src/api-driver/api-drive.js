const { google } = require("googleapis");
const path = require("path");
const fs = require("fs");

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

const uploadFile = async () => {
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
};

// uploadFile();

const getLink = async (req, res) => {
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
};

module.exports = {
  uploadFile,
  getLink,
};
