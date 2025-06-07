import { initializeApp } from "firebase/app"
import { getStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: "AIzaSyCj_juwUufdTrMomnLSdp8oaUptrPYg4cQ",
  authDomain: "probandocositas-8c425.firebaseapp.com",
  projectId: "probandocositas-8c425",
  storageBucket: "probandocositas-8c425.appspot.com",
  messagingSenderId: "475444253440",
  appId: "1:475444253440:web:d351ea1f52e325ab8cd9e5"
};
const app = initializeApp(firebaseConfig)
const storage = getStorage(app)

export { storage }