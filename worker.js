import cluster from 'cluster';
import { cpus } from 'os';
import express from 'express'
import process from 'process';
import { getPrice } from './getPrice.js';

const plateNumbers = ["ALZ 422", "LJZ 9143", "ADV 687X"]
const port = 3000;

const main = () => {
    //Executed in multiple processes
    const app = express();
    console.log(`Worker ${process.pid} started`);

    app.get('/getPrice', async function (req, res) {
  
      req.plateNumber = plateNumbers[req.query.id]
      req.skipCache = req.query.skipCache === '1' ? true : false;
      
      const price = await getPrice(req.plateNumber, req.skipCache)
      console.log(`workerId: ${cluster.worker.id} - on process ${process.pid} - Response`);
      process.send({ cmd: 'notifyPrice' , price: price, plateNumber: req.plateNumber});
  

      res.send(`Result number is ${price}`);
    });
  
    app.listen(port, () => {
      console.log(`App listening on port ${port}`);
    });
}

if (cluster.isPrimary) {

  function messageHandler(msg) {
    if(msg.cmd && msg.cmd === 'notifyPrice'){
        console.log({"PlateNumber": msg.plateNumber, "price": msg.price})
    }
  }

  // Start workers and listen for messages containing notifyRequest
  const numCPUs =  cpus().length;;
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  for (const id in cluster.workers) {
    cluster.workers[id].on('message', messageHandler);
  }

  cluster.on("exit", (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
    cluster.fork();
  });

} else {
    main()
}