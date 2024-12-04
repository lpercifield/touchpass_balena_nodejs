import { refreshAccessToken } from "./lib/index.js";

refreshAccessToken(
  "X3AF7b9NIckAAAAAAAAAAT23RIsTpISZ3yxZje7aloi381O1sc7pVfcJaHGmStN8",
  "l9t332dv91ct6b3",
  "d4idah58iy7l3su"
)
  .then((result) => {
    console.log(result);
  })
  .catch((error) => {
    const { message } = error;
    if (message.includes("refresh token is invalid or revoked")) {
      console.log("please unset DROPBOX_REFRESH_TOKEN to retry");
    }
    reject(`dropbox error: ${message}`);
  });
