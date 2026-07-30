/** Attach age/gender rules from product to cart line item (for checkout validation) */
export const withProductDemographics = (cartItem = {}, product = {}) => {
  const source = product?.raw && typeof product.raw === "object" ? product.raw : product;

  return {
    ...cartItem,
    fromAge: Number(source?.fromAge ?? product?.fromAge) || 0,
    toAge: Number(source?.toAge ?? product?.toAge) || 0,
    gender: source?.gender ?? product?.gender ?? "Both",
    raw: source,
  };
};
