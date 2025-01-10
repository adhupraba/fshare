#!/bin/sh

# Array of environment variables to replace
ENV_VARS="
VITE_API_URL
UMAMI_SCRIPT_URL
UMAMI_WEBSITE_ID
"

sed_script=$(mktemp)

# Build the sed script
for VAR in $ENV_VARS; do
  VALUE=$(eval echo \$$VAR)
  if [ -n "$VALUE" ]; then
    printf "s|__%s__|%s|g\n" "$VAR" "$VALUE" >> "$sed_script"
    printf "Replacing __%s__ with %s\n" "$VAR" "$VALUE"
  else
    printf "s|__%s__|%s|g\n" "$VAR" "" >> "$sed_script"
    printf "Warning: %s is not set. Placeholder __%s__ will be replaced with empty string.\n" "$VAR" "$VAR" >&2
  fi
done

# Perform replacements in all files in the .next directory
if [ -s "$sed_script" ]; then
  find /usr/share/nginx/html/ -type f \( -name "*.html" -o -name "*.js" -o -name "*.json" \) -exec sed -i -f "$sed_script" {} +
fi

# Clean up
rm -f "$sed_script"

# Start the application
exec "$@"
