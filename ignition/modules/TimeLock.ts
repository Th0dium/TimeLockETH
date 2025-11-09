import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const TimeLockModule = buildModule("TimeLockModule", (m) => {
  const timeLock = m.contract("TimeLock");

  return { timeLock };
});

export default TimeLockModule;
