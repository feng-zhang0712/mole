/**
 * @param {unknown} expectedCondition
 * @param {string} [message="Assertion error"]
 * @returns {asserts expectedCondition}
 */
export function assert(expectedCondition, message = "Assertion error") {
  if (!expectedCondition) {
    console.error(message);
    throw Error(message);
  }
}
