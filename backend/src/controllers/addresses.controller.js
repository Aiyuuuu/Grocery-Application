const addressesModel = require('../models/addresses.model');

function parseBooleanInput(value) {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true') return true;
    if (normalized === 'false') return false;
  }

  return Boolean(value);
}

function formatAddress(address) {
  return {
    ...address,
    isDefault: address.is_default === 'true',
  };
}

exports.getAddresses = async (req, res, next) => {
  try {
    const userId = req.auth.userId;
    const addresses = await addressesModel.listAddressesByUser(userId);

    res.json(addresses.map(formatAddress));
  } catch (error) {
    next(error);
  }
};

exports.getAddressById = async (req, res, next) => {
  try {
    const userId = req.auth.userId;
    const { id } = req.params;

    const address = await addressesModel.findAddressByIdForUser(id, userId);

    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    res.json(formatAddress(address));
  } catch (error) {
    next(error);
  }
};

exports.createAddress = async (req, res, next) => {
  try {
    const userId = req.auth.userId;
    const {
      label,
      type,
      address,
      city,
      province,
      postal_code,
      phone_number,
      delivery_instructions,
      latitude,
      longitude,
      isDefault,
    } = req.body;

    if (!address || !city || !province || !postal_code) {
      return res.status(400).json({ 
        message: 'address, city, province and postal_code are required'
      });
    }

    if (type && !['home', 'work', 'other'].includes(type)) {
      return res.status(400).json({ message: 'type must be one of: home, work, other' });
    }

    const isDefaultFlag = parseBooleanInput(isDefault);

    if (isDefaultFlag) {
      await addressesModel.clearDefaultForUser(userId);
    }

    const newAddress = await addressesModel.createAddress({
      userId,
      label: label || null,
      type: type || null,
      address,
      city,
      province: province || null,
      postalCode: postal_code || null,
      phoneNumber: phone_number || null,
      deliveryInstructions: delivery_instructions || null,
      latitude: latitude === undefined || latitude === null || latitude === '' ? null : Number(latitude),
      longitude: longitude === undefined || longitude === null || longitude === '' ? null : Number(longitude),
      isDefault: isDefaultFlag ? 'true' : 'false',
    });

    res.status(201).json(formatAddress(newAddress));
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
      type,
      address,
      city,
      province,
      postal_code,
      phone_number,
      delivery_instructions,
      latitude,
      longitude,
      isDefault,
    } = req.body;

    const existing = await addressesModel.findAddressByIdForUser(id, userId);

    if (!existing) {
      return res.status(404).json({ message: 'Address not found' });
    }

    const isDefaultFlag = isDefault === undefined ? undefined : parseBooleanInput(isDefault);

    if (isDefaultFlag) {
      await addressesModel.clearDefaultForUser(userId, id);
    }

    const nextType = type === undefined ? existing.type : type;
    if (nextType && !['home', 'work', 'other'].includes(nextType)) {
      return res.status(400).json({ message: 'type must be one of: home, work, other' });
    }

    await addressesModel.updateAddress(id, userId, {
      label: label === undefined ? existing.label : (label || null),
      type: nextType || null,
      address: address === undefined ? existing.address : address,
      city: city === undefined ? existing.city : city,
      province: province === undefined ? existing.province : province,
      postalCode: postal_code === undefined ? existing.postal_code : postal_code,
      phoneNumber: phone_number === undefined ? existing.phone_number : (phone_number || null),
      deliveryInstructions:
        delivery_instructions === undefined
          ? existing.delivery_instructions
          : (delivery_instructions || null),
      latitude: latitude === undefined ? existing.latitude : latitude,
      longitude: longitude === undefined ? existing.longitude : longitude,
      isDefault: isDefaultFlag === undefined ? existing.is_default : (isDefaultFlag ? 'true' : 'false'),
    });

    const updatedAddress = await addressesModel.findAddressByIdForUser(id, userId);

    res.json(formatAddress(updatedAddress));
  } catch (error) {
    next(error);
  }
};

exports.deleteAddress = async (req, res, next) => {
  try {
    const userId = req.auth.userId;
    const { id } = req.params;

    const result = await addressesModel.deleteAddress(id, userId);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Address not found' });
    }

    res.json({ message: 'Address deleted successfully' });
  } catch (error) {
    next(error);
  }
};
