const redis = require('redis')
const { promisify } = require('util')

const REDIS_PORT = process.env.REDIS_PORT || 6379
const REDIS_HOST = process.env.REDIS_HOST || 'redis'

const client_redis = redis.createClient(REDIS_PORT, REDIS_HOST)
// const client_redis = redis.createClient(REDIS_PORT)

client_redis.on('connect', () => console.log('Connected to Redis'))

const getAsync = promisify(client_redis.get).bind(client_redis)

module.exports = {
    client_redis,
    getAsync,
}
