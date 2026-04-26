const { query } = require('../../db');

async function listAddressesByUser(userId) {
  return query(
    `SELECT id, label, type, address, city, province, postal_code,
            phone_number, delivery_instructions, latitude, longitude, is_default, created_at
     FROM addresses
     WHERE user_id = ?
     ORDER BY CASE WHEN is_default = 'true' THEN 1 ELSE 0 END DESC, created_at DESC`,
    [userId]
  );
}

async function findAddressByIdForUser(id, userId) {
  const rows = await query(
    `SELECT id, user_id, label, type, address, city, province, postal_code,
            phone_number, delivery_instructions, latitude, longitude, is_default, created_at
     FROM addresses
     WHERE id = ? AND user_id = ?
     FETCH FIRST 1 ROWS ONLY`,
    [id, userId]
  );
  return rows[0] || null;
}

async function clearDefaultForUser(userId, excludeId = null) {
  if (excludeId) {
    return query(
      "UPDATE addresses SET is_default = 'false' WHERE user_id = ? AND id <> ?",
      [userId, excludeId]
    );
  }

  return query("UPDATE addresses SET is_default = 'false' WHERE user_id = ?", [userId]);
}

async function createAddress(addressPayload) {
  const {
    userId,
    label,
    type,
    address,
    city,
    province,
    postalCode,
    phoneNumber,
    deliveryInstructions,
    latitude,
    longitude,
    isDefault,
  } = addressPayload;

  await query(
    `INSERT INTO addresses
     (user_id, label, type, address, city, province, postal_code, phone_number, delivery_instructions, latitude, longitude, is_default)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      label,
      type,
      address,
      city,
      province,
      postalCode,
      phoneNumber,
      deliveryInstructions,
      latitude,
      longitude,
      isDefault,
    ]
  );

  const rows = await query(
    `SELECT id, user_id, label, type, address, city, province, postal_code,
            phone_number, delivery_instructions, latitude, longitude, is_default, created_at
     FROM addresses
     WHERE user_id = ?
     ORDER BY id DESC
     FETCH FIRST 1 ROWS ONLY`,
    [userId]
  );

  return rows[0] || null;
}

async function updateAddress(id, userId, addressPayload) {
  const {
    label,
    type,
    address,
    city,
    province,
    postalCode,
    phoneNumber,
    deliveryInstructions,
    latitude,
    longitude,
    isDefault,
  } = addressPayload;

  const result = await query(
    `UPDATE addresses
     SET label = ?, type = ?, address = ?, city = ?, province = ?, postal_code = ?,
         phone_number = ?, delivery_instructions = ?, latitude = ?, longitude = ?, is_default = ?
     WHERE id = ? AND user_id = ?`,
    [
      label,
      type,
      address,
      city,
      province,
      postalCode,
      phoneNumber,
      deliveryInstructions,
      latitude,
      longitude,
      isDefault,
      id,
      userId,
    ]
  );

  return result;
}

async function deleteAddress(id, userId) {
  return query('DELETE FROM addresses WHERE id = ? AND user_id = ?', [id, userId]);
}

module.exports = {
  listAddressesByUser,
  findAddressByIdForUser,
  clearDefaultForUser,
  createAddress,
  updateAddress,
  deleteAddress,
};
