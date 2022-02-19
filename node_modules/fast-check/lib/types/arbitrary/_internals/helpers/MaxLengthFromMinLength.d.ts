/**
 * The size parameter defines how large the generated values could be.
 *
 * The default in fast-check is 'small' but it could be increased (resp. decreased)
 * to ask arbitraries for larger (resp. smaller) values.
 *
 * @remarks Since 2.22.0
 * @public
 */
export declare type Size = 'xsmall' | 'small' | 'medium' | 'large' | 'xlarge';
/**
 * @remarks Since 2.22.0
 * @public
 */
export declare type RelativeSize = '-4' | '-3' | '-2' | '-1' | '=' | '+1' | '+2' | '+3' | '+4';
/**
 * Superset of {@link Size} to override the default defined for size
 * @remarks Since 2.22.0
 * @public
 */
export declare type SizeForArbitrary = RelativeSize | Size | 'max' | undefined;
/**
 * Resolve the size that should be used given the current context
 * @param size - Size defined by the caller on the arbitrary
 */
export declare function resolveSize(size: Exclude<SizeForArbitrary, 'max'> | undefined): Size;
