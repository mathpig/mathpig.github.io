'use strict';

async function main() {
  async function Print(message) {
    for (var i = 0; i < message.length; ++i) {
      print(message[i], "");
      await sleep(randint(10, 30) / 500);
    }
    await sleep(randint(10, 30) / 50);
    print("");
  }

  function printMap() {
    print("");
    print("Player 1 has " + points[0] + " points.");
    print("Player 2 has " + points[1] + " points.");
    print("Player 3 has " + points[2] + " points.");
    print("Player 4 has " + points[3] + " points.");
    for (var i = 0; i < 30; ++i) {
      print("");
      for (var j = 0; j < 30; ++j) {
        var foundSpecial = false;
        for (var k = 0; k < 4; ++k) {
          if (coordinates[k][0] == i && coordinates[k][1] == j) {
            print((k + 1) + " ", "");
            foundSpecial = true;
            break;
          }
        }
        if (!foundSpecial) {
          if (i >= 14 && i <= 15 && j >= 14 && j <= 15) {
            print("C ", "");
          }
          else {
            print("- ", "");
          }
        }
      }
    }
    print("");
  }

  var coordinates = [[0, 0], [29, 0], [29, 29], [0, 29]];
  var points = [0, 0, 0, 0];

  async function move(player, direction) {
    var originalX = coordinates[player][0];
    var originalY = coordinates[player][1];
    if (direction == "n") {
      coordinates[player][0] -= 1;
    }
    else if (direction == "e") {
      coordinates[player][1] += 1;
    }
    else if (direction == "s") {
      coordinates[player][0] += 1;
    }
    else {
      coordinates[player][1] -= 1;
    }
    if (coordinates[player][1] < 0) {
      coordinates[player][1] += 30;
    }
    if (coordinates[player][0] < 0) {
      coordinates[player][0] += 30;
    }
    if (coordinates[player][1] >= 30) {
      coordinates[player][1] -= 30;
    }
    if (coordinates[player][0] >= 30) {
      coordinates[player][0] -= 30;
    }
    if (coordinates[player][0] >= 14 && coordinates[player][0] <= 15 && coordinates[player][1] >= 14 && coordinates[player][1] <= 15) {
      print("");
      printMap();
      print("");
      points[player] += 100;
      await Print("Player " + (player + 1) + " has reached the castle and gains 100 points! Player " + (player + 1) + " now has " + points[player] + " points.");
      await Print("");
      await Print("Final scoreboard:");
      await Print("");
      await Print("Player 1: " + points[0] + " points");
      await Print("Player 2: " + points[1] + " points");
      await Print("Player 3: " + points[2] + " points");
      await Print("Player 4: " + points[3] + " points");
      await Print("");
      var maxPoints = points[0];
      var winnerIndices = [0];
      for (var i = 1; i < 4; ++i) {
        if (points[i] > maxPoints) {
          maxPoints = points[i];
          winnerIndices = [i];
        }
        else if (points[i] == maxPoints) {
          winnerIndices.push(i);
        }
      }
      print("Winning player numbers: ", "");
      for (var i = 0; i < winnerIndices.length; ++i) {
        print(winnerIndices[i] + 1, "");
        if (i < winnerIndices.length - 1) {
          print(", ", "");
        }
      }
      await Print("");
      await Print("");
      await sleep(2);
      await Print("P.S. The winners may stick pins into all the other players now. Enjoy! -- Mr. Slavan");
      await Print("");
      await Print("Credits:");
      await Print("");
      await Print("King Guy: This game was produced by -- Pop! Ribbit ribbit.");
      await Print("Mr. Slavan: Why, of course it was produced by...");
      await Print("  _________.__                             .__                _________                                          __  .__");
      await Print(" /   _____/|  | _____ ___  _______    ____ |__|____    ____   \\_   ___ \\  _________________   ________________ _/  |_|__| ____   ____   ______");
      await Print(" \\_____  \\ |  | \\__  \\\\  \\/ /\\__  \\  /    \\|  \\__  \\  /    \\  /    \\  \\/ /  _ \\_  __ \\____ \\ /  _ \\_  __ \\__  \\\\   __\\  |/  _ \\ /    \\ /  ___/");
      await Print(" /        \\|  |__/ __ \\\\   /  / __ \\|   |  \\  |/ __ \\|   |  \\ \\     \\___(  <_> )  | \\/  |_> >  <_> )  | \\// __ \\|  | |  (  <_> )   |  \\\\___ \\");
      await Print("/_______  /|____(____  /\\_/  (____  /___|  /__(____  /___|  /  \\______  /\\____/|__|  |   __/ \\____/|__|  (____  /__| |__|\\____/|___|  /____  >");
      await Print("        \\/           \\/           \\/     \\/        \\/     \\/          \\/             |__|                     \\/                    \\/     \\/");
      await Print("");
      await Print("There\'s no doubt about it; such an excellent game could not have been made by mere mortals, what do you say, chappies?");
      await Print("");
      await Print("Scuttles: Um, Mister Slavan, ...");
      await Print("Mr. Slavan: Oh, look, we're out of time.");
      await Print("Here is the antidote to the toad transformation spell, Mr. Guy, and...");
      await Print("Good evening, gentlemen.");
      await Print("");
      await Print("  ______");
      await Print(" /  ___/");
      await Print(" \\___ \\");
      await Print("/____  >");
      await Print("     \\/");
      await Print("");
      sleep(4);
      await exit();
    }
    for (var i = 0; i < 4; ++i) {
      if (i != player && coordinates[i][0] == coordinates[player][0] && coordinates[i][1] == coordinates[player][1]) {
        coordinates[player][0] = originalX;
        coordinates[player][1] = originalY;
        return false;
      }
    }
    return true;
  }

  async function pin(player1, player2) {
    if (player1 == player2) {
      await Print("Well, well, what an unfortunate event...");
      points[player1] -= 25;
      return true;
    }
    console.log(player1, player2);
    var distance1 = Math.abs(coordinates[player2][0] - coordinates[player1][0]);
    var distance2 = Math.abs(coordinates[player2][1] - coordinates[player1][1]);
    if (distance1 >= 4) {
      distance1 = 30 - distance1;
    }
    if (distance2 >= 4) {
      distance2 = 30 - distance2;
    }
    if (distance1 + distance2 <= 3) {
      points[player1] += 50;
      points[player2] -= 25;
      return true;
    }
    return false;
  }

  var turn = 0;

  print("")
  print("Would you like an introduction to the game to become aquainted with the rules? ", "")
  var introduction = await get_string("");
  if (introduction == "y" || introduction == "yes") {
    await Print("");
    await Print("An Opening Explanation to the Joy and Delight of Voodoo Dolls, supplemented by Mister Slavan:");
    await Print("");
    await Print("Welcome to the game of Voodoo Dolls. I am very glad you are participating.");
    await Print("This is a game that poses great danger to your health, making it all the more exciting.");
    await Print("");
    await Print("Four players take turns moving and performing actions with the goal of reaching the castle in the center of the board.");
    await Print("Reaching the castle grants the player who reaches it 100 points and ends the game.");
    await Print("The different players' points are compared to decide who the winner(s) is/are.")
    await Print("");
    await Print("On each turn, a pair of dice are rolled to decide how many steps you may move on that turn.");
    await Print("This will be decided automatically, and you must move exactly your allotted step count value.");
    await Print("");
    await Print("After moving, you must stick a pin in a nearby player within a 7x7 diamond region around you:");
    await Print("N N N N N N N N N");
    await Print("N N N N Y N N N N");
    await Print("N N N Y Y Y N N N");
    await Print("N N Y Y Y Y Y N N");
    await Print("N Y Y Y X Y Y Y N");
    await Print("N N Y Y Y Y Y N N");
    await Print("N N N Y Y Y N N N");
    await Print("N N N N Y N N N N");
    await Print("N N N N N N N N N");
    await Print("");
    await Print("If no players are nearby, you must stick a pin into your own player.");
    await Print("In the case that this unfortunate event occurs, you lose 25 points (as well as a good portion of your body mass).");
    await Print("Sticking a pin in a different player grants you 50 points, and also takes 25 points away from the player you stick the pin in.");
    await Print("");
    await Print("Note that the board loops around, so you can stick pins into players in surprising ways and jump from one edge of the board to the opposite edge.");
    await Print("");
    await Print("Thank you for reading my brief introduction to this truly remarkable wizarding game.");
    await Print("Now enjoy playing it with each other; it will be quite a memorable experience.");
    await Print("");
    await Print("  -- Mr. Slavan");
  }
  await Print("");
  await Print("  ______");
  await Print(" /  ___/");
  await Print(" \\___ \\");
  await Print("/____  >");
  await Print("     \\/");

  while (true) {
    printMap();
    print("");
    var moveCount = randint(1, 6) + randint(1, 6);
    print("Player " + (turn + 1) + " rolls a " + moveCount + ".");
    while (moveCount > 0) {
      var action = await get_string("Enter your move direction; you have " + moveCount + " moves left (player " + (turn + 1) + "): ");
      while ((action != "n" && action != "e" && action != "s" && action != "w") || !await move(turn, action)) {
        action = await get_string("Please retry; either your direction was invalid or another player is in the way: ");
      }
      moveCount--;
      printMap();
      print("");
    }
    action = await get_int("Enter the number of the player you would like to stick a pin into (you are player " + (turn + 1) + "): ");
    while (action < 1 || action > 4 || !await pin(turn, action - 1)) {
      action = await get_int("Please retry; either you entered an invalid player number or the player is too far away: ");
    }
    turn = (turn + 1) % 4;
  }
}

main();
