// Shared default settings (used by the bridge content script and the popup).
// eslint-disable-next-line no-unused-vars
var LCAC_DEFAULTS = {
  enabled: true,      // master switch
  autoPopup: true,    // show suggestions while typing (off = Ctrl+Space only)
  typeAware: true,    // methods after "." match the variable's type
  identifiers: true,  // suggest names already in your code
  snippets: true,     // for-loop / def / lambda templates
  enterAccepts: true, // Enter accepts a suggestion (Tab always does)
};
