var candidateId;

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
      return App.render();
    });
  },

  listenForEvents: function() {
    App.contracts.eVote.deployed().then(function(instance) {
	  instance.votedEvent({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function(error, event) {
        console.log("event triggered", event);
      });

    });

  },
  
    setNames: function() {
	  var index = 1;
	  App.contracts.eVote.deployed().then(function(instance) {
      evoteInstance = instance;
      return evoteInstance.totalCandidates();
    }).then(function(totalCandidates) {
		for (var i = 1; i <= totalCandidates; i++) {
        evoteInstance.candidates(i).then(function(candidate) {
          var id = candidate[0];
          var name = candidate[1];
          var voteCount = candidate[2];
		  $("#candidate" + index.toString()).html(web3.toAscii(name));
		  index++;
        });
      }
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
		  		
          candidateTemplate = "<tr><th>" + id + "</th><td>" + web3.toAscii(name) + "</td><td>" + voteCount + "</td></tr>"
		  candidatesResults.append(candidateTemplate);
		  console.log(candidatesResults);
        });
      }
      return evoteInstance.voters(App.account);
    }).then(function(voter){
		return voter[1];
	}).then(function(hasVoted) {
      if(hasVoted) {
        $('#votepoll').hide();
		$('#warning').show();
		console.log("You already voted");
      }

    }).catch(function(error) {
      console.warn(error);
    });
  },

  castVote: function() {
	  console.log("candidate id is " + candidateId);
	  App.contracts.eVote.deployed().then(function(instance) {
      return instance.vote(candidateId, { from: App.account });
    }).then(function(result) {
      // Wait for votes to update
	  $('#votepoll').hide();
	  window.location.replace("http://localhost:3000/results.html");
    }).catch(function(err) {
      console.error(err);
    });
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
