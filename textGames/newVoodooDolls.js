var coordinates = [];
var points = [];
var turn = 0;
var typeTurns = ["roll", "card", "pin"];
var indexTurn = 0;
var chatRecord = [];
var usedCards = [];
var stats = [];
var cursedPlayers = [];
var afflictedPlayers = [];
var voicelessPlayers = [];
var blessedPlayers = [];
var restricted = true;

var teams = {};

print("");
var playerCount = get_int("How many players are there? ");
if (playerCount == -1) {
    restricted = false;
    print("Restriction removed.");
    print("");
    playerCount = get_int("How many players are there? ");
}
while (playerCount < 1 || (playerCount > 9 && restricted)) {
    playerCount = get_int("How many players are there? (this is a 1-9 player game) ");
}
if (playerCount == 1) {
    print("Note: 1 player only is possible, but is not recommended, and will be very dull because you will only have yourself to stick pins into. Proceed with caution.");
}
var boardStyle = Math.ceil(Math.sqrt(playerCount));

print("");

for (var i = 0; i < playerCount; ++i) {
    coordinates.push(0);
    points.push(0);
    stats.push([False, False, False, False]);
    teams[i] = get_int("Which team is player " + (i + 1) + " part of? ")
    while (teams[i] < 1 || teams[i] > playerCount) {
        teams[i] = get_int("Please enter a team number between 1 and " + playerCount + ", inclusive. ");
    }
    print("");
}

while (true) {
    print("Points:");
    for (var i = 0; i < playerCount; ++i) {
        print("Player " + (i + 1) + " has " + points[i] + " points.");
    }
    print("");
    if (cursedPlayers.length > 0) {
        print("Cursed players: ", "");
        for (var i = 0; i < cursedPlayers.length; ++i) {
            print(cursedPlayers[i], "");
            if (i < cursedPlayers.length - 1) {
                print(", ", "");
            }
        }
        print("");
    }
    if (afflictedPlayers.length > 0) {
        print("Afflicted players: ", "");
        for (var i = 0; i < afflictedPlayers.length; ++i) {
            print(afflictedPlayers[i], "");
            if (i < afflictedPlayers.length - 1) {
                print(", ", "");
            }
        }
        print("");
    }
    if (voicelessPlayers.length > 0) {
        print("Voiceless players: ", "");
        for (var i = 0; i < voicelessPlayers.length; ++i) {
            print(voicelessPlayers[i], "");
            if (i < voicelessPlayers.length - 1) {
                print(", ", "");
            }
        }
        print("");
    }
    if (blessedPlayers.length > 0) {
        print("Blessed players: ", "");
        for (var i = 0; i < blessedPlayers.length; ++i) {
            print(blessedPlayers[i], "");
            if (i < blessedPlayers.length - 1) {
                print(", ", "");
            }
        }
        print("");
    }
    if (cursedPlayers.length !== 0 || afflictedPlayers.length !== 0 || voicelessPlayers.length !== 0 || blessedPlayers.length !== 0) {
        print("");
    }
    print("Board:");
    print("");
    for (var i = 0; i < Math.ceil(playerCount / boardStyle); ++i) {
        for (var j = 0; j < 29; ++j) {
            print("|", "");
            for (var k = 0; k < boardStyle; ++k) {
                if (boardStyle * i + k < playerCount && coordinates[boardStyle * i + k] == j) {
                    print(boardStyle * i + k + 1, "");
                }
                else if (j == 9 || j == 19) {
                    print("T", "");
                }
                else {
                    var val = randint(0, 1);
                    if (val === 0) {
                        print(".", "");
                    }
                    else {
                        print(",", "");
                    }
                }
            }
        }
        print("|", "");
        for (var i = 0; i < boardStyle; ++i) {
            print("C", "");
        print("|");
    }
    if (chatRecord.length > 0) {
        print("");
    }
    for (var i = 0; i < chatRecord.length; ++i) {
        print("Player " + chatRecord[i][0] + " said \"" + chatRecord[i][1] + "\".");
    }

    print("");
    action = get_string("Enter your command, player " + (turn + 1) + "(\"talk\" or \"" + typeTurns[indexTurn] + "\"): ");
    while action != typeTurns[indexTurn] and action != "talk":
        action = get_string(f"Enter your command (\"talk\" or \"{typeTurns[indexTurn]}\"): ")
    if action == typeTurns[indexTurn]:
        if indexTurn == 0:
            rollVal = randint(1, 6) + randint(1, 6)
            coordinates[turn] += rollVal
            if rollVal == 11:
                print(f"Player {turn + 1} rolled an 11.")
            else:
                print(f"Player {turn + 1} rolled a {rollVal}.")
            if coordinates[turn] >= 29:
                points[turn] += 100
                print("")
                print(f"Player {turn + 1} reaches the castle and gains 100 points! Final scoreboard:")
                for i in range(playerCount):
                    print(f"Player {i + 1}: {points[i]} points")
                print("")
                maxPoints = points[0]
                winnerIndices = [0]
                for i in range(1, playerCount):
                    if points[i] > maxPoints:
                        maxPoints = points[i]
                        winnerIndices = [i]
                    elif points[i] == maxPoints:
                        winnerIndices.append(i)
                d = {}
                print(f"Winning player numbers: ", end="")
                for i in range(len(winnerIndices)):
                    print(winnerIndices[i] + 1, end="")
                    if i < len(winnerIndices) - 1:
                        print(", ", end="")
                    d[teams[winnerIndices[i]]] = True
                print("")
                print("")
                print("Winning teams: ", end="")
                winners = []
                for i in d:
                    winners.append(i)
                for i in range(len(winners)):
                    print(winners[i], end="")
                    if i < len(winners) - 1:
                        print(", ", end="")
                print("")
                print("")
                exit()
        elif indexTurn == 1:
            card = randint(0, 7)
            print("The card reads, ", end="")
            if card == 0:
                print("\"You and your kin are cursed for nine generations.\" Oh my, intones Mr. Slavan.")
                print("The instructions declare that your hand will be forced to stab pins into your own player every turn rather than your true target.")
                print("You will, however, only lose 5 points from doing so rather than the customary 25.")
                for i in range(playerCount):
                    if not stats[i][0] and teams[i] == teams[turn]:
                        cursedPlayers.append(i + 1)
                        stats[i][0] = True
            elif card == 1:
                print("\"You may cast another player into eternal affliction.\"")
                print("The instructions declare that your enemy shall lose 10 points per turn as a result of their eternal pain.")
                print("")
                player = get_int("Enter the player you would like to cast into eternal affliction: ")
                while player < 1 or player > playerCount:
                    player = get_int("Please enter a valid player. Try again. ")
                if teams[player - 1] == teams[turn]:
                    print("You idiot! It could have been anybody else! Why, why!!!")
                if not stats[player - 1][1]:
                    afflictedPlayers.append(player)
                    stats[player - 1][1] = True
            elif card == 2:
                print("\"You may suck the voice of another player out of their soul.\"")
                print("The instructions declare that your enemy shall no longer be able to talk.")
                print("")
                player = get_int("Enter the player you would like to take the voice of: ")
                while player < 1 or player > playerCount:
                    player = get_int("Please enter a valid player. Try again. ")
                if teams[player - 1] == teams[turn]:
                    print("You idiot! It could have been anybody else! Why, why!!!")
                if not stats[player - 1][2]:
                    voicelessPlayers.append(player)
                    stats[player - 1][2] = True
            elif card == 3:
                print("\"You and your kin are blessed for nine generations.\" Oh dear, intones Mr. Slavan.")
                print("The instructions declare that you may stick a pin into any player on your turn, whether they are nearby or not.")
                for i in range(playerCount):
                    if not stats[i][3] and teams[i] == teams[turn]:
                        blessedPlayers.append(i + 1)
                        stats[i][3] = True
            else:
                val = randint(0, 1)
                value = randint(1, 6) * randint(1, 6)
                if val == 0:
                    print(f"\"You gain {value} points.\"")
                    points[turn] += value
                else:
                    print(f"\"You lose {value} points.\"")
                    points[turn] -= value
                print("These instructions seem rather self-explanatory.")
        else:
            if stats[turn][0]:
                points[turn] -= 5
                print("Due to the curse laid upon you, the pin flies out of your hand and into your figure. Ouch.")
            else:
                originalPlayer = get_int("Enter the player you would like to stick a pin into: ")
                while originalPlayer < 1 or originalPlayer > playerCount or (abs(coordinates[turn] - coordinates[originalPlayer - 1]) > 3 and not stats[turn][3]):
                    originalPlayer = get_int("Either the selected player is too far away to stick a pin into or simply does not exist. Please retry. ")
                if originalPlayer - 1 == turn:
                    points[turn] -= 25
                    if stats[turn][3]:
                        print("You idiot! It could have been anybody else! Why, why!!!")
                    else:
                        print("Sad you had to stick one into yourself... Ah, well...")
                else:   
                    points[turn] += 50
                    points[originalPlayer - 1] -= 25
            if coordinates[turn] == 9 or coordinates[turn] == 19:
                print("Because you are atop a tower, you may stick a pin into a second nearby player (must be different from the first, unless the first was you).")
                secondPin = get_string("Would you like to do so? ")
                if secondPin == "y" or secondPin == "yes":
                    if stats[turn][0]:
                        points[turn] -= 5
                        print("Due to the curse laid upon you, the pin flies out of your hand and into your figure. Ouch. You regret opting for a second go.")
                    else:
                        player = get_int("Enter the player you would like to stick a pin into: ")
                        while player < 1 or player > playerCount or (abs(coordinates[turn] - coordinates[player - 1]) > 3 and not stats[turn][3]) or (player == originalPlayer and player - 1 != turn):
                            print("Either the selected player is too far away to stick a pin into, simply does not exist, or has already been attacked.")
                            player = get_int("Please retry. ")
                        if player - 1 == turn:
                            points[turn] -= 25
                            if stats[turn][3]:
                                print("You idiot! It could have been anybody else! This is what you do with your tower priviledge?! Why, why!!!")
                            else:
                                print("Sad you had to stick one into yourself... Maybe shouldn't have opted to go again... Ah, well...")
                        else:
                            points[turn] += 50
                            points[player - 1] -= 25
    else:
        player = get_int("Which player is talking: ")
        while player < 1 or player > playerCount:
            player = get_int("Which player is talking (don't lie): ")
        if stats[player - 1][2]:
            print("You have no voice and manage only to produce an incomprehensible grunt.")
            chatRecord.append([player, "ummph-la"])
        else:
            message = get_string("Enter your chat message: ")
            chatRecord.append([player, message])
    if action == typeTurns[indexTurn]:
        if indexTurn == 2:
            if stats[turn][1]:
                points[turn] -= 10
                print("")
                print("You lose 10 points due to the eternal affliction you have been cast into.")
            indexTurn = 0
            turn += 1
            turn %= playerCount
        else:
            indexTurn += 1
    print("")
}
