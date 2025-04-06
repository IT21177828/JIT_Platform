import {
  AuthenticatedTemplate,
  UnauthenticatedTemplate,
  useMsal,
} from "@azure/msal-react";

import adminList from "../../adminList";
import image from "../../assets/images/LST.png";
import { useEffect } from "react";
import { useProfilePicture } from "../../hooks/useProfilePicture";

export function AuthHome() {
  const { instance, accounts } = useMsal();
  const isAdmin = accounts[0] && adminList.includes(accounts[0]?.username);
  console.log(instance);
  const photoUrl = useProfilePicture();

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

        <div className="flex items-center gap-2">
      {photoUrl ? (
        <img src={photoUrl} className="rounded-full w-10 h-10" alt="User" />
      ) : (
        <div className="w-10 h-10 rounded-full bg-gray-400 animate-pulse" />
      )}
    </div>
      </AuthenticatedTemplate>

      <UnauthenticatedTemplate></UnauthenticatedTemplate>
    </>
  );
}
