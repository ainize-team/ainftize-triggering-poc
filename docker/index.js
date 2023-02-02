const express = require('express');
const AinJs = require('@ainblockchain/ain-js').default;
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const { parsePath, formatPath } = require('./util');
const { default: Ain } = require('@ainblockchain/ain-js');

const app = express();

const port = 80;
const blockchainEndpoint = process.env.PROVIDER_URL;
const chainId = process.env.NETWORK === 'mainnet' ? 1 : 0;
const ain = new AinJs(blockchainEndpoint, chainId);
const BOT_PRIVKEY = process.env.AINIZE_INTERNAL_PRIVATE_KEY;
const BOT_ADDRESS = AinJs.utils.toChecksumAddress(ain.wallet.add(BOT_PRIVKEY));
// set BOT_ADDRESS as default wallet
ain.wallet.setDefaultAccount(BOT_ADDRESS);

const SD_INPAINTING_ENDPOINT = "https://comcom-pp-diffusers-inpaint-dev.ucanuse.xyz/";

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
        parsedInputPath[1] !== 'sf_ainft' ||
        parsedInputPath[2] !== 'sd_inpainting' ||
        parsedInputPath[6] !== 'input') {
        console.log(`Not supported path pattern: ${inputPath}`);
        return;
    }

    // 2. call GET /tasks/{task_id}
    const inputValue = tx.tx_body.operation.value;
    const options = JSON.parse(inputValue);

    const task_id = options.task_id;
    const pickedOptions = (({ prompt, seed, guidance_scale }) => ({ prompt, seed, guidance_scale }))(options);

    const callApi = axios.post(`${SD_INPAINTING_ENDPOINT}/${task_id}/validate`, pickedOptions).then((res) => {
        res.send(`Validation in progress... task-id: ${task_id}`)
    })


    //pre-check the output path

  
});

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});
