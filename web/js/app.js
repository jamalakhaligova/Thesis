var candidateId;
var accounts_list;
var candidatesResults;
var new_json;

function addAccount(email, pass){
	var $address = $(email);
	var emailaddress = $address.val();
	var $passw = $(pass);
	var pass_val = $passw.val();
	console.log(emailaddress);
	console.log(pass_val);
	//new_json = JSON.stringify(accounts_list.push({emailaddress: pass_val}));
	//console.log(accounts_list);
};

function adminLogin(email,pass) {
	var $address = $(email);
	var emailaddress = $address.val();
	var $passw = $(pass);
	var pass_val = $passw.val();
	console.log(emailaddress);
	console.log(pass_val);
	
	if(emailaddress == "admin@admin.com" && pass_val=="admin"){
		window.location.replace("http://localhost:3000/admin.html");
	}else{
		console.log("Wrong Credentials!");
	}
	
};

function setId(id) {
	candidateId = id;
}
App =  {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  hasVoted: false,
	  

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },

  initContract: function() {
    $.getJSON("eVote.json", function(evote) {
      App.contracts.eVote = TruffleContract(evote);
      App.contracts.eVote.setProvider(App.web3Provider);	
      App.listenForEvents();
	  App.setNames();
	  if(window.location.href == "http://localhost:3000/votingpoll.html" || window.location.href == "http://localhost:3000/results.html"){
		  return App.render();
	  }
	  
	  if(window.location.href == "http://localhost:3000/authentication.html"){
		  return App.listVoters();
	  }
    });
  },

  listenForEvents: function() {
    App.contracts.eVote.deployed().then(function(instance) {
	  instance.contract.events.votedEvent({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).on('error',function(error, event) {
        console.log("event triggered", event);
      });

    });

  },
  
    setNames: function() {
	  var index = 1;
	  
	  web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        App.account = account;
        $("#accountAddress").html("Your Account: " + account);
      }
    });
	  
	  App.contracts.eVote.deployed().then(function(instance) {
      evoteInstance = instance;
      return evoteInstance.totalCandidates();
    }).then(function(totalCandidates) {
		for (var i = 1; i <= totalCandidates; i++) {
        evoteInstance.candidates(i).then(function(candidate) {
          var id = candidate[0];
          var name = candidate[1];
          var voteCount = candidate[2];
		  $("#candidate" + index.toString()).html(web3.utils.toAscii(name));
		  index++;
        });
      }
    });  
  },
  
    checkLogin: function() {
	  $('#voterout').hide();
	  web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        App.account = account;
        $("#accountAddress").html("Your Account: " + account);
      }
    });
	  
	  App.contracts.eVote.deployed().then(function(instance) {
      evoteInstance = instance;
	  return evoteInstance.voters(App.account);
    }).then(function(voter) {
		var isLoggedIn = voter[3];
		if(isLoggedIn){
			$('#voterout').show();
		}else{
			$('#voterin').show();
		}	
    });  
  },
  
  authenticate : function(address) { 
	var $addrs = $(address);
	var address_val = $addrs.val();
	console.log(address_val);
	App.contracts.eVote.deployed().then(function(instance) {
      return instance.voterAuth(address_val, { from: App.account }	);
    }).then(function(result) {
		console.log("Authenticated. This user can vote now.");
    });
	  
  },

  render: function() {
    var evoteInstance;
    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        App.account = account;
        $("#accountAddress").html("Your Account: " + account);
      }
    });

	$('#warning').hide();
	$('#unlogged').hide();
	$('#authfail').hide();
	
    App.contracts.eVote.deployed().then(function(instance) {
      evoteInstance = instance;
      return evoteInstance.totalCandidates();
    }).then(function(totalCandidates) {
		candidatesResults = $("#candidatesResults");
		candidatesResults.text('')
		for (var i = 1; i <= totalCandidates; i++) {
        evoteInstance.candidates(i).then(function(candidate) {
          var id = candidate[0];
          var name = candidate[1];
          var voteCount = candidate[2];
		  		
          candidateTemplate = "<tr><th>" + id + "</th><td>" + web3.utils.toAscii(name) + "</td><td>" + voteCount + "</td></tr>"
		  candidatesResults.append(candidateTemplate);
		  console.log(candidatesResults);
        });
      }
      return evoteInstance.voters(App.account);
    }).then(function(voter){
		var hasVoted = voter[0];
		var isLoggedIn = voter[3];
		var isAllowed = voter[4];
		if(hasVoted) {
			$('#votepoll').hide();
			$('#warning').show();
			console.log("You already voted");
		}
		else if(!isLoggedIn){
			$('#votepoll').hide();
			$('#unlogged').show();
			console.log("Login first to vote");  
		}
		else if(!isAllowed){
			$('#votepoll').hide();
			$('#authfail').show();
			console.log("Admin didn't authorazed yet"); 
		}
	}).catch(function(error) {
		console.warn(error);
    });
  },
  
  listVoters: function() {
    var evoteInstance;
	
    App.contracts.eVote.deployed().then(function(instance) {
      evoteInstance = instance;
      return evoteInstance.totalVoters();
    }).then(function(totalVoters) {
		voterAddresses = $("#voterAddresses");
		voterAddresses.text('')
		for (var i = 1; i <= totalVoters; i++) {
			evoteInstance.voterList(i).then(function(voteraddr) {
          voterTemplate = "<tr><th>" + voteraddr + "</th><td></td></tr>"
		  voterAddresses.append(voterTemplate);
        });
      }
    })
  },
  
  isAuth: function(address) {  
	var evoteInstance;
    App.contracts.eVote.deployed().then(function(instance) {
      evoteInstance = instance;
	  return evoteInstance.voters(address)
	}).then(function(voter) {
		var auth = voter[4];
		if(auth){
			return "Yes";
		}
		else {
			return "No";
		}
	});  
  },
  
  loginUser : function(address,pass){
	var $address = $(address);
	var emailaddress = $address.val();
	var $passw = $(pass);
	var pass_val = $passw.val();
	


	
	App.contracts.eVote.deployed().then(function(instance) {
		//loginVoter(address _address, string memory _password)
		return instance.loginVoter(emailaddress,pass_val, {from: App.account}).on('receipt', function(){
			console.log("login function");
		}).then(function(successfulLogin){
			console.log(successfulLogin);
			if(!successfulLogin){
				console.log("Login credentials are incorrect");
			}else{
				window.location.replace("http://localhost:3000/votingpoll.html");
			}
		})
	})
	
  },
	
  register : function(email,age,pass, conpass){
	var $email = $(email);
	var emailaddress = $email.val();
	var $id_ = $(age);
	var ageval = $id_.val();

	var $passw = $(pass);
	var pass_val = $passw.val();
	var $cpassw = $(conpass);
	var confirmpass_val = $cpassw.val();
	
	console.log(jQuery.type(emailaddress));
	console.log(jQuery.type(pass_val));
	
	
	if(pass_val == confirmpass_val){
		console.log(App.contracts.eVote);
		App.contracts.eVote.deployed().then(function(instance) {
			//string memory _email,string memory _password,string memory _age
			return instance.registerVoter(emailaddress,pass_val,ageval, {from: App.account}).on('receipt', function(){
			console.log("registered");
			window.location.replace("http://localhost:3000/voter_login.html");
		}).catch(function(error){
			console.log("You already registered");
		})
		})
	}
	else{
		console.log("Passwords dont match");
	}
  },
  
  castVote: function() {
	  console.log("candidate id is " + candidateId);
	  App.contracts.eVote.deployed().then(function(instance) {
      return instance.vote(candidateId, { from: App.account });
    }).then(function(result) {
      // Wait for votes to update
	  $('#votepoll').hide();
	  window.location.replace("http://localhost:3000/results.html");
	  App.render();
	  console.log(candidatesResults);
    }).catch(function(err) {
      console.warn(err);
    });
  }

};

$(function() {
	$(window).on('load', function(){
		App.init();
	});
});
