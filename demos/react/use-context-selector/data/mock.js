function getUser(current) {
  const users = ['Tom', 'Jack'];
  if (!current) {
    return users[0];
  }

  return users.find(item => current !== item);
}

async function mockLogin() {
  return new Promise(resolve => {
    setTimeout(() => resolve({
      user: getUser(),
    }), 1000);
  })
}

async function mockChangeUser(current) {
  return new Promise(resolve => {
    setTimeout(() => resolve({
      user: getUser(current),
    }), 1000);
  });
}

export {
  mockLogin,
  mockChangeUser,
};
