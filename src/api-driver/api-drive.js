const { google } = require("googleapis");
const path = require("path");
const fs = require("fs");

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;

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

const isExists = (folderName, cb) => {
  drive.files.list(
    {
      fields: "nextPageToken, files(id, name)",
    },
    (err, res) => {
      if (err) return console.log("The API returned an error: " + err);
      const files = res.data.files;
      let found = false;
      for (const i in files) {
        let file = files[i];
        if (file.name === folderName) {
          // console.log(`${file.name} (${file.id})`);
          found = true;
          cb([found, file.id]);
          break;
        }
      }
      if (!found) {
        cb([found, ""]);
      }
    }
  );
};

const createFolder = (cfolderName, pfolderName, cb) => {
  /* 
  param cfolderName: is child folder name 
  param pfolderName: is parent folder name
   */
  if (pfolderName) {
    isExists(pfolderName, (p) => {
      if (p[0]) {
        isExists(cfolderName, (c) => {
          if (!c[0]) {
            let fileMetadata = {
              name: cfolderName,
              parents: [p[1]],
              mimeType: "application/vnd.google-apps.folder",
            };
            drive.files.create(
              {
                resource: fileMetadata,
                fields: "id",
              },
              function (err, file) {
                if (err) {
                  // Handle error
                  console.error(err);
                } else {
                  console.log(`Folder ${cfolderName} Id: ${file.data.id}`);
                  cb(file.data.id);
                }
              }
            );
          } else {
            console.log(`${cfolderName} is Already Exists - ${c[1]}`);
            cb(c[1]);
          }
        });
      }
    });
  } else {
    isExists(cfolderName, (c) => {
      if (!c[0]) {
        let fileMetadata = {
          name: cfolderName,
          mimeType: "application/vnd.google-apps.folder",
        };
        drive.files.create(
          {
            resource: fileMetadata,
            fields: "id",
          },
          function (err, file) {
            if (err) {
              // Handle error
              console.error(err);
            } else {
              console.log(`Folder ${cfolderName} Id: ${file.data.id}`);
              cb(file.data.id);
            }
          }
        );
      } else {
        console.log(`${cfolderName} is Already Exists - ${c[1]}`);
        cb(c[1]);
      }
    });
  }
};
const permission = (id) => {
  let permission = {
    type: "user",
    role: "reader",
    emailAddress: "4bits.1001@gmail.com",
  };
  drive.permissions.create(
    {
      resource: permission,
      fileId: id,
      fields: "id",
    },
    function (err, res) {
      if (err) {
        // Handle error...
        console.log(
          `Sorry, the items were successfully shared but emails could not be sent to ${permission["emailAddress"]}.`
        );
      } else {
        console.log("Permission ID: ", res.data.id);
      }
    }
  );
};
const uploadFile = (folderId, filePath, fileName) => {
  let fileMetadata = {
    name: fileName,
    parents: [folderId],
  };
  let media = {
    mimeType: "video/mp4, image/jpeg",
    body: fs.createReadStream(filePath),
  };
  drive.files.create(
    {
      resource: fileMetadata,
      media: media,
      fields: "id",
    },
    function (err, file) {
      if (err) {
        // Handle error
        console.error(err);
      } else {
        console.log("File Id: ", file.data.id);
        fs.unlinkSync(filePath);
        console.log(`Deleted ${filePath} in local machine`);
        return file.data.id;
      }
    }
  );
};

const isExists1 = (folderName, cb) => {
  drive.files.list(
    {
      fields: "nextPageToken, files(id, name)",
    },
    (err, res) => {
      if (err) return console.log("The API returned an error: " + err);
      const files = res.data.files;
      let found = false;
      for (const i in files) {
        let file = files[i];
        if (file.name === folderName) {
          // console.log(`${file.name} (${file.id})`);
          found = true;
          cb({ status: found, file_id: file.id });
          break;
        }
      }
      if (!found) {
        cb({ status: found, file_id: null });
      }
    }
  );
};

const getFileChild = async (filename, id_foldername) => {
  return new Promise((resolve, reject) => {
    const fileId = id_foldername;
    drive.files.list(
      {
        includeRemoved: false,
        spaces: "drive",
        fileId: fileId,
        fields:
          "nextPageToken, files(id, name, parents, mimeType, modifiedTime)",
        q: `'${fileId}' in parents and fullText contains '${filename}'`,
      },
      function (err, response) {
        if (err) {
          return reject(err);
        }
        if (response.data.files[0]) return resolve(response.data.files[0]);
        return reject(null);
      }
    );
  });
};

module.exports = {
  permission,
  createFolder,
  uploadFile,
  isExists,
  getFileChild,
};
