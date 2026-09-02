import {
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    signOut,
    User,
    UserCredential
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase/config';

interface LoginData {
  email: string;
  senha: string;
}

interface CadastroData {
  nome: string;
  email: string;
  senha: string;
  cpf: string;
  telefone: string;
  dataNascimento: string;
  tipo: 'Mecanico' | 'Cliente';
}

export const authService = {
  async cadastrar(data: CadastroData): Promise<UserCredential> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.senha
      );
      
      const uid = userCredential.user.uid;

      await setDoc(doc(db, 'usuarios', uid), {
        nome: data.nome,
        email: data.email,
        cpf: data.cpf,
        telefone: data.telefone,
        dataNascimento: data.dataNascimento,
        tipo: data.tipo,
        criadoEm: serverTimestamp(),
        ativo: true,
      });

      if (data.tipo === 'Mecanico') {
        await setDoc(doc(db, 'mecanicos', uid), {
          especialidade: '',
          comissao: 0,
          dataContratacao: serverTimestamp(),
          ativo: true,
        });
      } else {
        await setDoc(doc(db, 'clientes', uid), {
          endereco: '',
          ativo: true,
        });
      }

      return userCredential;
    } catch (error) {
      throw error;
    }
  },

  async login(data: LoginData): Promise<UserCredential> {
    try {
      return await signInWithEmailAndPassword(auth, data.email, data.senha);
    } catch (error) {
      throw error;
    }
  },

  async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      throw error;
    }
  },

  async getCurrentUser(uid: string) {
    try {
      const userDoc = await getDoc(doc(db, 'usuarios', uid));
      if (userDoc.exists()) {
        return { uid, ...userDoc.data() };
      }
      return null;
    } catch (error) {
      throw error;
    }
  },

  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      throw error;
    }
  },

  getCurrentUserSync(): User | null {
    return auth.currentUser;
  }
};