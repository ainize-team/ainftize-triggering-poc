const Ain = require("@ainblockchain/ain-js").default;
const ain = new Ain("https://testnet-api.ainetwork.ai", 0);
const fs = require("fs");
const envfile = require("envfile");
const envPath = ".env";

const ainCreateAccount = async () => {
  const accounts = ain.wallet.create(1);
  const myAddress = accounts[0];
  ain.wallet.setDefaultAccount(myAddress);

  const accountInfo = Object.fromEntries(Object.entries(ain.wallet.defaultAccount).map(([key, val]) => [key.toUpperCase(), val]));
  
  try {
    await fs.promises.writeFile(envPath, envfile.stringify(accountInfo));
    console.log(`Account Created : ${ain.wallet.defaultAccount.address}`);
  } catch (err) {
    console.log(err);
  }
};

module.exports = { ainCreateAccount: ainCreateAccount };