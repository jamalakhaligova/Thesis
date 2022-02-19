import { convertFromNext, convertToNext } from '../check/arbitrary/definition/Converters.js';
import { ArrayArbitrary } from './_internals/ArrayArbitrary.js';
import { MaxLengthUpperBound, maxGeneratedLengthFromSizeForArbitrary, } from './_internals/helpers/MaxLengthFromMinLength.js';
function createArrayArbitrary(nextArb, size, minLength, maxLengthOrUnset) {
    const maxLength = maxLengthOrUnset !== undefined ? maxLengthOrUnset : MaxLengthUpperBound;
    const specifiedMaxLength = maxLengthOrUnset !== undefined;
    const maxGeneratedLength = maxGeneratedLengthFromSizeForArbitrary(size, minLength, maxLength, specifiedMaxLength);
    return convertFromNext(new ArrayArbitrary(nextArb, minLength, maxGeneratedLength, maxLength));
}
function array(arb, ...args) {
    const nextArb = convertToNext(arb);
    if (args[0] === undefined) {
        return createArrayArbitrary(nextArb, undefined, 0, undefined);
    }
    if (typeof args[0] === 'object') {
        return createArrayArbitrary(nextArb, args[0].size, args[0].minLength || 0, args[0].maxLength);
    }
    if (args[1] !== undefined) {
        return createArrayArbitrary(nextArb, undefined, args[0], args[1]);
    }
    return createArrayArbitrary(nextArb, undefined, 0, args[0]);
}
export { array };
