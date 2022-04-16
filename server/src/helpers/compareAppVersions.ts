/**
 * Compares app versions like '0.9.0' and '0.9.0-beta1'.
 * @param currentVersion
 * @param newVersion
 * @returns < 0 if new version is older than current version; 0 if they are
 * equal; > 0 if new version is newer than current version
 */
export const compareAppVersions = (
    currentVersion: string,
    newVersion: string
): number => {
    let match = newVersion.match(/^(\d+)\.(\d+)\.(\d+)(-beta(\d+))?$/);
    if (!match) {
        return 0;
    }
    const majorN = Number.parseInt(match[1], 10);
    const minorN = Number.parseInt(match[2], 10);
    const patchN = Number.parseInt(match[3], 10);
    const betaN = match[5]
        ? Number.parseInt(match[5], 10)
        : Number.MAX_SAFE_INTEGER;

    match = currentVersion.match(/^(\d+)\.(\d+)\.(\d+)(-beta(\d+))?$/);
    if (!match) {
        return 0;
    }
    const majorC = Number.parseInt(match[1], 10);
    const minorC = Number.parseInt(match[2], 10);
    const patchC = Number.parseInt(match[3], 10);
    const betaC = match[5]
        ? Number.parseInt(match[5], 10)
        : Number.MAX_SAFE_INTEGER;

    const majorDiff = majorN - majorC;

    if (majorDiff !== 0) {
        return majorDiff;
    }

    const minorDiff = minorN - minorC;
    if (minorDiff !== 0) {
        return minorDiff;
    }

    const patchDiff = patchN - patchC;
    if (patchDiff !== 0) {
        return patchDiff;
    }

    const betaDiff = betaN - betaC;
    if (betaDiff !== 0) {
        return betaDiff;
    }

    return 0;
};
