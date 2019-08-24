#!/bin/bash
echo "publish. OK? (type y)"
read answer
case $answer in
  y)
    cd ../koteitan.github.io/BMSHydraViewer/
    git pull
    cd ..
    git add BMSHydraViewer
    git commit -m"merge"
    git push
    break
    ;;
esac

