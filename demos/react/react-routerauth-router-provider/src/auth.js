export const fakeAuthProvider = {
  isAuthenticated: false,
  username: null,
  async singIn (username) {
    setTimeout(() => {
      fakeAuthProvider.isAuthenticated = true;
      fakeAuthProvider.username = username;
    }, 500);
  },
  async signOut () {
    setTimeout(() => {
      fakeAuthProvider.isAuthenticated = false;
      fakeAuthProvider.username = null;
    }, 500);
  }
};
