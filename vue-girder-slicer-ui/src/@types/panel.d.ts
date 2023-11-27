/**
 * Parse a <parameters> tag into a "panel" object.
 */
export default function panel(panelTag: any, opts?: {}): {
    advanced: boolean;
    groups: any;
};
