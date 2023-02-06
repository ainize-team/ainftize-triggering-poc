const prompts = require("prompts");
const lodash = require("lodash");
const { ainCreateAccount } = require("./CreateAccount");
const { ainCreateApp } = require("./CreateApp");
const { ainSetRule } = require("./SetRule");
const { ainSetValue } = require("./SetValue");
const { ainSetFunction } = require("./SetFunction");

const commandList = [
  "1. Create Account",
  "2. Create App",
  "3. SET_RULE",
  "4. SET_FUNCTION",
  "5. SET_VALUE",
];
var [appResponse, appName, appPath] = [undefined, undefined, undefined];

const commadQuestion = [
  {
    type: "text",
    name: "command",
    message: `Select command`,
  },
];

const appQuestion = [
  {
    type: "text",
    name: "appName",
    message: `Enter app name`,
  },
];

const addressQuestion = [
  {
    type: "text",
    name: "address",
    message: `Enter target address`,
  },
];

const setValueQuestion = [
  {
    type: "text",
    name: "model",
    message: `Enter model`,
  },
  {
    type: "text",
    name: "tokenId",
    message: `Enter token id`,
  },
];

const setFunctionQuestion = [
  {
    type: "text",
    name: "url",
    message: `Enter url`,
  },
];

(async () => {
  while (true) {
    console.log(`Select Command\n${commandList.join("\n")}`);
    const commandResponse = await prompts(commadQuestion);
    const command = commandResponse.command;
    if (!isNaN(command) && lodash.inRange(command, 1, 5)) {
      console.log("------------------------------------------");
      console.log(`${commandList[command - 1]} selected`);
    }
    switch (command) {
      case "1":
        await ainCreateAccount();
        break;

      case "2":
        appResponse = await prompts(appQuestion);
        appName = appResponse.appName;
        await ainCreateApp(appName);
        break;

      case "3":
        if (!appName) {
          appResponse = await prompts(appQuestion);
          appName = appResponse.appName;
        }
        appPath = `/apps/${appName}`;

        // const addressResponse = await prompts(addressQuestion);
        // const targetAddress = addressResponse.address;
        // await ainSetRule(appPath, targetAddress);
        await ainSetRule(appPath, "");
        break;

      case "4":
        if (!appName) {
          appResponse = await prompts(appQuestion);
          appName = appResponse.appName;
        }
        appPath = `/apps/${appName}`;
        const setFunctionResponse = await prompts(setFunctionQuestion);
        const url = setFunctionResponse.url;
        await ainSetFunction(appPath, url);
        break;

      case "5":
        if (!appName) {
          appResponse = await prompts(appQuestion);
          appName = appResponse.appName;
        }
        appPath = `/apps/${appName}`;
        const setValueResponse = await prompts(setValueQuestion);
        const model = setValueResponse.model;
        const tokenId = setValueResponse.tokenId;
        await ainSetValue(appPath, model, tokenId);
        break;

      default:
        console.log("------------------------------------------");
        console.log("Exit script");
        process.exit(1);
    }
    console.log("------------------------------------------");
    setTimeout(() => console.log("wait for 10 seconds"), 10000);
  }
})();
