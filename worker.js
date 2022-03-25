import cluster from 'cluster';
import { cpus } from 'os';
import express from 'express'
import process from 'process';
import { getPrice } from './getPrice.js';

const plateNumbers = ["ALZ 422", "LJZ 9143", "ADV 687X"]
const port = 3000;

if (cluster.isPrimary) {

  // Start workers and listen for messages containing notifyRequest
  const numCPUs =  cpus().length;
  for (let i = 0; i < numCPUs; i++) {
    var worker = cluster.fork();
    worker.on('message', async (msg) => {
      if(msg.cmd && msg.cmd === 'requestPrice'){
        console.log("SKIPCACHE value: ", msg.skipCache)
        const price = await getPrice(msg.plateNumber, msg.skipCache)
        worker.send({
          cmd: "priceResponse",
          price: price
        })
      }
    });
  }

  cluster.on("exit", (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
    cluster.fork();
  });

} else {
    //Executed in multiple processes
    const app = express();
    console.log(`Worker ${process.pid} started`);

    const getPriceFromMainProcess = (req, res, next) => {
      req.plateNumber = plateNumbers[req.query.id]
      
      console.log(`workerId: ${cluster.worker.id} - on process ${process.pid} - Response`);
      process.send({ 
        cmd: 'requestPrice', 
        workerId: cluster.worker.id,
        processId: process.pid,
        plateNumber: req.plateNumber,
        skipCache: !(req.query.skipCache === "0")
      });

      process.on("message", (msg) => {
        if(msg.cmd && msg.cmd === 'priceResponse'){
          res.locals.price = msg.price
          next()
        }
      }) 
    }

    app.get('/getPrice', getPriceFromMainProcess, async function (req, res) {
      console.log("After Next()");
      res.send(`Result number is ${res.locals.price}`);
    });
  
    app.listen(port, () => {
      console.log(`App listening on port ${port}`);
    });
}