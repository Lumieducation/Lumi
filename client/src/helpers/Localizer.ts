import i18next from 'i18next';

/**
 * Tries localizing the key. If it fails (indicated by the fact that the key
 * is part of the localized string), it will return the original source
 * string. Tries through all the namespaces specified before falling back.
 * @param key the key to look up the translation in the i18n data
 * @param sourceString the original English string received from the Hub
 * @param namespaces (optional) the namespaces to try. Will default to the
 * namespaces passed into the constructor if unspecified.
 * @returns the localized string or the original English source string
 */
export function tryLocalize(
    key: string,
    sourceString: string,
    namespaces: string[]
): string {
    for (const namespace of namespaces) {
        const localized = i18next.t(`${namespace}:${key}`);
        if (!localized.includes(key)) {
            return localized;
        }
    }
    return sourceString;
}
