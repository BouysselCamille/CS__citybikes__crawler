// #!/usr/bin/env node
const amqp = require('amqplib/callback_api');
const XMLHttpRequest = require('xhr2');


// Quick wrapper function for making a GET call.
async function get(url) {
    return new Promise((resolve) => {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.responseType = "json";
        xhr.onload = () => resolve(xhr.response);
        xhr.send(null);
    });
}
const AMQP_URL = process.env.AMQP_URL || 'amqp://localhost';

// connection to rabbitMQ and fetch status data
amqp.connect(AMQP_URL, function(error0, connection) {
    if (error0) { throw error0; }
    connection.createChannel(async function(error1, channel) {
        if (error1) { throw error1; }

        const url = `https://gbfs.citibikenyc.com/gbfs/en/station_status.json`;
        const status = await get(url);
        const status_stringify = JSON.stringify(status);

        var queue = 'status';

        channel.assertQueue(queue, { durable: false });
        channel.sendToQueue(queue,  Buffer.from(status_stringify));
        console.log("Status Send");
    });
    setTimeout(function() {
        connection.close();
        process.exit(0);
    }, 10000);
});