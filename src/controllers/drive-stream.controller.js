const fetch = require('node-fetch')
const { client_redis, getAsync } = require('../redis/redis')
const queryString = require('query-string')
const { decrypt } = require('../lib/mahoa')

const getLinkStream = async (req, res, next) => {
    const id = req.query.id
    //lấy dữ liệu từ cache
    let cookieStream = await getAsync(`cookie`)
    let urlStream = await getAsync(`${id}_urlStream`)
    let idMovieStream

    if (cookieStream) req.cookieStream = cookieStream
    else {
        idMovieStream = decrypt(id)
        cookieStream = await getCookie(idMovieStream)
        client_redis.setex(`cookie`, 60 * 60 * 3 - 10 * 60, cookieStream)
        req.cookieStream = cookieStream
    }
    // nếu url tồn tại thì gán req.urlStream = urlStream
    if (urlStream) {
        req.urlStream = urlStream
    } else {
        if (idMovieStream == undefined) idMovieStream = decrypt(id)
        urlStream = await getUrlStream(idMovieStream, cookieStream)
        client_redis.setex(`${id}_urlStream`, 60 * 60 * 3 - 10 * 60, urlStream)
        req.urlStream = urlStream
    }
    return next()
}

const streamVideo = async (req, res) => {
    const headers = {
        'cache-control': 'max-age=0,s-maxage=21600',
        'content-type': 'video/mp4',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,HEAD,POST,OPTIONS',
        'Access-Control-Allow-Headers': 'Range,User-Agent',
    }
    delete req.headers.host
    delete req.headers.referer

    req.headers['cookie'] = req.cookieStream

    const getVideo = await fetch(req.urlStream, {
        method: 'GET',
        headers: req.headers,
    })

    headers['content-range'] = `${getVideo.headers.get('content-range')}`
    headers['content-length'] = `${getVideo.headers.get('content-length')}`

    res.writeHead(206, headers)
    getVideo.body.pipe(res)
}

module.exports = {
    getLinkStream,
    streamVideo,
}

function getUrlStream(idMovieStream, cookieStream) {
    const opts = {
        headers: {
            cookie: cookieStream,
        },
    }
    return fetch(
        `https://drive.google.com/u/7/get_video_info?docid=${idMovieStream}`,
        opts
    )
        .then((response) => response.text())
        .then((body) => {
            const data = queryString.parse(body)
            const arrUrl = data.fmt_stream_map.split(',')
            //lấy chất lượng cao nhất
            const url = arrUrl[arrUrl.length - 1].split('|')[1]

            return url
        })
        .catch((err) => console.log(err))
}

async function getCookie(idMovieStream) {
    return await fetch(
        `https://drive.google.com/u/7/get_video_info?docid=${idMovieStream}`
    )
        .then((response) => {
            console.log(response.headers.raw()['set-cookie'])
            return response.headers.raw()['set-cookie'][0].split('; ')[0]
        })
        .catch((err) => console.log(err))
    // client_redis.setex(`cookie`, 60 * 60 * 3 - 10 * 60, cookieStream)
    // req.cookieStream = cookieStream
}
