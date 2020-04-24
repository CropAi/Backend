const cluster = require('cluster');
const os = require('os');
const path = require('path');
const fs = require('fs');

// break  default setting on windows
cluster.schedulingPolicy = cluster.SCHED_RR;



// create a folder by name test_images to keep images
const uploadDir = path.join(__dirname, "test_images");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

if (cluster.isMaster) {
    const machineCPU = os.cpus().length;
    console.log(`Work will be balanced between:${machineCPU} CPU cores`)
    for (let i = 0; i < machineCPU; i++) {
        cluster.fork();
    }
    cluster.on('exit', function (worker, code, signal) {
        if (worker.suicide === true) {
            console.log(new Date() + ' Worker committed suicide');
            cluster.fork();
        }
    });
   
}
else {
    require('./server');
}