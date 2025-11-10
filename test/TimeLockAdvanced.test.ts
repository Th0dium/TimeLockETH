import { expect } from "chai";
import { ethers } from "hardhat";
import { TimeLockAdvanced } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("TimeLockAdvanced", function () {
  let timeLock: TimeLockAdvanced;
  let creator: HardhatEthersSigner;
  let receiver: HardhatEthersSigner;
  let authority: HardhatEthersSigner;
  let other: HardhatEthersSigner;

  const RIGHT_CHANGE_RECEIVER = 0x01;
  const RIGHT_CHANGE_UNLOCK_TIME = 0x02;
  const RIGHT_BOTH = 0x03;

  beforeEach(async function () {
    [creator, receiver, authority, other] = await ethers.getSigners();

    const TimeLockFactory = await ethers.getContractFactory("TimeLockAdvanced");
    timeLock = await TimeLockFactory.deploy();
  });

  describe("Create Vault", function () {
    it("Nên tạo vault với đầy đủ thông tin", async function () {
      const amount = ethers.parseEther("1.0");
      const lockDuration = 3600;

      await expect(
        timeLock
          .connect(creator)
          .createVault(receiver.address, authority.address, lockDuration, RIGHT_BOTH, {
            value: amount,
          })
      )
        .to.emit(timeLock, "VaultCreated")
        .withArgs(
          creator.address,
          0,
          receiver.address,
          authority.address,
          amount,
          await time.latest() + lockDuration + 1,
          RIGHT_BOTH
        );

      const vaultCount = await timeLock.vaultCount(creator.address);
      expect(vaultCount).to.equal(1);
    });

    it("Nên tạo vault không có authority", async function () {
      const amount = ethers.parseEther("1.0");
      const lockDuration = 3600;

      await timeLock
        .connect(creator)
        .createVault(receiver.address, ethers.ZeroAddress, lockDuration, 0, {
          value: amount,
        });

      const [, auth, , , , authRights] = await timeLock.getVaultInfo(creator.address, 0);
      expect(auth).to.equal(ethers.ZeroAddress);
      expect(authRights).to.equal(0);
    });

    it("Không nên cho phép authority rights khi không có authority", async function () {
      await expect(
        timeLock
          .connect(creator)
          .createVault(receiver.address, ethers.ZeroAddress, 3600, RIGHT_BOTH, {
            value: ethers.parseEther("1.0"),
          })
      ).to.be.revertedWithCustomError(timeLock, "AuthorityRightsWithoutAuthority");
    });

    it("Không nên cho phép amount = 0", async function () {
      await expect(
        timeLock
          .connect(creator)
          .createVault(receiver.address, authority.address, 3600, RIGHT_BOTH, {
            value: 0,
          })
      ).to.be.revertedWithCustomError(timeLock, "InvalidAmount");
    });

    it("Không nên cho phép lock duration = 0", async function () {
      await expect(
        timeLock
          .connect(creator)
          .createVault(receiver.address, authority.address, 0, RIGHT_BOTH, {
            value: ethers.parseEther("1.0"),
          })
      ).to.be.revertedWithCustomError(timeLock, "InvalidUnlockTime");
    });
  });

  describe("Withdraw", function () {
    beforeEach(async function () {
      await timeLock
        .connect(creator)
        .createVault(receiver.address, authority.address, 3600, RIGHT_BOTH, {
          value: ethers.parseEther("1.0"),
        });
    });

    it("Receiver nên rút được sau khi unlock", async function () {
      await time.increase(3601);

      const balanceBefore = await ethers.provider.getBalance(receiver.address);

      const tx = await timeLock.connect(receiver).withdraw(creator.address, 0);
      const receipt = await tx.wait();
      const gasUsed = receipt!.gasUsed * receipt!.gasPrice;

      const balanceAfter = await ethers.provider.getBalance(receiver.address);

      expect(balanceAfter).to.equal(balanceBefore + ethers.parseEther("1.0") - gasUsed);
    });

    it("Không nên rút được trước khi unlock", async function () {
      await expect(
        timeLock.connect(receiver).withdraw(creator.address, 0)
      ).to.be.revertedWithCustomError(timeLock, "StillLocked");
    });

    it("Chỉ receiver mới rút được", async function () {
      await time.increase(3601);

      await expect(
        timeLock.connect(other).withdraw(creator.address, 0)
      ).to.be.revertedWithCustomError(timeLock, "OnlyReceiver");
    });

    it("Không nên rút được 2 lần", async function () {
      await time.increase(3601);

      await timeLock.connect(receiver).withdraw(creator.address, 0);

      await expect(
        timeLock.connect(receiver).withdraw(creator.address, 0)
      ).to.be.revertedWithCustomError(timeLock, "AlreadyWithdrawn");
    });
  });

  describe("Authority - Set Receiver", function () {
    beforeEach(async function () {
      await timeLock
        .connect(creator)
        .createVault(receiver.address, authority.address, 3600, RIGHT_CHANGE_RECEIVER, {
          value: ethers.parseEther("1.0"),
        });
    });

    it("Authority nên thay đổi được receiver", async function () {
      const newReceiver = other.address;

      await expect(
        timeLock.connect(authority).setReceiver(creator.address, 0, newReceiver)
      )
        .to.emit(timeLock, "ReceiverChanged")
        .withArgs(creator.address, 0, newReceiver);

      const [, , rcv] = await timeLock.getVaultInfo(creator.address, 0);
      expect(rcv).to.equal(newReceiver);
    });

    it("Chỉ authority mới được thay đổi receiver", async function () {
      await expect(
        timeLock.connect(other).setReceiver(creator.address, 0, other.address)
      ).to.be.revertedWithCustomError(timeLock, "OnlyAuthority");
    });

    it("Không nên thay đổi receiver nếu thiếu quyền", async function () {
      // Tạo vault mới không có RIGHT_CHANGE_RECEIVER
      await timeLock
        .connect(creator)
        .createVault(receiver.address, authority.address, 3600, RIGHT_CHANGE_UNLOCK_TIME, {
          value: ethers.parseEther("1.0"),
        });

      await expect(
        timeLock.connect(authority).setReceiver(creator.address, 1, other.address)
      ).to.be.revertedWithCustomError(timeLock, "AuthorityMissingRight");
    });

    it("Không nên thay đổi receiver sau khi withdrawn", async function () {
      await time.increase(3601);
      await timeLock.connect(receiver).withdraw(creator.address, 0);

      await expect(
        timeLock.connect(authority).setReceiver(creator.address, 0, other.address)
      ).to.be.revertedWithCustomError(timeLock, "AlreadyWithdrawn");
    });
  });

  describe("Authority - Set Unlock Time", function () {
    beforeEach(async function () {
      await timeLock
        .connect(creator)
        .createVault(receiver.address, authority.address, 3600, RIGHT_CHANGE_UNLOCK_TIME, {
          value: ethers.parseEther("1.0"),
        });
    });

    it("Authority nên thay đổi được unlock time", async function () {
      const currentTime = await time.latest();
      const newUnlockTime = currentTime + 7200;

      await expect(
        timeLock.connect(authority).setUnlockTime(creator.address, 0, newUnlockTime)
      )
        .to.emit(timeLock, "UnlockTimeChanged")
        .withArgs(creator.address, 0, newUnlockTime);

      const [, , , , unlockTime] = await timeLock.getVaultInfo(creator.address, 0);
      expect(unlockTime).to.equal(newUnlockTime);
    });

    it("Authority có thể giảm thời gian khóa", async function () {
      const currentTime = await time.latest();
      const newUnlockTime = currentTime + 1800; // Giảm xuống còn 30 phút

      await timeLock.connect(authority).setUnlockTime(creator.address, 0, newUnlockTime);

      const [, , , , unlockTime] = await timeLock.getVaultInfo(creator.address, 0);
      expect(unlockTime).to.equal(newUnlockTime);
    });

    it("Chỉ authority mới được thay đổi unlock time", async function () {
      const currentTime = await time.latest();

      await expect(
        timeLock.connect(other).setUnlockTime(creator.address, 0, currentTime + 7200)
      ).to.be.revertedWithCustomError(timeLock, "OnlyAuthority");
    });

    it("Không nên thay đổi unlock time nếu thiếu quyền", async function () {
      // Tạo vault mới không có RIGHT_CHANGE_UNLOCK_TIME
      await timeLock
        .connect(creator)
        .createVault(receiver.address, authority.address, 3600, RIGHT_CHANGE_RECEIVER, {
          value: ethers.parseEther("1.0"),
        });

      const currentTime = await time.latest();

      await expect(
        timeLock.connect(authority).setUnlockTime(creator.address, 1, currentTime + 7200)
      ).to.be.revertedWithCustomError(timeLock, "AuthorityMissingRight");
    });
  });

  describe("View Functions", function () {
    it("getVaultInfo nên trả về thông tin đầy đủ", async function () {
      await timeLock
        .connect(creator)
        .createVault(receiver.address, authority.address, 3600, RIGHT_BOTH, {
          value: ethers.parseEther("2.5"),
        });

      const [
        vaultCreator,
        vaultAuthority,
        vaultReceiver,
        amount,
        unlockTime,
        authRights,
        withdrawn,
        isUnlocked,
      ] = await timeLock.getVaultInfo(creator.address, 0);

      expect(vaultCreator).to.equal(creator.address);
      expect(vaultAuthority).to.equal(authority.address);
      expect(vaultReceiver).to.equal(receiver.address);
      expect(amount).to.equal(ethers.parseEther("2.5"));
      expect(authRights).to.equal(RIGHT_BOTH);
      expect(withdrawn).to.be.false;
      expect(isUnlocked).to.be.false;

      await time.increase(3601);

      const [, , , , , , , isUnlockedAfter] = await timeLock.getVaultInfo(creator.address, 0);
      expect(isUnlockedAfter).to.be.true;
    });

    it("getTotalLocked nên tính đúng", async function () {
      await timeLock
        .connect(creator)
        .createVault(receiver.address, authority.address, 3600, RIGHT_BOTH, {
          value: ethers.parseEther("1.0"),
        });

      await timeLock
        .connect(creator)
        .createVault(receiver.address, authority.address, 3600, RIGHT_BOTH, {
          value: ethers.parseEther("2.5"),
        });

      let total = await timeLock.getTotalLocked(creator.address);
      expect(total).to.equal(ethers.parseEther("3.5"));

      // Sau khi rút một vault
      await time.increase(3601);
      await timeLock.connect(receiver).withdraw(creator.address, 0);

      total = await timeLock.getTotalLocked(creator.address);
      expect(total).to.equal(ethers.parseEther("2.5"));
    });

    it("hasAuthorityRight nên kiểm tra đúng quyền", async function () {
      await timeLock
        .connect(creator)
        .createVault(receiver.address, authority.address, 3600, RIGHT_CHANGE_RECEIVER, {
          value: ethers.parseEther("1.0"),
        });

      const hasReceiverRight = await timeLock.hasAuthorityRight(
        creator.address,
        0,
        RIGHT_CHANGE_RECEIVER
      );
      const hasUnlockTimeRight = await timeLock.hasAuthorityRight(
        creator.address,
        0,
        RIGHT_CHANGE_UNLOCK_TIME
      );

      expect(hasReceiverRight).to.be.true;
      expect(hasUnlockTimeRight).to.be.false;
    });
  });

  describe("Multiple Vaults", function () {
    it("Creator nên tạo được nhiều vaults", async function () {
      await timeLock
        .connect(creator)
        .createVault(receiver.address, authority.address, 3600, RIGHT_BOTH, {
          value: ethers.parseEther("1.0"),
        });

      await timeLock
        .connect(creator)
        .createVault(other.address, ethers.ZeroAddress, 7200, 0, {
          value: ethers.parseEther("2.0"),
        });

      const count = await timeLock.vaultCount(creator.address);
      expect(count).to.equal(2);

      const [, , receiver0] = await timeLock.getVaultInfo(creator.address, 0);
      const [, , receiver1] = await timeLock.getVaultInfo(creator.address, 1);

      expect(receiver0).to.equal(receiver.address);
      expect(receiver1).to.equal(other.address);
    });
  });
});
