import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    query,
    QueryConstraint,
    serverTimestamp,
    updateDoc,
    where
} from 'firebase/firestore';
import { db } from '../../firebase/config';

export const firestoreService = {
  // Criar documento
  async create(collectionName: string, data: any) {
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        criadoEm: serverTimestamp(),
        atualizadoEm: serverTimestamp(),
      });
      return { id: docRef.id, ...data };
    } catch (error) {
      throw error;
    }
  },

  // Buscar todos os documentos
  async getAll(collectionName: string, constraints: QueryConstraint[] = []) {
    try {
      const q = query(collection(db, collectionName), ...constraints);
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      throw error;
    }
  },

  // Buscar documento por ID
  async getById(collectionName: string, id: string) {
    try {
      const docRef = doc(db, collectionName, id);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        return { id: snapshot.id, ...snapshot.data() };
      }
      return null;
    } catch (error) {
      throw error;
    }
  },

  // Buscar documentos com filtro
  async getWhere(collectionName: string, field: string, value: any) {
    try {
      const q = query(collection(db, collectionName), where(field, '==', value));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      throw error;
    }
  },

  // Atualizar documento
  async update(collectionName: string, id: string, data: any) {
    try {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, {
        ...data,
        atualizadoEm: serverTimestamp(),
      });
      return { id, ...data };
    } catch (error) {
      throw error;
    }
  },

  // Deletar documento
  async delete(collectionName: string, id: string) {
    try {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
      return { id };
    } catch (error) {
      throw error;
    }
  },
};