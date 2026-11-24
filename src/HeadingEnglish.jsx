import React from 'react';

export default function HeadingEnglish({lang, children}) {
  if (lang !== 'zh' || !children) return null;
  return <small className="mh-heading-english" lang="en" aria-hidden="true">{children}</small>;
}
