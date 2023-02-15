const express = require('express');
const AinJs = require('@ainblockchain/ain-js').default;
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const NodeCache = require( "node-cache" );
const CryptoJS = require("crypto-js")

const { parsePath, formatPath } = require('./util');
const { default: Ain } = require('@ainblockchain/ain-js');

const app = express();

const port = 80;
const blockchainEndpoint = process.env.TESTNET_PROVIDER_URL;
const chainId = process.env.NETWORK === 'mainnet' ? 1 : 0;
const ain = new AinJs(blockchainEndpoint, chainId);
const BOT_NAME = process.env.BOT_NAME;
const BOT_PRIVKEY = process.env.AINIZE_INTERNAL_PRIVATE_KEY;
const BOT_ADDRESS = AinJs.utils.toChecksumAddress(ain.wallet.add(BOT_PRIVKEY));
// set BOT_ADDRESS as default wallet
ain.wallet.setDefaultAccount(BOT_ADDRESS);

const SD_INPAINTING_ENDPOINT = process.env.SD_INPAINTING_ENDPOINT;

const cache = new NodeCache();

app.use(express.json());

app.get('/', (req, res, next) => {
    res.status(200)
        .set('Content-Type', 'text/plain')
        .send(`SD inpainting trigger is alive!
               input path: /apps/sf_ainft/sd_inpainting/$user_addr/$tokenId/$timestamp/input
               signed data path: /apps/sf_ainft/sd_inpainting/$user_addr/$tokenId/$timestamp/signed_data
               `)
        .end();
});

app.post('/trigger', async (req, res) => {

    // Example of the transaction shape: refer to tx_sample.json

    // 1. check tx meets precondition
    const tx = req.body.transaction;
    if (!tx || !tx.tx_body || !tx.tx_body.operation) {
        console.log(`Invalid tx: ${JSON.stringify(tx)}`);
        return;
    }
    if (tx.tx_body.operation.type !== 'SET_VALUE') {
        console.log(`Not supported tx type: ${tx.tx_body.operation.type}`)
        return;
    }

    const inputPath = tx.tx_body.operation.ref;
    const parsedInputPath = parsePath(inputPath);

    if (parsedInputPath.length !== 7 ||
        parsedInputPath[0] !== 'apps' ||
        parsedInputPath[1] !== `${process.env.APP_NAME}` ||
        parsedInputPath[6] !== 'input') {
        console.log(`Not supported path pattern: ${inputPath}`);
        return;
    }

    // 2. call GET /tasks/{task_id}
    const inputValue = tx.tx_body.operation.value;
    const options = JSON.parse(inputValue);

    const hashedValue = CryptoJS.SHA512(inputValue).toString(CryptoJS.enc.Hex);
    if(cache.get(hashedValue)) {
        cache.ttl( hashedValue, 60 )
        return;
    }
    cache.set(hashedValue, true, 60);

    const task_id = options.task_id;
    
    const SDResult = await axios.get(`${SD_INPAINTING_ENDPOINT}/tasks/${task_id}`);

    if (SDResult.data.status !== "completed") {
        console.log(`Task ${task_id} is not completed!`);
        res.send(`Task ${task_id} is not completed!`);
        cache.del(hashedValue);
        return;
    }
    
    //pre-check the output path
    const outputPath = formatPath([...parsedInputPath.slice(0, parsedInputPath.length - 1), "signed_data"]);

    const signedData = ain.wallet.sign(JSON.stringify(SDResult.data.result));

    const writeData = {
        "status": `${SDResult.data.status}`,
        "updated_at": `${SDResult.data.updated_at}`,
        "result": `${signedData}`
    };

    const setValueRes = await ain.db.ref(outputPath).setValue({
      value: `${JSON.stringify(writeData)}`,
      nonce: -1,
      gas_price: 500
    })
    .catch((e) => {
      console.error(`setValue failure:`, e);
    });

    if(setValueRes.result.code != 0) {
      cache.del(hashedValue);
    }
});

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});
