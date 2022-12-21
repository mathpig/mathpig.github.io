'use strict';

async function main() {
  print("");
  print("Welcome to the seven snipers! See how long you can last against a band of snipers.");
  print("");
  print("Controls:");
  print("n, e, s, and w to move vision and gun aim.");
  print("r to reload.");
  print("f to fire.");
  print("g to launch a grenade.");
  print("q to prematurely quit the game.")
  print("");
  print("Key:");
  print("");
  print("-: empty tile");
  print("S: sniper (this is bad)");
  print("F: shooting sniper (this is very bad)");
  print("?: unknown square outside of your view");
  print("X: the square you are aiming at. You will also be told what you are aiming at on your turn.");
  print("");
  print("Good luck!");

  var health = 100;
  var x = 2;
  var y = 2;
  var ammo = 6;
  var grenades = 3;
  var turns = 0;
  var kills = 0;

  var world = [];
  for (var i = 0; i < 5; ++i) {
    world.push([]);
    for (var j = 0; j < 5; ++j) {
      world[i].push(["-", randint(5, 25)]);
    }
  }

  function healthAmmoMapAim() {
    print("");
    print("Your health: " + Math.max(0, health) + "/100");
    print("Ammo: " + ammo + "/6");
    print("Grenades: " + grenades);
    print("");
    print("The map:");
    print("");
    for (var i = -1; i < 6; ++i) {
      for (var j = -1; j < 6; ++j) {
        if (i == -1 || i == 5 || j == -1 || j == 5) {
          print("B", "");
        }
        else if (j == x && i == y) {
          print("X", "");
        } 
        else if (j >= (x - 1) && j <= (x + 1) && i >= (y - 1) && i <= (y + 1)) {
          print(world[i][j][0], "");
        }
        else {
          print("?", "");
        }
      }
      print("");
    }
    print("");
    print("You are aiming at a " + world[y][x][0] + ".");
    print("");
  }

  while (true) {
    print("");
    healthAmmoMapAim();
    var command = await get_string("Enter your command: ");
    if (command == "n") {
      if (y !== 0) {
        print("Aim and view have been moved northwards.");
        y--;
      }
      else {
        print("You are at the edge.");
      }
    }
    else if (command == "e") {
      if (x != 4) {
        print("Aim and view have been moved eastwards.");
        x++;
      }
      else {
        print("You are at the edge.");
      }
    }
    else if (command == "s") {
      if (y != 4) {
        print("Aim and view have been moved southwards.");
        y++;
      }        
      else {
        print("You are at the edge.");
      }
    }
    else if (command == "w") {
      if (x !== 0) {
        print("Aim and view have been moved westwards.");
        x--;
      }
      else {
        print("You are at the edge.");
      }
    } 
    else if (command == "f") {
      if (ammo === 0) {
        print("Out of ammo.");
      }
      else {
        print("You fire.");
        ammo--;
        if (world[y][x][0] != "-") {
          kills++;
          world[y][x][0] = "-";
          world[y][x][1] = randint(5, 25);
        }
      }
    }
    else if (command == "r") {
      print("You reload.");
      ammo = 6;
    } 
    else if (command == "g") {
      if (grenades === 0) {
        print("Out of grenades.");
      }
      else {
        print("You launch a grenade.");
        grenades--;
        for (var i = Math.max(0, x - 1); i < Math.min(5, x + 2); ++i) {
          if (world[y][i][0] != "-") {
            kills++;
            world[y][i][0] = "-";
            world[y][i][1] = randint(5, 25);
          }
        }
        for (var i = Math.max(0, y - 1); i < Math.min(5, y + 2); ++i) {
          if (world[i][x][0] != "-") {
            kills++;
            world[i][x][0] = "-";
            world[i][x][1] = randint(5, 25);
          }
        }
      }
    }
    else if (command == "q") {
      print("Game terminated.")
      print("")
      await exit();
    }
    else {
      print("Invalid command.");
    }
    turns++;
    print("");
    for (var i = 0; i < 5; ++i) {
      for (var j = 0; j < 5; ++j) {
        world[i][j][1]--;
        if (world[i][j][1] === 0) {
          if (world[i][j][0] == "-") {
            world[i][j][0] = "S";
            world[i][j][1] = randint(15, 35);
          }
          else if (world[i][j][0] == "S") {
            world[i][j][0] = "F";
          }
        }
        if (world[i][j][0] == "F") {
          health--;
        }
      }
    }
    if (health <= 0) {
      break;
    }
  }

  var score = turns + kills * 2;
  print("");
  print("Out of health.");
  print("");
  print("Your score: " + score);
  print("");
  print("Your rank: ", "");
  if (score <= 49) {
    print("\"Doesn't know how to play\"");
  }
  else if (score <= 74) {
    print("\"Recently started playing\"");
  }
  else if (score <= 99) {
    print("\"Some skill\"");
  }
  else if (score <= 124) {
    print("\"Experienced player\"");
  }
  else {
    print("\"Master (this rank also requires a certain amount of luck)\"");
  }
  print("");
  await exit();
}

main();
