import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy,
  onSnapshot,
  setDoc,
  serverTimestamp
} from 'firebase/firestore';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  updatePassword as firebaseUpdatePassword,
  User
} from 'firebase/auth';
import { auth, secondaryAuth, db } from '../config/firebase';

// Collections
const COLLECTIONS = {
  INTERNS: 'interns',
  TASKS: 'tasks',
  PERFORMANCES: 'performances',
  ATTENDANCE: 'attendance',
  MESSAGES: 'messages',
  CHATS: 'chats',
  SETTINGS: 'settings'
};

// Auth Services
export const authService = {
  // Register new user using secondary auth (for intern creation)
  async registerIntern(email: string, password: string, userData: any) {
    try {
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
      const user = userCredential.user;
      
      // Save additional user data to Firestore
      await setDoc(doc(db, COLLECTIONS.INTERNS, user.uid), {
        ...userData,
        uid: user.uid,
        email: email,
        createdAt: serverTimestamp(),
        status: 'Active'
      });
      
      // Sign out from secondary auth to prevent interference
      await signOut(secondaryAuth);
      
      return { success: true, user };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Register new user (general registration)
  async register(email: string, password: string, userData: any) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Save additional user data to Firestore
      await setDoc(doc(db, COLLECTIONS.INTERNS, user.uid), {
        ...userData,
        uid: user.uid,
        email: email,
        createdAt: serverTimestamp(),
        status: 'Active'
      });
      
      return { success: true, user };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Login user
  async login(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Logout user
  async logout() {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Update password
  async updatePassword(newPassword: string) {
    try {
      if (auth.currentUser) {
        await firebaseUpdatePassword(auth.currentUser, newPassword);
        return { success: true };
      }
      return { success: false, error: 'No user logged in' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
};

// Firestore Services
export const firestoreService = {
  // Generic CRUD operations
  async create(collectionName: string, data: any) {
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return { success: true, id: docRef.id };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  async createWithId(collectionName: string, id: string, data: any) {
    try {
      await setDoc(doc(db, collectionName, id), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return { success: true, id };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  async getAll(collectionName: string) {
    try {
      const querySnapshot = await getDocs(collection(db, collectionName));
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  async getById(collectionName: string, id: string) {
    try {
      const docSnap = await getDoc(doc(db, collectionName, id));
      if (docSnap.exists()) {
        return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
      } else {
        return { success: false, error: 'Document not found' };
      }
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  async update(collectionName: string, id: string, data: any) {
    try {
      await updateDoc(doc(db, collectionName, id), {
        ...data,
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  async delete(collectionName: string, id: string) {
    try {
      await deleteDoc(doc(db, collectionName, id));
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  async query(collectionName: string, conditions: any[] = [], orderByField?: string) {
    try {
      let q = collection(db, collectionName);
      
      if (conditions.length > 0) {
        q = query(q, ...conditions.map(condition => where(condition.field, condition.operator, condition.value)));
      }
      
      if (orderByField) {
        q = query(q, orderBy(orderByField));
      }
      
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Real-time listener
  onSnapshot(collectionName: string, callback: (data: any[]) => void, conditions: any[] = []) {
    let q = collection(db, collectionName);
    
    if (conditions.length > 0) {
      q = query(q, ...conditions.map(condition => where(condition.field, condition.operator, condition.value)));
    }
    
    return onSnapshot(q, (querySnapshot) => {
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(data);
    });
  }
};

// Specific service functions
export const internService = {
  async createIntern(internData: any) {
    try {
      // Use secondary auth to prevent admin logout
      const authResult = await authService.registerIntern(internData.email, internData.password || 'intern123', internData);
      
      if (authResult.success) {
        return { success: true, id: authResult.user?.uid };
      }
      return authResult;
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  async getAllInterns() {
    return await firestoreService.getAll(COLLECTIONS.INTERNS);
  },

  async updateIntern(id: string, data: any) {
    return await firestoreService.update(COLLECTIONS.INTERNS, id, data);
  },

  async deleteIntern(id: string) {
    return await firestoreService.delete(COLLECTIONS.INTERNS, id);
  }
};

export const taskService = {
  async createTask(taskData: any) {
    return await firestoreService.create(COLLECTIONS.TASKS, taskData);
  },

  async getAllTasks() {
    return await firestoreService.getAll(COLLECTIONS.TASKS);
  },

  async updateTask(id: string, data: any) {
    return await firestoreService.update(COLLECTIONS.TASKS, id, data);
  },

  async deleteTask(id: string) {
    return await firestoreService.delete(COLLECTIONS.TASKS, id);
  },

  async getTasksByIntern(internId: string) {
    return await firestoreService.query(COLLECTIONS.TASKS, [
      { field: 'assignedToId', operator: '==', value: internId }
    ]);
  }
};

export const performanceService = {
  async createPerformance(performanceData: any) {
    return await firestoreService.create(COLLECTIONS.PERFORMANCES, performanceData);
  },

  async getAllPerformances() {
    return await firestoreService.getAll(COLLECTIONS.PERFORMANCES);
  },

  async updatePerformance(id: string, data: any) {
    return await firestoreService.update(COLLECTIONS.PERFORMANCES, id, data);
  },

  async deletePerformance(id: string) {
    return await firestoreService.delete(COLLECTIONS.PERFORMANCES, id);
  }
};

export const attendanceService = {
  async createAttendance(attendanceData: any) {
    return await firestoreService.create(COLLECTIONS.ATTENDANCE, attendanceData);
  },

  async getAllAttendance() {
    return await firestoreService.getAll(COLLECTIONS.ATTENDANCE);
  },

  async updateAttendance(id: string, data: any) {
    return await firestoreService.update(COLLECTIONS.ATTENDANCE, id, data);
  },

  async deleteAttendance(id: string) {
    return await firestoreService.delete(COLLECTIONS.ATTENDANCE, id);
  }
};

export const messageService = {
  async sendMessage(messageData: any) {
    return await firestoreService.create(COLLECTIONS.MESSAGES, messageData);
  },

  async getMessages(chatId: string) {
    return await firestoreService.query(COLLECTIONS.MESSAGES, [
      { field: 'chatId', operator: '==', value: chatId }
    ], 'createdAt');
  },

  onMessagesSnapshot(chatId: string, callback: (messages: any[]) => void) {
    return firestoreService.onSnapshot(COLLECTIONS.MESSAGES, callback, [
      { field: 'chatId', operator: '==', value: chatId }
    ]);
  }
};

export const chatService = {
  async createChat(chatData: any) {
    return await firestoreService.create(COLLECTIONS.CHATS, chatData);
  },

  async getAllChats() {
    return await firestoreService.getAll(COLLECTIONS.CHATS);
  },

  async updateChat(id: string, data: any) {
    return await firestoreService.update(COLLECTIONS.CHATS, id, data);
  },

  onChatsSnapshot(callback: (chats: any[]) => void) {
    return firestoreService.onSnapshot(COLLECTIONS.CHATS, callback);
  }
};

export const settingsService = {
  async saveSettings(userId: string, settings: any) {
    return await firestoreService.createWithId(COLLECTIONS.SETTINGS, userId, settings);
  },

  async getSettings(userId: string) {
    return await firestoreService.getById(COLLECTIONS.SETTINGS, userId);
  },

  async updateSettings(userId: string, settings: any) {
    return await firestoreService.update(COLLECTIONS.SETTINGS, userId, settings);
  }
};