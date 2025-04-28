const fs = require('fs');

function generateCss(config) {
  const {
    primaryColor,
    secondaryColor,
    accentColor,
    successColor,
    warningColor,
    errorColor,
    backgroundColor,
    textColor,
    borderColor,
    cardColor,
    inputColor,
    fontFamily,
    fontSize,
    smBreakpoint,
    mdBreakpoint,
    lgBreakpoint,
    xlBreakpoint,
  } = config;

  const css = `:root {
    --color-primary: ${primaryColor};
    --color-secondary: ${secondaryColor};
    --color-accent: ${accentColor};
    --color-success: ${successColor};
    --color-warning: ${warningColor};
    --color-error: ${errorColor};
    --color-background: ${backgroundColor};
    --color-text: ${textColor};
    --color-border: ${borderColor};
    --color-card: ${cardColor};
    --color-input: ${inputColor};
    --font-family: ${fontFamily};
    --font-size: ${fontSize};
    --sm-breakpoint: ${smBreakpoint};
    --md-breakpoint: ${mdBreakpoint};
    --lg-breakpoint: ${lgBreakpoint};
    --xl-breakpoint: ${xlBreakpoint};
  }`;

  fs.writeFileSync('src/custom.css', css);
}

module.exports = generateCss;
