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

function getUserByCard(cardId,callback){
    var jsonData = getAction("getAllUsers",function(jsonData){
        Object.keys(jsonData).forEach(function(key) {
            //console.log(key, jsonData[key]);
            if (typeof jsonData[key].Metadata.cardId !== 'undefined'){
                if(cardId == jsonData[key].Metadata.cardId){
                    //console.log(jsonData[key]);
                    callback(jsonData[key].UserID);
                }
            }
        });

    });
    //const obj = JSON.parse(jsonData);

  
  }

  module.exports = { getUserByCard };