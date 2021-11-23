import upath from 'upath';

/**
 * Sanitizes a filename. Removes invalid characters and shortens to the max
 * length.
 * @param filename
 * @param invalidCharacterRegex
 * @param maxLength
 * @returns the sanitized filename
 */
export function generalizedSanitizeFilename(
    filename: string,
    invalidCharacterRegex: RegExp,
    maxLength: number,
    fallbackFilename: string
): string {
    // First remove all invalid characters.
    // We keep / and \ as the "filename" can be a relative path with
    // directories. We don't use the sanitize-filename package, as it
    // also removes directory separators.
    let cleanedFilename = filename.replace(invalidCharacterRegex, '');

    // Should the filename only contain the extension now (because all
    // characters of the basename were invalid), we add a generic filename.

    if (cleanedFilename === '') {
        cleanedFilename = fallbackFilename;
    }

    // Shorten the filename if it is too long.
    const numberOfCharactersToCut = cleanedFilename.length - maxLength;
    if (numberOfCharactersToCut < 0) {
        return cleanedFilename.trim();
    }

    const finalBasenameLength = Math.max(
        1,
        cleanedFilename.length - numberOfCharactersToCut
    );
    return cleanedFilename.substr(0, finalBasenameLength).trim();
}

/**
 * Sanitizes a filename or path by shortening it to the specified maximum length
 * and removing the invalid characters in the RegExp. If you don't specify a
 * RegExp a very strict invalid character list will be used that only leaves
 * alphanumeric filenames untouched.
 * @param filename the filename or path (with UNIX slash separator) to sanitize
 * @param maxFileLength the filename will be shortened to this length
 * @param invalidCharactersRegex these characters will be removed from the
 * filename
 * @returns the cleaned filename
 */
export function sanitizeFilename(
    filename: string,
    fallbackFilename: string
): string {
    return generalizedSanitizeFilename(
        filename,
        /[~"#%&*:<>?/\\{|}]/g,
        128,
        fallbackFilename
    );
}
