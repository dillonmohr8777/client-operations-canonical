/* @ds-bundle: {"format":4,"namespace":"MomentumDesignSystem_09b3bb","components":[{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Notice","sourcePath":"components/core/Notice.jsx"},{"name":"Swatch","sourcePath":"components/core/Swatch.jsx"},{"name":"TextButton","sourcePath":"components/core/TextButton.jsx"},{"name":"BookCard","sourcePath":"components/editorial/BookCard.jsx"},{"name":"BookCover","sourcePath":"components/editorial/BookCover.jsx"},{"name":"ChapterArt","sourcePath":"components/editorial/ChapterArt.jsx"},{"name":"CitationRef","sourcePath":"components/editorial/CitationRef.jsx"},{"name":"EngravingPanel","sourcePath":"components/editorial/EngravingPanel.jsx"},{"name":"PullQuote","sourcePath":"components/editorial/PullQuote.jsx"},{"name":"SourceDisclosure","sourcePath":"components/editorial/SourceDisclosure.jsx"},{"name":"Checklist","sourcePath":"components/forms/Checklist.jsx"},{"name":"ExerciseField","sourcePath":"components/forms/ExerciseField.jsx"},{"name":"SearchField","sourcePath":"components/forms/SearchField.jsx"},{"name":"ChapterNav","sourcePath":"components/navigation/ChapterNav.jsx"},{"name":"SegmentedTabs","sourcePath":"components/navigation/SegmentedTabs.jsx"},{"name":"SiteFooter","sourcePath":"components/navigation/SiteFooter.jsx"},{"name":"TopBar","sourcePath":"components/navigation/TopBar.jsx"},{"name":"DiagramSteps","sourcePath":"components/reading/DiagramSteps.jsx"},{"name":"ExercisePanel","sourcePath":"components/reading/ExercisePanel.jsx"},{"name":"ReaderTools","sourcePath":"components/reading/ReaderTools.jsx"},{"name":"ReadingProgress","sourcePath":"components/reading/ReadingProgress.jsx"}],"sourceHashes":{"components/core/Button.jsx":"e84d34f2597e","components/core/Notice.jsx":"57193a0d6e5b","components/core/Swatch.jsx":"e56213872d16","components/core/TextButton.jsx":"e471ea3c2317","components/editorial/BookCard.jsx":"bcc9131634c5","components/editorial/BookCover.jsx":"64ea35de3fc7","components/editorial/ChapterArt.jsx":"1ea1bade8e50","components/editorial/CitationRef.jsx":"05ba2bfc8285","components/editorial/EngravingPanel.jsx":"61aa091aa1cb","components/editorial/PullQuote.jsx":"f419f4c64327","components/editorial/SourceDisclosure.jsx":"d2fa370d3731","components/forms/Checklist.jsx":"0d5175645e86","components/forms/ExerciseField.jsx":"718aac67013a","components/forms/SearchField.jsx":"baaae6507fa8","components/navigation/ChapterNav.jsx":"569e72183554","components/navigation/SegmentedTabs.jsx":"1947d6cf3a47","components/navigation/SiteFooter.jsx":"fa6edbd97e75","components/navigation/TopBar.jsx":"ea6a280e79b7","components/reading/DiagramSteps.jsx":"4a077a2763b9","components/reading/ExercisePanel.jsx":"2db87e10fa01","components/reading/ReaderTools.jsx":"6c61d71863e3","components/reading/ReadingProgress.jsx":"3a29dfaaafef","ui_kits/brand-system/BrandSystem.jsx":"3a69e99274ec","ui_kits/field-notes/Library.jsx":"e9f8461afc47","ui_kits/field-notes/Reader.jsx":"c084dd741540","ui_kits/field-notes/data.js":"4001a59cbe64"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.MomentumDesignSystem_09b3bb = window.MomentumDesignSystem_09b3bb || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const momentumButtonBase = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 18,
  padding: "12px 22px",
  borderRadius: "var(--radius-control)",
  fontFamily: "var(--body)",
  fontWeight: 900,
  textDecoration: "none",
  alignSelf: "flex-start",
  transition: "background var(--dur-state),transform var(--dur-state)",
  cursor: "pointer"
};
const momentumButtonVariants = {
  primary: {
    background: "var(--action-primary-bg)",
    border: "1px solid var(--action-primary-bg)",
    color: "var(--action-primary-fg)"
  },
  secondary: {
    background: "transparent",
    border: "1px solid var(--action-secondary-border)",
    color: "var(--action-secondary-fg)"
  }
};

/** Gold primary / hairline secondary action. Hover lightens to #ffcf54 and lifts 2px over .2s. */
function Button({
  variant = "primary",
  href,
  children,
  icon,
  disabled,
  style,
  onClick,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const s = {
    ...momentumButtonBase,
    ...momentumButtonVariants[variant],
    ...(hover && !disabled ? {
      background: "var(--action-primary-bg-hover)",
      transform: "translateY(var(--lift-hover))"
    } : null),
    ...(disabled ? {
      opacity: .5,
      cursor: "not-allowed"
    } : null),
    ...style
  };
  const inner = /*#__PURE__*/React.createElement(React.Fragment, null, children, icon ? /*#__PURE__*/React.createElement("span", {
    style: {
      width: 20,
      height: 20,
      display: "block"
    }
  }, icon) : null);
  const handlers = {
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false)
  };
  if (href && !disabled) return /*#__PURE__*/React.createElement("a", _extends({
    href: href,
    onClick: onClick,
    style: s
  }, handlers, rest), inner);
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    style: s,
    disabled: disabled,
    onClick: onClick
  }, handlers, rest), inner);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Notice.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const momentumNoticeStyle = {
  fontSize: "var(--size-note)",
  color: "var(--text-secondary)",
  padding: "14px 0",
  borderTop: "1px solid var(--border-hairline)",
  borderBottom: "1px solid var(--border-hairline)",
  maxWidth: "none"
};

/** Rule-bounded review / status line. Honest disclosure, never decoration. */
function Notice({
  children,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("p", _extends({
    style: {
      ...momentumNoticeStyle,
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Notice });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Notice.jsx", error: String((e && e.message) || e) }); }

// components/core/Swatch.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const momentumSwatchStyle = {
  minHeight: 190,
  padding: "var(--space-inset)",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  fontSize: "var(--size-label)",
  fontFamily: "var(--body)"
};

/** Colour specimen tile: name, hex, role. Fills its grid cell. */
function Swatch({
  name,
  hex,
  role,
  color,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      ...momentumSwatchStyle,
      background: hex,
      color: color || "var(--paper)",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("b", {
    style: {
      fontSize: "1.1rem"
    }
  }, name), /*#__PURE__*/React.createElement("span", null, hex.toUpperCase()), /*#__PURE__*/React.createElement("small", {
    style: {
      fontSize: "var(--size-micro)"
    }
  }, role));
}
Object.assign(__ds_scope, { Swatch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Swatch.jsx", error: String((e && e.message) || e) }); }

// components/core/TextButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const momentumTextButtonStyle = {
  background: "transparent",
  color: "inherit",
  border: "1px solid currentColor",
  borderRadius: "var(--radius-pill)",
  padding: "5px 14px",
  fontSize: 13,
  fontFamily: "var(--body)",
  fontWeight: 800,
  cursor: "pointer"
};

/** Outlined pill used for the header motion toggle. Inherits the field's text colour. */
function TextButton({
  pressed,
  onToggle,
  children,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    "aria-pressed": pressed === undefined ? undefined : String(pressed),
    onClick: onToggle,
    style: {
      ...momentumTextButtonStyle,
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { TextButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/TextButton.jsx", error: String((e && e.message) || e) }); }

// components/editorial/BookCard.jsx
try { (() => {
const momentumCardStyle = {
  borderBottom: "1px solid var(--border-hairline)",
  paddingBottom: 28
};
const momentumCardFeatured = {
  gridColumn: "1/-1",
  display: "grid",
  gridTemplateColumns: "1.25fr 1fr",
  background: "var(--surface-emphasis)",
  color: "var(--paper)",
  gap: 0,
  border: 0,
  padding: 0,
  borderRadius: "var(--radius)",
  overflow: "hidden"
};
const momentumCardMeta = {
  display: "flex",
  gap: 16,
  fontSize: "var(--size-micro)",
  letterSpacing: "var(--tracking-meta)",
  textTransform: "uppercase",
  marginBottom: 20,
  fontWeight: 800
};
const momentumArrow = /*#__PURE__*/React.createElement("svg", {
  viewBox: "0 0 24 24",
  "aria-hidden": "true"
}, /*#__PURE__*/React.createElement("path", {
  d: "M4 12h16m-6-6 6 6-6 6"
}));

/** Library card: 3:2 image over editorial copy. featured = dark navy split composition. */
function BookCard({
  title,
  summary,
  series,
  topic,
  image,
  href = "#",
  alt,
  featured,
  cta = "Open the field guide",
  onOpen
}) {
  const [hover, setHover] = React.useState(false);
  const open = onOpen ? e => {
    e.preventDefault();
    onOpen();
  } : undefined;
  const copy = /*#__PURE__*/React.createElement("div", {
    style: featured ? {
      padding: 44,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center"
    } : {
      paddingTop: 24
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: "var(--size-card-title)",
      marginBottom: featured ? 15 : 16
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    style: {
      ...momentumCardMeta,
      marginTop: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: featured ? "var(--text-meta-accent-dark-field)" : "var(--text-meta-accent)"
    }
  }, series), /*#__PURE__*/React.createElement("span", null, topic)), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: "var(--size-support)",
      marginBottom: 22
    }
  }, summary), /*#__PURE__*/React.createElement(__ds_scope.Button, {
    href: href,
    onClick: open,
    icon: momentumArrow
  }, cta));
  return /*#__PURE__*/React.createElement("article", {
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: featured ? momentumCardFeatured : momentumCardStyle
  }, /*#__PURE__*/React.createElement("figure", {
    style: {
      margin: 0,
      background: "var(--surface-image-field)",
      aspectRatio: "3/2",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: href,
    onClick: open,
    "aria-label": "Read " + title
  }, /*#__PURE__*/React.createElement("img", {
    src: image,
    alt: alt || title,
    loading: "lazy",
    style: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      transition: "transform var(--dur-identity) var(--ease)",
      transform: hover ? "scale(1.025)" : "none"
    }
  }))), copy);
}
Object.assign(__ds_scope, { BookCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/editorial/BookCard.jsx", error: String((e && e.message) || e) }); }

// components/editorial/BookCover.jsx
try { (() => {
const momentumCoverStyle = {
  background: "var(--surface-identity)",
  color: "var(--paper)",
  position: "relative",
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  minHeight: 610
};
const momentumCoverCopy = {
  padding: "70px 20px 70px max(40px,calc((100vw - 1344px)/2))",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  gap: 25,
  position: "relative",
  zIndex: 1
};

/** Book cover: midnight field, display title, deck, gold action, contained art. */
function BookCover({
  title,
  deck,
  series,
  topic,
  image,
  alt,
  cta = "Start reading",
  href = "#chapter-1"
}) {
  return /*#__PURE__*/React.createElement("section", {
    style: momentumCoverStyle
  }, /*#__PURE__*/React.createElement("div", {
    style: momentumCoverCopy
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: "var(--size-cover-title)"
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 16,
      fontSize: "var(--size-micro)",
      letterSpacing: "var(--tracking-meta)",
      textTransform: "uppercase",
      fontWeight: 800,
      color: "var(--gold)",
      margin: 0
    }
  }, /*#__PURE__*/React.createElement("span", null, series), /*#__PURE__*/React.createElement("span", null, topic)), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: "var(--size-subtitle)",
      color: "var(--text-reversed-dim)",
      maxWidth: "var(--measure-cover-deck)"
    }
  }, deck), /*#__PURE__*/React.createElement(__ds_scope.Button, {
    href: href,
    style: {
      marginTop: 6
    }
  }, cta)), /*#__PURE__*/React.createElement("img", {
    src: image,
    alt: alt || title,
    style: {
      height: "100%",
      width: "100%",
      objectFit: "contain",
      background: "var(--surface-identity)",
      minHeight: 500
    }
  }));
}
Object.assign(__ds_scope, { BookCover });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/editorial/BookCover.jsx", error: String((e && e.message) || e) }); }

// components/editorial/ChapterArt.jsx
try { (() => {
const momentumChapterArtStyle = {
  margin: "35px 0",
  background: "var(--surface-image-field)",
  borderRadius: "var(--radius)",
  overflow: "hidden"
};

/** 3:2 illustration frame on a midnight field with a reversed caption. */
function ChapterArt({
  src,
  alt,
  caption,
  contain
}) {
  return /*#__PURE__*/React.createElement("figure", {
    style: momentumChapterArtStyle
  }, /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: alt,
    style: {
      width: "100%",
      aspectRatio: "3/2",
      objectFit: contain ? "contain" : "cover"
    }
  }), caption ? /*#__PURE__*/React.createElement("figcaption", {
    style: {
      padding: "12px 20px",
      color: "var(--text-reversed-dim)",
      fontSize: "var(--size-micro)"
    }
  }, caption) : null);
}
Object.assign(__ds_scope, { ChapterArt });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/editorial/ChapterArt.jsx", error: String((e && e.message) || e) }); }

// components/editorial/CitationRef.jsx
try { (() => {
/** Superscript citation link into a chapter's source disclosures. */
function CitationRef({
  n,
  href
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: ".7em",
      verticalAlign: "super",
      lineHeight: 0
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: href,
    style: {
      textDecoration: "none",
      fontWeight: 900,
      padding: "2px 3px",
      color: "var(--text-link)"
    }
  }, n));
}
Object.assign(__ds_scope, { CitationRef });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/editorial/CitationRef.jsx", error: String((e && e.message) || e) }); }

// components/editorial/EngravingPanel.jsx
try { (() => {
const momentumEngravingStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "var(--space-grid)",
  alignItems: "center",
  background: "var(--surface-reading-field)",
  padding: "var(--space-panel)",
  borderRadius: "var(--radius)",
  margin: "50px 0"
};

/** Pale editorial pause: square engraved study beside a short note. */
function EngravingPanel({
  src,
  alt,
  title,
  children,
  reverse
}) {
  const art = /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: alt,
    style: {
      aspectRatio: "1",
      objectFit: "cover",
      borderRadius: "var(--radius-control)",
      width: "100%"
    }
  });
  const copy = /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: "0 0 14px",
      fontSize: "var(--size-title)"
    }
  }, title), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: "var(--size-support)",
      margin: 0
    }
  }, children));
  return /*#__PURE__*/React.createElement("div", {
    style: momentumEngravingStyle
  }, reverse ? /*#__PURE__*/React.createElement(React.Fragment, null, copy, art) : /*#__PURE__*/React.createElement(React.Fragment, null, art, copy));
}
Object.assign(__ds_scope, { EngravingPanel });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/editorial/EngravingPanel.jsx", error: String((e && e.message) || e) }); }

// components/editorial/PullQuote.jsx
try { (() => {
const momentumQuoteStyle = {
  margin: "30px 0",
  padding: "28px 32px",
  background: "var(--surface-emphasis)",
  color: "var(--paper)",
  borderRadius: "var(--radius)"
};

/** Navy in-chapter quotation block. */
function PullQuote({
  children,
  cite
}) {
  return /*#__PURE__*/React.createElement("blockquote", {
    style: momentumQuoteStyle
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      maxWidth: "none"
    }
  }, children), cite ? /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "12px 0 0",
      fontSize: "var(--size-note)",
      color: "var(--text-reversed-dim)",
      maxWidth: "none"
    }
  }, cite) : null);
}
Object.assign(__ds_scope, { PullQuote });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/editorial/PullQuote.jsx", error: String((e && e.message) || e) }); }

// components/editorial/SourceDisclosure.jsx
try { (() => {
/** Collapsible source note. Text-first provenance, subordinate to the chapter. */
function SourceDisclosure({
  summary = "Source note",
  children,
  id,
  open
}) {
  return /*#__PURE__*/React.createElement("details", {
    id: id,
    open: open,
    style: {
      fontSize: "var(--size-note)",
      color: "var(--text-secondary)",
      scrollMarginTop: 110
    }
  }, /*#__PURE__*/React.createElement("summary", {
    style: {
      cursor: "pointer",
      fontWeight: 800,
      padding: "6px 0"
    }
  }, summary), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: "var(--size-note)",
      lineHeight: "var(--leading-note)",
      whiteSpace: "pre-wrap",
      padding: 16,
      background: "var(--surface-reading-field)",
      borderRadius: "var(--radius-control)",
      margin: "8px 0",
      maxWidth: "none"
    }
  }, children));
}
Object.assign(__ds_scope, { SourceDisclosure });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/editorial/SourceDisclosure.jsx", error: String((e && e.message) || e) }); }

// components/forms/Checklist.jsx
try { (() => {
const momentumChecklistStyle = {
  display: "grid",
  gap: 12
};
const momentumCheckLabel = {
  display: "flex",
  gap: 12,
  alignItems: "flex-start",
  fontSize: "var(--size-support)",
  cursor: "pointer",
  fontFamily: "var(--body)"
};
const momentumCheckInput = {
  marginTop: 7,
  accentColor: "var(--blue)",
  width: 18,
  height: 18,
  flexShrink: 0
};

/** Locally-saved reading checklist. Status text is textual, never a badge. */
function Checklist({
  items,
  checked = {},
  onToggle,
  status
}) {
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: momentumChecklistStyle
  }, items.map((item, i) => /*#__PURE__*/React.createElement("label", {
    key: i,
    style: momentumCheckLabel
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    style: momentumCheckInput,
    checked: !!checked[i],
    onChange: () => onToggle && onToggle(i)
  }), /*#__PURE__*/React.createElement("span", null, item)))), status ? /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: "var(--size-note)",
      color: "var(--text-secondary)",
      marginTop: 18
    }
  }, status) : null);
}
Object.assign(__ds_scope, { Checklist });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Checklist.jsx", error: String((e && e.message) || e) }); }

// components/forms/ExerciseField.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const momentumFieldLabel = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
  fontSize: "var(--size-label)",
  fontWeight: 900,
  fontFamily: "var(--body)"
};
const momentumFieldControl = {
  font: "16px/1.5 var(--body)",
  color: "var(--text-body)",
  padding: 12,
  border: "1px solid var(--border-hairline)",
  borderRadius: "var(--radius-control)",
  background: "var(--paper)",
  minWidth: 0,
  width: "100%",
  caretColor: "var(--caret)"
};

/** Labelled exercise control. Label sits above the field; white surface, hairline border. */
function ExerciseField({
  label,
  name,
  type = "text",
  options,
  rows = 2,
  required = true,
  ...rest
}) {
  const common = {
    name,
    required,
    style: momentumFieldControl,
    ...rest
  };
  return /*#__PURE__*/React.createElement("label", {
    style: momentumFieldLabel
  }, label, type === "select" ? /*#__PURE__*/React.createElement("select", common, (options || []).map(o => /*#__PURE__*/React.createElement("option", {
    key: o,
    value: o
  }, o || "Choose…"))) : type === "textarea" ? /*#__PURE__*/React.createElement("textarea", _extends({
    rows: rows
  }, common, {
    style: {
      ...momentumFieldControl,
      resize: "vertical"
    }
  })) : /*#__PURE__*/React.createElement("input", _extends({
    type: type
  }, type === "number" ? {
    min: 0,
    step: 1
  } : null, common)));
}
Object.assign(__ds_scope, { ExerciseField });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/ExerciseField.jsx", error: String((e && e.message) || e) }); }

// components/forms/SearchField.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const momentumSearchWrap = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  position: "relative",
  width: "min(520px,100%)"
};
const momentumSearchInput = {
  width: "100%",
  padding: "12px 16px 12px 50px",
  background: "var(--surface-reading-field)",
  border: "1px solid var(--border-hairline)",
  borderRadius: "var(--radius)",
  color: "var(--text-body)",
  caretColor: "var(--caret)",
  fontFamily: "var(--body)"
};
const momentumSearchCompactInput = {
  width: "100%",
  padding: "10px 10px 10px 38px",
  fontSize: "var(--size-label)",
  background: "var(--surface-reading-field)",
  border: "1px solid var(--border-hairline)",
  borderRadius: "var(--radius)",
  color: "var(--text-body)",
  caretColor: "var(--caret)",
  fontFamily: "var(--body)"
};

/** Pale search field with a leading inline magnifier. compact = the reader sidebar size. */
function SearchField({
  placeholder = "Find a field guide",
  value,
  onChange,
  compact,
  style,
  ...rest
}) {
  const glyph = compact ? {
    width: 16,
    left: 12
  } : {
    width: 22,
    left: 16
  };
  return /*#__PURE__*/React.createElement("label", {
    style: {
      ...momentumSearchWrap,
      ...(compact ? {
        width: "100%"
      } : null),
      ...style
    }
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    "aria-hidden": "true",
    style: {
      width: glyph.width,
      height: glyph.width,
      position: "absolute",
      left: glyph.left,
      color: "var(--text-secondary)"
    }
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "10",
    cy: "10",
    r: "6"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m15 15 5 5"
  })), /*#__PURE__*/React.createElement("input", _extends({
    type: "search",
    placeholder: placeholder,
    "aria-label": placeholder,
    value: value,
    onChange: onChange,
    style: compact ? momentumSearchCompactInput : momentumSearchInput
  }, rest)));
}
Object.assign(__ds_scope, { SearchField });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/SearchField.jsx", error: String((e && e.message) || e) }); }

// components/navigation/ChapterNav.jsx
try { (() => {
const momentumChapterNavStyle = {
  position: "sticky",
  top: 105,
  maxHeight: "calc(100vh - 130px)",
  overflow: "auto",
  paddingRight: 15,
  fontSize: "var(--size-label)",
  fontFamily: "var(--body)"
};
const momentumChapterNavHeading = {
  fontFamily: "var(--body)",
  fontSize: 15,
  fontWeight: 900,
  letterSpacing: 0,
  margin: "24px 0 12px"
};
const momentumChapterLink = {
  padding: "9px 10px",
  textDecoration: "none",
  borderRadius: "var(--radius-nav)",
  lineHeight: 1.45,
  color: "var(--text-secondary)",
  display: "block"
};
const momentumChapterLinkActive = {
  background: "var(--surface-reading-field)",
  color: "var(--surface-emphasis)",
  fontWeight: 900
};

/** Sticky contents column: heading, chapter links, reading progress. */
function ChapterNav({
  heading = "Contents",
  chapters = [],
  activeId,
  progress,
  children
}) {
  return /*#__PURE__*/React.createElement("nav", {
    style: momentumChapterNavStyle,
    "aria-label": "Contents"
  }, children, /*#__PURE__*/React.createElement("h2", {
    style: momentumChapterNavHeading
  }, heading), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 2
    }
  }, chapters.map(c => /*#__PURE__*/React.createElement("a", {
    key: c.id,
    href: "#" + c.id,
    "aria-current": c.id === activeId ? "location" : undefined,
    style: {
      ...momentumChapterLink,
      ...(c.id === activeId ? momentumChapterLinkActive : null)
    }
  }, c.title))), progress === undefined ? null : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: "var(--size-micro)",
      marginTop: 24,
      color: "var(--text-secondary)"
    }
  }, "Reading progress"), /*#__PURE__*/React.createElement("progress", {
    max: "100",
    value: progress
  })));
}
Object.assign(__ds_scope, { ChapterNav });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/ChapterNav.jsx", error: String((e && e.message) || e) }); }

// components/navigation/SegmentedTabs.jsx
try { (() => {
const momentumTabsRow = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap"
};
const momentumTabRest = {
  border: "1px solid var(--border-hairline)",
  background: "var(--control-rest-bg)",
  color: "var(--text-body)",
  padding: "12px 20px",
  borderRadius: "var(--radius-control)",
  fontWeight: 900,
  fontFamily: "var(--body)"
};
const momentumTabSelected = {
  background: "var(--control-selected-bg)",
  color: "var(--control-selected-fg)",
  borderColor: "var(--control-selected-bg)",
  boxShadow: "var(--state-rule)"
};

/** Pale-to-navy control group with an inset gold state rule. Uses aria-pressed. */
function SegmentedTabs({
  items = [],
  value,
  onChange,
  label = "Categories",
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    role: "group",
    "aria-label": label,
    style: {
      ...momentumTabsRow,
      ...style
    }
  }, items.map(t => {
    const selected = t.value === value;
    return /*#__PURE__*/React.createElement("button", {
      key: t.value,
      type: "button",
      "aria-pressed": String(selected),
      onClick: () => onChange && onChange(t.value),
      style: {
        ...momentumTabRest,
        ...(selected ? momentumTabSelected : null)
      }
    }, t.label);
  }));
}
Object.assign(__ds_scope, { SegmentedTabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/SegmentedTabs.jsx", error: String((e && e.message) || e) }); }

// components/navigation/SiteFooter.jsx
try { (() => {
const momentumFooterStyle = {
  padding: "30px 0",
  borderTop: "1px solid var(--border-hairline)",
  display: "flex",
  justifyContent: "space-between",
  gap: 20,
  fontSize: "var(--size-note)",
  color: "var(--text-secondary)",
  flexWrap: "wrap"
};

/** Hairline footer row: attribution, edition, one or two links. */
function SiteFooter({
  items = []
}) {
  return /*#__PURE__*/React.createElement("footer", {
    style: momentumFooterStyle
  }, items.map((it, i) => it.href ? /*#__PURE__*/React.createElement("a", {
    key: i,
    href: it.href
  }, it.label) : /*#__PURE__*/React.createElement("span", {
    key: i
  }, it.label)));
}
Object.assign(__ds_scope, { SiteFooter });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/SiteFooter.jsx", error: String((e && e.message) || e) }); }

// components/navigation/TopBar.jsx
try { (() => {
const momentumTopBarStyle = {
  position: "sticky",
  top: 0,
  zIndex: 20,
  height: "var(--topbar-h)",
  background: "var(--surface-identity)",
  color: "var(--paper)",
  borderBottom: "1px solid var(--border-hairline-dark)"
};
const momentumTopBarWrap = {
  width: "min(var(--wrap-max),calc(100% - var(--wrap-gutter)))",
  margin: "auto",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 30
};
const momentumTopBarNav = {
  display: "flex",
  alignItems: "center",
  gap: 26,
  fontSize: "var(--size-label)",
  fontWeight: 800
};

/** Midnight sticky header: exact logo, plain text links, outlined motion toggle. */
function TopBar({
  logoSrc = "assets/momentum-logo.png",
  tagline,
  showLogo = true,
  links = [],
  paused,
  onToggleMotion
}) {
  return /*#__PURE__*/React.createElement("header", {
    style: momentumTopBarStyle
  }, /*#__PURE__*/React.createElement("div", {
    style: momentumTopBarWrap
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    "aria-label": "Momentum library",
    style: {
      position: "relative",
      textDecoration: "none",
      display: "block"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: logoSrc,
    alt: "Momentum",
    style: {
      width: 195,
      opacity: showLogo ? 1 : 0,
      transform: showLogo ? "none" : "translateY(-8px)",
      transition: "opacity var(--dur-identity) var(--ease),transform var(--dur-identity) var(--ease)"
    }
  }), tagline ? /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      left: 0,
      top: "50%",
      transform: "translateY(-50%)",
      fontSize: "var(--size-label)",
      whiteSpace: "nowrap",
      fontWeight: 800,
      letterSpacing: "var(--tracking-tagline)",
      opacity: showLogo ? 0 : 1,
      pointerEvents: showLogo ? "none" : "auto",
      transition: "opacity var(--dur-identity) var(--ease)"
    }
  }, tagline) : null), /*#__PURE__*/React.createElement("nav", {
    "aria-label": "Primary",
    style: momentumTopBarNav
  }, links.map(l => /*#__PURE__*/React.createElement("a", {
    key: l.label,
    href: l.href,
    style: {
      textDecoration: "none"
    }
  }, l.label)), /*#__PURE__*/React.createElement(__ds_scope.TextButton, {
    pressed: paused,
    onToggle: onToggleMotion
  }, paused ? "Resume motion" : "Pause motion"))));
}
Object.assign(__ds_scope, { TopBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/TopBar.jsx", error: String((e && e.message) || e) }); }

// components/reading/DiagramSteps.jsx
try { (() => {
const momentumStepsRow = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
  marginBottom: 20
};
const momentumStepRest = {
  flex: 1,
  minWidth: 95,
  padding: "12px 8px",
  background: "var(--paper)",
  border: "1px solid var(--border-hairline)",
  borderRadius: "var(--radius-control)",
  color: "var(--surface-emphasis)",
  fontSize: "var(--size-label)",
  fontWeight: 900,
  fontFamily: "var(--body)"
};
const momentumStepSelected = {
  background: "var(--control-selected-bg)",
  color: "var(--control-selected-fg)",
  borderColor: "var(--control-selected-bg)",
  boxShadow: "var(--state-rule)"
};

/** Step selector: each step swaps the detail text below it. */
function DiagramSteps({
  steps = [],
  index = 0,
  onSelect
}) {
  const [local, setLocal] = React.useState(index);
  const active = onSelect ? index : local;
  const pick = i => {
    setLocal(i);
    onSelect && onSelect(i);
  };
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: momentumStepsRow
  }, steps.map((s, i) => /*#__PURE__*/React.createElement("button", {
    key: i,
    type: "button",
    "aria-pressed": String(i === active),
    onClick: () => pick(i),
    style: {
      ...momentumStepRest,
      ...(i === active ? momentumStepSelected : null)
    }
  }, s.label))), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: "var(--size-support)",
      minHeight: "4em"
    }
  }, steps[active] && steps[active].detail));
}
Object.assign(__ds_scope, { DiagramSteps });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/reading/DiagramSteps.jsx", error: String((e && e.message) || e) }); }

// components/reading/ReaderTools.jsx
try { (() => {
const momentumToolsStyle = {
  padding: "var(--tool-inset)",
  background: "var(--surface-tool)",
  borderRadius: "var(--radius)",
  margin: "40px 0"
};

/** Pale tool panel that hosts exercises, diagrams and checklists. */
function ReaderTools({
  title,
  intro,
  children
}) {
  return /*#__PURE__*/React.createElement("section", {
    style: momentumToolsStyle
  }, title ? /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: "2.2rem",
      marginBottom: 18
    }
  }, title) : null, intro ? /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: "var(--size-support)",
      marginBottom: 24
    }
  }, intro) : null, children);
}
Object.assign(__ds_scope, { ReaderTools });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/reading/ReaderTools.jsx", error: String((e && e.message) || e) }); }

// components/reading/ExercisePanel.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const momentumExerciseForm = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 18,
  margin: "24px 0"
};

/** Local-only reading exercise: labelled fields, action row, output table, textual status. */
function ExercisePanel({
  title,
  intro,
  fields = [],
  submitLabel = "Save review",
  output,
  status,
  onSubmit,
  onDownload
}) {
  return /*#__PURE__*/React.createElement(__ds_scope.ReaderTools, {
    title: title,
    intro: intro
  }, /*#__PURE__*/React.createElement("form", {
    style: momentumExerciseForm,
    onSubmit: e => {
      e.preventDefault();
      onSubmit && onSubmit(e);
    }
  }, fields.map(f => /*#__PURE__*/React.createElement(__ds_scope.ExerciseField, _extends({
    key: f.name
  }, f))), /*#__PURE__*/React.createElement("div", {
    style: {
      gridColumn: "1/-1",
      display: "flex",
      gap: 10,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Button, {
    style: {
      fontSize: 13,
      padding: "10px 14px"
    },
    onClick: undefined
  }, submitLabel), /*#__PURE__*/React.createElement(__ds_scope.Button, {
    variant: "secondary",
    style: {
      fontSize: 13,
      padding: "10px 14px"
    },
    onClick: onDownload
  }, "Download my entries"))), output ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      lineHeight: "var(--leading-body)",
      overflow: "auto"
    }
  }, output) : null, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: "var(--size-note)",
      color: "var(--text-secondary)",
      marginTop: 18
    }
  }, status || "Nothing saved yet. Entries stay in this browser."));
}
Object.assign(__ds_scope, { ExercisePanel });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/reading/ExercisePanel.jsx", error: String((e && e.message) || e) }); }

// components/reading/ReadingProgress.jsx
try { (() => {
/** Labelled 5px gold reading progress meter. */
function ReadingProgress({
  value = 0,
  label = "Reading progress"
}) {
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: "var(--size-micro)",
      color: "var(--text-secondary)",
      marginBottom: 6
    }
  }, label), /*#__PURE__*/React.createElement("progress", {
    max: "100",
    value: value,
    style: {
      width: "100%",
      height: 5,
      accentColor: "var(--progress)"
    }
  }));
}
Object.assign(__ds_scope, { ReadingProgress });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/reading/ReadingProgress.jsx", error: String((e && e.message) || e) }); }

// ui_kits/brand-system/BrandSystem.jsx
try { (() => {
const {
  Button,
  Swatch,
  SegmentedTabs
} = window.MomentumDesignSystem_09b3bb;
const BRAND_ART = "../../assets/artwork/";
const brandGallerySets = {
  agents: [["hero-mascot", "Momo", "The collection guide with the exact Momentum m superhero emblem."], ["search-mascot", "Search & discovery", "Momo studies a local business landscape."], ["phone-mascot", "Lead response", "A clear role for the next conversation."], ["build-mascot", "Build & create", "A practical companion for making the system."], ["operations-mascot", "Operations", "A coordinated view of the moving parts."], ["audience-mascot", "Audience", "People stay at the center of the work."]],
  services: [["icon-search", "Search", "Ceramic service icon."], ["icon-phone", "Response", "Ceramic service icon."], ["icon-build", "Build", "Ceramic service icon."], ["icon-operations", "Operations", "Ceramic service icon."], ["icon-audience", "Audience", "Ceramic service icon."], ["icon-proof", "Proof", "Ceramic service icon."]],
  imagery: [["bird-engraving", "Observation", "Original engraved bird study for editorial intervals."], ["botanical-engraving", "Growth & structure", "Original botanical study for the collection."], ["philly-engraving", "Philadelphia", "Original city engraving for place and context."]]
};
const brandSectionStyle = {
  padding: "70px 0",
  borderTop: "1px solid var(--border-hairline)",
  width: "min(1440px,calc(100% - 96px))",
  margin: "auto"
};
const brandHeadStyle = {
  display: "grid",
  gridTemplateColumns: "1.1fr 1fr",
  gap: 70,
  alignItems: "end",
  marginBottom: 35
};
function BrandSystemScreen() {
  const [category, setCategory] = React.useState("agents");
  const [compact, setCompact] = React.useState(false);
  const set = brandGallerySets[category];
  return /*#__PURE__*/React.createElement("main", null, /*#__PURE__*/React.createElement("section", {
    style: {
      padding: "60px 0 75px",
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 50,
      alignItems: "center",
      width: "min(1440px,calc(100% - 96px))",
      margin: "auto"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", null, "One identity.", /*#__PURE__*/React.createElement("br", null), "A whole world", /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--gold)"
    }
  }, ".")), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "28px 0",
      fontSize: "1.15rem",
      color: "var(--text-secondary)"
    }
  }, "Momentum's blue and gold, unmistakable type, and Momo: a curious guide to the work behind AI."), /*#__PURE__*/React.createElement(Button, {
    href: "#asset-library"
  }, "Explore the collection")), /*#__PURE__*/React.createElement("img", {
    src: BRAND_ART + "hero-mascot.png",
    alt: "Momo with the Momentum m superhero chest emblem",
    style: {
      borderRadius: "var(--radius)",
      background: "var(--night)"
    }
  })), /*#__PURE__*/React.createElement("section", {
    style: brandSectionStyle
  }, /*#__PURE__*/React.createElement("div", {
    style: brandHeadStyle
  }, /*#__PURE__*/React.createElement("h2", null, "Identity stays exact.", /*#__PURE__*/React.createElement("br", null), "Expression gets room."), /*#__PURE__*/React.createElement("p", {
    style: {
      color: "var(--text-secondary)",
      fontSize: "1rem"
    }
  }, "The Momentum logo is a fixed identity asset. Momo is supporting artwork, wearing the Momentum m as a superhero emblem. Neither replaces the other.")), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 320,
      background: "var(--surface-identity)",
      position: "relative",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/momentum-logo.png",
    alt: "Exact Momentum Digital logo",
    style: {
      width: 560,
      maxWidth: "80%",
      transition: "transform var(--dur-identity) var(--ease)",
      transform: compact ? "translate(calc(-50vw + 180px),-95px) scale(.35)" : "translate(0,0)"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      bottom: 22,
      color: "var(--text-reversed-dim)",
      fontSize: "var(--size-label)"
    }
  }, "A solid field. A clear identity.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 12,
      marginTop: 24
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    onClick: () => setCompact(!compact)
  }, compact ? "Return to full identity" : "Preview header transition"), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    href: "../../assets/momentum-logo.png"
  }, "Download exact logo"), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    href: "../../assets/momentum-mark.png"
  }, "Download exact mark")), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: "var(--size-note)",
      color: "var(--text-secondary)",
      marginTop: 18
    }
  }, "0.8 seconds \xB7 cubic-bezier(.85,0,.15,1). Preserve proportions and clear space. Never redraw, stretch, recolour or turn the wordmark into a typeface. Digital identity remains separate from Momentum 360.")), /*#__PURE__*/React.createElement("section", {
    style: brandSectionStyle
  }, /*#__PURE__*/React.createElement("div", {
    style: brandHeadStyle
  }, /*#__PURE__*/React.createElement("h2", null, "Bold at a glance.", /*#__PURE__*/React.createElement("br", null), "Calm for the read."), /*#__PURE__*/React.createElement("p", {
    style: {
      color: "var(--text-secondary)",
      fontSize: "1rem"
    }
  }, "Archivo Black establishes a clear point. Nunito Sans carries chapters, controls and source notes. Gold leads to a useful next action.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1.2fr 1fr",
      gap: 60,
      alignItems: "start"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "display",
    style: {
      fontFamily: "var(--display)",
      fontWeight: 900,
      fontSize: "var(--size-brand-display)",
      lineHeight: 1.08,
      display: "block",
      letterSpacing: "var(--tracking-display)"
    }
  }, "Make complex", /*#__PURE__*/React.createElement("br", null), "work clear", /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--gold)"
    }
  }, ".")), /*#__PURE__*/React.createElement("small", {
    style: {
      display: "block",
      fontSize: "var(--size-note)",
      marginTop: 20,
      color: "var(--text-secondary)"
    }
  }, "Archivo Black \xB7 display / chapter / campaign")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: "1.2rem",
      lineHeight: "var(--leading-body)"
    }
  }, "A strong guide gives the reader room to think. Generous leading, a clear hierarchy and sources close to the claim turn a long read into something usable."), /*#__PURE__*/React.createElement("small", {
    style: {
      display: "block",
      fontSize: "var(--size-note)",
      marginTop: 20,
      color: "var(--text-secondary)"
    }
  }, "Nunito Sans \xB7 18px / 1.7\u20131.85 \xB7 reading and interface"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 12,
      marginTop: 24
    }
  }, /*#__PURE__*/React.createElement(Button, {
    href: "../field-notes/index.html"
  }, "See it in a field guide")))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(5,1fr)",
      gap: 8,
      marginTop: 44
    }
  }, /*#__PURE__*/React.createElement(Swatch, {
    name: "Midnight",
    hex: "#03172e",
    role: "Logo / image field"
  }), /*#__PURE__*/React.createElement(Swatch, {
    name: "Momentum navy",
    hex: "#072d53",
    role: "Cover / emphasis"
  }), /*#__PURE__*/React.createElement(Swatch, {
    name: "Action blue",
    hex: "#1766ab",
    role: "Link / interaction"
  }), /*#__PURE__*/React.createElement(Swatch, {
    name: "Gold",
    hex: "#efb928",
    role: "Action / detail",
    color: "#03172e"
  }), /*#__PURE__*/React.createElement(Swatch, {
    name: "Reading field",
    hex: "#f0f5f9",
    role: "Tools / source notes",
    color: "#102d49"
  }))), /*#__PURE__*/React.createElement("section", {
    style: brandSectionStyle,
    id: "asset-library"
  }, /*#__PURE__*/React.createElement("div", {
    style: brandHeadStyle
  }, /*#__PURE__*/React.createElement("h2", null, "A cast with purpose.", /*#__PURE__*/React.createElement("br", null), "A library with range."), /*#__PURE__*/React.createElement("p", {
    style: {
      color: "var(--text-secondary)",
      fontSize: "1rem"
    }
  }, "Original collection artwork, grouped by its job. Momo makes the work approachable. Ceramic service icons support navigation. Engraved studies create a considered pause.")), /*#__PURE__*/React.createElement("div", {
    style: {
      margin: "25px 0"
    }
  }, /*#__PURE__*/React.createElement(SegmentedTabs, {
    label: "Asset categories",
    value: category,
    onChange: setCategory,
    items: [{
      value: "agents",
      label: "Momo & agents"
    }, {
      value: "services",
      label: "Service icons"
    }, {
      value: "imagery",
      label: "Engraved imagery"
    }]
  })), /*#__PURE__*/React.createElement("div", {
    "aria-live": "polite",
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(3,1fr)",
      gap: 28
    }
  }, set.map(([file, title, copy]) => /*#__PURE__*/React.createElement("figure", {
    key: file,
    style: {
      margin: 0,
      background: "var(--surface-reading-field)",
      borderRadius: "var(--radius)",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: BRAND_ART + file + ".png",
    alt: title,
    loading: "lazy",
    style: {
      width: "100%",
      aspectRatio: category === "services" ? "1" : "3/2",
      objectFit: "contain",
      background: "var(--surface-identity)"
    }
  }), /*#__PURE__*/React.createElement("figcaption", {
    style: {
      padding: 22
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: "1.25rem",
      marginBottom: 12
    }
  }, title), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: "var(--size-label)",
      marginBottom: 15,
      color: "var(--text-secondary)"
    }
  }, copy), /*#__PURE__*/React.createElement("a", {
    href: BRAND_ART + file + ".png",
    style: {
      fontSize: "var(--size-note)",
      fontWeight: 900,
      color: "var(--text-link)"
    }
  }, "Download original PNG"))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(3,1fr)",
      gap: 35,
      marginTop: 60
    }
  }, [["Give Momo a role.", "Use the illustration that matches the subject. Keep the full ceramic form and the chest emblem visible. Supporting artwork can move gently; reading text stays still."], ["Let imagery earn its place.", "Use an engraved study at a chapter interval or as a supporting editorial detail. It is artwork, not evidence of a client result or a historical brand claim."], ["Keep the source close.", "Use the exact original file. Asset generation and source records remain alongside this collection. All manuscripts remain a private review edition."]].map(([h, p]) => /*#__PURE__*/React.createElement("article", {
    key: h
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: "1.4rem",
      marginBottom: 15
    }
  }, h), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: "1rem",
      color: "var(--text-secondary)"
    }
  }, p))))), /*#__PURE__*/React.createElement("section", {
    style: brandSectionStyle
  }, /*#__PURE__*/React.createElement("div", {
    style: brandHeadStyle
  }, /*#__PURE__*/React.createElement("h2", null, "Motion with a beginning", /*#__PURE__*/React.createElement("br", null), "and an end."), /*#__PURE__*/React.createElement("p", {
    style: {
      color: "var(--text-secondary)",
      fontSize: "1rem"
    }
  }, "Stills from the four clips Dillon selected. Vertical social films open in a near-black field, break a stone shard open into live footage, and close on the navy end card. Portrait films are locked off with Philadelphia behind the subject.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(4,1fr)",
      gap: 8
    }
  }, [["reference-portal-reveal.png", "Shard opens · glass + blue sparks"], ["reference-endcard-need-momentum.png", "End card · mark over letterspaced caps"], ["footage-city-hall-golden-hour.png", "Locked-off portrait · golden hour"], ["footage-broad-street-dusk.png", "Locked-off portrait · dusk bokeh"]].map(([f, c]) => /*#__PURE__*/React.createElement("figure", {
    key: f,
    style: {
      margin: 0
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/footage/" + f,
    alt: c,
    style: {
      width: "100%",
      aspectRatio: "3/4",
      objectFit: "cover",
      borderRadius: "var(--radius-control)",
      background: "var(--night)"
    }
  }), /*#__PURE__*/React.createElement("figcaption", {
    style: {
      fontSize: "var(--size-micro)",
      color: "var(--text-secondary)",
      marginTop: 8
    }
  }, c))))));
}
Object.assign(window, {
  BrandSystemScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/brand-system/BrandSystem.jsx", error: String((e && e.message) || e) }); }

// ui_kits/field-notes/Library.jsx
try { (() => {
const {
  Button,
  Notice,
  BookCard,
  SearchField
} = window.MomentumDesignSystem_09b3bb;
function LibraryScreen({
  onOpen,
  heroRef
}) {
  const [q, setQ] = React.useState("");
  const {
    books,
    artBase
  } = window.FieldNotesData;
  const shown = books.filter(b => (b.title + " " + b.summary + " " + b.topic).toLowerCase().includes(q.toLowerCase().trim()));
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("section", {
    ref: heroRef,
    "aria-label": "Momentum identity",
    style: {
      background: "var(--surface-identity)",
      minHeight: 390,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "60px 30px"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/momentum-logo.png",
    alt: "Momentum",
    style: {
      width: "min(780px,80vw)"
    }
  })), /*#__PURE__*/React.createElement("main", {
    className: "wrap",
    style: {
      width: "min(1440px,calc(100% - 96px))",
      margin: "auto"
    }
  }, /*#__PURE__*/React.createElement("section", {
    style: {
      padding: "76px 0 54px",
      display: "grid",
      gridTemplateColumns: "1.2fr 1fr",
      alignItems: "end",
      gap: 80
    }
  }, /*#__PURE__*/React.createElement("h1", null, "Big ideas.", /*#__PURE__*/React.createElement("br", null), "Useful field notes", /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--gold)"
    }
  }, ".")), /*#__PURE__*/React.createElement("p", {
    style: {
      color: "var(--text-secondary)",
      fontSize: "1.2rem"
    }
  }, "Five illustrated guides to the work behind AI. Read deeply, follow the sources, and turn a useful idea into a clear next step.")), /*#__PURE__*/React.createElement(Notice, null, "Private design review. All five complete manuscripts retain their original source notes and open publication conditions."), /*#__PURE__*/React.createElement("section", null, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "28px 0",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 30
    }
  }, /*#__PURE__*/React.createElement(SearchField, {
    value: q,
    onChange: e => setQ(e.target.value)
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: "var(--size-label)",
      color: "var(--text-secondary)"
    }
  }, shown.length, " field guide", shown.length === 1 ? "" : "s")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(2,1fr)",
      gap: "44px 32px",
      padding: "12px 0 90px"
    }
  }, shown.map((b, i) => /*#__PURE__*/React.createElement(BookCard, {
    key: b.slug,
    featured: i === 0,
    title: b.title,
    series: "Field Notes " + b.slug,
    topic: b.topic,
    summary: b.summary,
    image: artBase + b.image,
    alt: "Momo illustrating " + b.topic,
    href: "#",
    cta: "Open the field guide",
    onOpen: () => onOpen(books.indexOf(b))
  }))), shown.length === 0 ? /*#__PURE__*/React.createElement("p", {
    style: {
      padding: 20,
      color: "var(--text-secondary)",
      fontSize: "var(--size-label)"
    }
  }, "No matching field guide. Try search, leads, websites, operations or audience.") : null), /*#__PURE__*/React.createElement("section", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 60,
      padding: "70px 0",
      borderTop: "1px solid var(--border-hairline)"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("img", {
    src: artBase + "hero-mascot.png",
    alt: "Momo, Momentum's blue ceramic guide",
    style: {
      borderRadius: "var(--radius)",
      background: "var(--night)"
    }
  }), /*#__PURE__*/React.createElement("h2", {
    style: {
      marginTop: 24,
      fontSize: "2.8rem"
    }
  }, "Explore with curiosity.", /*#__PURE__*/React.createElement("br", null), "Act with clarity.")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    style: {
      color: "var(--text-secondary)"
    }
  }, "This collection brings bold blue, Momo, original ceramic scenes and engraved studies into a substantial reading experience. The logo stays exact. The thinking stays inspectable."), /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: 20,
      color: "var(--text-secondary)"
    }
  }, "Search chapters, follow the source notes, and save a small checklist as you read. Your checklist stays in this browser."), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 24
    }
  }, /*#__PURE__*/React.createElement(Button, {
    onClick: () => onOpen(0)
  }, "Open Field Notes 01"))))));
}
Object.assign(window, {
  LibraryScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/field-notes/Library.jsx", error: String((e && e.message) || e) }); }

// ui_kits/field-notes/Reader.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const {
  Button,
  BookCover,
  ChapterNav,
  SearchField,
  PullQuote,
  ChapterArt,
  EngravingPanel,
  CitationRef,
  SourceDisclosure,
  ReaderTools,
  DiagramSteps,
  ExercisePanel,
  Checklist
} = window.MomentumDesignSystem_09b3bb;
function ReaderScreen({
  book,
  onBack
}) {
  const {
    artBase,
    chapters,
    steps
  } = window.FieldNotesData;
  const [active, setActive] = React.useState("c1");
  const [checked, setChecked] = React.useState({});
  const done = Object.values(checked).filter(Boolean).length;
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(BookCover, {
    title: book.title,
    deck: book.summary,
    series: "Field Notes " + book.slug,
    topic: book.topic,
    image: artBase + book.image,
    alt: "Momo illustrating " + book.topic,
    cta: "Start reading",
    href: "#c1"
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      background: "var(--surface-reading-field)",
      padding: "16px max(40px,calc((100vw - 1344px)/2))",
      fontSize: "var(--size-note)",
      color: "var(--text-secondary)",
      maxWidth: "none",
      margin: 0
    }
  }, "Private review edition \xB7 complete manuscript retained with its original source notes."), /*#__PURE__*/React.createElement("div", {
    className: "wrap",
    style: {
      width: "min(1440px,calc(100% - 96px))",
      margin: "auto",
      display: "grid",
      gridTemplateColumns: "270px minmax(0,1fr)",
      gap: 60,
      padding: "52px 0 90px",
      alignItems: "start"
    }
  }, /*#__PURE__*/React.createElement(ChapterNav, {
    chapters: chapters,
    activeId: active,
    progress: done * 25
  }, /*#__PURE__*/React.createElement(SearchField, {
    compact: true,
    placeholder: "Search this guide"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0,
      maxWidth: "var(--reader-max)"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    onClick: onBack,
    style: {
      marginBottom: 24,
      fontSize: 13,
      padding: "10px 14px"
    }
  }, "Back to the library"), chapters.map((c, i) => /*#__PURE__*/React.createElement("section", {
    key: c.id,
    id: c.id,
    onMouseEnter: () => setActive(c.id),
    style: {
      padding: "25px 0 70px",
      borderBottom: "1px solid var(--border-hairline)",
      marginBottom: 35
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: "var(--size-headline)",
      maxWidth: "var(--measure-headline)",
      marginBottom: 30
    }
  }, c.title), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "0 0 23px",
      fontSize: "var(--size-reading)",
      lineHeight: "var(--leading-reading)"
    }
  }, "An assistant answers from what it can read, parse and trust. That is a smaller set of pages than most owners assume, and it changes what is worth fixing first", /*#__PURE__*/React.createElement(CitationRef, {
    n: i + 1,
    href: "#src-" + (i + 1)
  }), "."), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "0 0 23px",
      fontSize: "var(--size-reading)",
      lineHeight: "var(--leading-reading)"
    }
  }, "Start with the question a customer actually types. Write the answer where it can be found, then record what you observed rather than what you hoped."), i === 0 ? /*#__PURE__*/React.createElement(PullQuote, {
    cite: "Field Notes " + book.slug
  }, "Report the names first. The counts come after.") : null, i === 1 ? /*#__PURE__*/React.createElement(ChapterArt, {
    src: artBase + "operations-mascot.png",
    alt: "Momo illustrating operations",
    caption: "Original ceramic scene \xB7 Momentum collection",
    contain: true
  }) : null, i === 2 ? /*#__PURE__*/React.createElement(EngravingPanel, {
    src: artBase + "bird-engraving.png",
    alt: "Engraved bird study",
    title: "Observation"
  }, "An engraved study marks a place to stop and think. It is artwork, not evidence of a client result.") : null, /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: "1px solid var(--border-hairline)",
      paddingTop: 15,
      marginTop: 35,
      display: "grid",
      gap: 4
    }
  }, /*#__PURE__*/React.createElement(SourceDisclosure, {
    id: "src-" + (i + 1),
    summary: "Source · " + c.title
  }, "Manual observation log, September 2026. Method and limits recorded verbatim; nothing here is a verified platform result.")))), /*#__PURE__*/React.createElement(ReaderTools, {
    title: "Apply it",
    intro: "Four steps, in order. Nothing on this page leaves your browser."
  }, /*#__PURE__*/React.createElement(DiagramSteps, {
    steps: steps
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 24
    }
  }, /*#__PURE__*/React.createElement(Checklist, {
    items: steps.map(s => s.label + " — done"),
    checked: checked,
    onToggle: i => setChecked({
      ...checked,
      [i]: !checked[i]
    }),
    status: done + " of 4 complete. Saved only in this browser."
  }))), /*#__PURE__*/React.createElement(ExercisePanel, _extends({}, book.exercise, {
    status: "Nothing saved yet. Entries stay in this browser."
  })))));
}
Object.assign(window, {
  ReaderScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/field-notes/Reader.jsx", error: String((e && e.message) || e) }); }

// ui_kits/field-notes/data.js
try { (() => {
window.FieldNotesData = {
  artBase: "../../assets/artwork/",
  books: [{
    slug: "01",
    title: "Show Up When They Ask AI",
    topic: "AI search",
    image: "search-mascot.png",
    summary: "How a local service business gets found in ChatGPT, Gemini and Google's AI answers",
    exercise: {
      title: "Your AI visibility log",
      intro: "Record a question, the engine you checked and what you observed. This is a manual evidence log, not a live AI-search scan.",
      submitLabel: "Add observed row",
      fields: [{
        label: "Question you tested",
        name: "question"
      }, {
        label: "Engine or assistant",
        name: "engine"
      }, {
        label: "Observed status",
        name: "observed",
        type: "select",
        options: ["", "Business cited", "Business mentioned, not cited", "Business not observed", "Unable to verify"]
      }]
    }
  }, {
    slug: "02",
    title: "From Missed Call to Booked Job",
    topic: "Lead response",
    image: "phone-mascot.png",
    summary: "One lead-intake workflow a service business can trust, and the thirty tests to run before it touches a customer",
    exercise: {
      title: "Your lead-intake test report",
      intro: "Record five manual test cases. These selections document your review; this page does not call, text or connect to a phone system.",
      submitLabel: "Save review",
      fields: ["Normal inquiry", "Missing contact details", "Duplicate inquiry", "After-hours request", "Escalation required"].map((c, i) => ({
        label: c,
        name: "case" + i,
        type: "select",
        options: ["Not run", "Pass", "Fail"]
      }))
    }
  }, {
    slug: "03",
    title: "Built, Not Prompted",
    topic: "Creative production",
    image: "build-mascot.png",
    summary: "AI in design, video and content production without losing the brand",
    exercise: {
      title: "Your creative release review",
      intro: "Record the asset and the human review checks needed before release. Checking a box never publishes an asset.",
      submitLabel: "Save review",
      fields: [{
        label: "Asset name",
        name: "asset"
      }, {
        label: "Source recorded",
        name: "r0",
        type: "select",
        options: ["Not reviewed", "Pass", "Needs revision"]
      }, {
        label: "Exact logo verified",
        name: "r1",
        type: "select",
        options: ["Not reviewed", "Pass", "Needs revision"]
      }, {
        label: "Visual review complete",
        name: "r2",
        type: "select",
        options: ["Not reviewed", "Pass", "Needs revision"]
      }]
    }
  }, {
    slug: "04",
    title: "The Small Business AI Operating System",
    topic: "AI operations",
    image: "operations-mascot.png",
    summary: "Agents, workflows and approval gates for a business that wants to run bigger than its headcount",
    exercise: {
      title: "Your workflow brief",
      intro: "Specify one workflow before choosing a tool. Save the inputs and the human escalation route in a portable brief.",
      submitLabel: "Save review",
      fields: ["Trigger", "Input", "Owner", "Output", "Escalation"].map(n => ({
        label: n,
        name: n.toLowerCase(),
        type: "textarea"
      }))
    }
  }, {
    slug: "05",
    title: "Names, Not Numbers",
    topic: "Audience intelligence",
    image: "audience-mascot.png",
    summary: "How to know which real people your marketing produced, and why the platform total is not the answer",
    exercise: {
      title: "Your lead reconciliation",
      intro: "Enter whole-number counts from your own evidence. This is a comparison of user-entered counts, not a verified CRM or attribution match.",
      submitLabel: "Calculate & save",
      fields: [{
        label: "Platform events",
        name: "platform",
        type: "number"
      }, {
        label: "Unique CRM leads",
        name: "crm",
        type: "number"
      }, {
        label: "Qualified leads",
        name: "qualified",
        type: "number"
      }]
    }
  }],
  chapters: [{
    id: "c1",
    title: "Why assistants answer the way they do"
  }, {
    id: "c2",
    title: "What a local business can actually control"
  }, {
    id: "c3",
    title: "Building the visibility log"
  }, {
    id: "c4",
    title: "Reading the result honestly"
  }],
  steps: [{
    label: "Name it",
    detail: "Identify the actual question, repeated task or missing information. Record the inputs and the person who owns the result."
  }, {
    label: "Draw it",
    detail: "Draw the handoff before choosing a tool. Specify what goes in, what should come out, and when a human must decide."
  }, {
    label: "Test it",
    detail: "Try a bounded example. Compare the output with the expected result and record failures before expanding its use."
  }, {
    label: "Inspect it",
    detail: "Ask the accountable owner to inspect the result. Keep the evidence and the next decision together."
  }]
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/field-notes/data.js", error: String((e && e.message) || e) }); }

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Notice = __ds_scope.Notice;

__ds_ns.Swatch = __ds_scope.Swatch;

__ds_ns.TextButton = __ds_scope.TextButton;

__ds_ns.BookCard = __ds_scope.BookCard;

__ds_ns.BookCover = __ds_scope.BookCover;

__ds_ns.ChapterArt = __ds_scope.ChapterArt;

__ds_ns.CitationRef = __ds_scope.CitationRef;

__ds_ns.EngravingPanel = __ds_scope.EngravingPanel;

__ds_ns.PullQuote = __ds_scope.PullQuote;

__ds_ns.SourceDisclosure = __ds_scope.SourceDisclosure;

__ds_ns.Checklist = __ds_scope.Checklist;

__ds_ns.ExerciseField = __ds_scope.ExerciseField;

__ds_ns.SearchField = __ds_scope.SearchField;

__ds_ns.ChapterNav = __ds_scope.ChapterNav;

__ds_ns.SegmentedTabs = __ds_scope.SegmentedTabs;

__ds_ns.SiteFooter = __ds_scope.SiteFooter;

__ds_ns.TopBar = __ds_scope.TopBar;

__ds_ns.DiagramSteps = __ds_scope.DiagramSteps;

__ds_ns.ExercisePanel = __ds_scope.ExercisePanel;

__ds_ns.ReaderTools = __ds_scope.ReaderTools;

__ds_ns.ReadingProgress = __ds_scope.ReadingProgress;

})();
