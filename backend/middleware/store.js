// In-memory store — used as fallback when MongoDB is not available
const store = {
  users: [],
  policies: [],
  claims: [],
  _id: 1000,
  nextId() { return String(this._id++); }
};

module.exports = store;
