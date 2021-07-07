require('dotenv').config()

const express = require('express')
const path = require('path')

const PORT = process.env.PORT || 5003

const app = express()
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '/public')))

const streamVideoRouter = require('./src/routers/stream-video.router')
const cloudflareRouter = require('./src/routers/cloudflare.router')
const getUrlRouter = require('./src/routers/get-url.router')
const streamMotPhjm = require('./src/routers/stream-video-mp')
const streamHydrax = require('./src/routers/get-url-hydrax')

const apiGoogle = require('./src/api-driver/api-drive')

app.use(streamVideoRouter)
// app.use(cloudflareRouter)
// app.use(getUrlRouter)
// app.use(streamMotPhjm)
// app.use(streamHydrax)
// app.use('/get-name-file/:id_foldername/:filename', (req, res) => {
//     const filename = req.params.filename
//     const id_foldername = req.params.id_foldername
//     apiGoogle
//         .getFileChild(filename, id_foldername)
//         .then((data) => {
//             res.send(data)
//         })
//         .catch((err) => res.send(err))
// })

app.listen(PORT, () => {
    console.log(`App listening on port: ${PORT}`)
})
