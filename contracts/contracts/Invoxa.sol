// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title Invoxa
 * @dev Invoice management and payment tracking contract on BOT Chain
 */
contract Invoxa is Ownable, ReentrancyGuard {
    // Counter for invoice IDs
    uint256 private invoiceCounter;

    // Invoice status enum
    enum InvoiceStatus {
        Pending,
        Paid,
        Cancelled
    }

    // Invoice struct
    struct Invoice {
        uint256 id;
        address issuer;
        address client;
        string description;
        uint256 amount;
        uint256 dueDate;
        InvoiceStatus status;
        string invoiceNumber;
        uint256 createdAt;
        uint256 paidAt;
    }

    // Payment receipt struct
    struct PaymentReceipt {
        uint256 invoiceId;
        address paidBy;
        uint256 amount;
        uint256 timestamp;
        string transactionHash;
    }

    // Mappings
    mapping(uint256 => Invoice) public invoices;
    mapping(uint256 => PaymentReceipt[]) public paymentHistory;
    mapping(address => uint256[]) public issuerInvoices;
    mapping(address => uint256[]) public clientInvoices;

    // Events
    event InvoiceCreated(
        uint256 indexed invoiceId,
        address indexed issuer,
        address indexed client,
        uint256 amount,
        uint256 dueDate,
        string invoiceNumber
    );

    event InvoicePaid(
        uint256 indexed invoiceId,
        address indexed paidBy,
        uint256 amount,
        uint256 timestamp
    );

    event InvoiceCancelled(
        uint256 indexed invoiceId,
        address indexed issuer
    );

    event PaymentReceived(
        address indexed from,
        address indexed to,
        uint256 amount,
        uint256 indexed invoiceId
    );

    modifier invoiceExists(uint256 invoiceId) {
        require(invoiceId < invoiceCounter, "Invoice does not exist");
        _;
    }

    // Constructor
    constructor() Ownable(msg.sender) {}

    /**
     * @dev Create a new invoice
     */
    function createInvoice(
        address _client,
        string memory _description,
        uint256 _amount,
        uint256 _dueDate,
        string memory _invoiceNumber
    ) external nonReentrant returns (uint256) {
        require(_client != address(0), "Invalid client address");
        require(_amount > 0, "Amount must be greater than 0");
        require(_dueDate > block.timestamp, "Due date must be in the future");
        require(bytes(_description).length > 0, "Description cannot be empty");

        uint256 invoiceId = invoiceCounter;
        invoiceCounter++;

        invoices[invoiceId] = Invoice({
            id: invoiceId,
            issuer: msg.sender,
            client: _client,
            description: _description,
            amount: _amount,
            dueDate: _dueDate,
            status: InvoiceStatus.Pending,
            invoiceNumber: _invoiceNumber,
            createdAt: block.timestamp,
            paidAt: 0
        });

        issuerInvoices[msg.sender].push(invoiceId);
        clientInvoices[_client].push(invoiceId);

        emit InvoiceCreated(
            invoiceId,
            msg.sender,
            _client,
            _amount,
            _dueDate,
            _invoiceNumber
        );

        return invoiceId;
    }

    /**
     * @dev Pay an invoice
     */
    function payInvoice(uint256 _invoiceId) external payable nonReentrant invoiceExists(_invoiceId) {
        Invoice storage invoice = invoices[_invoiceId];

        require(
            invoice.status == InvoiceStatus.Pending,
            "Invoice is not pending"
        );
        require(msg.value >= invoice.amount, "Insufficient payment amount");
        require(msg.sender == invoice.client, "Only client can pay");

        invoice.status = InvoiceStatus.Paid;
        invoice.paidAt = block.timestamp;

        // Record payment
        paymentHistory[_invoiceId].push(
            PaymentReceipt({
                invoiceId: _invoiceId,
                paidBy: msg.sender,
                amount: msg.value,
                timestamp: block.timestamp,
                transactionHash: ""
            })
        );

        // Transfer payment to issuer
        (bool success, ) = invoice.issuer.call{value: invoice.amount}("");
        require(success, "Payment transfer failed");

        // Refund excess payment
        if (msg.value > invoice.amount) {
            (bool refundSuccess, ) = msg.sender.call{
                value: msg.value - invoice.amount
            }("");
            require(refundSuccess, "Refund failed");
        }

        emit InvoicePaid(_invoiceId, msg.sender, msg.value, block.timestamp);
        emit PaymentReceived(msg.sender, invoice.issuer, invoice.amount, _invoiceId);
    }

    /**
     * @dev Cancel an invoice (only issuer)
     */
    function cancelInvoice(uint256 _invoiceId) external invoiceExists(_invoiceId) {
        Invoice storage invoice = invoices[_invoiceId];

        require(msg.sender == invoice.issuer, "Only issuer can cancel");
        require(
            invoice.status == InvoiceStatus.Pending,
            "Only pending invoices can be cancelled"
        );

        invoice.status = InvoiceStatus.Cancelled;

        emit InvoiceCancelled(_invoiceId, msg.sender);
    }

    /**
     * @dev Get invoice details
     */
    function getInvoice(uint256 _invoiceId)
        external
        view
        invoiceExists(_invoiceId)
        returns (
            address issuer,
            address client,
            string memory description,
            uint256 amount,
            uint256 dueDate,
            InvoiceStatus status,
            string memory invoiceNumber,
            uint256 createdAt,
            uint256 paidAt
        )
    {
        Invoice storage invoice = invoices[_invoiceId];
        return (
            invoice.issuer,
            invoice.client,
            invoice.description,
            invoice.amount,
            invoice.dueDate,
            invoice.status,
            invoice.invoiceNumber,
            invoice.createdAt,
            invoice.paidAt
        );
    }

    /**
     * @dev Get total number of invoices
     */
    function getTotalInvoices() external view returns (uint256) {
        return invoiceCounter;
    }

    /**
     * @dev Get invoices by issuer
     */
    function getIssuerInvoices(address _issuer)
        external
        view
        returns (uint256[] memory)
    {
        return issuerInvoices[_issuer];
    }

    /**
     * @dev Get invoices by client
     */
    function getClientInvoices(address _client)
        external
        view
        returns (uint256[] memory)
    {
        return clientInvoices[_client];
    }

    /**
     * @dev Get payment history for an invoice
     */
    function getPaymentHistory(uint256 _invoiceId)
        external
        view
        returns (PaymentReceipt[] memory)
    {
        return paymentHistory[_invoiceId];
    }

    /**
     * @dev Check if invoice is overdue
     */
    function isOverdue(uint256 _invoiceId) external view invoiceExists(_invoiceId) returns (bool) {
        Invoice storage invoice = invoices[_invoiceId];
        return (invoice.status == InvoiceStatus.Pending &&
            block.timestamp > invoice.dueDate);
    }

    /**
     * @dev Withdraw contract balance (owner only)
     */
    function withdraw() external onlyOwner nonReentrant {
        (bool success, ) = owner().call{value: address(this).balance}("");
        require(success, "Withdrawal failed");
    }

    /**
     * @dev Receive ETH
     */
    receive() external payable {}
}
