import { ethers } from "hardhat";

async function main() {
  console.log("Deploying TimeLockAdvanced contract...");

  // Get the contract factory
  const TimeLockAdvanced = await ethers.getContractFactory("TimeLockAdvanced");

  // Deploy the contract
  const timeLock = await TimeLockAdvanced.deploy();

  await timeLock.waitForDeployment();

  const address = await timeLock.getAddress();

  console.log(`TimeLockAdvanced deployed to: ${address}`);
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
