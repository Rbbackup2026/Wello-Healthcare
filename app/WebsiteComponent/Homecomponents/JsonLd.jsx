const JsonLd = ({ data = [] }) => {
  const schemas = (Array.isArray(data) ? data : [data]).filter(Boolean);

  if (!schemas.length) return null;

  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={`jsonld-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
};

export default JsonLd;
