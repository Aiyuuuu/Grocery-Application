const ADDRESSES_STORAGE_KEY = 'savedAddresses';
const ADDRESSES_JSON_PATH = '/addresses.json';

export async function loadAddresses() {
  const response = await fetch(ADDRESSES_JSON_PATH);
  const data = await response.json();
  const baseAddresses = Array.isArray(data.addresses) ? data.addresses : [];

  if (typeof window === 'undefined') {
    return baseAddresses;
  }

  const savedAddresses = window.localStorage.getItem(ADDRESSES_STORAGE_KEY);
  if (!savedAddresses) {
    return baseAddresses;
  }

  try {
    const parsedAddresses = JSON.parse(savedAddresses);
    return Array.isArray(parsedAddresses) && parsedAddresses.length > 0
      ? parsedAddresses
      : baseAddresses;
  } catch {
    return baseAddresses;
  }
}

export function saveAddresses(addresses) {
  if (typeof window === 'undefined') {
    return;
  }

  if (!Array.isArray(addresses)) {
    window.localStorage.removeItem(ADDRESSES_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(ADDRESSES_STORAGE_KEY, JSON.stringify(addresses));
}

export function getDefaultAddress(addresses) {
  if (!Array.isArray(addresses) || addresses.length === 0) {
    return null;
  }

  return addresses.find((address) => address.isDefault) || addresses[0];
}
