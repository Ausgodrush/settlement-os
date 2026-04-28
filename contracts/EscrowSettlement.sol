// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title EscrowSettlement
 * @notice Phase 2 — Smart contract escrow for Property Settlement OS.
 *
 * DESIGN PRINCIPLES:
 * - Backend (NestJS) is the DECISION engine. It evaluates all conditions.
 * - This contract is the EXECUTION layer only. It holds and releases funds.
 * - The contract never independently decides when to release — it waits for
 *   backend authorisation via a trusted oracle/relayer key.
 * - No blockchain-specific business logic (no condition checking here).
 *
 * FLOW:
 *   1. Buyer deposits purchase price minus deposit (or full amount).
 *   2. Backend validates all settlement conditions off-chain.
 *   3. Backend calls releaseFunds() via a trusted relayer wallet.
 *   4. Funds transfer to seller. Deal is marked SETTLED on-chain.
 *
 * DEPLOYMENT: Polygon (Mumbai testnet → Polygon mainnet)
 * Why Polygon: low gas fees, fast finality, EVM-compatible.
 */

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract EscrowSettlement is Ownable, ReentrancyGuard {

    // ─── State ────────────────────────────────────────────────────────────────

    enum EscrowStatus {
        CREATED,    // Escrow initialised, awaiting deposit
        FUNDED,     // Buyer has deposited funds
        RELEASED,   // Backend authorised — funds sent to seller
        REFUNDED,   // Deal cancelled — funds returned to buyer
        DISPUTED    // Dispute raised — manual resolution required
    }

    struct Escrow {
        bytes32  dealId;          // Maps to deals.id in PostgreSQL (as bytes32)
        address  buyer;
        address  seller;
        address  relayer;         // Trusted backend relayer address
        uint256  amount;          // Purchase price in wei (or USDC units)
        EscrowStatus status;
        uint256  createdAt;
        uint256  settledAt;
        string   settlementRef;   // PEXA lodgement reference
    }

    // dealId → Escrow
    mapping(bytes32 => Escrow) public escrows;

    // ─── Events ───────────────────────────────────────────────────────────────

    event EscrowCreated(bytes32 indexed dealId, address buyer, address seller, uint256 amount);
    event EscrowFunded(bytes32 indexed dealId, uint256 amount, address funder);
    event FundsReleased(bytes32 indexed dealId, address seller, uint256 amount, string settlementRef);
    event FundsRefunded(bytes32 indexed dealId, address buyer, uint256 amount, string reason);
    event DisputeRaised(bytes32 indexed dealId, address raisedBy, string reason);

    // ─── Constructor ──────────────────────────────────────────────────────────

    constructor() Ownable(msg.sender) {}

    // ─── Modifiers ────────────────────────────────────────────────────────────

    modifier onlyRelayer(bytes32 dealId) {
        require(
            msg.sender == escrows[dealId].relayer || msg.sender == owner(),
            "Only authorised relayer can call this"
        );
        _;
    }

    modifier inStatus(bytes32 dealId, EscrowStatus expected) {
        require(escrows[dealId].status == expected, "Escrow not in required status");
        _;
    }

    // ─── Functions ────────────────────────────────────────────────────────────

    /**
     * @notice Create an escrow for a deal.
     *         Called by the backend when a deal moves to ACTIVE.
     * @param dealId       UUID from PostgreSQL, encoded as bytes32
     * @param buyer        Buyer's wallet address
     * @param seller       Seller's wallet address
     * @param amount       Expected deposit amount in wei
     * @param relayer      Trusted backend relayer wallet address
     */
    function createEscrow(
        bytes32 dealId,
        address buyer,
        address seller,
        uint256 amount,
        address relayer
    ) external onlyOwner {
        require(escrows[dealId].buyer == address(0), "Escrow already exists for this deal");
        require(buyer != address(0) && seller != address(0), "Invalid party address");
        require(amount > 0, "Amount must be > 0");

        escrows[dealId] = Escrow({
            dealId: dealId,
            buyer: buyer,
            seller: seller,
            relayer: relayer,
            amount: amount,
            status: EscrowStatus.CREATED,
            createdAt: block.timestamp,
            settledAt: 0,
            settlementRef: ""
        });

        emit EscrowCreated(dealId, buyer, seller, amount);
    }

    /**
     * @notice Buyer deposits funds into escrow.
     */
    function depositFunds(bytes32 dealId)
        external
        payable
        nonReentrant
        inStatus(dealId, EscrowStatus.CREATED)
    {
        Escrow storage e = escrows[dealId];
        require(msg.sender == e.buyer, "Only buyer can deposit");
        require(msg.value == e.amount, "Deposit must equal escrow amount");

        e.status = EscrowStatus.FUNDED;
        emit EscrowFunded(dealId, msg.value, msg.sender);
    }

    /**
     * @notice Backend relayer releases funds to seller after all conditions
     *         have been verified off-chain.
     *
     *         IMPORTANT: This function trusts the relayer completely.
     *         The backend is responsible for all condition validation.
     *         This contract does NOT re-evaluate conditions — it only executes.
     *
     * @param dealId            The deal identifier
     * @param settlementRef     PEXA lodgement reference for audit trail
     */
    function releaseFunds(bytes32 dealId, string calldata settlementRef)
        external
        nonReentrant
        onlyRelayer(dealId)
        inStatus(dealId, EscrowStatus.FUNDED)
    {
        Escrow storage e = escrows[dealId];
        uint256 amount = e.amount;

        e.status = EscrowStatus.RELEASED;
        e.settledAt = block.timestamp;
        e.settlementRef = settlementRef;

        (bool success, ) = e.seller.call{value: amount}("");
        require(success, "Transfer to seller failed");

        emit FundsReleased(dealId, e.seller, amount, settlementRef);
    }

    /**
     * @notice Refund buyer if deal is cancelled.
     *         Can only be called by relayer or contract owner.
     */
    function refundBuyer(bytes32 dealId, string calldata reason)
        external
        nonReentrant
        onlyRelayer(dealId)
        inStatus(dealId, EscrowStatus.FUNDED)
    {
        Escrow storage e = escrows[dealId];
        uint256 amount = e.amount;

        e.status = EscrowStatus.REFUNDED;

        (bool success, ) = e.buyer.call{value: amount}("");
        require(success, "Refund to buyer failed");

        emit FundsRefunded(dealId, e.buyer, amount, reason);
    }

    /**
     * @notice Raise a dispute (pauses automated flow).
     *         Requires manual resolution by contract owner (legal arbiter).
     */
    function raiseDispute(bytes32 dealId, string calldata reason)
        external
        inStatus(dealId, EscrowStatus.FUNDED)
    {
        Escrow storage e = escrows[dealId];
        require(
            msg.sender == e.buyer || msg.sender == e.seller || msg.sender == e.relayer,
            "Only deal parties can raise dispute"
        );
        e.status = EscrowStatus.DISPUTED;
        emit DisputeRaised(dealId, msg.sender, reason);
    }

    // ─── View Functions ───────────────────────────────────────────────────────

    function getEscrow(bytes32 dealId) external view returns (Escrow memory) {
        return escrows[dealId];
    }

    function getEscrowStatus(bytes32 dealId) external view returns (EscrowStatus) {
        return escrows[dealId].status;
    }
}
