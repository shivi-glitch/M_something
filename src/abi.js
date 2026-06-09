export const CONTRACT_ADDRESS = "0xYourDeployedContractAddressHere";

export const ABI = [
  "function deposit() public payable",
  "function submitTransaction(address _recipient, uint _amount) public",
  "function approveTransaction(uint txid) public",
  "function executeTransaction(uint txid) public",
  "function allTransactions(uint) public view returns (address recipient, uint amount, uint approvalCount, bool executed)",
  "function owners(uint) public view returns (address)",
  "function threshold() public view returns (uint)",
  "function isOwner(address) public view returns (bool)",
  "function approvals(uint, address) public view returns (bool)",
];