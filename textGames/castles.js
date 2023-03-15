'use strict';

async function main() {
    var castle = [];
    var health = [];

    print("");
    var rows = await get_int(" How many lanes? ");
    while (rows < 1 || rows > 9) {
        rows = await get_int(" How many lanes (1-9)? ");
    }

    print("");
    var boardSize = await get_int(" How large a board? ");
    while (boardSize < 3 || boardSize > 30) {
        boardSize = await get_int(" How large a board (3-30)? ");
    }

    for (var i = 0; i < rows; ++i) {
        castle.push([]);
        health.push([]);
        for (var j = 0; j < boardSize; ++j) {
            castle[i].push(" --- ");
            health[i].push(0);
        }
    }

    var troopName = {"DWF": "dwarf", "WAR": "warrior", "UNC": "unchained demon", "GLM": "golem", "DRY": "dryad", "HLW": "hollow knight", "ORC": "orc warrior", "BLC": "black knight"};
    var troopMana = {"DWF": 2, "WAR": 3, "UNC": 3, "GLM": 4, "DRY": 4, "HLW": 4, "ORC": 5, "BLC": 10};
    var troopHealth = {"DWF": 818, "WAR": 515, "UNC": 1180, "GLM": 1718, "DRY": 536, "HLW": 1823, "ORC": 1394, "BLC": 1823};
    var troopAttack = {"DWF": 54, "WAR": 129, "UNC": 279, "GLM": 70, "DRY": 151, "HLW": 193, "ORC": 151, "BLC": 526};

    var internals = [];
    for (var i = 0; i < rows; ++i) {
        internals.push([]);
        for (var j = 0; j < 2; ++j) {
            internals[i].push(" --- ");
        }
    }

    var mana = 0;
    var maxMana = 1;
    var manaCounter = 0;
    var manaPunishment = 0;
    var enemyMana = 0;
    var enemyManaPunishment = 0;
    var castleHealth = 8869;
    var enemyHealth = 8869;
    var uses = 0;
    var enemyUses = 0;
    var hasWon = false;
    var hasLost = false;

    function fourDigit(health) {
        if (health >= 10000) {
            return "10K+";
        }
        health = health.toString();
        while (health.length < 4) {
            health = "0" + health;
        }
        return health;
    }

    function printCastle() {
        print("");
        print(" Your mana: " + mana.toString());
        print("")
            print("")
            print(" Your health: " + fourDigit(castleHealth), "");
        for (var i = 0; i < (5 * boardSize - 10); ++i) {
            print(" ", "");
        }
        print("Health of Enemy: " + fourDigit(enemyHealth));
        print("");
        print("    + + + + + +", "");
        for (var i = 0; i < (5 * boardSize - 2); ++i) {
            print(" ", "");
        }
        print("+ + + + + +");
        print("    # # # # # #", "");
        for (var i = 0; i < (5 * boardSize - 2); ++i) {
            print(" ", "");
        }
        print("# # # # # #");
        print("    ###########", "");
        for (var i = 0; i < (5 * boardSize - 2); ++i) {
            print(" ", "");
        }
        print("###########");
        print("     #########", "");
        for (var i = 0; i < (5 * boardSize); ++i) {
            print(" ", "");
        }
        print("#########");
        print("     #       #", "");
        for (var i = 0; i < (5 * boardSize); ++i) {
            print("~", "");
        }
        print("#       #");
        for (var i = 0; i < rows; ++i) {
            print("     # " + internals[i][0] + " " + (i + 1).toString(), "");
            for (var j = 0; j < boardSize; ++j) {
                print(castle[i][j], "");
            }
            print((i + 1).toString() + " " + internals[i][1] + " #");
            print("     #########", "");
            for (var j = 0; j < (5 * boardSize); ++j) {
                print("~", "");
            }
            print("#########");
        }
        print("     #########", "");
        for (var i = 0; i < (5 * boardSize); ++i) {
            print(" ", "");
        }
        print("#########");
    }

    printCastle();
    print("");

    while (true) {
        if (mana < (2 + manaPunishment)) {
            await sleep(1);
        }

        if (mana == maxMana) {
            manaCounter++;
        }
        mana = Math.min(mana + 1, maxMana, 12);
        if (manaCounter >= (maxMana - 1)) {
            maxMana++;
            manaCounter = 0;
        }

        enemyMana = Math.min(enemyMana + 1, 12);

        for (var i = 0; i < rows; ++i) {
            for (var j = (boardSize - 2); j >= 0; --j) {
                if (castle[i][j][4] == "+" && castle[i][j + 1] == " --- ") {
                    castle[i][j + 1] = castle[i][j];
                    health[i][j + 1] = health[i][j];
                    castle[i][j] = " --- ";
                    health[i][j] = 0;
                }
            }
        }
        for (var i = 0; i < rows; ++i) {
            if (internals[i][0] != " --- " && castle[i][0] == " --- ") {
                castle[i][0] = internals[i][0];
                health[i][0] = troopHealth[castle[i][0][1] + castle[i][0][2] + castle[i][0][3]];
                internals[i][0] = " --- ";
            }
        }
        for (var i = 0; i < rows; ++i) {
            for (var j = 1; j < boardSize; ++j) {
                if (castle[i][j][0] == "-" && castle[i][j - 1] == " --- ") {
                    castle[i][j - 1] = castle[i][j];
                    health[i][j - 1] = health[i][j];
                    castle[i][j] = " --- ";
                    health[i][j] = 0;
                }
            }
        }
        for (var i = 0; i < rows; ++i) {
            if (internals[i][1] != " --- " && castle[i][boardSize - 1] == " --- ") {
                castle[i][boardSize - 1] = internals[i][1];
                health[i][boardSize - 1] = troopHealth[castle[i][boardSize - 1][1] + castle[i][boardSize - 1][2] + castle[i][boardSize - 1][3]];
                internals[i][1] = " --- ";
            }
        }

        for (var i = 0; i < rows; ++i) {
            for (var j = 0; j < (boardSize - 1); ++j) {
                if (castle[i][j][4] == "+" && castle[i][j + 1][0] == "-") {
                    health[i][j + 1] -= troopAttack[castle[i][j][1] + castle[i][j][2] + castle[i][j][3]];
                    if (health[i][j + 1] <= 0) {
                        health[i][j + 1] = 0;
                        if (castle[i][j + 1] == "-UNC ") {
                            enemyManaPunishment -= 3;
                        }
                        if (castle[i][j + 1] == "-HLW ") {
                            castle[i][j + 1] = " HLW+";
                            health[i][j + 1] = 1823;
                        }
                        else {
                            castle[i][j + 1] = " --- ";
                        }
                    }
                }
            }
        }
        for (var i = 0; i < rows; ++i) {
            if (internals[i][0] != " --- " && castle[i][0][0] == "-") {
                health[i][0] -= randint(2, 3) * troopAttack[internals[i][0][1] + internals[i][0][2] + internals[i][0][3]];
                if (health[i][0] <= 0) {
                    health[i][0] = 0;
                    if (castle[i][0] == "-UNC "){
                        enemyManaPunishment -= 3;
                    }
                    if (castle[i][0] == "-HLW ") {
                        castle[i][0] = " HLW+";
                        health[i][0] = 1823;
                    }
                    else {
                        castle[i][0] = " --- ";
                    }
                }
            }
        }
        for (var i = 0; i < rows; ++i) {
            for (var j = 1; j < boardSize; ++j) {
                if (castle[i][j][0] == "-" && castle[i][j - 1][4] == "+") {
                    health[i][j - 1] -= troopAttack[castle[i][j][1] + castle[i][j][2] + castle[i][j][3]];
                    if (health[i][j - 1] <= 0) {
                        health[i][j - 1] = 0;
                        if (castle[i][j - 1] == " UNC+") {
                            manaPunishment -= 3;
                        }
                        if (castle[i][j - 1] == " HLW+") {
                            castle[i][j - 1] = "-HLW ";
                            health[i][j - 1] = 1823;
                        }
                        else {
                            castle[i][j - 1] = " --- ";
                        }
                    }
                }
            }
        }
        for (var i = 0; i < rows; ++i) {
            if (internals[i][1] != " --- " && castle[i][boardSize - 1][4] == "+") {
                health[i][boardSize - 1] -= randint(2, 3) * troopAttack[internals[i][1][1] + internals[i][1][2] + internals[i][1][3]];
                if (health[i][boardSize - 1] <= 0) {
                    health[i][boardSize - 1] = 0;
                    if (castle[i][boardSize - 1] == " UNC+") {
                        manaPunishment -= 3;
                    }
                    if (castle[i][boardSize - 1] == " HLW+") {
                        castle[i][boardSize - 1] = "-HLW ";
                        health[i][boardSize - 1] = 1823;
                    }
                    else {
                        castle[i][boardSize - 1] = " --- ";
                    }
                }
            }
        }

        for (var i = 0; i < rows; ++i) {
            if (castle[i][boardSize - 1][4] == "+") {
                enemyHealth -= troopAttack[castle[i][boardSize - 1][1] + castle[i][boardSize - 1][2] + castle[i][boardSize - 1][3]];
                if (enemyHealth < 0) {
                    enemyHealth = 0;
                    hasWon = true;
                }
            }
        }
        for (var i = 0; i < rows; ++i) {
            if (castle[i][0][0] == "-") {
                castleHealth -= troopAttack[castle[i][0][1] + castle[i][0][2] + castle[i][0][3]];
                if (castleHealth < 0) {
                    castleHealth = 0;
                    hasLost = true;
                }
            }
        }

        for (var i = 0; i < rows; ++i) {
            for (var j = 0; j < boardSize; ++j) {
                if (castle[i][j] == " DRY+" || castle[i][j] == "-DRY ") {
                    health[i][j] = Math.min(health[i][j] + 107, troopHealth["DRY"]);
                }
            }
        }

        print("");
        printCastle();
        print("");

        if (hasWon && hasLost) {
            await sleep(1);
            print("Tie! How surprising! Play again?");
            print("");
            await exit();
        }
        if (hasWon) {
            await sleep(1);
            print("You win! Congratulations!");
            print("");
            await exit();
        }
        if (hasLost) {
            await sleep(1);
            print("You lose. Try again?");
            print("");
            await exit();
        }

        var ans = "";
        if (mana >= (2 + manaPunishment)) {
            ans = await get_string(" Spawn troop? ");
        }
        else if (mana >= 2) {
            print("You cannot do anything with this amount of mana due to the mana penalty incurred by your living unchained demon(s).")
        }
        if (ans == "y" || ans == "yes") {
            var lane = await get_int(" Which lane? ");
            if (lane < 1 || lane > rows) {
                print(" Invalid lane.");
            }
            else if (internals[lane - 1][0] != " --- ") {
                print(" This lane already has a troop inside your castle.");
            }
            else {
                var displayMessage = true;
                for (i in troopName) {
                    if (mana >= (troopMana[i] + manaPunishment) && (i != "UNC" || randint(0, 3) == 0) && (i != "DRY" || randint(0, 1) == 0) && (i != "HLW" || randint(0, 7) == 0) && (i != "BLC" || randint(0, 3) == 0)) {
                        var spawn = await get_string(" Spawn " + troopName[i] + "? ");
                        if (spawn == "y" || spawn == "yes") {
                            internals[lane - 1][0] = " " + i + "+";
                            mana -= (troopMana[i] + manaPunishment);
                            if (i == "UNC") {
                                manaPunishment += 3;
                            }
                            printCastle();
                            await sleep(0.5);
                            displayMessage = false;
                            break;
                        }
                    }
                }
                if (displayMessage) {
                    print(" No other troops are currently available. Please check back later.");
                }
            }
        }
        else if (mana >= (2 + manaPunishment) && randint(0, 1) == 0) {
            var fortify = await get_string(" Fortify? ")
            if (fortify == "y" || fortify == "yes") {
                mana -= (2 + manaPunishment);
                castleHealth += Math.round(2680 * Math.pow(0.7, uses))
                uses++;
                printCastle();
                await sleep(0.5);
            }
        }

        var possibilities = [];
        for (i in troopName) {
            if ((troopMana[i] + enemyManaPunishment) <= enemyMana) {
                possibilities.push(i);
                if (i != "UNC") {
                    possibilities.push(i);
                }
            }
        }
        var lane = randint(0, rows - 1);
        if (internals[lane][1] == " --- " && possibilities.length > 0 && randint(0, 3) == 0) {
            var val = possibilities[randint(0, possibilities.length - 1)];
            internals[lane][1] = "-" + val + " ";
            enemyMana -= (troopMana[val] + enemyManaPunishment);
            if (val == "UNC") {
                enemyManaPunishment += 3;
            }
            print("");
            print(" The enemy spawns a(n) " + troopName[val] + "!");
            printCastle();
            await sleep(0.5);
        }
        else if (enemyMana >= (2 + enemyManaPunishment) && randint(0, 11) == 0) {
            print("");
            print(" The enemy fortifies!");
            enemyMana -= (2 + enemyManaPunishment);
            enemyHealth += Math.round(2680 * Math.pow(0.7, enemyUses));
            enemyUses++;
            printCastle();
            await sleep(0.5);
        }
    }
}

main();
