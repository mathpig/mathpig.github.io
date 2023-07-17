async function main() {
  var hunger = 100;
  var fish = randint(20, 30);
  var sand = randint(12, 18);
  var crystals = randint(4, 6);
  var sharks = randint(1, 2);
  var rays = 0;
  var crabs = randint(0, 1);
  var scienceSharks = 0;
  var science = randint(8, 12);
  var upgradeIndex = 0;

  var upgrades = [[100, 100, 10, 10, 2, 1, "Crystal Biting Gear for Sharks"],
  [150, 250, 50, 25, 1, 2, "Long Crystal Horns for Rays"]];

  async function Print(message) {
    for (var i = 0; i < message.length; ++i) {
      print(message[i], "");
      await sleep(0.04);
    }
    print("");
    await sleep(0.4);
  }

  print("");
  print("Would you like an introduction to the game? ", "");
  var introduction = await get_string("");
  if (introduction == "y" || introduction == "yes") {
    await Print("");
    await Print("Welcome to shark game!");
    await Print("");
    await Print("Controls:");
    await Print("\"c\" or \"catch\" to catch fish.");
    await Print("\"e\" or \"eat\" to eat a fish.");
    await Print("\"f\" or \"find\" to find a shark, ray, or crab to help catch or find fish, sand, and crystals. Respond to the follow-up message with \"shark\", \"ray\", or \"crab\",");
    await Print("depending on who you would like to find.");
    await Print("\"t\" or \"train\" to train a science shark.");
    await Print("\"b\" or \"buy\" to buy the next available upgrade.");
    await Print("\"q\" or \"quit\" to quit the game.");
    await Print("");
    await Print("Information:");
    await Print("Your goal is to obtain at least 12 sharks, 6 rays, 10 crabs, 3 science sharks, 1000 unused fish, 1000 unused sand, and 50 unused crystals and to purchase");
    await Print("all scientifical upgrades within a certain timespan (800 to 1200 turns).");
    await Print("");
    await Print("Sharks produce fish, rays produce sand as well as some fish, crabs slowly produce crystals, and science sharks produce science.");
    await Print("It is recommended that you start by finding sharks, because they will produce the fish necessary for both your survival and your attracting other sea");
    await Print("creatures to join your group.");
  }
  await Print("");
  await Print("Good luck!");

  for (var i = 0; i < randint(800, 1200); ++i) {
    print("");
    print("Your hunger: " + hunger + "/100");
    print("");
    print("You have " + fish + " fish.");
    print("You have " + sand + " sand.");
    print("You have " + crystals + " crystals.");
    print("You have " + science + " science.");
    print("");
    print("You have " + sharks + " shark(s) helping you catch fish. Finding another shark will cost you " + ((sharks + 1) * 5) + " fish.");
    print("You have " + rays + " ray(s) helping you catch fish and find sand. Finding another ray will cost you " + ((rays + 1) * 15) + " fish.");
    print("You have " + crabs + " crab(s) helping you find crystals. Finding another crab will cost you " + ((crabs + 1) * 10) + " fish.");
    print("You have " + scienceSharks + " science shark(s) producing science. Training another science shark will cost you 1 shark and " + ((scienceSharks + 1) * 20) + " crystals.");
    print("");
    if (upgradeIndex < upgrades.length) {
      print("The next upgrade, \"" + upgrades[upgradeIndex][6] + "\", will cost " + upgrades[upgradeIndex][0] + " science, " + upgrades[upgradeIndex][1] + " fish, " + upgrades[upgradeIndex][2] + " sand, and " + upgrades[upgradeIndex][3] + " crystals.");
      print("It will grant a shark improvement factor of " + upgrades[upgradeIndex][4] + " and a ray improvement factor of " + upgrades[upgradeIndex][5] + ".");
    }
    else {
      print("All upgrades have been purchased. The science sharks have clearly been partying the past few weeks...");
    }

    print("");
    print("You lose one hunger point.");
    hunger--;
    print("Your hunger: " + hunger + "/100.");
    print("");
    if (hunger === 0) {
      print("You die of hunger. You lasted " + i + " turn(s).");
      print("");
      await exit();
    }

    var action = await get_string("Enter your command: ");
    if (action == "c" || action == "catch") {
      var val = randint(0, 9);
      if (val <= 1) {
        print("The fish escapes.");
      }
      else if (val <= 3) {
        print("The fish escape.");
      }
      else if (val <= 5) {
        fish++;
        print("You successfully catch a fish. Fish: " + fish + ".");
      }
      else if (val <= 7) {
        fish += 2;
        print("You successfully catch a pair of fish. Fish: " + fish + ".");
      }
      else {
        fish += randint(8, 10);
        print("You successfully catch a whole school of fish! Fish: " + fish + ".");
      }
    }
    else if (action == "e" || action == "eat") {
      if (fish === 0) {
        print("You are out of fish.")
      }
      else {
        fish--;
        hunger = Math.min(hunger + 5, 100);
        print("You eat a fish. Fish: " + fish + ". Hunger: " + hunger + "/100.");
      }
    }
    else if (action == "f" || action == "find") {
      var item = await get_string("Find what? ");
      if (item == "shark") {
        if (fish >= (sharks + 1) * 5) {
          fish -= (sharks + 1) * 5;
          var val = randint(0, 1);
          if (val === 0) {
            sharks++;
            print("Another shark joins you for the price of " + (sharks * 5) + " fish. Fish: " + fish + ". Sharks: " + sharks + ".");
          }
          else {
            print("The shark gladly accepts your gift of fish, but refuses to join you. You lose " + ((sharks + 1) * 5) + " fish. Fish: " + fish + ".");
          }
        }
        else {
          print("The shark refuses to join your group without a larger gift of fish.");
        }
      }
      else if (item == "ray") {
        if (fish >= (rays + 1) * 15) {
          fish -= (rays + 1) * 15;
          var val = randint(0, 1);
          if (val === 0) {
            rays++;
            print("A ray joins you for the price of " + (rays * 15) + " fish. Fish: " + fish + ". Rays: " + rays + ".");
          }
          else {
            print("The ray gladly accepts your gift of fish, but refuses to join you. You lose " + ((rays + 1) * 15) + " fish. Fish: " + fish + ".");
          }
        }
        else {
          print("The ray refuses to join your group without a larger gift of fish.");
        }
      }
      else if (item == "crab") {
        if (fish >= (crabs + 1) * 10) {
          fish -= (crabs + 1) * 10;
          var val = randint(0, 1);
          if (val === 0) {
            crabs++;
            print("A ray joins you for the price of " + (crabs * 10) + " fish. Fish: " + fish + ". Crabs: " + crabs + ".");
          }
          else {
            print("The crab gladly accepts your gift of fish, but refuses to join you. You lose " + ((crabs + 1) * 10) + " fish. Fish: " + fish + ".");
          }
        }
        else {
          print("The crab refuses to join your group without a larger gift of fish.");
        }
      }
      else {
        print("Unknown item.");
      }
    }
    else if (action == "q" || action == "quit") {
      print("Game exited. You lasted " + i + " turn(s).");
      print("");
      await exit();
    }
    else if (action == "t" || action == "train") {
      if (sharks > 0 && crystals >= (scienceSharks + 1) * 20) {
        scienceSharks++;
        sharks--;
        crystals -= scienceSharks * 20;
        print("You teach a shark all your knowledge of science. It will make discoveries for you. Science sharks: " + scienceSharks + ". Crystals: " + crystals + ".");
      }
      else if (sharks === 0) {
        print("No sharks are available for the position.");
      }
      else {
        print("The shark fails in its studies due to the lack of crystals provided for chemistry.");
      }
    }
    else if (action == "b" || action == "buy") {
      if (upgradeIndex >= upgrades.length) {
        print("All upgrades have been purchased already!")
      }
      else {
        if (science < upgrades[upgradeIndex][0]) {
          print("Not enough science.");
        }
        else if (fish < upgrades[upgradeIndex][1]) {
          print("Not enough fish.");
        }
        else if (sand < upgrades[upgradeIndex][2]) {
          print("Not enough sand.");
        }
        else if (crystals < upgrades[upgradeIndex][3]) {
          print("Not enough crystals.");
        }
        else {
          science -= upgrades[upgradeIndex][0];
          fish -= upgrades[upgradeIndex][1];
          sand -= upgrades[upgradeIndex][2];
          crystals -= upgrades[upgradeIndex][3];
          print("Upgrade purchased! Sharks are " + upgrades[upgradeIndex][4] + " times as effective and rays are " + upgrades[upgradeIndex][4] + " times as effective!");
          print("Science: " + science + ". Fish: " + fish + ". Sand: " + sand + ". Crystals: " + crystals + ".");
          upgradeIndex++;
        }
      }
    }
    else {
      print("Invalid command.");
    }

    if (sharks > 0) {
      var fishBonus = 0;
      for (var i = 0; i < sharks; ++i) {
        var limit = 1;
        if (upgradeIndex > 0) {
          limit = 2;
        }
        if (randint(0, 1) == 0) {
          fishBonus += limit;
        }
      }
      fish += fishBonus;
      print("");
      print("Your " + sharks + " shark(s) bring you a bonus " + fishBonus + " fish. Fish: " + fish + ".");
    }

    if (rays > 0) {
      var fishBonus = 0;
      var sandBonus = 0;
      for (var i = 0; i < rays; ++i) {
        var limit = 1
        if (upgradeIndex > 1) {
          limit = 2
        }
        if (randint(0, 3) == 0) {
          fishBonus += limit
        }
        if (randint(0, 1) == 0) {
          sandBonus += limit
        }
      }
      fish += fishBonus;
      sand += sandBonus;
      print("");
      print("Your " + rays + " ray(s) bring you a bonus " + fishBonus + " fish and " + sandBonus + " sand. Fish: " + fish + ". Sand: " + sand + ".")
    }

    if (crabs > 0) {
      var crystalBonus = 0;
      for (var i = 0; i < rays; ++i) {
        if (randint(0, 11) == 0) {
          crystalBonus++;
        }
      }
      crystals += crystalBonus;
      print("");
      print("Your " + crabs + " crab(s) bring you a bonus " + crystalBonus + " crystals. Crystals: " + crystals + ".");
    }

    if (scienceSharks > 0) {
      var scienceBonus = 0;
      for (var i = 0; i < scienceSharks; ++i) {
        if (randint(0, 1) == 0) {
          scienceBonus++;
        }
      }
      science += scienceBonus;
      print("");
      print("Your " + scienceSharks + " science sharks produce " + scienceBonus + " science. Science: " + science + ".");
    }

    if (sharks >= 12 && rays >= 6 && crabs >= 9 && scienceSharks >= 3 && upgradeIndex == 2 && fish >= 1000 && sand >= 1000 && crystals >= 50) {
      print("");
      print("You win!!! Congratulations! Play again?");
      print("");
      await exit();
    }
  }

  print("");
  print("You ran out of time. Try again?");
  print("");
  await exit();
}

main();
