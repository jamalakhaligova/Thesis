var eVote = artifacts.require("./eVote.sol");

contract("eVote", function(accounts) {
  var evoteInstance;
  
  it("starts with three candidates", function() {
    return eVote.deployed().then(function(instance) {
      return instance.totalCandidates();
    }).then(function(candidates) {
      assert.equal(candidates, 3);
    });
  });
  
  it("initializes with correct ids", function() {
    return eVote.deployed().then(function(instance) {
      evoteInstance = instance;
      return evoteInstance.candidates(1);
    }).then(function(candidate) {
      assert.equal(candidate[0], 1, "contains the correct id");
      return evoteInstance.candidates(2);
    }).then(function(candidate) {
      assert.equal(candidate[0], 2, "contains the correct id");
	  return evoteInstance.candidates(3);
    }).then(function(candidate) {
      assert.equal(candidate[0], 3, "contains the correct id");
    });
  });
  
   it("allows to cast a vote", function() {
    return eVote.deployed().then(function(instance) {
      evoteInstance = instance;
      candidateId = 1;
      return evoteInstance.vote(candidateId, { from: accounts[0] });
    }).then(function(receipt) {
      assert.equal(receipt.logs.length, 1, "an event was triggered");
      assert.equal(receipt.logs[0].event, "votedEvent", "the event type is correct");
      assert.equal(receipt.logs[0].args._voteIndex.toNumber(), candidateId, "the candidate id is correct");
      return evoteInstance.voters(accounts[0]);
    }).then(function(voter){
		var hasVoted = voter[1];
		return hasVoted;
	}).then(function(voted) {
      assert(voted, "the voter was marked as voted");
      return evoteInstance.candidates(candidateId);
    }).then(function(candidate) {
      var totalVotes = candidate[2];
      assert.equal(totalVotes, 1, "increments the candidate's vote count");
    })
  });
  
	it("throws an exception for invalid candiates", function() {
    return eVote.deployed().then(function(instance) {
      evoteInstance = instance;
      return evoteInstance.vote(44, { from: accounts[1] })
    }).then(assert.fail).catch(function(error) {
      assert(error.message.indexOf('revert') >= 0, "error message must contain revert");
      return evoteInstance.candidates(1);
    }).then(function(candidate1) {
      var totalVotes = candidate1[2];
      assert.equal(totalVotes, 1, "candidate 1 did not receive any votes");
      return evoteInstance.candidates(2);
    }).then(function(candidate2) {
      var totalVotes = candidate2[2];
      assert.equal(totalVotes, 0, "candidate 2 did not receive any votes");
	  return evoteInstance.candidates(3);
    }).then(function(candidate3) {
      var totalVotes = candidate3[2];
      assert.equal(totalVotes, 0, "candidate 3 did not receive any votes");
    });
  });
  
    it("throws an exception for double voting", function() {
    return eVote.deployed().then(function(instance) {
      evoteInstance = instance;
      candidateId = 1;
      evoteInstance.vote(candidateId, { from: accounts[1] });
      return evoteInstance.candidates(candidateId);
    }).then(function(candidate) {
      var totalVotes = candidate[2];
      assert.equal(totalVotes, 1, "accepts first vote");
      // Try to vote again
      return evoteInstance.vote(candidateId, { from: accounts[1] });
    }).then(assert.fail).catch(function(error) {
      assert(error.toString().indexOf('revert') >= -1, "error message must contain revert");
	  return electionInstance.candidates(1);
    }).then(function(candidate1) {
      var voteCount = candidate1[2];
      assert.equal(voteCount, 1, "candidate 1 did not receive any votes");
      return electionInstance.candidates(2);
    }).then(function(candidate2) {
      var voteCount = candidate2[2];
      assert.equal(voteCount, 1, "candidate 2 did not receive any votes");
    });
  });

});