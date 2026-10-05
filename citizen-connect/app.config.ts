import type { ConfigContext, ExpoConfig } from "expo/config";
// Expo Go needs no custom Maps key. A standalone Android build does.
export default ({ config }: ConfigContext): ExpoConfig => {
  const key = process.env.GOOGLE_MAPS_ANDROID_API_KEY;
  return {
    ...config,
    name: config.name || "Citizen Connect",
    slug: config.slug || "citizen-connect",
    plugins: [
      ...(config.plugins || []),
      ...(key
        ? [
            ["react-native-maps", { androidGoogleMapsApiKey: key }] as [
              string,
              Record<string, string>,
            ],
          ]
        : []),
    ],
  };
};
