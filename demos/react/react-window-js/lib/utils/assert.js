export function assert(expectedCondition, message = 'Assertion error') {
  if (!expectedCondition) {
    console.error(message);
    throw new Error(message);
  }
}
