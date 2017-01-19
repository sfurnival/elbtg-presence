'use strict';

let AWS   = require('aws-sdk');
let ELBv2 = new AWS.ELBv2({
    accessKeyId     : process.env.AWS_ACCESS_KEY,
    secretAccessKey : process.env.AWS_SECRET_KEY
});
let Get   = require('request-promise');

// --
// Configuration
// --

let params = {
    TargetGroupArn: process.env.AWS_TARGET_GROUP,
    Targets: [{
        Id: null,
        Port: process.env.PORT
    }]
};

// --
// Methods
// --

function register() {
    console.log(`Registering [${ params.Targets[0].Id }] at [${ process.env.AWS_TARGET_GROUP }] ...`);
    ELBv2.registerTargets(params, (e, data) => {
        if (e) {
            console.log(e, e.stack);
            process.exit(1);
        } else {
            process.exit(0);
        }
    });
}

function deregister() {
    console.log(`Deregistering [${ params.Targets[0].Id }] from [${ process.env.AWS_TARGET_GROUP }] ...`);
    ELBv2.deregisterTargets(params, (e, data) => {
        if (e) {
            console.log(e, e.stack);
            process.exit(1);
        } else {
            process.exit(0);
        }
    });
}

function tick() {
    return;
}

// --
// Events
// --

process.on('SIGTERM', () => {
    deregister(params);
});

process.on('SIGINT', () => {
    deregister(params);
});

// --
// Init
// --

if (
    process.env.PORT &&
    process.env.AWS_TARGET_GROUP &&
    process.env.AWS_REGION &&
    process.env.AWS_ACCESS_KEY &&
    process.env.AWS_SECRET_KEY
) {

    console.log(params);

    Get({ uri: 'http://169.254.169.254/latest/meta-data/instance-id' })
        .then(req => {
            params.Targets[0].Id = req;
            register();

            let loop = setInterval(tick, 500);
        })
        .catch(e => {
            console.log(e);
            process.exit(1);
        })

} else {
    console.log('Error: Missing one or more configuration values.');
    process.exit(1);
}