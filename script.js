const ethers = require("ethers");
require("dotenv").config();

const provider = new ethers.providers.JsonRpcProvider(process.env.INFURA_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY);
const account = wallet.connect(provider);
const myAddress = account.address;
const daiInvestment = 180; // USD
const investmentDuration = 60; // seconds

const leveragedYieldFarmContract = new ethers.Contract(
  "0x4114c17f9B64Ef166916c31A058a80c6145D3047",
  [
    "function depositDai(uint256 initialAmount) external returns (bool)",
    "function withdrawDai(uint256 initialAmount) external returns (bool)",
  ],
  account
);

const daiContract = new ethers.Contract(
  "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  ["function balanceOf(address guy) external view returns (uint)"],
  account
);

const cDaiContract = new ethers.Contract(
  "0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643",
  ["function balanceOf(address guy) external view returns (uint)"],
  account
);

const compContract = new ethers.Contract(
  "0xc00e94Cb662C3520282E6f5717214004A7f26888",
  ["function balanceOf(address guy) external view returns (uint)"],
  account
);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const init = async () => {
  await leveragedYieldFarmContract.depositDai(
    ethers.utils.parseUnits(`${daiInvestment}`, "ether")
  );

  let ethBalanceBefore = await provider.getBalance(myAddress);
  let daiBalanceBefore = await daiContract.balanceOf(myAddress);
  let cDaiBalanceBefore = await cDaiContract.balanceOf(
    leveragedYieldFarmContract.address
  );
  let compBalanceBefore = await compContract.balanceOf(myAddress);

  console.log(
    `\nInvestment duration ${investmentDuration} seconds. Please wait...\n`
  );
  await sleep(investmentDuration);

  await leveragedYieldFarmContract.withdrawDai(
    ethers.utils.parseUnits(`${daiInvestment}`, "ether")
  );

  let ethBalanceAfter = await provider.getBalance(myAddress);
  let daiBalanceAfter = await daiContract.balanceOf(myAddress);
  let cDaiBalanceAfter = await cDaiContract.balanceOf(
    leveragedYieldFarmContract.address
  );
  let compBalanceAfter = await compContract.balanceOf(myAddress);

  require(ethBalanceAfter.lt(
    ethBalanceBefore
  ), "ETH balance should be decreased because of gas fee");
  require(daiBalanceAfter.gt(
    daiBalanceBefore
  ), "DAI should be increased because of interest");
  require(cDaiBalanceAfter.lt(
    cDaiBalanceBefore
  ), "cDAI should be decreased because we swap it back to DAI");
  require(compBalanceAfter.gt(
    compBalanceBefore
  ), "COMP should be increased because of interest");

  ethBalanceBefore = ethers.utils.formatUnits(ethBalanceBefore, "ether");
  daiBalanceBefore = ethers.utils.formatUnits(daiBalanceBefore, "ether");
  cDaiBalanceBefore = ethers.utils.formatUnits(cDaiBalanceBefore, "ether");
  compBalanceBefore = ethers.utils.formatUnits(compBalanceBefore, "ether");

  ethBalanceAfter = ethers.utils.formatUnits(ethBalanceAfter, "ether");
  daiBalanceAfter = ethers.utils.formatUnits(daiBalanceAfter, "ether");
  cDaiBalanceAfter = ethers.utils.formatUnits(cDaiBalanceAfter, "ether");
  compBalanceAfter = ethers.utils.formatUnits(compBalanceAfter, "ether");

  const results = {
    ethBalanceBefore: ethBalanceBefore,
    ethBalanceAfter: ethBalanceAfter,
    daiBalanceBefore: daiBalanceBefore,
    daiBalanceAfter: daiBalanceAfter,
    cDaiBalanceBefore: cDaiBalanceBefore,
    cDaiBalanceAfter: cDaiBalanceAfter,
    compBalanceBefore: compBalanceBefore,
    compBalanceAfter: compBalanceAfter,
  };
  console.table(results);
};

init();
