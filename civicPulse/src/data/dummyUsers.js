// Simple in-memory dummy users for frontend-only login/testing
// Do NOT use in production. This is only to enable UI testing when backend is unavailable.

const dummyUsers = [
  {
    id: 1,
    name: 'elec',
    username: 'elec',
    password: '12345',
    type: 'ELEC',
  },
  {
    id: 2,
    name: 'water',
    username: 'water',
    password: '12345',
    type: 'WATER',
  },
  {
    id: 3,
    name: 'road',
    username: 'road',
    password: '12345',
    type: 'ROAD',
  },
  {
    id: 4,
    name: 'garbage',
    username: 'garbage',
    password: '12345',
    type: 'GARB',
  },
  // A quick demo admin
  {
    id: 99,
    name: 'demo',
    username: 'demo',
    password: '12345',
    type: 'ELEC',
  }
];

export default dummyUsers;
