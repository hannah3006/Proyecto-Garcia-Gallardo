#!/bin/bash

DATE=$(date +"%Y%m%d-%H%M%S")
BACKUP_DIR="backups/backup-$DATE"

mkdir -p "$BACKUP_DIR"

cp -r data "$BACKUP_DIR/data"

echo "Respaldo creado correctamente en $BACKUP_DIR"
