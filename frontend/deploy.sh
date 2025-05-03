#!/bin/bash
rm -rf dist/
npm run build
sudo cp -r dist/* /var/www/html/
echo "✅ Deploy complete"
