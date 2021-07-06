const fetch = require('node-fetch')
const queryString = require('query-string')
const https = require('https')

const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
})

const stream = async (req, res) => {
    const chuck = req.params.chuck
    const query = queryString.stringify(req.query)

    delete req
    console.log(req)

    const url = `https://vod.vidsugar.com/_definst_/smil:mp4/edfc39c4d787a8537d015ebad6c6b6d8/${chuck}?${query}`
    const getFile = await fetch(url, {
        method: 'GET',
    })
    getFile.body.pipe(res)
}
module.exports = { stream }
// playlist.m3u8?s=vidsugar&v=1615877119
