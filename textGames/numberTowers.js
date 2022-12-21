'use strict';

async function main() {
  var towers = [];

  var yourPower = randint(4, 6);
  var enemyPower = randint(2, 3);
  var potions = 0;

  var tower = 0;

  for (var i = 0; i < randint(4, 6); ++i) {
    towers.push([]);
    for (var j = 0; j < randint(5, 10); ++j) {
      towers[i].push([]);
      for (var k = 0; k < randint(1, 3); ++k) {
        var val = randint(1, 20);
        if (val == 1) {
          towers[i][j].push("Potion");
        }
        else if (val == 2 || val == 3) {
          var num = randint(Math.round(-enemyPower), Math.round(enemyPower));
          while (num == 0) {
            num = randint(Math.round(-enemyPower), Math.round(enemyPower));
          }
          if (num > 0) {
            num = "+" + num;
          }
          towers[i][j].push(num);
        }
        else {
          towers[i][j].push(randint(Math.round(enemyPower / 2), Math.round(enemyPower * 3 / 2)));
        }
      }
      enemyPower *= 1.6;
    }
    shuffle(towers[i]);
    enemyPower *= 1.6;
  }

  function printTower(tower) {
    print("Tower " + (tower + 1) + " / " + towers.length + ":");
    print("");
    for (var i = 0; i < towers[tower].length; ++i) {
      print("Floor ", "");
      if ((towers[tower].length - i) < 10) {
        print(" ", "");
      }
      print((towers[tower].length - i) + ": " + towers[tower][i].join(", "));
    }
  }

  print("");
  print("Your starting strength: " + yourPower + ".");

  while (true) {
    print("");
    printTower(tower);
    print("");
    var floor = await get_int("Enter a floor to attack: ");
    if (floor < 1 || floor > towers[tower].length) {
      print("Invalid floor.");
      continue;
    }
    print("");
    floor = towers[tower].length - floor;
    for (var i = 0; i < towers[tower][floor].length; ++i) {
      print("Your power: " + yourPower);
      if (towers[tower][floor][i].toString()[0] != "+" && towers[tower][floor][i].toString()[0] != "-" && towers[tower][floor][i].toString()[0] != "P") {
        print("Enemy's power: " + towers[tower][floor][i]);
      }
      print("");
      print("Potions: " + potions);
      if (potions > 0) {
        print("");
        var use = await get_string("Would you like to drink a potion? ");
        if (use == "y" || use == "yes") {
          potions--;
          print("You drink the potion. Potions remaining: " + potions);
          print("");
          var val = randint(2, 3);
          if (randint(0, 1) == 0) {
            yourPower = Math.round(yourPower / val);
            if (val == 2) {
              print("Your power is halved! Your power: " + yourPower);
            }
            else {
              print("Your power is divided by 3!!! Your power: " + yourPower);
            }
          }
          else {
            yourPower *= val;
            if (val == 2) {
              print("Your power is doubled! Your power: " + yourPower);
            }
            else {
              print("Your power is tripled!!! Your power: " + yourPower);
            }
          }
        }
      }
      if (towers[tower][floor][i].toString()[0] == "P") {
        potions++;
        print("");
        print("You found a potion! Potions: " + potions);
        print("");
      }
      else if (towers[tower][floor][i].toString()[0] == "+" || towers[tower][floor][i].toString()[0] == "-") {
        var powerGain = parseInt(towers[tower][floor][i]);
        yourPower += powerGain;
        print("");
        if (powerGain > 0) {
          print("There is a power boost here!");
          print("You gain " + powerGain + " power! Your power: " + yourPower);
        }
        else {
          print("There is a trap here!");
          print("You lose " + (-powerGain) + " power. Your power: " + yourPower);
          if (yourPower <= 0) {
            print("");
            print("You lose.");
            print("");
            print("   __");
            print(" _/  \\_");
            print("/ x  x \\");
            print("\\      /");
            print(" \\_  _/");
            print("  |__|");
            print("");
            await exit();
          }
        }
        print("");
      }
      else {
        if (potions > 0) {
          var use = await get_string("Would you like to throw a potion at your enemy? ");
          print("")
            if (use == "y" || use == "yes") {
              potions--;
              print("You throw a potion at your enemy. Potions remaining: " + potions);
              print("");
              var val = randint(2, 3);
              if (randint(0, 1) == 0) {
                towers[tower][floor][i] = Math.round(towers[tower][floor][i] / val);
                if (val == 2) {
                  print("Your enemy's power is halved! Your enemy's power: " + towers[tower][floor][i]);
                }
                else {
                  print("Your enemy's power is divided by 3!!! Your enemy's power: " + towers[tower][floor][i]);
                }
              }
              else {
                towers[tower][floor][i] *= val;
                if (val == 2) {
                  print("Your enemy's power is doubled! Your enemy's power: " + towers[tower][floor][i]);
                }
                else {
                  print("Your enemy's power is tripled!!! Your enemy's power: " + towers[tower][floor][i]);
                }
              }
              print("");
            }
        }
        if (Math.random() < (2 * yourPower) / (3 * towers[tower][floor][i])) {
          yourPower += towers[tower][floor][i];
          print("");
          print("You win this battle and gain " + towers[tower][floor][i] + " power! You now have " + yourPower + " power!");
          print("");
        }
        else {
          print("You lose.");
          print("");
          print("   __");
          print(" _/  \\_");
          print("/ x  x \\");
          print("\\      /");
          print(" \\_  _/");
          print("  |__|");
          print("");
          await exit();
        }
      }
    }
    print("");
    print("Floor " + (towers[tower].length - floor) + " has been destroyed!", "");
    towers[tower].splice(floor, 1);
    if (towers[tower].length == 0) {
      print("");
      print("");
      print("You beat tower " + (tower + 1) + "!", "");
      tower++;
      if (tower == towers.length) {
        break;
      }
      print(" Onwards to tower " + (tower + 1) + "!");
    }
    else {
      print(" The tower shrinks in size!");
    }
  }

  print("");
  print("");
  print("You win! Swords and sandals wand passward hint: <= \"frawd\" =>");
  print("Thank you for playing! :)");
  print("");
  await exit();
}

main();
