
// File: contracts/eVote.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.5.16;

contract eVote {

    struct Voter {
        bytes32 name;
        bool hasVoted;
        uint vote; 
    }
    struct Candidate {
        uint id;
        bytes32 name;
        uint totalVotes;
    }
    
    address payable public chairman;
    
    mapping(address => Voter) public voters;
    mapping(uint => Candidate) public candidates;
    
    uint public totalVoters = 0;
    uint public totalCandidates = 0;
    
    constructor () public {
        chairman = (msg.sender);
        addCandidate("First Candidate");
        addCandidate("Second Candidate");
        addCandidate("Third Candidate");
    }
	
	event votedEvent (
        uint indexed _voteIndex
    );
	
    
    function addCandidate(bytes32 _name) private {
        require(msg.sender == chairman);
        totalCandidates+= 1;
        candidates[totalCandidates] = Candidate(totalCandidates,_name, 0);
    }

    function vote(uint _voteIndex) public {
        require(!voters[msg.sender].hasVoted);
		require(_voteIndex > 0 && _voteIndex <= totalCandidates);       
        voters[msg.sender].vote = _voteIndex;
        voters[msg.sender].hasVoted = true;
        
        candidates[_voteIndex].totalVotes += 1;
        totalVoters += 1;
		
		emit votedEvent(_voteIndex);
    }

}