/**
 * Recursively process a SchemaField object and populate the fields.
 * @param {string} prefix - Key path so far (e.g. "damage").
 * @param {object} schemaField - The SchemaField instance with subfields.
 * @param {object} fields - The object to populate.
 */
export function flattenFields(prefix, schemaField, fields) {
  for (const subField in schemaField.fields) {
    const subFieldObj = schemaField.fields[subField];
    const subFieldType = subFieldObj.constructor.name;
    // Full key path, e.g. "damage.formula", "damage.save", etc.
    const fullKey = `${prefix}.${subField}`;

    if (subFieldType === "SchemaField") {
      // Recurse deeper into nested SchemaFields
      flattenFields(fullKey, subFieldObj, fields);
    } else {
      fields.push({
        field: subFieldObj,
      })
    }
  }
}