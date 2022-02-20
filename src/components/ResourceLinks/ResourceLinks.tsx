import * as React from "react";
import ListItem from "@mui/material/ListItem";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

// Sets the menu items
const options = ["Nomics", "Test Entry"];
// const options = [
//         {
//             name: "Nomics",
//             url: "google.com"
//         },
//         {
//             name: "Test Entry",
//             url: "gmail.com"
//         }
// ];

interface LabelMenuItemProps {
  text: string;
}

const LabelMenuItem: React.FC<LabelMenuItemProps> = ({ text }) => {
  return (
    <ListItem
      // setting bgcolor here causes a slight strobe color effect on menu click
      id={"item-label-" + text}
      sx={{ bgcolor: "gray", justifyContent: "center" }}
    >
      {text}
    </ListItem>
  );
};

const ResourceLinks = () => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  // const [selectedIndex, setSelectedIndex] = React.useState(0);
  const open = Boolean(anchorEl);
  const handleClickListItem = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuItemClick = (event: React.MouseEvent<HTMLElement>, index: number) => {
    // setSelectedIndex(index);
    setAnchorEl(null);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Button
        // setting bgcolor here causes a slight strobe color effect on menu click
        id="lock-button"
        aria-haspopup="listbox"
        aria-controls="lock-menu"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClickListItem}
        endIcon={<KeyboardArrowDownIcon color="primary" />}
      >
        <Typography sx={{ fontSize: "30px", fontWeight: "700" }}>Resources</Typography>
      </Button>
      <Menu
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
        <LabelMenuItem text="Marketcap" />
        {options.map((option, index) => (
          <MenuItem
            sx={{ color: "white", bgcolor: "black" }} // for menu items
            key={option}
            onClick={(event) => handleMenuItemClick(event, index)}
          >
            {option}
          </MenuItem>
        ))}
        <LabelMenuItem text="A Second Category" />
        <MenuItem
          sx={{ color: "white", bgcolor: "black" }} // for menu items
        >
          Test Second Cat
        </MenuItem>
      </Menu>
    </>
  );
};

export default React.memo(ResourceLinks);
