const { withProjectBuildGradle, withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');


// Android modifications: Adding Maven and Ext parameters
const withHyperSDKAndroid = (config, { clientId, hyperSDKVersion, juspayMavenUrls, excludedMicroSDKs, hyperAssetVersion }) => {
  config = withProjectBuildGradle(config, (config) => {
    if (config.modResults.contents) {
      const repositoriesStartRegex = /allprojects\s*{\s*repositories\s*{/;
      if (repositoriesStartRegex.test(config.modResults.contents)) {
        config.modResults.contents = config.modResults.contents.replace(repositoriesStartRegex, (match) => {
          // Loop through each Maven URL and add it to 'repositories' block if not already present
          const mavenUrlsToAdd = juspayMavenUrls
            .map((url) => {
              if (!config.modResults.contents.includes(url)) {
                return `        maven { url "${url}" }\n`;
              } else {
                return "";
              }
            })
            .join('');
            if (mavenUrlsToAdd.length > 0) {
            // Append the new Maven URLs just after the opening of the 'repositories' block
            return `${match}\n${mavenUrlsToAdd}`;
          }
          return match;
        });
      } else {
        // If 'repositories' block doesn't exist, add it
        config.modResults.contents = config.modResults.contents.replace(
          /allprojects\s*{/,
          `allprojects {
    repositories {
        ${juspayMavenUrls.map((url) => `maven { url "${url}" }`).join('\n        ')}
    }`
        );
      }
      if (!config.modResults.contents.includes("clientId =")) {
        const modifyWithKey = (key, value) => {
          if (value) {
            config.modResults.contents = config.modResults.contents.replace(
              /ext {/,
              `ext {
        ${key} = "${value}"`
            );
          }
        }
        modifyWithKey("clientId", clientId);
        modifyWithKey("hyperSDKVersion", hyperSDKVersion);
        modifyWithKey("excludedMicroSDKs", excludedMicroSDKs);
        modifyWithKey("hyperAssetVersion", hyperAssetVersion);
      }
    }
    return config;
  });
  return config;
};

// iOS modifications: Add post_install script using withDangerousMod
const withHyperSDKiOS = (config, { clientId }) => {
  return withDangerousMod(config, ['ios', async (config) => {
    const podfilePath = path.join(config.modRequest.projectRoot, 'ios', 'Podfile');
    let podfileContent = fs.readFileSync(podfilePath, 'utf-8');
    const newLines = `
  post_install do |installer|
    fuse_path = "./Pods/HyperSDK/Fuse.rb"
    clean_assets = false # Pass true to re-download all the assets
    if File.exist?(fuse_path)
      system("ruby", fuse_path.to_s, clean_assets.to_s)
    end
`;
    const postInstallRegex = /(post_install do \|installer\|)/;
    if (postInstallRegex.test(podfileContent)) {
      if (!podfileContent.includes("fuse_path")) {
        podfileContent = podfileContent.replace(postInstallRegex, (match) => {
          return match.replace(postInstallRegex, `${newLines}`);
        });
      }
    } else {
      // If post_install block does not exist, create it
      podfileContent += `
  ${newLines.trim()}
end
`;
    }

    fs.writeFileSync(podfilePath, podfileContent);
    return config;
  }]);
};

// Modifying the build process to inject MerchantConfig file
const withMerchantConfigFile = (config, { clientId }) => {
  return withDangerousMod(config, ['ios', async (config) => {
    if (config.modRequest && config.modRequest.platform === 'ios' && config.modRequest.projectRoot) {
      const merchantConfigPath = path.join(config.modRequest.projectRoot, 'ios', 'MerchantConfig.txt');
      fs.writeFileSync(merchantConfigPath, `clientId = ${clientId}\n`);
    }
    return config;
  }]);
};

const withHyperSDKReact = (config) => {
  const props = config.modRequest?.props || config.extra || {};
  const { clientId, hyperSDKVersion = "2.1.25", juspayMavenUrls = ["https://maven.juspay.in/jp-build-packages/hyper-sdk/"], excludedMicroSDKs, hyperAssetVersion } = props;
  if (!clientId) {
    throw new Error('clientId is required for hyper-sdk-react plugin');
  }
  config = withHyperSDKAndroid(config, { clientId, hyperSDKVersion, juspayMavenUrls, excludedMicroSDKs, hyperAssetVersion});
  config = withHyperSDKiOS(config, { clientId });
  config = withMerchantConfigFile(config, { clientId });

  return config;
};

module.exports = (config) => withHyperSDKReact(config);
