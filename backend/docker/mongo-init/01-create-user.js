// ./mongo-init/01-create-user.js
db = db.getSiblingDB('appdb');
db.createUser({
  user: 'appuser',
  pwd: 'app_password_123',
  roles: [{ role: 'readWrite', db: 'appdb' }],
});