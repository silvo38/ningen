#!/bin/bash
# Test that check the nested example script is working correctly.
# Run this script from this directory.

echo "Testing nested example"

# Clean up old artifacts.
rm -f build.ninja subdir/foo.out

# Generate the ninja file.
if ! ./BUILD.ts; then
    >&2 echo "nested example failed running BUILD.ts"
    exit 1
fi

# Run ninja.
if ! ninja; then
    >&2 echo "nested example failed running ninja"
    exit 1
fi

# Verify that output files are as expected.
if ! diff subdir/foo.out subdir/foo.expected; then
    >&2 echo "nested example failed: foo.out did not match expected foo.expected"
    exit 1
fi

if ! diff build.ninja build.ninja.expected; then
    >&2 echo "nested example failed: build.ninja did not match build.ninja.expected"
    exit 1
fi

echo "nested example tests passed"
