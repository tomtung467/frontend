import { initializeApp } from 'firebase/app'
import { getAnalytics, isSupported } from 'firebase/analytics'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyDAF4YBYElpMH6CwvA8vLiFHqaOZFfiEb8',
  authDomain: 'real-time-restaurant-ordering.firebaseapp.com',
  databaseURL: 'https://real-time-restaurant-ordering-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'real-time-restaurant-ordering',
  storageBucket: 'real-time-restaurant-ordering.firebasestorage.app',
  messagingSenderId: '257221986660',
  appId: '1:257221986660:web:d399f87ef5283d00149271',
  measurementId: 'G-T9MC8MLVWB',
}

export const firebaseApp = initializeApp(firebaseConfig)
export const firestoreDb = getFirestore(firebaseApp)

export const analyticsReady = typeof window !== 'undefined'
  ? isSupported().then((supported) => (supported ? getAnalytics(firebaseApp) : null))
  : Promise.resolve(null)
