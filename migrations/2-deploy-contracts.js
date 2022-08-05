const LeveragedYieldFarm = artifacts.require("LeveragedYieldFarm");

module.exports = function(deployer) {
  // deployment steps
  deployer.deploy(LeveragedYieldFarm);
};