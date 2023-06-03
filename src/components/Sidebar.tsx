import { useAuth } from "@clerk/nextjs";
import { useContext, useState } from "react";
import { api } from "~/utils/api";
import SwitchTheme from "~/components/SwitchTheme";
import UserDisplay from "~/components/UserDisplay";
import Feed, { FeedContext } from "~/pages/feed";
import { useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";

interface Props {
  handleSelectFeed: (
    id: string,
    type: string,
    name: string,
    ownerId: string
  ) => void;
}

// const defaultProps = {
//   handleSelectFeed: (
//     id: string,
//     type: string,
//     name: string,
//     ownerId: string
//   ) => {
//     return {
//       id,
//       type,
//       name,
//       ownerId,
//     };
//   },
// };

// TODO: Move this to a custom hook or refactor
const useSidebarToggle = () => {
  const [isToggled, setIsToggled] = useState(false);
  const [sidebarStyle, setSidebarStyle] = useState(
    ["-translate-x-full"].join(" ")
  );

  const handleOnClick = () => {
    console.log(isToggled);
    setIsToggled(!isToggled);

    if (isToggled) {
      setSidebarStyle("transform-none drop-shadow-xl");
    } else {
      setSidebarStyle("-translate-x-full");
    }
  };

  return { sidebarStyle, handleOnClick };
};

type SidebarWrapperProps = {
  children: React.ReactNode;
};
const SidebarWrapper = (props: SidebarWrapperProps) => {
  const { sidebarStyle, handleOnClick } = useSidebarToggle();

  return (
    <aside className={`fixed left-0 flex h-full w-full max-w-xs md:h-auto ${sidebarStyle} transform flex-col
    gap-4 bg-base-100  p-4 py-8 md:drop-shadow-none  transition-all md:static md:transform-none `}>
      {props.children}
      <div
        onClick={handleOnClick}
        className="absolute z-10 right-0 top-0 mt-4 flex aspect-square  transform translate-x-full bg-base-100 scale-x-110 flex-col items-center justify-center rounded-r-lg pl-3  p-2 md:hidden text-2xl"
      >
        <FontAwesomeIcon icon={faBars} />
      </div>
    </aside>
  )
};
const Sidebar = (sidebarProps: Props) => {
  const props = useMemo(() => ({ ...sidebarProps }), [sidebarProps]);

  const feedOnClick = (feedId: string, name: string, ownerId: string) => {
    props.handleSelectFeed(feedId, "feed", name, ownerId);
  };

  const SpaceListElement = useMemo(() => {

    const spaceOnClick = (spaceId: string, name: string, ownerId: string) => {
      props.handleSelectFeed(spaceId, "space", name, ownerId);
    };
    return <SpaceList onClick={spaceOnClick} />;
  }
    , [props]);
  return (
    <SidebarWrapper>
      <div>
        <UserDisplay />
      </div>
      <div className=" rounded-lg p-2 font-light">
        <div className="px-3 py-2 text-xl">Your Feeds</div>
        {SpaceListElement}
      </div>
      <div className=" rounded-lg p-2 font-light">
        <div className="px-3 py-2 text-xl">Feeds</div>
        <ul className="flex flex-col gap-2 py-2 text-lg">
          <li
            onClick={() => feedOnClick("global", "Global", "global")}
            className="btn-ghost btn justify-start font-normal normal-case"
          >
            Global
          </li>
        </ul>
      </div>
    </SidebarWrapper>
  );
};

type SpaceListProp = {
  onClick: (spaceId: string, name: string, ownerId: string) => void;
};
const SpaceList = ({ onClick }: SpaceListProp) => {
  const { userId } = useContext(FeedContext);

  const { data, isLoading: postsLoading } =
    api.spaces.getSpacesByUserId.useQuery({
      ownerId: userId,
    });

  if (postsLoading)
    return (
      <div className="flex w-full px-2 items-center grow">
        <span className="loading loading-dots text-accent"></span>
      </div>
    );
  if (!data) return <div>Something went wrong</div>;

  return (
    <ul className="flex flex-col gap-2 py-2 text-lg">
      {data.map((space) => {
        return (
          <li
            className="btn justify-start font-normal normal-case"
            key={space.id}
            onClick={() =>
              onClick(space.id, space.name || "Space", space.ownerId || "")
            }
          >
            {space.name}
          </li>
        );
      })}
    </ul>
  );
};

export default Sidebar;
