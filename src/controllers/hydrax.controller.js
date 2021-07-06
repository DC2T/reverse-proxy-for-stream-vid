const { decrypt } = require('../lib/mahoa')
const { client_redis, getAsync } = require('../redis/redis')
const fetch = require('node-fetch')

const getUrl = async (req, res) => {
    const id = req.params.id
    const idDriver = decrypt(id)
    const url = `https://api.hydrax.net/833c905b636dd9442e0305131ed35aff/drive/${idDriver}`
    // let status = false
    // let slug = ''
    const getSlug = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    })
        .then((response) => response.text())
        .then(async (body) => {
            console.log(body)
            return body
            // if (JSON.parse(body).status_video === 'Ready')
        })
    const json = JSON.parse(getSlug)
    res.json(json)
}

module.exports = {
    getUrl,
}
