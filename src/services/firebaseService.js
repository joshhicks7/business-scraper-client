import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Check if Firebase is available
const isFirebaseAvailable = () => {
  if (!db) {
    console.warn('Firebase is not configured. Data will not be persisted.');
    return false;
  }
  return true;
};

const BUSINESSES_COLLECTION = 'businesses';
const TRACKING_COLLECTION = 'tracking';

// Business operations
export const addBusiness = async (businessData) => {
  if (!isFirebaseAvailable()) {
    // Return a temporary ID if Firebase is not available
    return `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  try {
    const docRef = await addDoc(collection(db, BUSINESSES_COLLECTION), {
      ...businessData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      source: businessData.source || 'manual'
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding business:', error);
    throw error;
  }
};

export const updateBusiness = async (businessId, updates) => {
  if (!isFirebaseAvailable()) {
    console.warn('Firebase not available, update not persisted');
    return;
  }
  try {
    const businessRef = doc(db, BUSINESSES_COLLECTION, businessId);
    await updateDoc(businessRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating business:', error);
    throw error;
  }
};

export const deleteBusiness = async (businessId) => {
  if (!isFirebaseAvailable()) {
    console.warn('Firebase not available, delete not persisted');
    return;
  }
  try {
    await deleteDoc(doc(db, BUSINESSES_COLLECTION, businessId));
  } catch (error) {
    console.error('Error deleting business:', error);
    throw error;
  }
};

export const getAllBusinesses = async () => {
  if (!isFirebaseAvailable()) {
    return [];
  }
  try {
    const q = query(
      collection(db, BUSINESSES_COLLECTION),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching businesses:', error);
    throw error;
  }
};

export const searchBusinesses = async (filters = {}) => {
  if (!isFirebaseAvailable()) {
    return [];
  }
  try {
    let q = query(collection(db, BUSINESSES_COLLECTION));
    
    if (filters.category) {
      q = query(q, where('category', '==', filters.category));
    }
    
    if (filters.city) {
      q = query(q, where('city', '==', filters.city));
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error searching businesses:', error);
    throw error;
  }
};

// Tracking operations
export const saveTrackingData = async (businessId, trackingData) => {
  if (!isFirebaseAvailable()) {
    console.warn('Firebase not available, tracking data not persisted');
    return;
  }
  try {
    // Check if tracking document exists
    const trackingQuery = query(
      collection(db, TRACKING_COLLECTION),
      where('businessId', '==', businessId)
    );
    const querySnapshot = await getDocs(trackingQuery);
    
    if (!querySnapshot.empty) {
      // Update existing document
      const trackingDoc = querySnapshot.docs[0];
      await updateDoc(trackingDoc.ref, {
        ...trackingData,
        updatedAt: Timestamp.now()
      });
    } else {
      // Create new document
      await addDoc(collection(db, TRACKING_COLLECTION), {
        businessId,
        ...trackingData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
    }
  } catch (error) {
    console.error('Error saving tracking data:', error);
    throw error;
  }
};

export const getTrackingData = async (businessId) => {
  if (!isFirebaseAvailable()) {
    return null;
  }
  try {
    const trackingQuery = query(
      collection(db, TRACKING_COLLECTION),
      where('businessId', '==', businessId)
    );
    const querySnapshot = await getDocs(trackingQuery);
    
    if (!querySnapshot.empty) {
      return {
        id: querySnapshot.docs[0].id,
        ...querySnapshot.docs[0].data()
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching tracking data:', error);
    throw error;
  }
};

export const getAllTrackingData = async () => {
  if (!isFirebaseAvailable()) {
    return {};
  }
  try {
    const querySnapshot = await getDocs(collection(db, TRACKING_COLLECTION));
    const trackingMap = {};
    querySnapshot.docs.forEach(doc => {
      const data = doc.data();
      trackingMap[data.businessId] = {
        id: doc.id,
        ...data
      };
    });
    return trackingMap;
  } catch (error) {
    console.error('Error fetching all tracking data:', error);
    throw error;
  }
};

