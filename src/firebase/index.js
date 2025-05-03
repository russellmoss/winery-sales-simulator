export { default as app } from './firebase';
export { db, auth } from './firebase';
export * from './authService';
export * from './firestoreService';
export {
  loginUserWithRole,
  registerUserWithRole,
  getUserProfileWithRole,
  updateUserProfileWithRole,
  deleteUserAccountWithRole,
  createUser
} from './userService'; 