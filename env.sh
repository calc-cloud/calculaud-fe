#!/bin/sh

# Runtime environment variable injection script
# Replaces RUNTIME_ prefixed placeholders with actual environment variables

echo "Starting runtime environment variable injection..."

# Find all RUNTIME_ environment variables
runtime_vars=$(env | grep '^RUNTIME_' | cut -d= -f1)

if [ -z "$runtime_vars" ]; then
    echo "No RUNTIME_ environment variables found. Skipping injection."
else
    echo "Found RUNTIME_ variables: $(echo $runtime_vars | tr '\n' ' ')"
    
    # Process each RUNTIME_ variable
    for var in $runtime_vars; do
        value=$(eval echo \$$var)
        echo "Replacing $var with: $value"
        
        # Escape special characters for sed
        escaped_value=$(printf '%s\n' "$value" | sed 's/[\[\]{}()*+?.\\^$|]/\\&/g')
        
        # Replace in all JS and CSS files
        find /usr/share/nginx/html -type f \( -name '*.js' -o -name '*.css' \) \
            -exec sed -i "s|${var}|${escaped_value}|g" {} +
    done
fi

echo "Runtime environment variable injection completed."