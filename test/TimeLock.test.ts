import { expect } from "chai";
import { ethers } from "hardhat";
import { TimeLock } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("TimeLock", function () {
  let timeLock: TimeLock;
  let owner: HardhatEthersSigner;
  let user1: HardhatEthersSigner;
  let user2: HardhatEthersSigner;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    const TimeLockFactory = await ethers.getContractFactory("TimeLock");
    timeLock = await TimeLockFactory.deploy();
  });

  describe("Deposit", function () {
    it("Nên cho phép deposit ETH với thời gian khóa", async function () {
      const depositAmount = ethers.parseEther("1.0");
      const lockDuration = 3600; // 1 giờ

      const tx = await timeLock.connect(user1).deposit(lockDuration, { value: depositAmount });
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt!.blockNumber);
      const expectedUnlockTime = block!.timestamp + lockDuration;

      await expect(tx)
        .to.emit(timeLock, "Deposited")
        .withArgs(user1.address, depositAmount, expectedUnlockTime, 0);

      const lockCount = await timeLock.getLockCount(user1.address);
      expect(lockCount).to.equal(1);

      const totalLocked = await timeLock.getTotalLocked(user1.address);
      expect(totalLocked).to.equal(depositAmount);
    });

    it("Không nên cho phép deposit với amount = 0", async function () {
      await expect(
        timeLock.connect(user1).deposit(3600, { value: 0 })
      ).to.be.revertedWith("Amount must be greater than 0");
    });

    it("Không nên cho phép deposit với lock duration = 0", async function () {
      await expect(
        timeLock.connect(user1).deposit(0, { value: ethers.parseEther("1.0") })
      ).to.be.revertedWith("Lock duration must be greater than 0");
    });

    it("Nên cho phép nhiều deposits từ cùng một user", async function () {
      await timeLock.connect(user1).deposit(3600, { value: ethers.parseEther("1.0") });
      await timeLock.connect(user1).deposit(7200, { value: ethers.parseEther("2.0") });

      const lockCount = await timeLock.getLockCount(user1.address);
      expect(lockCount).to.equal(2);

      const totalLocked = await timeLock.getTotalLocked(user1.address);
      expect(totalLocked).to.equal(ethers.parseEther("3.0"));
    });
  });

  describe("Withdraw", function () {
    it("Nên cho phép withdraw sau khi hết thời gian khóa", async function () {
      const depositAmount = ethers.parseEther("1.0");
      const lockDuration = 3600;

      await timeLock.connect(user1).deposit(lockDuration, { value: depositAmount });

      // Tăng thời gian lên sau khi hết lock
      await time.increase(lockDuration + 1);

      const balanceBefore = await ethers.provider.getBalance(user1.address);

      const tx = await timeLock.connect(user1).withdraw(0);
      const receipt = await tx.wait();
      const gasUsed = receipt!.gasUsed * receipt!.gasPrice;

      const balanceAfter = await ethers.provider.getBalance(user1.address);

      expect(balanceAfter).to.equal(balanceBefore + depositAmount - gasUsed);
    });

    it("Không nên cho phép withdraw trước khi hết thời gian khóa", async function () {
      const depositAmount = ethers.parseEther("1.0");
      const lockDuration = 3600;

      await timeLock.connect(user1).deposit(lockDuration, { value: depositAmount });

      await expect(
        timeLock.connect(user1).withdraw(0)
      ).to.be.revertedWith("Funds are still locked");
    });

    it("Không nên cho phép withdraw với invalid index", async function () {
      await expect(
        timeLock.connect(user1).withdraw(0)
      ).to.be.revertedWith("Invalid lock index");
    });

    it("Không nên cho phép withdraw 2 lần từ cùng một lock", async function () {
      const depositAmount = ethers.parseEther("1.0");
      const lockDuration = 3600;

      await timeLock.connect(user1).deposit(lockDuration, { value: depositAmount });
      await time.increase(lockDuration + 1);

      await timeLock.connect(user1).withdraw(0);

      await expect(
        timeLock.connect(user1).withdraw(0)
      ).to.be.revertedWith("No funds to withdraw");
    });
  });

  describe("View Functions", function () {
    it("getLockInfo nên trả về thông tin chính xác", async function () {
      const depositAmount = ethers.parseEther("1.0");
      const lockDuration = 3600;

      await timeLock.connect(user1).deposit(lockDuration, { value: depositAmount });

      const currentTime = await time.latest();
      const [amount, unlockTime, isUnlocked] = await timeLock.getLockInfo(user1.address, 0);

      expect(amount).to.equal(depositAmount);
      expect(unlockTime).to.be.closeTo(currentTime + lockDuration, 5);
      expect(isUnlocked).to.be.false;

      await time.increase(lockDuration + 1);

      const [, , isUnlockedAfter] = await timeLock.getLockInfo(user1.address, 0);
      expect(isUnlockedAfter).to.be.true;
    });

    it("getTotalLocked nên tính tổng đúng", async function () {
      await timeLock.connect(user1).deposit(3600, { value: ethers.parseEther("1.0") });
      await timeLock.connect(user1).deposit(7200, { value: ethers.parseEther("2.5") });
      await timeLock.connect(user1).deposit(10800, { value: ethers.parseEther("0.5") });

      const total = await timeLock.getTotalLocked(user1.address);
      expect(total).to.equal(ethers.parseEther("4.0"));
    });
  });
});
