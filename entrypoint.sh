#!/usr/bin/env sh
set -e

cat >/usr/share/nginx/html/env.js <<EOF
window.__ENV__ = {
  API_URL: "${API_URL}",
  APP_NAME: "${APP_NAME}"
};
EOF

# inicia nginx
exec nginx -g 'daemon off;'
