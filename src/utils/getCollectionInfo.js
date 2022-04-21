import axios from "axios";

export default async (handle) => {
  const url = `/collections/${handle}/products.json`;
  return await axios.get(url).then(({ data }) => data.products);
};
