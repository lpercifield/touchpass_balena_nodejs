var fs = require('fs');
var obj = JSON.parse(fs.readFileSync('allusersupdated.json', 'utf8'));

var needle = require('needle');
var url = "https://uo2rlwa82g.execute-api.us-east-1.amazonaws.com/default/x-game?action="

var numUsersWithCard = 0;
obj.forEach(function1);
function function1(currentValue, index) {
    //console.log("Index in array is: "+index);
    //console.log(currentValue.userID)
    // var userToDelete = {userID:currentValue.userID}
    // console.log(userToDelete);
    // var jsonData = postAction("deleteUser",userToDelete , function (data) {
    //     //callback(jsonData);
    //     console.log(data);
    // });
    if (currentValue.metadata.cardId != null) {
        numUsersWithCard++;
        console.log(numUsersWithCard);
        //console.log(currentValue.metadata.cardId);
        var stringArray = currentValue.userName.split(/(\s+)/);
        var playerNumber = stringArray[stringArray.length - 1];
        var team = ""
        for(let i = 0;i<stringArray.length-2;i++){
            team += stringArray[i];
        }
        console.log(team + ":" + playerNumber)
        currentValue.metadata.team = team;
        currentValue.metadata.number = playerNumber;
        console.log(JSON.stringify(currentValue));
        // var jsonData = postAction("addUser", currentValue, function (data) {
        //     //callback(jsonData);
        //     console.log(data);
        // });
    }
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