import { Crypto, utils } from "ontology-ts-sdk";
import { addressOfHead } from "../api/constants";

export const gasPrice = 500;

export function getHeadContractAddress() {
  return new Crypto.Address(utils.reverseHex(addressOfHead));
}

export function reverseAddressHex(str) {
  return new Crypto.Address(utils.reverseHex(str));
}

export function cryptoAdress(adress) {
  return new Crypto.Address(adress);
}

export function cryptoPrivateKey(key) {
  return new Crypto.PrivateKey(key);
}

export function hexArrToArr(arr) {
  let res = [];
  for (let i = 0; i < arr.length; i++) {
    if (Array.isArray(arr[i])) {
      res.push({ [utils.hexstr2str(arr[i][0])]: utils.hexstr2str(arr[i][1]) });
    } else if (typeof arr[i] === "string" && arr[i] !== null) {
      res.push(utils.hexstr2str(arr[i]));
    }
  }
  return res;
}

export function parseExchangeRates(arr) {
  let res = [];

  for (let i = 0; i < arr.length; i++) {
    let sell = parseInt(utils.reverseHex(arr[i][1][0]), 16);
    let buy = parseInt(utils.reverseHex(arr[i][1][1]), 16);
    res.push({
      asset: utils.hexstr2str(arr[i][0]),
      buy: buy ? (buy / 100000000).toFixed(8) : 0,
      sell: sell ? (sell / 100000000).toFixed(8) : 0
    });
  }
  return res;
}

export function parseAmounts(arr) {
  let res = [];

  for (let i = 0; i < arr.length; i++) {
    let amount = parseInt(utils.reverseHex(arr[i][1]), 16);
    res.push({
      name: utils.hexstr2str(arr[i][0]),
      amount: amount ? (amount / 100000000).toFixed(8) : 0
    });
  }
  return res;
}

// Convert a hex string to a byte array
export function hexToBytes(hex) {
  for (var bytes = [], c = 0; c < hex.length; c += 2) bytes.push(parseInt(hex.substr(c, 2), 16));
  return bytes;
}
