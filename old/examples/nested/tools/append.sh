#!/bin/bash
# Script to simulate running a compiler.
# Copies the input file and appends a bit to the end.
IN="$1"
OUT="$2"
cp "$IN" "$OUT"
echo xyz >> "$OUT"
