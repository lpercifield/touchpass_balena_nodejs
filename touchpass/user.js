var needle = require('needle');
var url = "https://uo2rlwa82g.execute-api.us-east-1.amazonaws.com/default/x-game?action="

//https://uo2rlwa82g.execute-api.us-east-1.amazonaws.com/default/x-game?action=addUser&endpoint=default/x-game
//https://uo2rlwa82g.execute-api.us-east-1.amazonaws.com/default/x-game?action=getAllUsers&endpoint=default/x-game

function getAction(action,callback){
    needle.get(url+action+"&endpoint=default/x-game", function(error, response) {
        if (!error && response.statusCode == 200){
            //console.log(response.body);
            callback(JSON.parse(response.body));
            //return response.body;
        }
          
      });
}

function postAction(action,payload,callback){
    var options = {
        content_type: 'application/json'
    };
    console.log(JSON.stringify(payload));
    needle.post(url+action+"&endpoint=default/x-game", JSON.stringify(payload),options, function(error, response) {
        if (!error && response.statusCode == 200){
            //console.log(response.body);
            callback(JSON.parse(response.body));
            //return response.body;
        }else if(response.statusCode != 200){
            console.log(response.body);
        }else{
            console.log(error);
        }
          
      });
}

function getHighScore(callback){
    //var obj = null;
    var data = getAction("queryAllGamesSortedByScore",function(jsonData){
        // const jsonAsArray = Object.keys(jsonData).map(function (key) {
        //   return jsonData[key];
        // })
        // .sort(function (itemA, itemB) {
        //   return itemA.score < itemB.score;
        // });
        callback(jsonData);

    });
  }

function getUserByCard(cardId,callback){
    var userObj = null;
    var jsonData = getAction("getAllUsers",function(jsonData){
        Object.keys(jsonData).forEach(function(key) {
            //console.log(key, jsonData[key]);
            if (typeof jsonData[key].Metadata.cardId !== 'undefined'){
                if(cardId == jsonData[key].Metadata.cardId){
                    //console.log(jsonData[key]);
                    userObj = jsonData[key]
                }
            }
        });
        callback(userObj);

    });
  }
  function getUserHighScore(userId,callback){
    //var userObj = null;
    var payload = {};
    payload.userID = userId
    var jsonData = postAction("queryGamesByUserSortedByScore",payload,function(jsonData){
        callback(jsonData);
    });
  }

  function addGame(payload,callback){
    //var userObj = null;
    // var payload = {};
    // payload.userID = userId
    var jsonData = postAction("addGame",payload,function(jsonData){
        callback(jsonData);
    });
  }
  module.exports = { getUserByCard, getHighScore,getUserHighScore,addGame };