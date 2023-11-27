/**
 * Parse a parameter group (deliminated by <label> tags) within a
 * panel.
 */
export default function group(label: any, opts?: {}): {
    label: any;
    description: any;
    parameters: any;
};
