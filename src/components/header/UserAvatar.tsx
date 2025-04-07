const stringToColor = (str: String) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 50%)`;
};

interface UserAvatarProps {
  name: string | null | undefined;
  size?: number;
}
const UserAvatar = ({ name, size = 10 }: UserAvatarProps) => {
  const USER_NAME = name || "anonymous";

  const bgColor = stringToColor(USER_NAME);
  const firstLetter = USER_NAME?.charAt(0)?.toUpperCase() || "?";

  return (
    <>
      {USER_NAME == "anonymous" ? (
        <div
          className={`w-${size} h-${size} rounded-full flex items-center justify-center text-white font-bold text-lg`}
        ></div>
      ) : (
        <div
          className={`w-${size} h-${size} rounded-full flex items-center justify-center text-white font-bold text-lg`}
          style={{ backgroundColor: bgColor }}
        >
          {firstLetter}
        </div>
      )}
    </>
  );
};

export default UserAvatar;
