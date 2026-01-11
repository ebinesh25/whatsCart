import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from './config'

/**
 * Upload a file to Firebase Storage
 */
export async function uploadFile(
  path: string,
  file: File,
  metadata?: { [key: string]: any }
): Promise<string> {
  const storageRef = ref(storage, path)
  await uploadBytes(storageRef, file, metadata)
  const downloadURL = await getDownloadURL(storageRef)
  return downloadURL
}

/**
 * Get download URL for a file
 */
export async function getFileURL(path: string): Promise<string> {
  const storageRef = ref(storage, path)
  return await getDownloadURL(storageRef)
}

/**
 * Delete a file from Firebase Storage
 */
export async function deleteFile(path: string): Promise<void> {
  const storageRef = ref(storage, path)
  await deleteObject(storageRef)
}

/**
 * Generate a unique file path
 */
export function generateFilePath(folder: string, fileName: string, userId: string): string {
  const timestamp = Date.now()
  const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_')
  return `${folder}/${userId}/${timestamp}_${cleanFileName}`
}
