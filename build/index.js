const fs = require("fs-extra");

fs.copy("./icons", "./dist/icons", (err) => {
  if (err) {
    throw err;
  } else {
    console.log("copy icons");
  }
});

fs.copy("./manifest.json", "./dist/manifest.json", (err) => {
  if (err) {
    throw err;
  } else {
    console.log("copy manifest.json");
  }
});
