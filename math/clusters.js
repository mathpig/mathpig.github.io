"use strict";

var screen = document.getElementById("screen");
var ctx = screen.getContext("2d");

var rect = screen.getBoundingClientRect();

function distance(point, cluster) {
  return Math.pow(point[0] - cluster[0], 2) + Math.pow(point[1] - cluster[1], 2);
}

function doClusterStep(points, clusters) {
  for (var i = 0; i < points.length; ++i) {
    var best = Math.pow(10, 9);
    for (var j in clusters) {
      if (distance(points[i], clusters[j]) < best) {
        best = distance(points[i], clusters[j]);
        points[i][2] = j;
      }
    }
  }
  return points;
}

function centerClusters(points) {
  var clusters = {};
  for (var i = 0; i < points.length; ++i) {
    if (!(points[i][2] in clusters)) {
      clusters[points[i][2]] = [0, 0, 0];
    }
    clusters[points[i][2]][0] += points[i][0];
    clusters[points[i][2]][1] += points[i][1];
    clusters[points[i][2]][2] += 1;
  }
  var centeredClusters = {};
  for (var i in clusters) {
    centeredClusters[i] = [clusters[i][0] / clusters[i][2], clusters[i][1] / clusters[i][2]];
  }
  return centeredClusters;
}

function chooseClusters(points, clusterCount) {
  var colors = ["red", "blue", "lime", "orange", "purple", "pink", "yellow", "cyan", "brown", "white"];
  var clusters = {};
  var chosen = {};
  for (var i = 0; i < clusterCount; ++i) {
    while (true) {
      var index = Math.floor(Math.random() * points.length);
      if (!(index in chosen)) {
        break;
      }
    }
    chosen[index] = true;
    clusters[colors[i]] = [points[index][0], points[index][1]];
  }
  return clusters;
}

/*
function chooseClusters(points, clusterCount) {
  var colors = ["red", "blue", "lime", "orange", "purple", "pink", "yellow", "cyan", "brown", "white"];
  var clusters = {};
  for (var i = 0; i < clusterCount; ++i) {
    clusters[colors[i]] = [Math.random() * screen.width, Math.random() * screen.height];
  }
  return clusters;
}
*/

function findClusters(points, clusterCount) {
  var clusters = chooseClusters(points, clusterCount);
  for (var i = 0; i < 100; ++i) {
    points = doClusterStep(points, clusters);
    clusters = centerClusters(points);
  }
  points = doClusterStep(points, clusters);
  return clusters;
}

function getClusters(points, clusterCount) {
  var best = Math.pow(10, 9);
  var ans;
  for (var i = 0; i < 100; ++i) {
    var clusters = findClusters(points, clusterCount);
    var count = 0;
    for (var j = 0; j < points.length; ++j) {
      count += distance(points[j], clusters[points[j][2]]);
    }
    if (count < best) {
      best = count;
      ans = clusters;
    }
  }
  return ans;
}

var points = [];
var clusters = {};

var mouseX = 0;
var mouseY = 0;
var mouseDown = false;

function Draw() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, screen.width, screen.height);
  if (points.length == 0) {
    return;
  }
  var clusterCount = Math.min(points.length, parseInt(document.getElementById("clusterCount").value));
  clusters = getClusters(points, clusterCount);
  doClusterStep(points, clusters);
  for (var i = 0; i < points.length; ++i) {
    ctx.fillStyle = points[i][2];
    ctx.fillRect(points[i][0] - 2, points[i][1] - 2, 4, 4);
  }
  for (var i in clusters) {
    ctx.fillStyle = i;
    ctx.fillRect(clusters[i][0] - 4, clusters[i][1] - 4, 8, 8);
  }
}

Draw();

screen.onmousemove = function(e) {
  mouseX = e.clientX - rect.x;
  mouseY = e.clientY - rect.y;
};

screen.onmousedown = function(e) {
  points.push([mouseX, mouseY, "black"]);
  Draw();
};

document.getElementById("clusterCount").onchange = function() {
  Draw();
};
