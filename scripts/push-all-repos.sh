#!/usr/bin/env bash
# Push local Documents projects to GitHub (KuldeepSoni17).
set -euo pipefail

push_repo() {
  local dir="$1"
  local repo_name="$2"
  local msg="${3:-Sync local project}"
  echo ">>> $repo_name ($dir)"
  cd "$dir"
  if [ ! -d .git ]; then
    git init -b main
    git add -A
    git commit -m "$msg"
    gh repo create "KuldeepSoni17/$repo_name" --private --source=. --remote=origin --push
  else
    if ! git remote get-url origin &>/dev/null; then
      gh repo create "KuldeepSoni17/$repo_name" --private --source=. --remote=origin --push
    else
      git add -A
      if ! git diff --cached --quiet; then
        git commit -m "$msg"
      fi
      git push -u origin main 2>/dev/null || git push -u origin HEAD:main
    fi
  fi
  echo ""
}

# New repos
push_repo "/Users/kuldeep/Documents/StorageWar" "storage-war" "Add Storage War browser game"
push_repo "/Users/kuldeep/Documents/HarryPotterGame" "harry-potter-game" "Add wizarding platformer game"
push_repo "/Users/kuldeep/Documents/GameBuilder/echo-garden" "echo-garden" "Add Echo Garden Phaser game"
push_repo "/Users/kuldeep/Documents/TheTshirtProject" "thetshirtproject" "Add t-shirt design app"
push_repo "/Users/kuldeep/Documents/Divergence/divergence" "divergence" "Add Divergence analytics tool"
push_repo "/Users/kuldeep/Documents/TimelineGenerator/timeline-racer" "timeline-racer" "Add Timeline Racer"

# Existing repos with local changes
push_repo "/Users/kuldeep/Documents/cooltoolsbykul-workspace/cooltoolsbykul.com" "cooltoolsbykul.com" "Add subdomain routing and static app builds"
push_repo "/Users/kuldeep/Documents/Attack-Defense" "Attack-Defense" "Sync local Attack-Defense changes"
push_repo "/Users/kuldeep/Documents/Untapped" "untapped-unlock" "Sync unlock changes"
push_repo "/Users/kuldeep/Documents/OneStopAI" "onestopai" "Add OneStopAI full-stack app"

echo "All repos pushed."
