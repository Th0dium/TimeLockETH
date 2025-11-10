// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

/**
 * @title TimeLockAdvanced
 * @dev Contract nâng cao để khóa ETH với tính năng authority và receiver riêng biệt
 * Lấy cảm hứng từ Time-Locked-Wallet (Solana)
 */
contract TimeLockAdvanced {
    // Authority Rights bitmask
    uint8 constant RIGHT_CHANGE_RECEIVER = 0x01;  // 0b0000_0001
    uint8 constant RIGHT_CHANGE_UNLOCK_TIME = 0x02;  // 0b0000_0010

    // Struct để lưu thông tin về mỗi vault
    struct Vault {
        address creator;         // Người tạo và gửi tiền
        address authority;       // Người có quyền quản trị (có thể là address(0))
        address receiver;        // Người nhận tiền
        uint256 amount;          // Số lượng ETH bị khóa
        uint256 unlockTime;      // Thời điểm có thể rút
        uint8 authorityRights;   // Quyền của authority (bitmask)
        bool withdrawn;          // Đã rút chưa
    }

    // Mapping từ creator => vaultId => Vault
    mapping(address => mapping(uint256 => Vault)) public vaults;

    // Mapping để đếm số vault của mỗi creator
    mapping(address => uint256) public vaultCount;

    // Events
    event VaultCreated(
        address indexed creator,
        uint256 indexed vaultId,
        address receiver,
        address authority,
        uint256 amount,
        uint256 unlockTime,
        uint8 authorityRights
    );
    event Withdrawn(address indexed receiver, uint256 indexed vaultId, uint256 amount);
    event ReceiverChanged(address indexed creator, uint256 indexed vaultId, address newReceiver);
    event UnlockTimeChanged(address indexed creator, uint256 indexed vaultId, uint256 newUnlockTime);

    // Errors
    error InvalidAmount();
    error InvalidUnlockTime();
    error AuthorityRightsWithoutAuthority();
    error InvalidVaultId();
    error StillLocked();
    error AlreadyWithdrawn();
    error OnlyReceiver();
    error OnlyAuthority();
    error AuthorityMissingRight();
    error TransferFailed();
    error NothingToWithdraw();

    /**
     * @dev Tạo vault mới với cấu hình nâng cao
     * @param _receiver Địa chỉ người nhận
     * @param _authority Địa chỉ authority (có thể là address(0) nếu không cần)
     * @param _lockDuration Thời gian khóa (giây)
     * @param _authorityRights Quyền của authority (bitmask)
     */
    function createVault(
        address _receiver,
        address _authority,
        uint256 _lockDuration,
        uint8 _authorityRights
    ) external payable returns (uint256) {
        if (msg.value == 0) revert InvalidAmount();
        if (_lockDuration == 0) revert InvalidUnlockTime();

        // Nếu không có authority thì rights phải là 0
        if (_authority == address(0) && _authorityRights != 0) {
            revert AuthorityRightsWithoutAuthority();
        }

        uint256 vaultId = vaultCount[msg.sender];
        uint256 unlockTime = block.timestamp + _lockDuration;

        vaults[msg.sender][vaultId] = Vault({
            creator: msg.sender,
            authority: _authority,
            receiver: _receiver,
            amount: msg.value,
            unlockTime: unlockTime,
            authorityRights: _authorityRights,
            withdrawn: false
        });

        vaultCount[msg.sender]++;

        emit VaultCreated(
            msg.sender,
            vaultId,
            _receiver,
            _authority,
            msg.value,
            unlockTime,
            _authorityRights
        );

        return vaultId;
    }

    /**
     * @dev Rút ETH từ vault (chỉ receiver mới được rút)
     * @param _creator Địa chỉ creator của vault
     * @param _vaultId ID của vault
     */
    function withdraw(address _creator, uint256 _vaultId) external {
        if (_vaultId >= vaultCount[_creator]) revert InvalidVaultId();

        Vault storage vault = vaults[_creator][_vaultId];

        if (msg.sender != vault.receiver) revert OnlyReceiver();
        if (block.timestamp < vault.unlockTime) revert StillLocked();
        if (vault.withdrawn) revert AlreadyWithdrawn();
        if (vault.amount == 0) revert NothingToWithdraw();

        uint256 amount = vault.amount;
        vault.withdrawn = true;
        vault.amount = 0;

        (bool success, ) = vault.receiver.call{value: amount}("");
        if (!success) revert TransferFailed();

        emit Withdrawn(vault.receiver, _vaultId, amount);
    }

    /**
     * @dev Thay đổi receiver (chỉ authority với quyền RIGHT_CHANGE_RECEIVER)
     * @param _creator Địa chỉ creator của vault
     * @param _vaultId ID của vault
     * @param _newReceiver Địa chỉ receiver mới
     */
    function setReceiver(
        address _creator,
        uint256 _vaultId,
        address _newReceiver
    ) external {
        if (_vaultId >= vaultCount[_creator]) revert InvalidVaultId();

        Vault storage vault = vaults[_creator][_vaultId];

        if (msg.sender != vault.authority) revert OnlyAuthority();
        if ((vault.authorityRights & RIGHT_CHANGE_RECEIVER) == 0) {
            revert AuthorityMissingRight();
        }
        if (vault.withdrawn) revert AlreadyWithdrawn();

        vault.receiver = _newReceiver;

        emit ReceiverChanged(_creator, _vaultId, _newReceiver);
    }

    /**
     * @dev Thay đổi unlock time (chỉ authority với quyền RIGHT_CHANGE_UNLOCK_TIME)
     * @param _creator Địa chỉ creator của vault
     * @param _vaultId ID của vault
     * @param _newUnlockTime Unlock time mới
     */
    function setUnlockTime(
        address _creator,
        uint256 _vaultId,
        uint256 _newUnlockTime
    ) external {
        if (_vaultId >= vaultCount[_creator]) revert InvalidVaultId();

        Vault storage vault = vaults[_creator][_vaultId];

        if (msg.sender != vault.authority) revert OnlyAuthority();
        if ((vault.authorityRights & RIGHT_CHANGE_UNLOCK_TIME) == 0) {
            revert AuthorityMissingRight();
        }
        if (vault.withdrawn) revert AlreadyWithdrawn();

        vault.unlockTime = _newUnlockTime;

        emit UnlockTimeChanged(_creator, _vaultId, _newUnlockTime);
    }

    /**
     * @dev Lấy thông tin vault
     */
    function getVaultInfo(address _creator, uint256 _vaultId)
        external
        view
        returns (
            address creator,
            address authority,
            address receiver,
            uint256 amount,
            uint256 unlockTime,
            uint8 authorityRights,
            bool withdrawn,
            bool isUnlocked
        )
    {
        if (_vaultId >= vaultCount[_creator]) revert InvalidVaultId();

        Vault memory vault = vaults[_creator][_vaultId];

        return (
            vault.creator,
            vault.authority,
            vault.receiver,
            vault.amount,
            vault.unlockTime,
            vault.authorityRights,
            vault.withdrawn,
            block.timestamp >= vault.unlockTime
        );
    }

    /**
     * @dev Tính tổng ETH đang bị khóa của một creator
     */
    function getTotalLocked(address _creator) external view returns (uint256) {
        uint256 total = 0;
        for (uint256 i = 0; i < vaultCount[_creator]; i++) {
            if (!vaults[_creator][i].withdrawn) {
                total += vaults[_creator][i].amount;
            }
        }
        return total;
    }

    /**
     * @dev Kiểm tra xem authority có quyền cụ thể không
     */
    function hasAuthorityRight(
        address _creator,
        uint256 _vaultId,
        uint8 _right
    ) external view returns (bool) {
        if (_vaultId >= vaultCount[_creator]) revert InvalidVaultId();

        Vault memory vault = vaults[_creator][_vaultId];
        return (vault.authorityRights & _right) != 0;
    }
}
