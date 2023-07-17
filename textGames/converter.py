#! /usr/bin/env python3

import sys

if len(sys.argv) != 2:
    print("USAGE: " + sys.argv[0] + " <python-file>")
    sys.exit(1)

lines = []
result = []
indent = []
resultIndent = []

with open(sys.argv[1]) as fh:
    for line in fh.read().splitlines():
        if len(line) == 0:
            continue
        if len(lines) == 0:
            lines.append(line)
            continue
        lastLine = lines[len(lines) - 1]
        if lastLine[len(lastLine) - 1] == "," or lastLine[len(lastLine) - 1] == "[":
            index = 0
            for i in range(len(line)):
                if line[i] != " ":
                    index = i
                    break
            if lastLine[len(lastLine) - 1] == ",":
                lines[len(lines) - 1] += " "
            lines[len(lines) - 1] += line[index:]
        else:
            lines.append(line)

tabLength = 0
comment = False
inString = False

for i in range(len(lines)):
    if comment or lines[i][0] == "#":
        continue
    if lines[i] == "\"\"\"":
        comment = not comment
        continue
    if (len(lines[i]) > 5 and lines[i][0:5] == "from ") or (len(lines[i]) > 7 and lines[i][0:7] == "import "):
        continue
    j = 0
    while lines[i][j] == " ":
        j += 1
    if j == 0:
        indent.append(0)
    elif tabLength == 0:
        tabLength = j
        indent.append(1)
    else:
        indent.append(round(j / tabLength))
    k = len(lines[i]) - 1
    while lines[i][k] == " ":
        k -= 1
    lines[i] = lines[i][j:(k + 1)]
    if (len(lines[i]) > 7 and lines[i][0:7] == "global "):
        indent.pop()
        continue
    if len(lines[i]) > 3 and lines[i][0:3] == "if " and (lines[i][3] != "(" or lines[i][len(lines[i]) - 2] != ")"):
        lines[i] = "if (" + lines[i][3:(len(lines[i]) - 1)] + "):"
    if len(lines[i]) > 4 and lines[i][0:4] == "def ":
        lines[i] = "async function " + lines[i][4:]
    if len(lines[i]) > 5 and lines[i][0:5] == "elif ":
        lines[i] = "else if " + lines[i][5:]
        if lines[i][8] != "(" or lines[i][len(lines[i]) - 2] != ")":
            lines[i] = "else if (" + lines[i][8:(len(lines[i]) - 1)] + "):"
    if len(lines[i]) > 6 and lines[i][0:6] == "while " and (lines[i][6] != "(" or lines[i][len(lines[i]) - 2] != ")"):
        lines[i] = "while (" + lines[i][6:(len(lines[i]) - 1)] + "):"
    if lines[i][len(lines[i]) - 1] == ":":
        lines[i] = lines[i][0:(len(lines[i]) - 1)] + " {"
    else:
        lines[i] += ";"
    newLine = ""
    j = 0
    while (j < len(lines[i])):
        if lines[i][j] == "\"":
            newLine += "\""
            inString = not inString
            j += 1
            continue
        if inString:
            newLine += lines[i][j]
            j += 1
            continue
        if j < (len(lines[i]) - 3) and lines[i][j:(j + 4)] == "get_":
            newLine += "await get_"
            j += 4
            continue
        if j < (len(lines[i]) - 5) and lines[i][j:(j + 6)] == "sleep(":
            newLine += "await sleep("
            j += 6
            continue
        if j < (len(lines[i]) - 10) and lines[i][j:(j + 11)] == "foreground(":
            newLine += "foreground("
            j += 11
            continue
        if j < (len(lines[i]) - 10) and lines[i][j:(j + 11)] == "background(":
            newLine += "background("
            j += 11
            continue
        if j < (len(lines[i]) - 3) and lines[i][j:(j + 4)] == "True":
            newLine += "true"
            j += 4
            continue
        if j < (len(lines[i]) - 4) and lines[i][j:(j + 5)] == "False":
            newLine += "false"
            j += 5
            continue
        if j == (len(lines[i]) - 6) and lines[i][j:] == " += 1;":
            newLine += "++;"
            break
        if j == (len(lines[i]) - 6) and lines[i][j:] == " -= 1;":
            newLine += "--;"
            break
        if j < (len(lines[i]) - 3) and lines[i][j:(j + 4)] == " or ":
            newLine += " || "
            j += 4
            continue
        if j < (len(lines[i]) - 4) and lines[i][j:(j + 5)] == " and ":
            newLine += " && "
            j += 5
            continue
        if j < (len(lines[i]) - 3) and lines[i][j:(j + 4)] == "not ":
            newLine += "!"
            j += 4
            continue
        if j < (len(lines[i]) - 5) and lines[i][j:(j + 6)] == "floor(":
            newLine += "Math.floor("
            j += 6
            continue
        if j < (len(lines[i]) - 4) and lines[i][j:(j + 5)] == "ceil(":
            newLine += "Math.ceil("
            j += 5
            continue
        if j < (len(lines[i]) - 5) and lines[i][j:(j + 6)] == "round(":
            newLine += "Math.round("
            j += 6
            continue
        if j < (len(lines[i]) - 4) and lines[i][j:(j + 5)] == " end=":
            j += 5
            continue
        if j < (len(lines[i]) - 3) and lines[i][j:(j + 4)] == "len(":
            j += 4
            for k in range(j, len(lines[i])):
                if lines[i][k] == ")":
                    index = k
                    break
            newLine += (lines[i][j:index] + ".length")
            j = (index + 1)
            continue
        newLine += lines[i][j]
        j += 1
    lines[i] = newLine
    if i == 0:
        result.append(lines[0])
        resultIndent.append(0)
        continue
    for j in range(indent[len(indent) - 2] - indent[len(indent) - 1]):
        result.append("}")
        resultIndent.append(indent[len(indent) - 2] - j - 1)
    result.append(lines[i])
    resultIndent.append(indent[len(indent) - 1])

if len(indent) == 0:
  indentCount = 0
else:
  indentCount = indent[len(indent) - 1]
for i in range(indentCount):
    result.append("}")
    resultIndent.append(indentCount - i - 1)

print("async function main() {")
for i in range(len(result)):
    for j in range((resultIndent[i] + 1) * tabLength):
        print(" ", end="")
    print(result[i])
print("}")
print("main();")
