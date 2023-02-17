'use strict';

async function main() {
  var playerCount = await get_int("How many players (2-9, 9 recommended, just make some of the players npcs)? ");
  while (playerCount < 2 || playerCount > 9) {
    playerCount = await get_int("How many players (2-9, 9 recommended, just make some of the players npcs)? ");
  }
  var skipping = {};
  var length = 0;
  var speed = 1.5;

  async function typeSlow(message) {
    for (var i = 0; i < message.length; ++i) {
      await sleep(speed / 20);
      print(message[i], "");
    }
    await sleep(speed);
    print("");
  }

  function generateSenate() {
    var seats = [];
    for (var i = 0; i < randint(35, 50); ++i) {
      seats.push(randint(1, playerCount));
    }
    return seats;
  }

  function checkPlayers(seats) {
    var seen = [];
    for (var i = 0; i < playerCount; ++i) {
      seen.push(0);
    }
    for (var i = 0; i < seats.length; ++i) {
      seen[seats[i] - 1]++;
    }
    for (var i = 0; i < playerCount; ++i) {
      if (seen[i] < Math.floor(seats.length / playerCount) || seen[i] > Math.ceil(seats.length / playerCount)) {
        return false;
      }
    }
    return true;
  }

  function generateGoodSenate() {
    console.log(checkPlayers([1, 1, 1, 2, 2, 2]));
    var seats = generateSenate();
    while (!checkPlayers(seats)) {
      seats = generateSenate();
    }
    return seats;
  }

  var seats = generateGoodSenate();
  for (var i = 0; i < seats.length; ++i) {
    skipping[i] = false;
  }

  function checkTruth(s) {
    return (s == "y" || s == "yes");
  }

  var controlled = [];
  for (var i = 1; i < (playerCount + 1); ++i) {
    print("");
    var response = await get_string("Would you like player " + i + " to be automated? ");
    controlled.push(checkTruth(response));
  }

  function checkVictory(turn) {
    for (var i = 0; i < seats.length; ++i) {
      if (seats[i] != turn && seats[i] > 0) {
        return false;
      }
    }
    return true;
  }

  function countPlayers(n) {
    var count = 0;
    for (var i = 0; i < seats.length; ++i) {
      if (seats[i] == n) {
        count++;
      }
    }
    return count;
  }

  function convert(n) {
    if (n < 0) {
      n += seats.length;
    }
    else if (n >= seats.length) {
      n -= seats.length;
    }
    return n;
  }

  function findColor(n) {
    if (n == 0) {
      foreground(7);
      return 1;
    }
    if (n == 3) {
      foreground(7);
      return 4;
    }
    if (n < 6) {
      return (n + 1);
    }
    return (n + 2);
  }

  function printSenate(n) {
    for (var i = 0; i < n; ++i) {
      print("   ", "");
    }
    print(" |");
    foreground(0);
    for (var i = 0; i < seats.length; ++i) {
      background(findColor(seats[i]));
      if (skipping[i]) {
        foreground(1);
      }
      print(" " + seats[i] + " ", "");
      foreground(0);
    }
    normal();
    print("");
    print("");
  }

  function printNumSenate() {
    for (var i = 0; i < seats.length; ++i) {
      print(" " + Math.floor((i + 1) / 10) + " ", "");
    }
    print("");
    for (var i = 0; i < seats.length; ++i) {
      print(" " + (i + 1) % 10 + " ", "");
    }
    print("");
    print("");
    foreground(0);
    for (var i = 0; i < seats.length; ++i) {
      background(findColor(seats[i]));
      if (skipping[i]) {
        foreground(1);
      }
      print(" " + seats[i] + " ", "");
      foreground(0);
    }
    normal();
    print("");
    print("");
  }

  function kill(n) {
    n = convert(n);
    seats[n] = 0;
    if (skipping[n]) {
      length--;
    }
    skipping[n] = false;
  }

  function raiseSeat(n) {
    for (var i = 0; i < 50000; ++i) {
      var val = randint(0, seats.length - 1);
      if (seats[val] == 0) {
        seats[val] = seats[n];
        printSenate(val);
        return;
      }
    }
    kill(n);
  }

  function isDead() {
    for (var i = 0; i < seats.length; ++i) {
      if (seats[i] == 0) {
        return true;
      }
    }
    return false;
  }

  function aliveCount() {
    var count = 0;
    for (var i = 0; i < seats.length; ++i) {
      if (seats[i] != 0) {
        count++;
      }
    }
    return count;
  }

  print("");
  for (var m = 0; m < 200; ++m) {
    for (var i = 0; i < seats.length; ++i) {
      if (skipping[i]) {
        skipping[i] = false;
        length--;
        continue;
      }
      if (seats[i] == 0) {
        continue;
      }
      print("The senate:");
      print("");
      printSenate(i);
      if (controlled[seats[i] - 1]) {
        var command = "skip";
        if (isDead()) {
          command = "raise";
        }
        var commands = ["pistol"];
        if (seats[convert(i - 1)] != seats[i] && seats[convert(i - 1)] != 0 && seats[convert(i + 1)] != seats[i] && seats[convert(i + 1)] != 0 && countPlayers(seats[i]) >= 5) {
          if (seats[convert(i - 3)] != seats[i] && seats[convert(i - 3)] != 0 && seats[convert(i - 2)] != seats[i] && seats[convert(i - 2)] != 0) {
            commands.push("bomb left");
          }
          if (seats[convert(i - 2)] != seats[i] && seats[convert(i - 2)] != 0 && seats[convert(i + 2)] != seats[i] && seats[convert(i + 2)] != 0) {
            commands.push("bomb center");
          }
          if (seats[convert(i + 2)] != seats[i] && seats[convert(i + 2)] != 0 && seats[convert(i + 3)] != seats[i] && seats[convert(i + 3)] != 0) {
            commands.push("bomb right");
          }
        }
        if (seats[convert(i - 1)] != seats[i] && seats[convert(i - 1)] != 0) {
          commands.push("knife left");
        }
        if (seats[convert(i + 1)] != seats[i] && seats[convert(i + 1)] != 0) {
          commands.push("knife right");
        }
        if (countPlayers(seats[i]) >= 3 && (aliveCount() * 2) >= seats.length && (countPlayers(seats[i]) * 2) <= aliveCount()) {
          commands.push("grenade");
        }
        if (countPlayers(seats[i]) >= 5) {
          commands.push("sacrifice");
        }
        if (command == "skip" || randint(0, 1) == 0) {
          command = commands[randint(0, (commands.length - 1))];
        }
        if (checkVictory(seats[i])) {
          command = "victory";
        }
        print("Enter your command: ", "");
        await typeSlow(command);
      }
      else {
        var command = await get_string("Enter your command: ");
        while (command != "victory" && command != "knife left" && command != "knife right" && command != "skip" && command != "bomb left" && command != "bomb center" && command != "bomb right" && command != "raise" && command != "pistol" && command != "grenade" && command != "sacrifice") {
          command = await get_string("Enter your command (\"victory\", \"knife left\", \"knife right\", \"bomb left\", \"bomb center\", \"bomb right\", \"raise\", \"pistol\", \"grenade\", or \"skip\"): ");
        }
      }
      print("");
      if (command == "victory") {
        if (checkVictory(seats[i])) {
          print("Party " + seats[i] + " wins!");
          print("");
          await exit();
        }
        else {
          kill(i);
        }
      }
      else if (command == "knife left") {
        kill(i - 1);
      }
      else if (command == "knife right") {
        kill(i + 1);
      }
      else if (command[0] == "b") {
        kill(i);
        if (command[5] == "l") {
          if (randint(0, 1) == 0) {
            kill(i + 1);
          }
          if (randint(0, 1) == 0) {
            kill(i - 3);
          }
          kill(i - 1);
          kill(i - 2);
        }
        else if (command[5] == "c") {
          if (randint(0, 1) == 0) {
            kill(i + 2);
          }
          if (randint(0, 1) == 0) {
            kill(i - 2);
          }
          kill(i + 1);
          kill(i - 1);
        }
        else {
          if (randint(0, 1) == 0) {
            kill(i + 3);
          }
          if (randint(0, 1) == 0) {
            kill(i - 1);
          }
          kill(i + 2);
          kill(i + 1);
        }
      }
      else if (command == "raise") {
        raiseSeat(i);
        await sleep(speed);
      }
      else if (command == "pistol") {
        printNumSenate();
        if (controlled[seats[i] - 1]) {
          for (var j = 0; j < 50000; ++j) {
            var player = randint(0, seats.length - 1);
            var foundEnemy = false;
            if (seats[player] > 0 && seats[player] != seats[i] && (i != 0 || player != (seats.length - 1)) && (i != (seats.length - 1) || player != 0) && Math.abs(player - i) > 1) {
              foundEnemy = true;
              break;
            }
          }
          if (!foundEnemy) {
            player = i;
          }
          print("Which senate member to shoot: ", "");
          await typeSlow((player + 1).toString());
        }
        else {
          player = await get_int("Which senate member to shoot: ");
          player--;
        }
        print("");
        if (player < 0 || player > seats.length || (i == 0 && player == (seats.length - 1)) || (i == (seats.length - 1) && player == 0) || Math.abs(player - i) < 2) {
          kill(i);
          continue;
        }
        skipping[i] = true;
        length++;
        var val = randint(0, 3);
        if (val == 0) {
          kill(player - 1);
        }
        else if (val == 3) {
          kill(player + 1);
        }
        else {
          kill(player);
        }
      }
      else if (command == "grenade") {
        var val = randint(0, seats.length - 1);
        if (randint(0, 1) == 0) {
          kill(val - 1);
        }
        if (randint(0, 1) == 0) {
          kill(val + 1);
        }
        kill(val);
        printSenate(val);
        if (seats[i] != 0) {
          skipping[i] = true;
          length++;
        }
        await sleep(speed);
      }
      else {
        for (var j = 0; j < 50000; ++j) {
          var val = randint(0, seats.length - 1);
          if (seats[val] > 0 && seats[val] != seats[i]) {
            break;
          }
        }
        if (seats[val] > 0 && seats[val] != seats[i]) {
          kill(i);
          kill(val);
          printSenate(val);
          await sleep(speed);
        }
        kill(i);
      }
    }
  }

  print("The senate:");
  print("");
  printSenate(0);
  print("Tie; all senators are dead (or the game took amazingly long).");
  print("");
  await exit();
}

main();
