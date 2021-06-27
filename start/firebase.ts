/*
|--------------------------------------------------------------------------
| Preloaded File
|--------------------------------------------------------------------------
|
| Any code written inside this file will be executed during the application
| boot.
|
*/

import { firebaseConfig } from 'Config/firebase'
import firebase from 'firebase'

firebase.initializeApp(firebaseConfig)
