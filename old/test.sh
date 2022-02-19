#!/bin/bash
deno test --allow-read --unstable "$@"
deno fmt --check

