import { ethers } from "hardhat";

async function main() {
  console.log("Deploying TimeLock (basic) contract...");

  // Get the contract factory
  const TimeLock = await ethers.getContractFactory("TimeLock");

  // Deploy the contract
  const timeLock = await TimeLock.deploy();

  await timeLock.waitForDeployment();

  const address = await timeLock.getAddress();

  console.log(`TimeLock deployed to: ${address}`);
  console.log("\nDeployment successful!");
  console.log(`\nVerify with:`);
  console.log(`npx hardhat verify --network sepolia ${address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
