#! /usr/bin/env python3

from random import randint

keys = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "G#", "A", "Bb", "B"]
formatLength = 40
if randint(0, 11) == 0:
  keys = ["King Guy", "Scuttles", "Sylvia", "Kate", "Nate", "Harry", "Sophia", "Slavan", "Regindol", "Mocha", "Salmon", "Rendrick"]
  formatLength = 60

class Note:
  def __init__(self, pitch):
    self.pitch = pitch

  def transpose(self, val):
    self.pitch += val

  def octave(self):
    return ((self.pitch - 3) // len(keys) + 1)

  def __str__(self):
    s = keys[(self.pitch - 3) % len(keys)]
    if len(s) == 1:
      s += " "
    return (s + " " + str(self.octave()))

class Chord:
  def __init__(self, chordType, notes):
    self.chordType = chordType
    self.notes = notes

  def __str__(self):
    s = self.chordType
    while len(s) < 3:
      s += " "
    s += ": "
    for i in range(len(self.notes)):
      if i > 0:
        s += " - "
      s += Note.__str__(self.notes[i])
    return s

  def rawstr(self):
    melody = str(self.notes[randint(0, len(self.notes) - 1)].pitch + len(keys) * 2)
    left = [str(i.pitch) for i in self.notes]
    return '    [ ' + ', '.join(left + [melody]) + ' ],'

  def transpose(self, val):
    for i in range(len(self.notes)):
      self.notes[i].transpose(val)

  def invert(self, val):
    octaveDrop = 0
    if val < 0:
      octaveDrop = -val
      val = -(len(self.notes) - 1) * val
    while val >= len(self.notes):
      self.transpose(len(keys))
      val -= len(self.notes)
    newNotes = []
    for i in range(val, len(self.notes)):
      newNotes.append(self.notes[i])
    for i in range(val):
      self.notes[i].transpose(len(keys))
      newNotes.append(self.notes[i])
    self.transpose(-len(keys) * octaveDrop)
    self.notes = newNotes

chords = {"i": [0, 3, 7],
          "I": [0, 4, 7],
          "iio": [2, 5, 8],
          "ii": [2, 5, 9],
          "iv": [0, 5, 8],
          "IV": [0, 5, 9],
          "V": [2, 7, 11],
          "V7": [2, 5, 7, 11],
          "vi": [0, 4, 9],
          "VI": [0, 3, 8]}

chordTypes = []
for i in chords:
  chordTypes.append(i)

progressions = {"i-iio": True,
                "i-iv": True,
                "i-V": True,
                "i-V7": True,
                "i-VI": True,
                "I-ii": True,
                "I-IV": True,
                "I-V": True,
                "I-V7": True,
                "I-vi": True,
                "iio-iv": True,
                "iio-V": True,
                "iio-V7": True,
                "ii-IV": True,
                "ii-V": True,
                "ii-V7": True,
                "iv-i": True,
                "iv-V": True,
                "iv-V7": True,
                "IV-I": True,
                "IV-V": True,
                "IV-V7": True,
                "V-i": True,
                "V-I": True,
                "V-V7": True,
                "V-vi": True,
                "V-VI": True,
                "V7-i": True,
                "V7-I": True,
                "V7-vi": True,
                "V7-VI": True,
                "vi-V": True,
                "vi-V7": True,
                "VI-V": True,
                "VI-V7": True}

key = randint(0, len(keys) - 1)

def createChord(chordType, arr):
  newArr = []
  for i in range(len(arr)):
    newArr.append(Note(arr[i]))
  return Chord(chordType, newArr)

startChord = "i"
if randint(0, 1) == 0:
  startChord = "I"
currentChord = createChord(startChord, chords[startChord])
currentChord.transpose(len(keys) * 2 + key)
currentChord.invert(randint(0, 2))

def convert(s, n):
  while len(s) < n:
    s += " "
  return s

print("")
chordCount = 0
while True:
  chordCount += 1
  chordType = currentChord.chordType
  print(currentChord.rawstr())
  #print(convert(currentChord.__str__(), formatLength) + "Melody note: " + Note(currentChord.notes[randint(0, len(currentChord.notes) - 1)].pitch + 2 * len(keys)).__str__())
  if chordType == startChord and chordCount >= 30:
    break
  newChordType = chordTypes[randint(0, len(chordTypes) - 1)]
  while (((chordType + "-" + newChordType) not in progressions and newChordType != chordType) or
          (newChordType == "i" and startChord == "I") or
          (newChordType == "I" and startChord == "i") or
          (newChordType == "vi" and startChord == "i") or
          (newChordType == "VI" and startChord == "I") or
          ((newChordType == "V" or newChordType == "V7") and randint(0, 1) == 0)):
    newChordType = chordTypes[randint(0, len(chordTypes) - 1)]
  if newChordType == chordType:
    num = 0
    val = randint(0, 1)
    if val == 0 and currentChord.notes[0].octave() >= 2:
      num = -1
    elif val == 1 and currentChord.notes[len(currentChord.notes) - 1].octave() <= 4:
      num = 1
    currentChord.invert(num)
  else:
    newChord = createChord(newChordType, chords[newChordType])
    newChord.transpose(key)
    chord = createChord(newChordType, chords[newChordType])
    chord.transpose(key)
    possibilities = []
    best = 87
    oldHigh = currentChord.notes[len(currentChord.notes) - 1].pitch
    val = 88
    chord.invert(-val)
    for i in range(2 * val):
      chord.invert(1)
      highNote = chord.notes[len(chord.notes) - 1]
      if chord.notes[0].octave() < 2 or highNote.octave() > 4:
        continue
      distance = abs(highNote.pitch - oldHigh)
      if distance < best:
        best = distance
        possibilities = [i - val + 1]
      elif distance == best:
        possibilities.append(i - val + 1)
    selection = possibilities[randint(0, len(possibilities) - 1)]
    newChord.invert(selection)
    currentChord = newChord
print("")
