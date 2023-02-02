const Ain = require("@ainblockchain/ain-js").default;
const ain = new Ain("https://testnet-api.ainetwork.ai", 0);

require("dotenv").config();
const { PRIVATE_KEY } = process.env;

const ainSetRule = async (appPath, targetAddress) => {
  const private_key = PRIVATE_KEY;
  const myAddress = ain.wallet.addAndSetDefaultAccount(private_key);

  const resPublic = await ain.db.ref(`${appPath}`).setRule({
    value: {
      ".rule": {
        write: true,
      },
    },
    nonce: -1,
  });

  if (resPublic) {
    console.log(
      `Target App set to public.\nCheck TX in testnet-insight.ainetwork.ai: ${resPublic.tx_hash}`
    );
  }

  // const resRestrict = await ain.db
  //   .ref(`${appPath}/$model/$uid/$tokenId/$timestamp/signed_data`)
  //   .setRule({
  //     value: {
  //       ".rule": {
  //         write: `${targetAddress} === '$address'`,
  //       },
  //     },
  //     nonce: -1,
  //   });

  // if (resRestrict) {
  //   console.log(
  //     `[${appPath}/$model/$uid/$tokenId/$timestamp/signed_data] only can be writed by ${targetAddress}.\nCheck TX in testnet-insight.ainetwork.ai: ${resRestrict.tx_hash}`
  //   );
  // }
};

module.exports = { ainSetRule: ainSetRule };
