const redis = require("redis");
const { promisify } = require("util");

const REDIS_PROT = process.env.REDIS_PROT || 6379;
const REDIS_HOST = process.env.REDIS_HOST || "redis";

const client_redis = redis.createClient(REDIS_PROT);
const getAsync = promisify(client_redis.get).bind(client_redis);

module.exports = {
  client_redis,
  getAsync,
};
