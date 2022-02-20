import * as React from "react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import ListItemIcon from "@mui/material/ListItemIcon";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

// Sets the menu items
const options = ["Nomics", "Test Entry"];

interface LabelMenuItemProps {
  text: string;
}

const LabelMenuItem: React.FC<LabelMenuItemProps> = ({ text }) => {
  return (
    <ListItem
      // setting bgcolor here causes a slight strobe color effect on menu click
      id={"item-label-" + text}
      sx={{ bgcolor: "gray" }}
    >
      {text}
    </ListItem>
  );
};

const ResourceLinks = () => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const open = Boolean(anchorEl);
  const handleClickListItem = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuItemClick = (event: React.MouseEvent<HTMLElement>, index: number) => {
    setSelectedIndex(index);
    setAnchorEl(null);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <List component="nav" aria-label="Resources" sx={{ bgcolor: "white" }}>
        <ListItem
          // setting bgcolor here causes a slight strobe color effect on menu click
          button
          id="lock-button"
          aria-haspopup="listbox"
          aria-controls="lock-menu"
          aria-expanded={open ? "true" : undefined}
          onClick={handleClickListItem}
        >
          <ListItemText
            // setting bgcolor here causes the nav label to have it's text background color changed
            secondary={options[selectedIndex]}
          />
          <ListItemIcon>
            <KeyboardArrowDownIcon />
          </ListItemIcon>
        </ListItem>
      </List>
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
    </div>
  );
};

export default React.memo(ResourceLinks);
