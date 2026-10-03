import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import { Platform } from "react-native";
import { uid } from "../utils/complaints";
export async function pickPhoto(camera = false): Promise<string | undefined> {
  const permission = camera
    ? await ImagePicker.requestCameraPermissionsAsync()
    : await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted)
    throw new Error(
      `Allow ${camera ? "camera" : "photo library"} access to add a photo. You can also continue without one.`,
    );
  const options: ImagePicker.ImagePickerOptions = {
    mediaTypes: ["images"],
    allowsEditing: true,
    quality: 0.65,
    base64: Platform.OS === "web",
  };
  const result = camera
    ? await ImagePicker.launchCameraAsync(options)
    : await ImagePicker.launchImageLibraryAsync(options);
  if (result.canceled) return;
  const photo = result.assets[0];
  if (Platform.OS === "web")
    return photo.base64
      ? `data:${photo.mimeType || "image/jpeg"};base64,${photo.base64}`
      : photo.uri;
  const directory = `${FileSystem.documentDirectory}photos/`;
  await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
  const destination = `${directory}${uid()}.jpg`;
  await FileSystem.copyAsync({ from: photo.uri, to: destination });
  return destination;
}
