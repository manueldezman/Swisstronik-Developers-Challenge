const { ethers } = require("hardhat");
const { sendSignedShieldedQuery, sendShieldedTransaction } = require("../test/utils");

async function main() {
    // Deploy Token
    const perc20 = await ethers.deployContract("PERC20Sample");
    await perc20.deployed();

    console.log(`PERC20Sample was deployed to ${perc20.address}`);

    const account = new ethers.Wallet(
      process.env.PRIVATE_KEY, 
      new hre.ethers.providers.JsonRpcProvider(hre.network.config.url)
    )

    // Mint token
    const tx = await account.sendTransaction({
      to: perc20.address,
      value: ethers.utils.parseEther("1.5")
    })
    await tx.wait()

    const beforeBalanceReq = await sendSignedShieldedQuery(
      account,
      perc20.address,
      perc20.interface.encodeFunctionData("balanceOf", [account.address]),
    );
  
    // transfer 1 token to 0x16af037878a6cAce2Ea29d39A3757aC2F6F7aac1
    const balance = perc20.interface.decodeFunctionResult("balanceOf", beforeBalanceReq)[0]
    console.log('balance before transfer: ', ethers.utils.formatEther(balance))

    const transferReq = await sendShieldedTransaction(
      account,
      perc20.address,
      perc20.interface.encodeFunctionData("transfer", ["0x16af037878a6cAce2Ea29d39A3757aC2F6F7aac1", ethers.utils.parseEther("1")]),
    );

    const afterBalanceReq = await sendSignedShieldedQuery(
      account,
      perc20.address,
      perc20.interface.encodeFunctionData("balanceOf", [account.address]),
    );

    const balance2 = perc20.interface.decodeFunctionResult("balanceOf", afterBalanceReq)[0]
    console.log('balance after transfer: ', ethers.utils.formatEther(balance2))
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
