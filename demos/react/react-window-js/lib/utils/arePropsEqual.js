import { shallowCompare } from "./shallowCompare.js";

export function arePropsEqual(prevProps, nextProps) {
  const {
    ariaAttributes: prevAriaAttributes,
    style: prevStyle,
    ...prevRest
  } = prevProps;
  const {
    ariaAttributes: nextAriaAttributes,
    style: nextStyle,
    ...nextRest
  } = nextProps;

  return (
    shallowCompare(prevAriaAttributes, nextAriaAttributes) &&
    shallowCompare(prevStyle, nextStyle) &&
    shallowCompare(prevRest, nextRest)
  );
}
