var evoteContract = artifacts.require("eVote");

module.exports = function(deployer){
    deployer.deploy(evoteContract);
}