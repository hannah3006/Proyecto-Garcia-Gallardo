#!/bin/bash

if [ -z "$1" ]; then
  echo "Uso: ./scripts/restore.sh backups/nombre-del-backup"
  exit 1
fi

BACKUP_PATH="$1"

if [ ! -d "$BACKUP_PATH/data" ]; then
  echo "No se encontró carpeta data dentro del respaldo."
  exit 1
fi

rm -rf data
cp -r "$BACKUP_PATH/data" data

echo "Restauración completada desde $BACKUP_PATH"