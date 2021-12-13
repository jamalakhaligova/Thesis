var eVote = artifacts.require("./eVote.sol");

contract("eVote", function(accounts) {
  var evoteInstance;
  
  it("starts with 0 candidates", function() {
    return eVote.deployed().then(function(instance) {
		evoteInstance = instance;
      return evoteInstance.totalCandidates();
    }).then(function(candidates) {
		assert.equal(candidates, 0);
	});
  });
  
  it("admin adds first candidate successfully", function() {
    return eVote.deployed().then(function(instance) {
		evoteInstance = instance;
      return evoteInstance.addCandidate(web3.utils.fromAscii("Angela"), { from: accounts[0] })
    }).then(function(receipt) {
		return evoteInstance.totalCandidates();
    }).then(function(candidates) {
		assert.equal(candidates, 1);
	});
  });
  
  it("successful registration for voter", function() {
    return eVote.deployed().then(function(instance) {
		evoteInstance = instance;
      return evoteInstance.registerVoter("blabla@gmail.com","somepass","1232142", {from: accounts[0]})
    }).then(function(receipt) {
		return evoteInstance.totalVoters();
    }).then(function(voters) {
		assert.equal(voters, 1);
	});
  });
  
  it("successful login for the registered voter", function() {
    return eVote.deployed().then(function(instance) {
		evoteInstance = instance;
      return evoteInstance.loginVoter("blabla@gmail.com","somepass", {from: accounts[0]})
    }).then(function(receipt) {
		return evoteInstance.voters(accounts[0]);
    }).then(function(voter) {
		assert.equal(true, voter[3]);
	});
  });
  
  it("admin successfully changes phase to validate voters", function() {
    return eVote.deployed().then(function(instance) {
		evoteInstance = instance;
      return evoteInstance.authorizingUsers({from: accounts[0]})
    }).then(function(receipt) {
		return evoteInstance.authorizeUsers();
    }).then(function(isAuthPhase) {
		assert.equal(true, isAuthPhase);
	});
  });
  
  it("admin successfully validated voter", function() {
    return eVote.deployed().then(function(instance) {
		evoteInstance = instance;
      return evoteInstance.voterAuth(accounts[0],{ from: accounts[0]})
    }).then(function(receipt) {
		return evoteInstance.voters(accounts[0]);
    }).then(function(voter) {
		assert.equal(true, voter[4]);
	});
  });
  
  it("admin can't validate unregistered user", function() {
    return eVote.deployed().then(function(instance) {
		evoteInstance = instance;
      return evoteInstance.voterAuth(accounts[2],{ from: accounts[0]})
    }).then(function(receipt) {
		return evoteInstance.voters(accounts[2]);
    }).then(function(voter) {
		assert.equal(false, voter[2]);
	});
  });
  
  it("admin successfully changes phase to start voting", function() {
    return eVote.deployed().then(function(instance) {
		evoteInstance = instance;
      return evoteInstance.startVoting({from: accounts[0]})
    }).then(function(receipt) {
		return evoteInstance.startVote();
    }).then(function(started) {
		assert.equal(true, started);
	});
  });
  
  it("validated voter casts vote ", function() {
    return eVote.deployed().then(function(instance) {
		evoteInstance = instance;
      return evoteInstance.vote(1,{from: accounts[0]})
    }).then(function(receipt) {
		return evoteInstance.voters(accounts[0]);
    }).then(function(voter) {
		assert.equal(true, voter[0]);
	});
  });
  
  it("throws an exception for invalid candidates", function() {
    return eVote.deployed().then(function(instance) {
		evoteInstance = instance;
      return evoteInstance.vote(44,{from: accounts[0]})
    }).then(assert.fail).catch(function(error) {
      assert(error.toString().indexOf('revert') >= 0, "error message must contain revert");
    });
  });
  
  it("throws an exception for double voting", function() {
    return eVote.deployed().then(function(instance) {
		evoteInstance = instance;
      return evoteInstance.vote(1,{from: accounts[0]});
    }).then(assert.fail).catch(function(error) {
      assert(error.toString().indexOf('revert') >= 0, "error message must contain revert");
    });
  });
  
  it("admin successfully tallies results", function() {
    return eVote.deployed().then(function(instance) {
		evoteInstance = instance;
      return evoteInstance.stopVoting({from: accounts[0]})
    }).then(function(receipt) {
		return evoteInstance.finishedVote();
    }).then(function(completed) {
		assert.equal(true, completed);
	});
  });


});