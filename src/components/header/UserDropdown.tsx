import { useEffect, useState } from "react";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { useMsal } from "@azure/msal-react";
import UserAvatar from "./UserAvatar";
import { useAuth } from "../../hooks/useAuth";

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { instance } = useMsal();
  const [name, setName] = useState<string | null | undefined>(null);
  const [email, setEmail] = useState<string | null | undefined>(null);
  const [profilePic, setProfilePic] = useState<string | null | undefined>(null);
  const { user, isAdmin } = useAuth();

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  // // Function to get an access token and fetch user data
  // const fetchUserData = async () => {
  //   if (!activeAccount) {
  //     setName(null);
  //     setEmail(null);
  //     setProfilePic(image);
  //     return;
  //   }

  //   try {
  //     // Get access token
  //     const response = await instance.acquireTokenSilent({
  //       ...loginRequest,
  //       account: activeAccount,
  //     });

  //     if (!response.accessToken) {
  //       throw new Error("No access token returned from MSAL");
  //     }

  //     const accessToken = response.accessToken;

  //     // Fetch user profile details
  //     const profileResponse = await fetch(
  //       "https://graph.microsoft.com/v1.0/me",
  //       {
  //         headers: {
  //           Authorization: `Bearer ${accessToken}`,
  //         },
  //       }
  //     );

  //     if (!profileResponse.ok) {
  //       throw new Error("Failed to fetch user profile");
  //     }

  //     const userProfile = await profileResponse.json();
  //     setName(userProfile.displayName);
  //     setEmail(userProfile.mail);

  //     // Fetch user profile picture
  //     const photoResponse = await fetch(
  //       "https://graph.microsoft.com/v1.0/me/photo/$value",
  //       {
  //         headers: {
  //           Authorization: `Bearer ${accessToken}`,
  //         },
  //       }
  //     );

  //     if (photoResponse.ok) {
  //       const imageBlob = await photoResponse.blob();
  //       const imageURL = URL.createObjectURL(imageBlob);
  //       setProfilePic(imageURL);
  //     } else {
  //       console.log("Profile picture not found, using default image.");
  //       setProfilePic(image);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching user data:", error);

  //     if (error instanceof Response && error.status === 404) {
  //       console.warn("Profile picture not found (404). Using default image.");
  //       setProfilePic(image);
  //     } else if (error instanceof InteractionRequiredAuthError) {
  //       try {
  //         await instance.acquireTokenPopup(loginRequest);
  //         return fetchUserData(); // Retry fetching data after login
  //       } catch (popupError) {
  //         console.error("Popup login failed:", popupError);
  //       }
  //     }
  //   }
  // };

  // useEffect(() => {
  //   // fetchUserData();
  // }, [activeAccount]);

  useEffect(() => {
    if (user) {
      setName(user.name);
      console.log("user%%%%%%", user);
      setEmail(user.username);
      // setProfilePic(image);
    } else {
      setName(null);
      setEmail(null);
      setProfilePic(null);
    }
  }, [user]);

  const handleLogout = () => {
    instance.logout();
  };

  function closeDropdown() {
    setIsOpen(false);
  }

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center text-gray-700 dropdown-toggle dark:text-gray-400"
      >
        <span className="mr-3 overflow-hidden rounded-full h-10 w-10">
          {profilePic ? (
            <img
              src={profilePic}
              alt="User"
              className="rounded-full h-10 w-10"
            />
          ) : (
            <UserAvatar name={name} size={10} />
          )}
        </span>

        <span className="block mr-1 font-medium text-theme-sm">
          {name ?? "Loading..."}
        </span>
        <svg
          className={`stroke-gray-500 dark:stroke-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          width="18"
          height="20"
          viewBox="0 0 18 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.3125 8.65625L9 13.3437L13.6875 8.65625"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 mt-[17px] flex w-[260px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark"
      >
        <div>
          <span className="block font-medium text-gray-700 text-theme-sm dark:text-gray-400">
            {name}
          </span>
          <span className="mt-0.5 block text-theme-xs text-gray-500 dark:text-gray-400">
            {email}
          </span>
        </div>

        <ul className="flex flex-col gap-1 pt-4 pb-3 border-b border-gray-200 dark:border-gray-800">
          {isAdmin && (
            <li>
              <DropdownItem
                onItemClick={closeDropdown}
                tag="a"
                to="/analytics"
                className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 dark:text-gray-400"
              >
                👨🏻‍✈️ Admin Dashboard
              </DropdownItem>
            </li>
          )}
        </ul>

        <div
          className="flex items-center gap-3 px-3 py-2 mt-3 font-medium cursor-pointer text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 dark:text-gray-400"
          onClick={(e) => {
            e.preventDefault();
            handleLogout();
          }}
        >
          🚪 Sign out
        </div>
      </Dropdown>
    </div>
  );
}
