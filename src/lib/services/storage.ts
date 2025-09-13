// src/lib/services/storage.ts
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from "@/lib/firebase";

const storage = getStorage(app);

/**
 * Uploads a file to Firebase Storage.
 * @param path The path where the file should be stored (e.g., 'avatars/user123.png').
 * @param file The file to upload.
 * @returns The public URL of the uploaded file.
 */
export async function uploadFile(path: string, file: File): Promise<string> {
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(snapshot.ref);
  return downloadURL;
}


/**
 * Uploads a user's profile photo and returns the public URL.
 * @param userId The ID of the user.
 * @param file The image file to upload.
 * @returns The public URL of the uploaded photo.
 */
export async function updateUserProfilePhoto(userId: string, file: File): Promise<string> {
    const fileExtension = file.name.split('.').pop();
    const path = `profile-photos/${userId}.${fileExtension}`;
    return uploadFile(path, file);
}
