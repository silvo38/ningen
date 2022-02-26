#!/bin/bash
#
# Updates all version numbers in the repo. Supply a version number as the only
# command line argument to this script.
#
# Example:
#
#   ./cut_new_version.sh 0.1.2

VERSION="$1"

# Update all version numbers in the repo (ignoring hidden files)
find ./ -not -path '*/\.*' -type f -exec sed -i "s/@[0-9]\.[0-9]\.[0-9]/@$VERSION/g" {} \;

# Check diff before committing.
git diff
echo
read -p "Happy with that commit? (y/n)" -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
  echo "Cancelling"
  exit 1
fi

# Commit and push
echo "Committing"
git commit -a -m "Updating URLs to point at version $VERSION"
echo "Pushing commit"
git push

# Create tag and push
echo "Creating new tag $VERSION"
git tag -a "$VERSION"
echo "Pushing tag $VERSION"
git push origin "$VERSION"
