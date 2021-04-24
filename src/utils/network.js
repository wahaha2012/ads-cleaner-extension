export const http = (url, dataType = "json", options = {}) => {
  return fetch(url, options)
    .then((response) => {
      if (response.ok) {
        return response[dataType]();
      }
    })
    .catch((err) => {
      console.log("Error:", err);
    });
};
