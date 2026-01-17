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
 * @param collectionName - Name of the collection
 * @param constraints - Array of constraints. Can be QueryConstraint objects or raw arrays like ['field', '==', 'value']
 */
export async function getCollection<T extends DocumentData>(
  collectionName: string,
  constraints?: any[]
): Promise<T[]> {
  const collectionRef = collection(db, collectionName) as CollectionReference<T>

  let q: Query<T> | CollectionReference<T> = collectionRef
  if (constraints && constraints.length > 0) {
    // Convert raw array constraints to QueryConstraint objects
    const queryConstraints = constraints.map((constraint) => {
      if (Array.isArray(constraint) && constraint.length === 3) {
        // Raw array format: ['field', 'operator', 'value']
        return where(constraint[0], constraint[1], constraint[2])
      }
      // Already a QueryConstraint object
      return constraint
    })
    q = query(collectionRef, ...queryConstraints)
  }

  const querySnapshot = await getDocs(q as Query<T>)
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
