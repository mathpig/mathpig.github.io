'use strict';

var your_money = 0;
var computers_money = 0;
var turns_left = 1000;
var turns_locked = false;

var recent_choices = [];
var tit_for_tat_on_permanently = false;
var tit_for_tat_on_temporarily = false;
var tit_for_tat_on_count = 0;
var on_probation = false;
var on_probation_count = 0;
var computers_choice = 'P';

function Terminate() {
  passive.onclick = null;
  agressive.onclick = null;
}

function TestForOffences(choices, unacceptable_aggressive_val) {
  var aggressive_count = 0;
  for (var i = 0; i < choices.length; ++i) {
    if (choices[i] == 'A') {
      aggressive_count++;
    }
  }
  if (aggressive_count >= unacceptable_aggressive_val) {
    tit_for_tat_on_temporarily = true;
    tit_for_tat_on_count = 20;
  }
}

function TestForShortMediumAndLongTermOffences(short_term_choices,
                                               short_term_unacceptable_aggressive_val,
                                               medium_term_choices,
                                               medium_term_unacceptable_aggressive_val,
                                               long_term_choices,
                                               long_term_unacceptable_aggressive_val) {
  TestForOffences(short_term_choices, short_term_unacceptable_aggressive_val);
  TestForOffences(medium_term_choices, medium_term_unacceptable_aggressive_val);
  TestForOffences(long_term_choices, long_term_unacceptable_aggressive_val);
}

function DollOutMoney(your_choice, computers_choice) {
  if (your_choice == 'P' && computers_choice == 'P') {
    your_money += 75;
    computers_money += 75;
  }
  else if (your_choice == 'A' && computers_choice == 'P') {
    your_money += 100;
    computers_money += 25;
  }
  else if (your_choice == 'P' && computers_choice == 'A') {
    your_money += 25;
    computers_money += 100;
  }
  else if (your_choice == 'A' && computers_choice == 'A') {
    your_money += 50;
    computers_money += 50;
  }
}

function DoRound(your_choice, computers_choice) {
  if (!turns_locked) {
    turns_locked = true;
    turns_left = parseInt(turns.value);
    turns.disabled = true;
  }
  if (turns_left <= 0) {
    Terminate();
    return;
  }

  computers_choice = 'P';

  if (recent_choices.length == 1) {
    if (recent_choices[0] == 'A') {
      tit_for_tat_on_temporarily = true;
      tit_for_tat_on_count = 20;
    }
  }

  var short_term_choices = recent_choices.slice(Math.max(recent_choices.length - 3, 0), recent_choices.length);
  var medium_term_choices = recent_choices.slice(Math.max(recent_choices.length - 20, 0), recent_choices.length);
  var long_term_choices = recent_choices;

  if (!on_probation && !tit_for_tat_on_temporarily && !tit_for_tat_on_permanently) {
    TestForShortMediumAndLongTermOffences(short_term_choices, 2, medium_term_choices, 3, long_term_choices, 5);
  }

  if (!on_probation && tit_for_tat_on_temporarily && !tit_for_tat_on_permanently && tit_for_tat_on_count > 0) {
    computers_choice = recent_choices[recent_choices.length - 1];
    tit_for_tat_on_count--;
  }

  if (tit_for_tat_on_temporarily && tit_for_tat_on_count <= 0) {
    on_probation = true;
    on_probation_count = 50;
    tit_for_tat_on_temporarily = false;
  }
  if (!tit_for_tat_on_permanently && on_probation && on_probation_count > 0) {
    TestForShortMediumAndLongTermOffences(short_term_choices, 2, medium_term_choices, 2, long_term_choices, 4);
    if (tit_for_tat_on_temporarily) {
      tit_for_tat_on_permanently = true;
      tit_for_tat_on_temporarily = false;
      tit_for_tat_on_count = 0;
      on_probation = false;
      on_probation_count = 0;
    }
  }

  if (on_probation && on_probation_count <= 0) {
    on_probation = false;
  }

  if (tit_for_tat_on_permanently) {
    computers_choice = recent_choices[recent_choices.length - 1];
  }

  if (recent_choices.length >= 100) {
    recent_choices.shift();
  }

  recent_choices.push(your_choice);

  DollOutMoney(your_choice, computers_choice);

  turns_left--;
  turns.value = turns_left;
  yourmoney.innerText = your_money;
  computersmoney.innerText = computers_money;
}

passive.onclick = function() {
  DoRound('P', computers_choice);
};

aggressive.onclick = function() {
  DoRound('A', computers_choice);
};
