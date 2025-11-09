// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

/**
 * @title TimeLock
 * @dev Contract để khóa ETH trong một khoảng thời gian nhất định
 */
contract TimeLock {
    // Struct để lưu thông tin về mỗi khoản tiền bị khóa
    struct LockedFund {
        uint256 amount;        // Số lượng ETH bị khóa
        uint256 unlockTime;    // Thời điểm có thể rút (timestamp)
    }

    // Mapping từ địa chỉ người dùng đến danh sách các khoản tiền bị khóa
    mapping(address => LockedFund[]) public userLocks;

    // Events để theo dõi các hoạt động
    event Deposited(address indexed user, uint256 amount, uint256 unlockTime, uint256 lockIndex);
    event Withdrawn(address indexed user, uint256 amount, uint256 lockIndex);

    /**
     * @dev Gửi ETH vào contract và khóa trong một khoảng thời gian
     * @param _lockDuration Thời gian khóa tính bằng giây
     */
    function deposit(uint256 _lockDuration) external payable {
        require(msg.value > 0, "Amount must be greater than 0");
        require(_lockDuration > 0, "Lock duration must be greater than 0");

        uint256 unlockTime = block.timestamp + _lockDuration;

        userLocks[msg.sender].push(LockedFund({
            amount: msg.value,
            unlockTime: unlockTime
        }));

        uint256 lockIndex = userLocks[msg.sender].length - 1;

        emit Deposited(msg.sender, msg.value, unlockTime, lockIndex);
    }

    /**
     * @dev Rút ETH sau khi hết thời gian khóa
     * @param _lockIndex Index của khoản tiền muốn rút
     */
    function withdraw(uint256 _lockIndex) external {
        require(_lockIndex < userLocks[msg.sender].length, "Invalid lock index");

        LockedFund storage lock = userLocks[msg.sender][_lockIndex];

        require(lock.amount > 0, "No funds to withdraw");
        require(block.timestamp >= lock.unlockTime, "Funds are still locked");

        uint256 amount = lock.amount;
        lock.amount = 0; // Prevent re-entrancy

        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");

        emit Withdrawn(msg.sender, amount, _lockIndex);
    }

    /**
     * @dev Lấy số lượng các khoản tiền bị khóa của một địa chỉ
     * @param _user Địa chỉ cần kiểm tra
     * @return Số lượng locks
     */
    function getLockCount(address _user) external view returns (uint256) {
        return userLocks[_user].length;
    }

    /**
     * @dev Lấy thông tin chi tiết về một khoản tiền bị khóa
     * @param _user Địa chỉ người dùng
     * @param _lockIndex Index của lock
     * @return amount Số lượng ETH
     * @return unlockTime Thời điểm unlock
     * @return isUnlocked Đã unlock chưa
     */
    function getLockInfo(address _user, uint256 _lockIndex)
        external
        view
        returns (uint256 amount, uint256 unlockTime, bool isUnlocked)
    {
        require(_lockIndex < userLocks[_user].length, "Invalid lock index");

        LockedFund memory lock = userLocks[_user][_lockIndex];

        return (
            lock.amount,
            lock.unlockTime,
            block.timestamp >= lock.unlockTime
        );
    }

    /**
     * @dev Lấy tổng số ETH bị khóa của một địa chỉ
     * @param _user Địa chỉ cần kiểm tra
     * @return Tổng số ETH bị khóa
     */
    function getTotalLocked(address _user) external view returns (uint256) {
        uint256 total = 0;
        for (uint256 i = 0; i < userLocks[_user].length; i++) {
            total += userLocks[_user][i].amount;
        }
        return total;
    }
}
