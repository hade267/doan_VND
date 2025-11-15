const buildList = (base = [], extras = []) => {
  const filtered = [...base];
  extras
    .filter((value) => typeof value === 'string' && value.trim().length > 0)
    .forEach((value) => {
      if (!filtered.includes(value.trim())) {
        filtered.push(value.trim());
      }
    });
  return filtered;
};

const parseOrigins = (value) =>
  value
    ?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean) || [];

const buildCspDirectives = () => {
  const allowUnsafeInline = process.env.CSP_ALLOW_UNSAFE_INLINE === 'true';
  const relaxedMode = process.env.RELAXED_CSP === 'true';

  const trustedOrigins = new Set(
    [
      process.env.FRONTEND_URL,
      ...parseOrigins(process.env.CSP_ALLOWED_ORIGINS),
    ].filter(Boolean),
  );

  const shared = ["'self'"];
  const fontSources = buildList(shared, ['https://fonts.gstatic.com', ...trustedOrigins]);
  const styleSources = buildList(shared, ['https://fonts.googleapis.com', ...trustedOrigins]);

  if (allowUnsafeInline || relaxedMode) {
    styleSources.push("'unsafe-inline'");
  }

  const scriptSources = buildList(shared, [...trustedOrigins]);
  if (allowUnsafeInline || relaxedMode) {
    scriptSources.push("'unsafe-inline'");
  }

  const directives = {
    defaultSrc: shared,
    scriptSrc: scriptSources,
    styleSrc: styleSources,
    fontSrc: fontSources,
    imgSrc: buildList(shared, ['data:', 'blob:']),
    connectSrc: buildList(shared, [...trustedOrigins]),
    frameSrc: shared,
    objectSrc: ["'none'"],
    baseUri: shared,
    formAction: shared,
    upgradeInsecureRequests: [],
  };

  if (relaxedMode) {
    directives.connectSrc.push('ws://localhost:*', 'http://localhost:*', 'https://localhost:*');
  }

  return {
    useDefaults: false,
    directives,
  };
};

module.exports = buildCspDirectives;
