const { query } = require('../../db');

function formatAddress(address) {
  return {
    ...address,
    isDefault: Boolean(address.is_default),
  };
}

exports.getAddresses = async (req, res, next) => {
  try {
    const userId = req.auth.userId;
    const addresses = await query(
      `SELECT id, label, street_address, city, province, postal_code, 
              phone_number, delivery_instructions,
              country, latitude, longitude, is_default
       FROM addresses
       WHERE user_id = ?
       ORDER BY is_default DESC, created_at DESC`,
      [userId]
    );

    res.json(addresses.map(formatAddress));
  } catch (error) {
    next(error);
  }
};

exports.getAddressById = async (req, res, next) => {
  try {
    const userId = req.auth.userId;
    const { id } = req.params;

    const addresses = await query(
      `SELECT id, label, street_address, city, province, postal_code,
              phone_number, delivery_instructions,
              country, latitude, longitude, is_default
       FROM addresses
       WHERE id = ? AND user_id = ?`,
      [id, userId]
    );

    if (addresses.length === 0) {
      return res.status(404).json({ message: 'Address not found' });
    }

    res.json(formatAddress(addresses[0]));
  } catch (error) {
    next(error);
  }
};

exports.createAddress = async (req, res, next) => {
  try {
    const userId = req.auth.userId;
    const {
      label,
      street_address,
      city,
      province,
      postal_code,
      phone_number,
      delivery_instructions,
      country,
      latitude,
      longitude,
      isDefault,
    } = req.body;

    // Validate required fields
    if (!street_address || !city || !country) {
      return res.status(400).json({ 
        message: 'Street address, city, and country are required' 
      });
    }

    // If this is being set as default, unset other defaults
    if (isDefault) {
      await query(
        'UPDATE addresses SET is_default = FALSE WHERE user_id = ?',
        [userId]
      );
    }

    const result = await query(
      `INSERT INTO addresses 
       (user_id, label, street_address, city, province, postal_code, phone_number, delivery_instructions, country, latitude, longitude, is_default)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        label || null,
        street_address,
        city,
        province || null,
        postal_code || null,
        phone_number || null,
        delivery_instructions || null,
        country,
        latitude || null,
        longitude || null,
        isDefault ? 1 : 0,
      ]
    );

    const newAddress = await query(
      'SELECT id, label, street_address, city, province, postal_code, phone_number, delivery_instructions, country, latitude, longitude, is_default FROM addresses WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(formatAddress(newAddress[0]));
  } catch (error) {
    next(error);
  }
};

exports.updateAddress = async (req, res, next) => {
  try {
    const userId = req.auth.userId;
    const { id } = req.params;
    const {
      label,
      street_address,
      city,
      province,
      postal_code,
      phone_number,
      delivery_instructions,
      country,
      latitude,
      longitude,
      isDefault,
    } = req.body;

    // Verify ownership
    const existing = await query(
      'SELECT id FROM addresses WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: 'Address not found' });
    }

    // If this is being set as default, unset other defaults
    if (isDefault) {
      await query(
        'UPDATE addresses SET is_default = FALSE WHERE user_id = ? AND id != ?',
        [userId, id]
      );
    }

    await query(
      `UPDATE addresses 
       SET label = ?, street_address = ?, city = ?, province = ?, postal_code = ?, phone_number = ?, delivery_instructions = ?, country = ?, latitude = ?, longitude = ?, is_default = ?
       WHERE id = ? AND user_id = ?`,
      [
        label || null,
        street_address || null,
        city || null,
        province || null,
        postal_code || null,
        phone_number || null,
        delivery_instructions || null,
        country || null,
        latitude || null,
        longitude || null,
        isDefault ? 1 : 0,
        id,
        userId,
      ]
    );

    const updatedAddress = await query(
      'SELECT id, label, street_address, city, province, postal_code, phone_number, delivery_instructions, country, latitude, longitude, is_default FROM addresses WHERE id = ?',
      [id]
    );

    res.json(formatAddress(updatedAddress[0]));
  } catch (error) {
    next(error);
  }
};

exports.deleteAddress = async (req, res, next) => {
  try {
    const userId = req.auth.userId;
    const { id } = req.params;

    const result = await query(
      'DELETE FROM addresses WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Address not found' });
    }

    res.json({ message: 'Address deleted successfully' });
  } catch (error) {
    next(error);
  }
};
