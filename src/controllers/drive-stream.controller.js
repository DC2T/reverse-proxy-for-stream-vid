const fetch = require('node-fetch')
const { client_redis, getAsync } = require('../redis/redis')
const queryString = require('query-string')
const { decrypt } = require('../lib/mahoa')

const getLinkStream = async (req, res, next) => {
    const id = req.query.id
    //lấy dữ liệu từ cache
    const cookieStream = await getAsync(`${id}_cookie`)
    const urlStream = await getAsync(`${id}_urlStream`)
    // nếu tồn tại thì nhảy tiếp
    if (cookieStream && urlStream) {
        req.cookieStream = cookieStream
        req.urlStream = urlStream
        return next()
    }
    // không thì tìm nạp
    else {
        const idMovieStream = decrypt(id)
        const cookieStream = await fetch(
            `https://drive.google.com/u/3/get_video_info?docid=${idMovieStream}`
        ).then(
            (response) => response.headers.raw()['set-cookie'][0].split('; ')[0]
        )

        const opts = {
            headers: {
                cookie: cookieStream,
            },
        }
        await fetch(
            `https://drive.google.com/u/3/get_video_info?docid=${idMovieStream}`,
            opts
        )
            .then((response) => response.text())
            .then(async (body) => {
                const data = queryString.parse(body)
                const arrUrl = data.fmt_stream_map.split(',')
                //lấy chất lượng cao nhất
                const url = arrUrl[arrUrl.length - 1].split('|')[1]
                //lưu url vào cache
                client_redis.setex(
                    `${id}_cookie`,
                    60 * 60 * 3 - 10 * 60,
                    cookieStream
                )
                client_redis.setex(
                    `${id}_urlStream`,
                    60 * 60 * 3 - 10 * 60,
                    url
                )

                req.cookieStream = cookieStream
                req.urlStream = url
            })
        return next()
    }
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
