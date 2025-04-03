import {
  AuthenticatedTemplate,
  UnauthenticatedTemplate,
  useMsal,
} from "@azure/msal-react";

import adminList from "../../adminList";
import image from "../../assets/images/LST.png";
import { useEffect } from "react";

export function AuthHome() {
  const { instance, accounts } = useMsal();
  const isAdmin = accounts[0] && adminList.includes(accounts[0]?.username);
  console.log(instance);

  // **Preload the Image Before Rendering**
  useEffect(() => {
    const img = new Image();
    img.src = image;
    img.onload = () => {
      console.log("Image preloaded successfully!");
    };
  }, []);

  return (
    <>
      <AuthenticatedTemplate>
        <>Authenticated</>

        {isAdmin && <> Admin</>}
      </AuthenticatedTemplate>

      <UnauthenticatedTemplate></UnauthenticatedTemplate>
    </>
  );
}
