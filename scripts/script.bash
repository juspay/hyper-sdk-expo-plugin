#!/bin/bash

SOURCE_REPO_README_URL="https://raw.githubusercontent.com/juspay/hyper-sdk-react/main/README.md"
LOCAL_README="README.md"
TEMP_README="temp_readme.md"
USAGE_SECTION_FILE="usage_section.md"

echo "Fetching the latest README from hyper-sdk-react..."
curl -s $SOURCE_REPO_README_URL -o hyper-sdk-readme.md

if [[ ! -f "hyper-sdk-readme.md" ]]; then
  echo "Failed to download README.md from hyper-sdk-react repository."
  exit 1
fi

# Step 2: Extract the 'Usage' section without the heading
echo "Extracting the Usage section without the heading..."
# Extract everything from ## Usage until the next top-level header or end of file
awk '/^## Usage/,/^## [^Usage]/' hyper-sdk-readme.md | sed '1d;$d' > $USAGE_SECTION_FILE

if [[ ! -s $USAGE_SECTION_FILE ]]; then
  echo "Failed to extract Usage section."
  exit 1
fi

# Step 3: Create a temporary copy of your local README.md up until the '## License' section
echo "Preparing to insert content before the '## License' section in your README.md..."
# Copy the content of the README up to the '## License' heading
awk '/## License/{flag=1} !flag' $LOCAL_README > $TEMP_README

# Step 4: Add the new heading and insert the new Usage section under it
echo "Inserting the new hyper-sdk-react APIs section into your README..."
echo "## hyper-sdk-react" >> $TEMP_README
cat $USAGE_SECTION_FILE >> $TEMP_README

# Step 5: Append the License section back to the updated README
awk '/## License/{flag=1} flag' $LOCAL_README >> $TEMP_README

# Step 6: Replace the original README.md with the updated one
mv $TEMP_README $LOCAL_README

# Step 7: Clean up temporary files
rm hyper-sdk-readme.md $USAGE_SECTION_FILE

echo "README.md has been successfully updated with the latest hyper-sdk-react APIs section!"
