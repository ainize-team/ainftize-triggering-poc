const Ain = require("@ainblockchain/ain-js").default;
const ain = new Ain("https://testnet-api.ainetwork.ai", 0);

require("dotenv").config();
const { PRIVATE_KEY } = process.env;

const ainSetFunction = async (appPath, url) => {
  const private_key = PRIVATE_KEY;
  const uid = ain.wallet.addAndSetDefaultAccount(private_key);

  const functionPath = `${appPath}/$model/$uid/$tokenId/$timestamp/input`;
  const res = await ain.db.ref(functionPath).setFunction({
    value: {
      ".function": {
        "sd-bot-trigger": {
          function_type: "REST",
          function_url: `${url}`,
          function_id: "sd-bot-trigger",
        },
      },
    },
    nonce: -1,
  });

  if (res) {
    console.log(
      `Set Function at Target Path Succeeded.\nCheck TX in testnet-insight.ainetwork.ai: ${res.tx_hash}`
    );
  }
};

module.exports = { ainSetFunction: ainSetFunction };
