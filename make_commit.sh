#!/bin/bash
cd /home/sasha/multi/multi-xx

yarn scan

git add .
git commit -m "Nightly Commit - $(date)"
git push