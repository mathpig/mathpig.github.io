var s = "0123456789ABCDEF";
var bs = "&nbsp;";

stuff.innerHTML = ("Addition:<br/><br/>" + bs + bs + bs);
for (var i = 0; i < 16; ++i) {
  stuff.innerHTML += (s[i] + bs + bs);
}
for (var i = 0; i < 16; ++i) {
  stuff.innerHTML += ("<br/>" + s[i] + bs + bs);
  for (var j = 0; j < 16; ++j) {
    var val = i + j;
    var a = Math.floor(val / 16);
    var b = val % 16;
    stuff.innerHTML += (s[a] + s[b] + bs);
  }
}

stuff.innerHTML += ("<br/><br/>Multiplication:<br/><br/>" + bs + bs + bs);
for (var i = 0; i < 16; ++i) {
  stuff.innerHTML += (s[i] + bs + bs);
}
for (var i = 0; i < 16; ++i) {
  stuff.innerHTML += ("<br/>" + s[i] + bs + bs);
  for (var j = 0; j < 16; ++j) {
    var val = i * j;
    var a = Math.floor(val / 16);
    var b = val % 16;
    stuff.innerHTML += (s[a] + s[b] + bs);
  }
}
