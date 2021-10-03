
// File: contracts/eVote.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.5.16;

contract eVote {
    struct Voter {
        bool hasVoted;
        uint vote;
    }
	
	struct VoterDetails{
		string email;
		string pass;
		string age;
		address addr;
		bool isRegistered;
		bool isLoggedIn;
		bool allowedToVote;
	
	}
	
    struct Candidate {
        uint id;
        bytes32 name;
        uint totalVotes;
    }
    
    address payable public chairman;
    
    mapping(address => Voter) public voters;
	mapping(address => VoterDetails) voterdetails;
	mapping(uint => address) voterList;
	
    mapping(uint => Candidate) public candidates;
    
    uint public totalVoters = 0;
    uint public totalCandidates = 0;
    
    constructor () public {
        chairman = (msg.sender);
        addCandidate("First Candidate");
        addCandidate("Second Candidate");
        addCandidate("Third Candidate");
    }
	
	/*function voterAuth(address _voter) public {
        require(msg.sender == chairman);
        for(uint i=0;i<totalVoters;i++) {
			if(voters[voterList[i]].user_adrs == _voter){
				voters[voterList[i]].allowedToVote = true;
			}
			
		}
    }*/
	
	
	function loginVoter(string memory _email, string memory _password) public returns (bool)
    {
		require(voterdetails[msg.sender].isRegistered);
		//require(!voterdetails[msg.sender].isLoggedIn);
        if (
			keccak256(abi.encodePacked(voterdetails[msg.sender].email)) ==
            keccak256(abi.encodePacked(_email))  &&
            keccak256(abi.encodePacked(voterdetails[msg.sender].pass)) ==
            keccak256(abi.encodePacked(_password))
			
        ) {
            voterdetails[msg.sender].isLoggedIn = true;
            return true;
        } else {
            return false;
        }
    }
	
	function registerVoter(string memory _email,string memory _password,string memory _age, address _addr) public returns (bool) {
		require(!voterdetails[msg.sender].isRegistered);
		voterList[totalVoters] = msg.sender;
		voterdetails[msg.sender] = VoterDetails(_email,_password,_age, _addr, true, false, false);
		totalVoters+= 1;
        return true;
    }
	
	/*function checkIsUserLogged(address _address) public view returns (bool) {
        return (voterdetails[_address].isLoggedIn);
    }
	
	function logout() public {
        voterdetails[msg.sender].isLoggedIn = false;
    }*/
	
	event votedEvent (
        uint indexed _voteIndex
    );
    
    function addCandidate(bytes32 _name) private {
        require(msg.sender == chairman);
        totalCandidates+= 1;
        candidates[totalCandidates] = Candidate(totalCandidates,_name, 0);
    }
	
	

    function vote(uint _voteIndex) public {
		require(_voteIndex > 0 && _voteIndex <= totalCandidates);       
        voters[msg.sender].vote = _voteIndex;
        voters[msg.sender].hasVoted = true;
        
        candidates[_voteIndex].totalVotes += 1;
		
		emit votedEvent(_voteIndex);
    }

}
