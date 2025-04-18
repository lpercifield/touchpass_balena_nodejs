var needle = require('needle');
var url = "https://yrexy3ytq8.execute-api.us-east-1.amazonaws.com/default/x-game?action="

//https://w08v3r8yrd.execute-api.us-east-1.amazonaws.com/default/x-game
//"https://uo2rlwa82g.execute-api.us-east-1.amazonaws.com/default/x-game?action="
//https://yrexy3ytq8.execute-api.us-east-1.amazonaws.com/default/x-game?action=docs

//https://uo2rlwa82g.execute-api.us-east-1.amazonaws.com/default/x-game?action=addUser&endpoint=default/x-game
//https://uo2rlwa82g.execute-api.us-east-1.amazonaws.com/default/x-game?action=getAllUsers&endpoint=default/x-game

function getAction(action, callback) {
    needle.get(url + action + "&endpoint=default/x-game", function (error, response) {
        if (!error && response.statusCode == 200) {
            //console.log(action,response.body);
            callback(response.body);
            //return response.body;
        }
        // else if (response.statusCode != 200) {
        //     console.log("User get action: ", action, response.body);
        // } 
        // else {
        //     console.log("User get action: ", JSON.parse(response.body));
        //     callback("Error");
        // }

    });
}

// touchpass  TypeError: Cannot read properties of undefined (reading 'statusCode')
// touchpass      at /usr/src/app/user.js:13:29
// touchpass      at done (/usr/src/app/node_modules/needle/lib/needle.js:474:14)
// touchpass      at ClientRequest.had_error (/usr/src/app/node_modules/needle/lib/needle.js:489:5)

function postAction(action, payload, callback) {
    var options = {
        content_type: 'application/json'
    };
    console.log(JSON.stringify(payload));
    needle.post(url + action + "&endpoint=default/x-game", JSON.stringify(payload), options, function (error, response) {
        if (!error && response.statusCode == 200) {
            //console.log(response.body);
            callback(response.body);
            //return response.body;
            // } else if (response.statusCode != 200) {
            //     console.log("User post action: ", action, response.body);
        } else {
            console.log("User post action ERROR: ", action, response, error);
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
function getHighScoreByLocation(location, callback) {
    //var obj = null;
    var payload = {};
    payload.locationID = location;
    // payload.userName = message.team + " " + message.jerseyNumber;
    // payload.metadata = { "cardId": message.cardId }
    // var jsonData = postAction("addUser", payload, function (jsonData) {
    //     callback(jsonData);
    // });
    var data = postAction("queryGamesByLocationSortedByScore", payload, function (jsonData) {
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

    var getUserData = getAction("getAllUsers", function (users) {
        var userObj = { "foundCard": false, "users": users };
        Object.keys(users).forEach(function (key) {
            //console.log(key, jsonData[key]);
            if (typeof users[key].Metadata.cardId !== 'undefined') {
                if (cardId == users[key].Metadata.cardId) {
                    //console.log(jsonData[key]);
                    //return userObj = users[key];
                    userObj.foundCard = true;
                    userObj.foundUser = users[key]
                    //userObj.users = users;
                    //return users[key];
                    //console.log("Return 1");
                    //return userObj;
                } else {
                    //userObj.foundCard = false;
                    //userObj.users = users;
                    //console.log("Return 2");
                    //return userObj;
                }
            } else {
                userObj.foundCard = false;
                //userObj.users = users;
                //console.log("Return 3");
                //return userObj;
            }
        });
        //console.log(userObj)
        callback(userObj);

    });
}

function getLeaderboardData(count, location, callback) {

    var scorecount = count;
    //console.log("scorecount", scorecount);
    var leaderboardObj = [];
    getHighScoreByLocation(location, function (highScores) {
        const scoresArray = Object.keys(highScores).map(function (key) {
            return highScores[key];
        })
            .sort(function (itemA, itemB) {
                return itemB.Score - itemA.Score;
            });
        console.log("scoresArray", scoresArray.length);
        if (count == 0) {
            scorecount = scoresArray.length;
        }
        const users = getAction("getAllUsers", function (usersArray) {
            //console.log("scoresArray", scoresArray);
            for (let i = 0; i < scorecount; i++) {
                //console.log("Loop");
                try {
                    var found = usersArray.filter(
                        function (filterdata) { return filterdata.UserID == scoresArray[i].UserID } //scoresArray[i].UserID
                    );
                    if (!Array.isArray(found) || !found.length) {
                        // array does not exist, is not an array, or is empty
                        // ⇒ do not attempt to process array
                        var userScore = scoresArray[i];
                        userScore.name = "Deleted User"
                        //console.log("userScore",userScore)
                        leaderboardObj.push(userScore)
                    } else {
                        // var arrayFound = usersArray.items.filter(function(item) {
                        //     return item.UserID == scoresArray[i].UserID;
                        // });
                        // //usersArray.find(scoresArray[i].UserID);
                        //console.log("arrayFound", found);
                        var userScore = scoresArray[i];
                        userScore.name = found[0].UserName
                        //console.log("userScore",userScore)
                        leaderboardObj.push(userScore)
                        // console.log("leaderboardObj",leaderboardObj)
                    }
                }
                catch (error) {
                    console.error(error);
                    // Expected output: ReferenceError: nonExistentFunction is not defined
                    // (Note: the exact output may be browser-dependent)
                }
                // if (found !== undefined || found.length != 0) {

                // }


            }
            //console.log("leaderboardObj",leaderboardObj)
            callback(leaderboardObj);
            // Object.keys(jsonObject).forEach(key => {
            //     console.log(key + ": " + jsonObject[key]);
            //   });
        })


    })
}
function getAllUsers(callback) {
    const users = getAction("getAllUsers", function (usersArray) {
        callback(usersArray);
    })
}

function getUserHighScore(userId, callback) {
    //var userObj = null;
    var payload = {};
    payload.userID = userId
    var json = postAction("queryGamesByUserSortedByScore", payload, function (jsonData) {
        if (jsonData) {
            const jsonAsArray = Object.keys(jsonData).map(function (key) {
                return jsonData[key];
            })
                .sort(function (itemA, itemB) {
                    return itemB.Score - itemA.Score;
                });
            callback(jsonAsArray);
        }

    });
}
function addUser(message, callback) {
    //var userObj = null;
    var payload = {};
    payload.credits = 10;
    payload.userName = message.team + " " + message.jerseyNumber;
    payload.metadata = { "cardId": message.cardId, "team": message.team, "number": message.jerseyNumber }
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
module.exports = { getUserByCard, getHighScore, getUserHighScore, getHighScoreByLocation, addGame, addUser, getLeaderboardData, getAllUsers };