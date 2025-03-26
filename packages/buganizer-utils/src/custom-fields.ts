/**
 * Sets a custom field on a Buganizer bug
 *
 * @param bug - The Buganizer bug to set the custom field on
 * @param name - The name of the custom field
 * @param value - The value to set the custom field to
 * @throws {Error} if the custom field is not found on the bug
 */
export function setCustomField(
  bug: GoogleAppsScript.Buganizer.Bug,
  id: string,
  value: any
): void {
  const custom_field = getCustomField(bug, id);

  if (custom_field == undefined) {
    throw new Error(
      `The custom field, '${id}', was not found on b/${bug.getId()}`
    );
  }

  bug.setCustomField(custom_field, value);
}

/**
 * Sets a repeated custom field on a Buganizer bug
 *
 * @param bug - The Buganizer bug to set the repeated custom field on
 * @param name - The name of the repeated custom field
 * @param value - The value to set the repeated custom field to
 * @throws {Error} if the custom field is not found on the bug
 */
export function setRepeatedCustomField(
  bug: GoogleAppsScript.Buganizer.Bug,
  id: string,
  value: any
): void {
  const custom_field = getCustomField(bug, id);

  if (custom_field == undefined) {
    throw new Error(
      `The custom field, '${id}', was not found on b/${bug.getId()}`
    );
  }

  bug.setRepeatedCustomField(custom_field, value);
}

/**
 * Gets a custom field from a Buganizer bug by name
 *
 * @param bug - The Buganizer bug to get the custom field from
 * @param name - The name of the custom field to get
 * @returns {GoogleAppsScript.Buganizer.CustomField | undefined} The custom field object if found, undefined otherwise
 */
export function getCustomField(
  bug: GoogleAppsScript.Buganizer.Bug,
  id: string
): GoogleAppsScript.Buganizer.CustomField | undefined {
  return bug.getAllCustomFields().find((f) => f.getId() === id);
}

/**
 * Converts a boolean value to the corresponding enum value used by Buganizer
 *
 * @param bool - The boolean value to convert
 * @returns {number} 1 for true, 0 for false
 */
export function booleanCustomFieldEnum(bool: boolean): number {
  return bool ? 1 : 0;
}

export const WORKSPACE_CUSTOM_FIELDS = {
  isActionable: "1388909",
  isDeveloperIssue: "1388852",
  isEnglish: "1388884",
  status: "1245093",
  tags: "1172495",
  qualityScore: "1388853",
  tagged: "1385984",
  suggestedComponent: "1388836",
};
