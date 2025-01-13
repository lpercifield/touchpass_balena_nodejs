var needle = require('needle');
var url = "https://uo2rlwa82g.execute-api.us-east-1.amazonaws.com/default/x-game?action="

//https://uo2rlwa82g.execute-api.us-east-1.amazonaws.com/default/x-game?action=addUser&endpoint=default/x-game
//https://uo2rlwa82g.execute-api.us-east-1.amazonaws.com/default/x-game?action=getAllUsers&endpoint=default/x-game

function getAction(action, callback) {
    needle.get(url + action + "&endpoint=default/x-game", function (error, response) {
        if (!error && response.statusCode == 200) {
            //console.log(response.body);
            callback(JSON.parse(response.body));
            //return response.body;
        } else if (response.statusCode != 200) {
            console.log("User get action: ", action, response.body);
        } else {
            console.log("User get action: ", action, error);
        }

    });
}

function postAction(action, payload, callback) {
    var options = {
        content_type: 'application/json'
    };
    console.log(JSON.stringify(payload));
    needle.post(url + action + "&endpoint=default/x-game", JSON.stringify(payload), options, function (error, response) {
        if (!error && response.statusCode == 200) {
            //console.log(response.body);
            callback(JSON.parse(response.body));
            //return response.body;
        } else if (response.statusCode != 200) {
            console.log("User post action: ", action, response.body);
        } else {
            console.log("User post action: ", action, error);
        }

    });
}

function getHighScore(callback) {
    //var obj = null;
    var data = getAction("queryAllGamesSortedByScore", function (jsonData) {
        const jsonAsArray = Object.keys(jsonData).map(function (key) {
            return jsonData[key];
        })
            .sort(function (itemA, itemB) {
                return itemB.Score - itemA.Score;
            });
        callback(jsonAsArray);
    });
}

function getUserByCard(cardId, callback) {
    var userObj = null;
    var jsonData = getAction("getAllUsers", function (jsonData) {
        Object.keys(jsonData).forEach(function (key) {
            //console.log(key, jsonData[key]);
            if (typeof jsonData[key].Metadata.cardId !== 'undefined') {
                if (cardId == jsonData[key].Metadata.cardId) {
                    //console.log(jsonData[key]);
                    userObj = jsonData[key]
                }
            }
        });
        callback(userObj);

    });
}

function getLeaderboardData(count,callback) {
    const scorecount = count;
    console.log("scorecount",scorecount);
    var leaderboardObj = [];
    getHighScore(function (highScores) {
        const scoresArray = Object.keys(highScores).map(function (key) {
            return highScores[key];
        })
            .sort(function (itemA, itemB) {
                return itemB.Score - itemA.Score;
            });
        //console.log("scoresArray",scoresArray);
        const users = getAction("getAllUsers", function (usersArray) {
            //console.log("userArray", usersArray);
            for (let i = 0; i < scorecount; i++) {
                //console.log("Loop");
                var found = usersArray.filter(
                    function(filterdata){ return filterdata.UserID == scoresArray[i].UserID }
                );
                // var arrayFound = usersArray.items.filter(function(item) {
                //     return item.UserID == scoresArray[i].UserID;
                // });
                // //usersArray.find(scoresArray[i].UserID);
                //console.log("arrayFound",found);
                var userScore = scoresArray[i];
                userScore.name = found[0].UserName
                //console.log("userScore",userScore)
                leaderboardObj.push(userScore)
                // console.log("leaderboardObj",leaderboardObj)

              }
              //console.log("leaderboardObj",leaderboardObj)
              callback(leaderboardObj);
            // Object.keys(jsonObject).forEach(key => {
            //     console.log(key + ": " + jsonObject[key]);
            //   });
         })


    })
}

function getUserHighScore(userId, callback) {
    //var userObj = null;
    var payload = {};
    payload.userID = userId
    var json = postAction("queryGamesByUserSortedByScore", payload, function (jsonData) {
        const jsonAsArray = Object.keys(jsonData).map(function (key) {
            return jsonData[key];
        })
            .sort(function (itemA, itemB) {
                return itemB.Score - itemA.Score;
            });
        callback(jsonAsArray);
    });
}
function addUser(cardId, callback) {
    //var userObj = null;
    var payload = {};
    payload.credits = 10;
    payload.metadata = { "cardId": cardId }
    var jsonData = postAction("addUser", payload, function (jsonData) {
        callback(jsonData);
    });
}

function addGame(payload, callback) {
    //var userObj = null;
    // var payload = {};
    // payload.userID = userId
    var jsonData = postAction("addGame", payload, function (jsonData) {
        callback(jsonData);
    });
}
module.exports = { getUserByCard, getHighScore, getUserHighScore, addGame, addUser,getLeaderboardData };