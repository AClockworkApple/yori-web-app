const mockFirestore = {
  collection: jest.fn(() => ({
    doc: jest.fn(() => ({
      get: jest.fn(),
      set: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    })),
    addDoc: jest.fn(),
    getDocs: jest.fn(() => Promise.resolve({ forEach: jest.fn() })),
  })),
};

const mockAuth = {
  currentUser: null,
};

const mockFirebase = {
  initializeApp: jest.fn(),
  getFirestore: jest.fn(() => mockFirestore),
  getAuth: jest.fn(() => mockAuth),
};

jest.mock('firebase/firestore', () => mockFirestore);
jest.mock('firebase/auth', () => mockAuth);
jest.mock('firebase/app', () => mockFirebase);

module.exports = { firebase: mockFirebase, db: mockFirestore, auth: mockAuth };