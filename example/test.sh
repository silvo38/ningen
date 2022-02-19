#!/bin/bash
# Test that check the example script is working correctly.

# Clean up old artifacts.
rm -f build.ninja abc.txt.out

# Generate the ninja file.
if ! ./BUILD.ts; then
    >&2 echo "example failed running BUILD.ts"
    exit 1
fi

# Run ninja.
if ! ninja; then
    >&2 echo "example failed running ninja"
    exit 1
fi

# Verify that output files are as expected.
if ! diff abc.txt.out abc.txt.out.expected; then
    >&2 echo "example failed: abc.txt.out did not match expected output"
    exit 1
fi

if ! diff build.ninja build.ninja.expected; then
    >&2 echo "example failed: build.ninja did not match expected output"
    exit 1
fi
