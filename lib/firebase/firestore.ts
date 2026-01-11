import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  DocumentData,
  Query,
  CollectionReference,
} from 'firebase/firestore'
import { db } from './config'

/**
 * Get a document by ID
 */
export async function getDocument<T extends DocumentData>(
  collectionName: string,
  id: string
): Promise<T | null> {
  const docRef = doc(db, collectionName, id)
  const docSnap = await getDoc(docRef)

  if (docSnap.exists()) {
    return docSnap.data() as T
  }
  return null
}

/**
 * Get all documents from a collection
 */
export async function getCollection<T extends DocumentData>(
  collectionName: string,
  constraints?: any[]
): Promise<T[]> {
  const collectionRef = collection(db, collectionName) as CollectionReference<T>

  let q: Query<T> = collectionRef
  if (constraints && constraints.length > 0) {
    q = query(collectionRef, ...constraints)
  }

  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  })) as T[]
}

/**
 * Add a new document
 */
export async function addDocument<T extends DocumentData>(
  collectionName: string,
  data: T
): Promise<string> {
  const docRef = await addDoc(collection(db, collectionName), data)
  return docRef.id
}

/**
 * Update a document
 */
export async function updateDocument(
  collectionName: string,
  id: string,
  data: Partial<DocumentData>
): Promise<void> {
  const docRef = doc(db, collectionName, id)
  await updateDoc(docRef, data)
}

/**
 * Delete a document
 */
export async function deleteDocument(collectionName: string, id: string): Promise<void> {
  const docRef = doc(db, collectionName, id)
  await deleteDoc(docRef)
}

/**
 * Get a reference to a collection
 */
export function getCollectionRef<T extends DocumentData>(collectionName: string) {
  return collection(db, collectionName) as CollectionReference<T>
}

/**
 * Get a reference to a document
 */
export function getDocumentRef(collectionName: string, id: string) {
  return doc(db, collectionName, id)
}
