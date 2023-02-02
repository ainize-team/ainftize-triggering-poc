const Ain = require("@ainblockchain/ain-js").default;
const ain = new Ain("https://testnet-api.ainetwork.ai", 0);

require("dotenv").config();
const { PRIVATE_KEY } = process.env;

const ainSetValue = async (appPath, model, tokenId) => {
  const private_key = PRIVATE_KEY;
  const uid = ain.wallet.addAndSetDefaultAccount(private_key);

  const userMessagePath = `${appPath}/${model}/${uid}/${tokenId}/${Date.now()}/input`;
  const res = await ain.db.ref(`${userMessagePath}`).setValue({
    value: `${JSON.stringify(message)}`,
    nonce: -1,
  });

  if (res) {
    console.log(`Set Value at Target Path Succeeded.\nCheck TX in testnet-insight.ainetwork.ai: ${res.tx_hash}`);
  }
};

const message = {
  task_id: "359f6368-df09-5d72-a69d-15ba1c67f6f3",
  prompt: "ainetwork",
  parts: "background",
  seed: 42,
  guidance_scale: 7.5,
  origin: "https://www.ainetwork.ai/",
  result: "https://testnet-insight.ainetwork.ai/",
  updated_at: "1673510381814",
  public_key: `313327d1d0fa2fa32319ecf3dc787c28d5757a44d95fddd67c686ed4aea404451a5a08dc2f1824a7fba2ffa3346b0c448b18b420812ae982eb6fd480f12cb378`,
};

module.exports = { ainSetValue: ainSetValue };
