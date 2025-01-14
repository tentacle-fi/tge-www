import * as React from "react";
import ListItem from "@mui/material/ListItem";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import SLink from "components/SLink";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { styled } from "@mui/material/styles";

const DropdownOptions = [
  {
    categoryName: "Marketcap",
    links: [
      {
        name: "Nomics",
        url: "https://nomics.com/assets/ink4-tentacle-finance",
        type: "external",
      },
    ],
  },
  {
    categoryName: "Socials",
    links: [
      {
        name: "Twitter",
        url: "https://twitter.com/TentacleFinance",
        type: "external",
      },
      {
        name: "Medium",
        url: "https://medium.com/@tentaclefinance",
        type: "external",
      },
      {
        name: "Discord",
        url: "https://discord.gg/CbTa6Z2JYM",
        type: "external",
      },
    ],
  },
  {
    categoryName: "DAO Products",
    links: [
      {
        name: "Tx Download",
        url: "/tx-download",
        type: "internal",
      },
      {
        name: "Governance",
        url: "/governance",
        type: "internal",
      },
    ],
  },
];

const StyledMenu = styled(Menu)(({ theme }) => ({
  ".MuiMenu-paper": {
    background: "#000",
  },

  ".MuiMenuItem-root:hover": {
    background: "#333",
  },
}));

const ResourceLinks = () => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClickListItem = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuItemClick = (event: React.MouseEvent<HTMLElement>, index: number) => {
    setAnchorEl(null);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // dynamically generates dropdown list based on DropdownOptions
  const MyMenuItems = DropdownOptions.map((category, index) => {
    const links = category.links.map((link, index) => {
      return (
        <MenuItem sx={{ color: "white", bgcolor: "black" }} key={"menu-item-" + index} onClick={(event) => handleMenuItemClick(event, index)}>
          {
            <SLink external={link.type === "external" ? true : false} href={link.url} key={"slink-" + index}>
              {link.name}
            </SLink>
          }
        </MenuItem>
      );
    });

    return (
      <div key={"div" + index}>
        <ListItem key={"list-item-" + index} sx={{ bgcolor: "gray", justifyContent: "center" }}>
          {category.categoryName}
        </ListItem>
        {links}
      </div>
    );
  });

  return (
    <>
      <Button
        // setting bgcolor here causes a slight strobe color effect on menu click
        id="lock-button"
        sx={{ fontStyle: "normal" }}
        aria-haspopup="listbox"
        aria-controls="lock-menu"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClickListItem}
        endIcon={<KeyboardArrowDownIcon color="primary" />}
        key={"test"}
      >
        <Typography sx={{ fontSize: "30px", fontWeight: "700" }}>More</Typography>
      </Button>
      <StyledMenu
        // setting bgcolor here makes the whole screen that color when the menu is opened
        variant="menu"
        id="lock-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "lock-button",
          role: "listbox",
        }}
      >
        {MyMenuItems}
      </StyledMenu>
    </>
  );
};

export default React.memo(ResourceLinks);
