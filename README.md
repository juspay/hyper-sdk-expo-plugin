# hyper-sdk-expo-plugin

An Expo config plugin for automating Android & iOS integration changes for [`hyper-sdk-react`](https://www.npmjs.com/package/hyper-sdk-react) with apps using Expo.

## Installation

```bash
npm install hyper-sdk-expo-plugin
OR
yarn add hyper-sdk-expo-plugin
```
**Note**: Please install `hyper-sdk-react` before doing this.
```bash
npm install hyper-sdk-react
```

## Uses

### Step-1: Inputs
Expo config plugin takes some parameters which are needed to setup hyper-sdk-react.

Add following parameters in app.json
```JSON
{
  "expo": {
    // Others
    "extra": {
      // ...
      "clientId": "<clientId shared by Juspay team>", // Mandatory
      "hyperSDKVersion": "2.1.33", // Optional: Override for base SDK version present in plugin (the newer version among both would be considered)
      "juspayMavenUrls": [
        "https://maven.juspay.in/jp-build-packages/hyper-sdk/"
      ] // Optional
    },
    "plugins": [
      // Other plugins
      "hyper-sdk-expo-plugin"
    ]
    // ...
  }
}
```

### Step-2:
The expo config plugin is configured to execute while running `npx expo prebuild` OR `npx expo prebuild --clean`

**Note**: You must run `npx expo prebuild --clean` after making any change in plugin parameters defined in app.json.

### Step-3:
- For IOS, go inside iOS folder and run `pod install` to install pods.

Use APIs exposed by `hyper-sdk-react` [here](https://www.npmjs.com/package/hyper-sdk-react#usage)


## License

**hyper-sdk-expo-plugin** is distributed under [AGPL-3.0-only](https://github.com/juspay/hyper-sdk-expo-plugin/src/main/LICENSE.md) license.

