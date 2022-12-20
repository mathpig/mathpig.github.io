'use strict';

async function main() {
  var size = randint(25, 35);
  var maxValue = randint(5, 7);

  var startX = randint(0, size - 1);
  var startY = randint(0, size - 1);

  var lastColor = 0;

  if (maxValue == 7) {
    var movesRemaining = randint(Math.round(3 * size / 2), 2 * size);
  }
  else {
    var movesRemaining = randint(Math.round(3 * size / 2), Math.round(7 * size / 4));
  }

  var gameMap = [];

  for (var i = 0; i < size; ++i) {
    gameMap.push([]);
    for (var j = 0; j < size; ++j) {
      gameMap[i].push(randint(1, maxValue));
    }
  }

  for (var i = 0; i < randint(0, 1); ++i) {
    gameMap[randint(0, size - 1)][randint(0, size - 1)] = "W";
  }

  gameMap[startX][startY] = "X";

  function printMap() {
    if (movesRemaining == 1) {
      print("You have 1 move left.");
    }
    else {
      print("You have " + movesRemaining + " moves left.");
    }
    print("");
    for (var i = 0; i < size; ++i) {
      for (var j = 0; j < size; ++j) {
        if (gameMap[i][j] != "W" && gameMap[i][j] != "X") {
          foreground(0);
          background(gameMap[i][j]);
        }
        print(gameMap[i][j] + " ", "");
        normal();
      }
      print("");
    }
  }

  function floodFill(x, y, color1, color2) {
    var toDo = [[x, y]];

    while (toDo.length > 0) {
      var arr = toDo.pop();
      var x = arr[0];
      var y = arr[1];

      if (gameMap[x][y] != color1) {
        continue;
      }

      gameMap[x][y] = color2;

      if (x > 0) {
        toDo.push([x - 1, y])
      }
      if (y > 0) {
        toDo.push([x, y - 1])
      }
      if (x < (size - 1)) {
        toDo.push([x + 1, y])
      }
      if (y < (size - 1)) {
        toDo.push([x, y + 1])
      }
    }
  }

  function hasWon(lastColor) {
    var count = 0;
    for (var i = 0; i < size; ++i) {
      for (var j = 0; j < size; ++j) {
        if (gameMap[i][j] != lastColor && gameMap[i][j] != "W" && gameMap[i][j] != "X") {
          count += 1;
        }
      }
    }
    return count;
  }

  print("");
  if (maxValue == 5) {
    print("This is an easy puzzle.");
  }
  else if (maxValue == 6) {
    print("This is a medium puzzle.");
  }
  else {
    print("This is a hard puzzle.");
  }
  print("");
  printMap();
  print("");

  while (movesRemaining > 0) {
    lastColor = await get_int("Enter a color to fill with: ");
    while (lastColor <= 0 || lastColor > maxValue) {
      lastColor = await get_int("Enter a color to fill with (has to be between 1 and " + maxValue + ", inclusive): ");
    }

    if (startX > 0 && gameMap[startX - 1][startY] != lastColor) {
      floodFill(startX - 1, startY, gameMap[startX - 1][startY], lastColor);
    }
    if (startY > 0 && gameMap[startX][startY - 1] != lastColor) {
      floodFill(startX, startY - 1, gameMap[startX][startY - 1], lastColor);
    }
    if (startX < (size - 1) && gameMap[startX + 1][startY] != lastColor) {
      floodFill(startX + 1, startY, gameMap[startX + 1][startY], lastColor);
    }
    if (startY < (size - 1) && gameMap[startX][startY + 1] != lastColor) {
      floodFill(startX, startY + 1, gameMap[startX][startY + 1], lastColor);
    }

    movesRemaining--;
    print("");
    printMap();
    print("");

    if (hasWon(lastColor) == 0) {
      if (movesRemaining == 1) {
        print("You win! Congratulations! You had 1 move left!");
        print("");
        await exit();
      }
      print("You win! Congratulations! You had " + movesRemaining + " moves left!");
      print("");
      await exit();
    }
  }

  if (hasWon(lastColor) == 1) {
    print("Sorry; out of moves. You had 1 square left to fill.");
    print("");
    await exit();
  }
  print("Sorry; out of moves. You had " + hasWon(lastColor) + " squares left to fill.");
  print("");
  await exit();
}

main();
