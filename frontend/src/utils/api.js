export const API_BASE = process.env.REACT_APP_API_BASE ?? '';

const resolveUrl = (path) => {
  if (!path.startsWith('/')) {
    return `${API_BASE}/${path}`;
  }
  return `${API_BASE}${path}`;
};

export const request = async (path, options = {}) => {
  const response = await fetch(resolveUrl(path), options);

  if (!response.ok) {
    let message = 'Request failed';
    try {
      const errorText = await response.text();
      if (errorText) {
        message = errorText;
      }
    } catch (error) {
      // ignore
    }
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    return response.json();
  }

  return response.text();
};

export const requestJson = (path, { headers, ...options } = {}) =>
  request(path, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...headers,
    },
    ...options,
  });

export const safeArray = (value) => (Array.isArray(value) ? value : []);
export const safeObject = (value) => (value && typeof value === 'object' ? value : {});
