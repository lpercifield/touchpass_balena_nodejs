var numbers = [];
var total = 500;
var nextTarget;
var activeTarget = 5;

function generateRandomNext(min, max) {
  if (min !== max) {
    // run this loop until nextTarget is different than activeTarget
    do {
      nextTarget = Math.floor(Math.random() * (max - min + 1)) + min;
    } while (nextTarget === activeTarget);
  } else {
    nextTarget = max;
  }
}
for(var i = 0;i<total;i++){
    activeTarget = nextTarget;
    generateRandomNext(0, 5);
    numbers.push(nextTarget);
    if(i == 499){
        console.dir(numbers, {'maxArrayLength': null});
    }
    // console.log(numbers);
}