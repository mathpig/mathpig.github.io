'use strict';

function clearScreen() {
  for (var i = 0; i < 50; ++i) {
    print("");
  }
}

async function progressBar(a, b) {
  var i = 0;
  for (var i = 0; i < a; ++i) {
    clearScreen();
    bar(i, a);
    await sleep(b);
  }
  clearScreen();
  bar(i, a);
}

function bar(a, b) {
  print("|", "");
  for (var i = 0; i < a; ++i) {
    print("=", "");
  }
  print(">", "");
  for (var i = 0; i < (b - a); ++i) {
    print(" ", "");
  }
  print("|");
}

async function quit() {
  print("Invalid.");
  print("");
  await exit();
}

async function main() {
  print("");

  var a = await get_int("Total units in progress bar: ");
  if (a <= 0) {
    await quit();
  }

  var b = await get_float("Wait time in seconds per unit: ");
  if (b < 0) {
    await quit();
  }

  print("");

  await progressBar(a, b);
  print("");

  await exit();
}

main();
