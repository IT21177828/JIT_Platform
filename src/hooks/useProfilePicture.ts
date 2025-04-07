import { useEffect, useState } from "react";
import { useMsal } from "@azure/msal-react";
import { Client } from "@microsoft/microsoft-graph-client";
import { InteractionStatus } from "@azure/msal-browser";

export const useProfilePicture = () => {
  const { instance, inProgress, accounts } = useMsal();
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  const callApi = async () => {
    try {
      const graphClient = Client.init({
        authProvider: async (done) => {
          try {
            const tokenResponse = await instance.acquireTokenSilent({
              scopes: ["User.Read", "User.ReadBasic.All", "User.Read.All"],
            });
            done(null, tokenResponse.accessToken);
          } catch (err) {
            done(err, null);
          }
        },
      });

      console.log("Retrieving user photo from Graph API...");

      const userPhotoBlob = await graphClient
        .api("/me/photo/$value")
        .get()
        .then((response) => {
          console.log("response", response);
          return response;
        })
        .catch((error) => {
          console.log("Error fetching user photo:", error);
        });

      console.log("Blob Image", userPhotoBlob);

      setPhotoUrl(userPhotoBlob);
    } catch (e) {
      console.error("Error fetching profile picture:", e);
    }
  };

  useEffect(() => {
    if (inProgress === InteractionStatus.None && accounts.length > 0) {
      callApi();
    }
  }, [instance, accounts, inProgress]);

  return photoUrl;
};
