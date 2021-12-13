// File: contracts/eVote.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.5.16;

contract eVote {
    struct Voter {
        bool hasVoted;
        uint vote;
		bool isRegistered;
		bool isLoggedIn;
		bool allowedToVote;
    }
	struct VoterDetails{
		string email;
		string pass;
		string identityno;
	
	}
    struct Candidate {
        uint id;
        bytes32 name;
        uint totalVotes;
    }
	
	address chairman;
	

    mapping(address => Voter) public voters;
	mapping(address => VoterDetails) voterdetails; 
	mapping(uint => address) public voterList; //addresses of registered voters
    mapping(uint => Candidate) public candidates;
	
    uint public totalVoters = 0;
	uint public votedUsers = 0;
    uint public totalCandidates = 0;
	
	bool public registerCands = true;
	bool public authorizeUsers;
	bool public startVote;
	bool public finishedVote;
	bool public voteOngoing;
	
	constructor() public {
        chairman = msg.sender;
    }

	
	function voterAuth(string memory _voter) public returns (bool) {
		require(msg.sender == chairman);
		require(authorizeUsers);
		address _voter_addr = parseAddr(_voter);
		if(voters[_voter_addr].isRegistered){
			voters[_voter_addr].allowedToVote = true;
		}
		return voters[_voter_addr].allowedToVote;
    }
	
	//converts string memory address to solidity type address
	function parseAddr(string memory _a) internal pure returns (address _parsedAddress) {
		bytes memory tmp = bytes(_a);
		uint160 iaddr = 0;
		uint160 b1;
		uint160 b2;
		for (uint i = 2; i < 2 + 2 * 20; i += 2) {
			iaddr *= 256;
			b1 = uint160(uint8(tmp[i]));
			b2 = uint160(uint8(tmp[i + 1]));
			if ((b1 >= 97) && (b1 <= 102)) {
				b1 -= 87;
			} else if ((b1 >= 65) && (b1 <= 70)) {
				b1 -= 55;
			} else if ((b1 >= 48) && (b1 <= 57)) {
				b1 -= 48;
			}
			if ((b2 >= 97) && (b2 <= 102)) {
				b2 -= 87;
			} else if ((b2 >= 65) && (b2 <= 70)) {
				b2 -= 55;
			} else if ((b2 >= 48) && (b2 <= 57)) {
				b2 -= 48;
			}
			iaddr += (b1 * 16 + b2);
		}
		return address(iaddr);
	}
	
	
	function loginVoter(string memory _email, string memory _password) public returns (bool)
    {
		require(voters[msg.sender].isRegistered);
        require (
			keccak256(abi.encodePacked(voterdetails[msg.sender].email)) ==
            keccak256(abi.encodePacked(_email))  &&
            keccak256(abi.encodePacked(voterdetails[msg.sender].pass)) ==
            keccak256(abi.encodePacked(_password))
			
        );
		
        voters[msg.sender].isLoggedIn = true;
    }
	
	function registerVoter(string memory _email,string memory _password,string memory _idno) public returns (bool) {
		require(!voters[msg.sender].isRegistered);
		totalVoters+= 1;
		voterList[totalVoters] = msg.sender;
		voters[msg.sender].isRegistered = true;
		voterdetails[msg.sender] = VoterDetails(_email,_password,_idno);
        return true;
    }
	
	function logout() public {
		require(voters[msg.sender].isLoggedIn);
        voters[msg.sender].isLoggedIn = false;
    }
	
	function authorizingUsers() public {
		require(msg.sender == chairman);
		authorizeUsers = true;
		registerCands = false;
	}
	
	function startVoting() public {
		require(msg.sender == chairman);
		startVote = true;
		voteOngoing = true;
		authorizeUsers = false;
	}
	
	function stopVoting() public {
		require(msg.sender == chairman);
		finishedVote = true;
		voteOngoing = false;
	}
	
	event votedEvent (
        uint indexed _voteIndex
    );
    
    function addCandidate(bytes32 _name) public {
		require(msg.sender == chairman);
		require(registerCands);
        totalCandidates+= 1;
        candidates[totalCandidates] = Candidate(totalCandidates,_name, 0);
    }
	

    function vote(uint _voteIndex) public {
		require(startVote && !finishedVote);
		require(!voters[msg.sender].hasVoted);
		require(voters[msg.sender].allowedToVote);
		require(_voteIndex > 0 && _voteIndex <= totalCandidates);

        voters[msg.sender].vote = _voteIndex;
        voters[msg.sender].hasVoted = true;
        candidates[_voteIndex].totalVotes += 1;
		votedUsers += 1;
		emit votedEvent(_voteIndex);
    }

}
