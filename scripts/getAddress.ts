import { ethers } from "ethers";

const privateKey = "bb9dce82f866b0424b86b46c9e25b72e2171ddaba79ccc7d9dcae71b8bbd311f";

const wallet = new ethers.Wallet(privateKey);

console.log("Private Key:", privateKey);
console.log("Public Address:", wallet.address);
