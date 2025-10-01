#!/usr/bin/env sh
set -e

cat >/usr/share/nginx/html/env.js <<EOF
window.__ENV__ = {
  API_URL: "${API_URL}",
  APP_NAME: "${APP_NAME}",
  CORRETOR_URL: "${CORRETOR_URL}",
  URL_PROVAS: "${URL_PROVAS}"
};
EOF

# inicia nginx
exec nginx -g 'daemon off;'
