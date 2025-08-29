export default {
  expo: {
    name: "vivace",
    slug: "vivace",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/vivace-icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/vivace-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/vivace-icon.png",
        backgroundColor: "#FFFFFF"
      }
    },
    web: {
      favicon: "./assets/vivace-icon.png"
    },
    extra: {
      EXPO_PUBLIC_API_URL: "http://localhost:3000/api"
    }
  }
};
