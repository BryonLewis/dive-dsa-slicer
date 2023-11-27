/**
 * Parse a `default` tag returning an empty object when no default is given.
 * If the default value appears to be a templated string, also return an
 * empty object.
 */
export default function defaultValue(type: any, value: any): {
    value: any;
} | {
    value?: undefined;
};
