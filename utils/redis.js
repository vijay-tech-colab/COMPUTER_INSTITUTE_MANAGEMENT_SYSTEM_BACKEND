import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redisClient = () => {
    if (process.env.REDIS_URL) {
        console.log(`Redis connected`);
        return process.env.REDIS_URL;
    }
    throw new Error('Redis connection failed');
};

export const redis = new Redis(redisClient());

// Reusable methods
export const setCache = async (key, value, expiry = 3600) => {
    try {
        await redis.set(key, JSON.stringify(value), 'EX', expiry);
    } catch (error) {
        console.error('Redis Set Error:', error);
    }
};

export const getCache = async (key) => {
    try {
        const data = await redis.get(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Redis Get Error:', error);
        return null;
    }
};

export const deleteCache = async (key) => {
    try {
        await redis.del(key);
    } catch (error) {
        console.error('Redis Delete Error:', error);
    }
};

export const deleteByPrefix = async (prefix) => {
    try {
        const keys = await redis.keys(`${prefix}*`);
        if (keys.length > 0) {
            await redis.del(...keys);
        }
    } catch (error) {
        console.error('Redis Clear Prefix Error:', error);
    }
};
