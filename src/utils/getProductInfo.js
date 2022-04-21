import axios from "axios";

export default async handle => {
  const url = `/products/${handle}.js`;
  return await axios.get(url).then(({data}) => data);
};
