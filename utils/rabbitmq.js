import amqp from 'amqplib';
import dotenv from 'dotenv';

dotenv.config();

let connection = null;
let channel = null;

const connectRabbitMQ = async () => {
    try {
        if (connection) return { connection, channel };

        connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
        channel = await connection.createChannel();
        
        console.log('RabbitMQ Connected Successfully 🚀');
        
        connection.on('error', (err) => {
            console.error('RabbitMQ Connection Error:', err);
            connection = null;
        });

        connection.on('close', () => {
            console.log('RabbitMQ Connection Closed');
            connection = null;
        });

        return { connection, channel };
    } catch (error) {
        console.error('Failed to connect to RabbitMQ:', error);
        throw error;
    }
};

export const publishToQueue = async (queue, message) => {
    try {
        const { channel } = await connectRabbitMQ();
        await channel.assertQueue(queue, { durable: true });
        channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
            persistent: true
        });
        console.log(`[x] Sent to queue ${queue}`);
    } catch (error) {
        console.error('RabbitMQ Publish Error:', error);
    }
};

export const consumeFromQueue = async (queue, callback) => {
    try {
        const { channel } = await connectRabbitMQ();
        await channel.assertQueue(queue, { durable: true });
        
        console.log(`[*] Waiting for messages in ${queue}. To exit press CTRL+C`);
        
        channel.consume(queue, (msg) => {
            if (msg !== null) {
                const content = JSON.parse(msg.content.toString());
                callback(content);
                channel.ack(msg);
            }
        });
    } catch (error) {
        console.error('RabbitMQ Consume Error:', error);
    }
};

export default connectRabbitMQ;
