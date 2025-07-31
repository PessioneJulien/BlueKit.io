#!/bin/bash

task_file="./next_tasks.txt"
log_file="./ai_task_runner.log"

if [[ ! -f "$task_file" ]]; then
  echo "$(date): Aucun fichier de tâches trouvé." >> "$log_file"
  exit 0
fi

while IFS= read -r line || [ -n "$line" ]; do
  if [[ ! -z "$line" ]]; then
    echo "$(date): Exécution -> $line" >> "$log_file"
    eval "$line" >> "$log_file" 2>&1
  fi
done < "$task_file"

# Optionnel : vider le fichier pour éviter relancement
> "$task_file"
