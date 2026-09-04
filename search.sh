#!/bin/bash
for file in src/pages/*.tsx; do
  if grep -q "button" "$file"; then
    echo "Checking $file"
    # we want to find if there is a button inside something
  fi
done
