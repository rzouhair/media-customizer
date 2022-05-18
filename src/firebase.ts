import firebase from 'firebase/compat/app'
import 'firebase/compat/firestore'
import type { Ref } from 'vue'

const config = {
  apiKey: 'AIzaSyAZ5Fl6bcIU7isXv7X-YIdRYhmot8Cn2MY',
  authDomain: 'media-customizer.firebaseapp.com',
  projectId: 'media-customizer',
  storageBucket: 'media-customizer.appspot.com',
  messagingSenderId: '691502906752',
  appId: '1:691502906752:web:7da2aff0cf8a0a8ab49565',
  measurementId: 'G-7T2JB3KSBM',
}

firebase.initializeApp(config)

const db = firebase.firestore()
export const timestampsCollection = db.collection('timestamps')

export const createTimestamp = (timestamp: any) => {
  return timestampsCollection.add(timestamp)
}

export const getTimestamps = async () => {
  return timestampsCollection.get()
}

export const getTimestamp = async (id: string) => {
  return timestampsCollection.doc(id)
}

export const updateTimestamp = async (id: string, timestamp: any) => {
  return timestampsCollection.doc(id).set(timestamp, { merge: true })
}

export const deleteTimestamp = async (id: string) => {
  return timestampsCollection.doc(id).delete()
}

export const useLoadTimestamps = () => {
  const timestamps: Ref<any> = ref([])
  const close = timestampsCollection.onSnapshot((snapshot) => {
    timestamps.value = snapshot.docs.map((doc: firebase.firestore.QueryDocumentSnapshot<firebase.firestore.DocumentData>) => ({ id: doc.id, ...doc.data() }))
  })
  onUnmounted(close)
  return timestamps
}
