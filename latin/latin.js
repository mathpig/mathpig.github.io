"use strict";

var words = [[["amor", "amoris", "love"], "3rd Declension Masculine Noun: amor, amoris: love"],
             [["deliciae", "deliciarum", "delight"], "1st Declension Feminine Noun: deliciae, deliciarum: delight"],
             [["digitus", "digiti", "finger"], "2nd Declension Masculine Noun: digitus, digiti: finger"],
             [["domina", "dominae", "mistress"], "1st Declension Feminine Noun: domina, dominae: mistress"],
             [["gremium", "gremii", "lap"], "2nd Declension Neuter Noun: gremium, gremii: lap"],
             [["oculus", "oculi", "eye"], "2nd Declension Masculine Noun: oculus, oculi: eye"],
             [["passer", "passeris", "sparrow"], "3rd Declension Masculine Noun: passer, passeris: sparrow"],
             [["senex", "senis", "old man"], "3rd Declension Masculine Noun: senex, senis: old man"],
             [["soror", "sororis", "sister"], "3rd Declension Feminine Noun: soror, sororis: sister"],
             [["verbum", "verbi", "word"], "2nd Declension Neuter Noun: verbum, verbi: word"],
             [["meus", "mea", "meum", "my"], "1st-2nd Declension Adjective: meus, mea, meum: my"],
             [["severus", "severa", "severum", "strict"], "1st-2nd Declension Adjective: severus, severa, severum: strict"],
             [["aestimo", "aestimare", "aestimavi", "aestimatum", "to regard"], "1st Conjugation Verb: aestimo, aestimare, aestimavi, aestimatum: to regard"],
             [["invideo", "invidere", "invidi", "invisum", "to envy"], "2nd Conjugation Verb: invideo, invidere, invidi, invisum: to envy"],
             [["puto", "putare", "putavi", "putatum", "to think"], "1st Conjugation Verb: puto, putare, putavi, putatum: to think"],
             [["dux", "ducis", "leader"], "3rd Declension Masculine Noun: dux, ducis: leader"],
             [["fortitudo", "fortitudinis", "courage"], "3rd Declension Feminine Noun: fortitudo, fortitudinis: courage"],
             [["homo", "hominis", "mankind"], "3rd Declension Masculine Noun: homo, hominis: mankind"],
             [["miles", "militis", "soldier"], "3rd Declension Masculine Noun: miles, militis: soldier"],
             [["oraculum", "oraculi", "oracle"], "2nd Declension Neuter Noun: oraculum, oraculi: oracle"],
             [["rex", "regis", "king"], "3rd Declension Masculine Noun: rex, regis: king"],
             [["templum", "templi", "temple"], "2nd Declension Neuter Noun: templum, templi: temple"],
             [["timor", "timoris", "fear"], "3rd Declension Masculine Noun: timor, timoris: fear"]];

var word = words[Math.floor(Math.random() * words.length)];
var wordInfo = word[0][Math.floor(Math.random() * word[0].length)];

var information = document.getElementById("information");
information.innerHTML = wordInfo;

function Check() {
  var guess = document.getElementById("guess");
  if (guess.value === word[1]) {
    word = words[Math.floor(Math.random() * words.length)];
    wordInfo = word[0][Math.floor(Math.random() * word[0].length)];
    information.innerHTML = wordInfo + "<br/><br/>Correct!";
  }
  else {
    information.innerHTML = wordInfo + "<br/><br/>Incorrect.";
  }
}

function Reveal() {
  information.innerHTML = wordInfo + "<br/><br/>" + answer;
}

var submitButton = document.getElementById("submit");
submitButton.onclick = Check;

var revealButton = document.getElementById("reveal");
revealButton.onclick = Reveal;
