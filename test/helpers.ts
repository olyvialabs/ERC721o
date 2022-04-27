const { ethers } = require("hardhat");

const deployContract = async function (
  contractName: string,
  constructorArgs: Array<any>
) {
  let factory;
  try {
    factory = await ethers.getContractFactory(contractName);
  } catch (e) {
    factory = await ethers.getContractFactory(
      contractName + "UpgradeableWithInit"
    );
  }
  let contract = await factory.deploy(...(constructorArgs || []));
  await contract.deployed();
  return contract;
};

export { deployContract };
