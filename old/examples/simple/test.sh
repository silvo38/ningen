#!/bin/bash
# Test that check the simple example script is working correctly.
# Run this script from this directory.

echo "Testing simple example"

# Clean up old artifacts.
rm -f build.ninja foo.out

# Generate the ninja file.
if ! ./BUILD.ts; then
    >&2 echo "simple example failed running BUILD.ts"
    exit 1
fi

# Run ninja.
if ! ninja; then
    >&2 echo "simple example failed running ninja"
    exit 1
fi

# Verify that output files are as expected.
if ! diff foo.out foo.expected; then
    >&2 echo "simple example failed: foo.out did not match expected foo.expected"
    exit 1
fi

if ! diff build.ninja build.ninja.expected; then
    >&2 echo "simple example failed: build.ninja did not match build.ninja.expected"
    exit 1
fi

echo "simple example tests passed"
