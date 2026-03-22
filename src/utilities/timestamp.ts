function timestamp(): string {
  return new Date().toLocaleString("en-GB").replace(",", "");
}

export default timestamp;