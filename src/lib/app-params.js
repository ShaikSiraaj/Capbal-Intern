// App parameter helpers — reads from URL query params and localStorage.
// All storage keys now use the "app_" prefix (Base44 references removed).

const isNode = typeof window === 'undefined';
const windowObj = isNode ? { localStorage: new Map() } : window;
const storage = windowObj.localStorage;

const toSnakeCase = (str) => {
	return str.replace(/([A-Z])/g, '_$1').toLowerCase();
};

const getAppParamValue = (paramName, { defaultValue = undefined, removeFromUrl = false } = {}) => {
	if (isNode) {
		return defaultValue;
	}
	const storageKey = `app_${toSnakeCase(paramName)}`;
	const urlParams = new URLSearchParams(window.location.search);
	const searchParam = urlParams.get(paramName);
	if (removeFromUrl) {
		urlParams.delete(paramName);
		const newUrl = `${window.location.pathname}${urlParams.toString() ? `?${urlParams.toString()}` : ''}${window.location.hash}`;
		window.history.replaceState({}, document.title, newUrl);
	}
	if (searchParam) {
		storage.setItem(storageKey, searchParam);
		return searchParam;
	}
	if (defaultValue) {
		storage.setItem(storageKey, defaultValue);
		return defaultValue;
	}
	const storedValue = storage.getItem(storageKey);
	if (storedValue) {
		return storedValue;
	}
	return null;
};

const getAppParams = () => {
	// Clean up any old base44 keys left in localStorage from previous sessions
	if (typeof window !== 'undefined') {
		['base44_access_token', 'base44_app_id', 'base44_functions_version',
		 'base44_app_base_url', 'base44_from_url', 'base44_clear_access_token', 'token']
			.forEach(k => localStorage.removeItem(k));
	}

	return {
		appId: getAppParamValue('app_id', { defaultValue: import.meta.env.VITE_APP_ID }),
		token: getAppParamValue('access_token', { removeFromUrl: true }),
		fromUrl: getAppParamValue('from_url', { defaultValue: isNode ? '' : window.location.href }),
		functionsVersion: getAppParamValue('functions_version', { defaultValue: import.meta.env.VITE_FUNCTIONS_VERSION }),
		appBaseUrl: getAppParamValue('app_base_url', { defaultValue: import.meta.env.VITE_APP_BASE_URL }),
	};
};

export const appParams = {
	...getAppParams(),
};
