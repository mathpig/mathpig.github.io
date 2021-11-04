'use strict';

var your_money = 0;
var computers_money = 0;
var turns_left = 1000;
var turns_locked = false;

var recent_choices = [];
var tit_for_tat_on_permanently = false;
var tit_for_tat_on_temporarily = false;
var tit_for_tat_count = 0;
var on_probation = false;
var on_probation_count = 0;
var computers_choice = 'P';

function DoRound(your_choice, computers_choice) {
  if (!turns_locked) {
    turns_locked = true;
    turns_left = parseInt(turns.value);
    turns.disabled = true;
  }
  if (turns_left <= 0) {
    passive.onclick = null;
    aggressive.onclick = null;
    return;
  }

  computers_choice = 'P';

  if (recent_choices.length == 1) {
    if (recent_choices[0] == 'A') {
      tit_for_tat_on_temporarily = true;
      tit_for_tat_count = 20;
    }
  }

  var short_term_recent_choices = recent_choices.slice(Math.max(recent_choices.length - 4, 0), recent_choices.length);
  var medium_term_recent_choices = recent_choices.slice(Math.max(recent_choices.length - 21, 0), recent_choices.length);
  var long_term_recent_choices = recent_choices;

  if (on_probation == false && tit_for_tat_on_temporarily == false && tit_for_tat_on_permanently == false) {
    var aggressive_count = 0;
    for (var i = 0; i < short_term_recent_choices.length; ++i) {
      if (short_term_recent_choices[i] == 'A') {
        aggressive_count++;
      }
    }
    if (aggressive_count >= 2) {
      tit_for_tat_on_temporarily = true;
      tit_for_tat_count = 20;
    }

    var aggressive_count = 0;
    for (var i = 0; i < medium_term_recent_choices.length; ++i) {
      if (short_term_recent_choices[i] == 'A') {
        aggressive_count++;
      }
    }
    if (aggressive_count >= 3) {
      tit_for_tat_on_temporarily = true;
      tit_for_tat_count = 20;
    }

    var aggressive_count = 0;
    for (var i = 0; i < long_term_recent_choices.length; ++i) {
      if (short_term_recent_choices[i] == 'A') {
        aggressive_count++;
      }
    }
    if (aggressive_count >= 5) {
      tit_for_tat_on_temporarily = true;
      tit_for_tat_count = 20;
    }
  }

  if (on_probation == false && tit_for_tat_on_temporarily && tit_for_tat_on_permanently == false && tit_for_tat_count > 0) {
    computers_choice = recent_choices[recent_choices.length - 1];
    tit_for_tat_count--;
  }

  if (tit_for_tat_on_temporarily && tit_for_tat_count == 0) {
    on_probation = true;
    on_probation_count = 50;
    tit_for_tat_on_temporarily = false;
  }
  if (tit_for_tat_on_permanently == false && on_probation && on_probation_count > 0) {
    var aggressive_count = 0;
    for (var i = 0; i < medium_term_recent_choices.length; ++i) {
      if (short_term_recent_choices[i] == 'A') {
        aggressive_count++;
      }
    }
    if (aggressive_count >= 2) {
      tit_for_tat_on_permanently = true;
    }

    var aggressive_count = 0;
    for (var i = 0; i < long_term_recent_choices.length; ++i) {
      if (short_term_recent_choices[i] == 'A') {
        aggressive_count++;
      }
    }
    if (aggressive_count >= 4) {
      tit_for_tat_on_permanently = true;
    }
    on_probation_count--;
  }

  if (tit_for_tat_on_permanently) {
    computers_choice = recent_choices[recent_choices.length - 1];
  }

  if (recent_choices.length >= 100) {
    recent_choices.shift();
  }

  recent_choices.push(your_choice);

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
